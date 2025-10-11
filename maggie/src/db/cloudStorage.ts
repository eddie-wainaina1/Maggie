import "@/lib/loadEnv";
import * as mongodb from "mongodb";
import crypto from "crypto";
import stream from "stream";

const mongo_uri = process.env.MONGO_URI;
const fs_db_name = "media_files";

if (!mongo_uri) {
  throw new Error("MONGO_URI is not defined in environment variables.");
}

const client = new mongodb.MongoClient(mongo_uri);
await client.connect(); // Ensure MongoDB connection is established

const db = client.db(fs_db_name);
const bucket = new mongodb.GridFSBucket(db, { bucketName: "fs_media_files" });

// Encryption key for at-rest encryption. Expect a base64-encoded 32-byte key.
const keyBase64 = process.env.IMAGE_STORAGE_KEY;
if (!keyBase64) {
  throw new Error(
    "IMAGE_STORAGE_KEY (base64) is not defined in environment variables.",
  );
}
const ENCRYPTION_KEY = Buffer.from(keyBase64, "base64");
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    "IMAGE_STORAGE_KEY must be a base64-encoded 32-byte key for AES-256.",
  );
}

export const uploadFile = async (
  buffer: Buffer,
  filename: string,
  metadata: object = {},
) => {
  // Encrypt buffer with AES-256-GCM before storing
  const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const storedMetadata = {
    ...(metadata || {}),
    _encrypted: true,
    enc_algo: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };

  return new Promise<mongodb.ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      chunkSizeBytes: 3145728,
      metadata: storedMetadata,
    });

    uploadStream.write(encrypted);
    uploadStream.end();

    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", (err) => reject(err));
  });
};

interface FileMetadata {
  _encrypted?: boolean;
  enc_algo?: string;
  iv?: string;
  authTag?: string;
  [key: string]: unknown;
}

export const fetchFile = async (id: string | mongodb.ObjectId) => {
  if (typeof id === "string") {
    id = new mongodb.ObjectId(id);
  }

  const downloadStream = bucket.openDownloadStream(id);

  // Try to read metadata to determine if file is encrypted
  const filesColl = db.collection("fs_media_files.files");
  const doc = await filesColl.findOne({ _id: id });
  const metadata = (doc?.metadata as FileMetadata | undefined) ?? undefined;

  if (metadata && metadata._encrypted) {
    // Create decipher and pipe the download stream through it
    if (!metadata.iv || !metadata.authTag) {
      throw new Error("Encrypted file metadata missing iv or authTag");
    }
    const iv = Buffer.from(metadata.iv as string, "base64");
    const authTag = Buffer.from(metadata.authTag as string, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    // Return a stream that yields decrypted bytes
    const passThrough = new stream.PassThrough();

    downloadStream.on("error", (err) => passThrough.emit("error", err));
    decipher.on("error", (err) => passThrough.emit("error", err));

    // Pipe download -> decipher -> passthrough
    downloadStream.pipe(decipher).pipe(passThrough);

    return passThrough as stream.Readable;
  }

  // Not encrypted, return raw download stream
  return downloadStream as stream.Readable;
};

export const getFileMetadata = async (id: string | mongodb.ObjectId) => {
  if (typeof id === "string") {
    id = new mongodb.ObjectId(id);
  }
  // GridFS stores files in <bucket>.files collection
  const filesColl = db.collection("fs_media_files.files");
  const doc = await filesColl.findOne({ _id: id });
  return doc || null;
};
