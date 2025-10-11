#!/usr/bin/env node
import 'dotenv/config';
import mongodb from 'mongodb';
import crypto from 'crypto';

const MONGO_URI = process.env.MONGO_URI;
const keyBase64 = process.env.IMAGE_STORAGE_KEY || process.env.IMAGE_SECRET_KEY;

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Aborting.');
  process.exit(1);
}
if (!keyBase64) {
  console.error('IMAGE_STORAGE_KEY (or IMAGE_SECRET_KEY) is not set. Aborting.');
  process.exit(1);
}

const ENCRYPTION_KEY = Buffer.from(keyBase64, 'base64');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('IMAGE_STORAGE_KEY must be a base64-encoded 32-byte key (AES-256). Aborting.');
  process.exit(1);
}

const client = new mongodb.MongoClient(MONGO_URI);
let stopped = false;

process.on('SIGINT', async () => {
  console.log('\nMigration interrupted by user (SIGINT). Cleaning up...');
  stopped = true;
  try {
    await client.close();
  } catch (e) {
    // ignore
  }
  process.exit(130);
});

await client.connect();
const db = client.db('media_files');
const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs_media_files' });
const filesColl = db.collection('fs_media_files.files');

console.log('Scanning GridFS for unencrypted files...');
const cursor = filesColl.find({ $or: [ { 'metadata._encrypted': { $exists: false } }, { 'metadata._encrypted': false } ] });

const FILE_TIMEOUT_MS = Number(process.env.MIGRATE_FILE_TIMEOUT_MS || 2 * 60 * 1000); // default 2 minutes per file
let processed = 0;
let total = 0;
const docs = await cursor.toArray();
total = docs.length;
console.log(`Found ${total} file(s) to process.`);

for (const doc of docs) {
  if (stopped) break;
  const id = doc._id;
  const filename = doc.filename ?? String(id);
  console.log(`\n[${processed + 1}/${total}] Processing file ${filename} (${id.toString()})`);

  try {
    // Download entire file into memory with timeout
    const downloadStart = Date.now();
    console.log(`-> starting download for ${filename}`);
    const chunks = [];
    const downloadStream = bucket.openDownloadStream(id);

    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const err = new Error(`Timeout while downloading file ${filename}`);
          reject(err);
        }, FILE_TIMEOUT_MS);

        downloadStream.on('data', (c) => chunks.push(c));
        downloadStream.on('end', () => {
          clearTimeout(timer);
          resolve();
        });
        downloadStream.on('close', () => {
          clearTimeout(timer);
          resolve();
        });
        downloadStream.on('error', (e) => {
          clearTimeout(timer);
          reject(e);
        });
      });
    } catch (downloadErr) {
      console.error(`!! Download failed for ${filename}:`, downloadErr && downloadErr.stack ? downloadErr.stack : downloadErr);
      // Move to next file
      continue;
    }

    const buffer = Buffer.concat(chunks);
    const downloadMs = Date.now() - downloadStart;
    console.log(`-> downloaded ${buffer.length} bytes for ${filename} in ${downloadMs}ms`);

    // Encrypt with AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const storedMetadata = {
      ...(doc.metadata || {}),
      _encrypted: true,
      enc_algo: 'aes-256-gcm',
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
    console.log(`-> encrypted ${buffer.length} -> ${encrypted.length} bytes for ${filename}`);

    // Delete original file (remove files & chunks docs directly for reliability)
    const deleteStart = Date.now();
    console.log(`-> removing files/chunks documents for ${filename} via direct DB delete...`);
    try {
      const filesResult = await filesColl.deleteOne({ _id: id });
      const chunksColl = db.collection('fs_media_files.chunks');
      const chunksResult = await chunksColl.deleteMany({ files_id: id });
      const deleteMs = Date.now() - deleteStart;
      console.log(`-> removed documents for ${filename} in ${deleteMs}ms; filesDeleted=${filesResult.deletedCount}, chunksDeleted=${chunksResult.deletedCount}`);
    } catch (fallbackErr) {
      const deleteMs = Date.now() - deleteStart;
      console.error(`!! Direct DB delete failed for ${filename} after ${deleteMs}ms:`, fallbackErr && fallbackErr.stack ? fallbackErr.stack : fallbackErr);
      console.log('-> continuing to upload encrypted copy to avoid leaving file unencrypted if possible');
    }

    // We previously attempted a best-effort bucket.delete here, but it can throw if the
    // file documents were already removed. To avoid crashing the script, we skip bucket.delete
    // and rely on direct DB deletion above which is reliable.
    console.log('-> skipped best-effort bucket.delete to avoid race conditions (direct DB delete used)');

    // Re-upload encrypted data with same id to preserve references; add timeout to upload
    // Re-upload encrypted data with same id to preserve references; add timeout to upload
    const uploadStart = Date.now();
    console.log(`-> starting upload for ${filename}...`);
    try {
      await new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStreamWithId(id, filename, {
          chunkSizeBytes: 3145728,
          metadata: storedMetadata,
        });

        const timer = setTimeout(() => {
          reject(new Error(`Timeout while uploading file ${filename}`));
        }, FILE_TIMEOUT_MS);

        uploadStream.on('finish', () => {
          clearTimeout(timer);
          resolve();
        });
        uploadStream.on('error', (e) => {
          clearTimeout(timer);
          reject(e);
        });

        uploadStream.write(encrypted);
        uploadStream.end();
      });
      const uploadMs = Date.now() - uploadStart;
      console.log(`-> uploaded ${encrypted.length} bytes for ${filename} in ${uploadMs}ms`);
    } catch (uploadErr) {
      console.error(`!! Upload failed for ${filename}:`, uploadErr && uploadErr.stack ? uploadErr.stack : uploadErr);
      // do not rethrow; continue with next file
      continue;
    }

    processed++;
    console.log(`Encrypted and replaced file ${filename} (${id.toString()})`);
  } catch (err) {
    console.error(`Failed processing ${filename} (${id.toString()}):`, err);
    // continue with next file
  }
}

console.log(`\nMigration complete. Processed ${processed} of ${total} file(s).`);
try {
  await client.close();
} catch (e) {
  // ignore
}
process.exit(0);
