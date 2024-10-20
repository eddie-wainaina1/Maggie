import { Storage } from '@google-cloud/storage';
import fs from 'fs';

const getBucket = (storage: Storage) => {
    if (process.env.GCLOUD_BUCKET) {
        return storage.bucket(process.env.GCLOUD_BUCKET);
    }
    else {
        throw new Error("GCLOUD_BUCKET not found");
    }
}

const authGCloud = () => {
    const keyFilePath = '/tmp/gcloud-keyfile.json';
    if (process.env.GCP_KEY_BASE64){
        const decodedKey = Buffer.from(
            process.env.GCP_KEY_BASE64, 'base64'
        ).toString('utf-8');
        fs.writeFileSync(keyFilePath, decodedKey);
        const storage = new Storage({
            projectId: process.env.GCLOUD_PROJECT_ID,
            keyFilename: keyFilePath,
        });
        return storage;
    }
    else {
        throw new Error("Cloud access not found");
    }
}

const storage = authGCloud()
const bucket = getBucket(storage);

const toBuffer = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const uploadImage = async (file: File): Promise<{ publicURL: string; cloudID: string }> => {
    const arrayBuffer = await toBuffer(file);
    const blob = bucket.file(file.name);
    const stream = blob.createWriteStream({
        metadata: {
            contentType: file.type,
        },
    });

    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
            const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve({ publicURL, cloudID: blob.name });
        });
        stream.on('error', reject);
        stream.end(Buffer.from(arrayBuffer));
    });
};

export const fetchImage = async (fileName: string): Promise<Buffer> => {
    const file = bucket.file(fileName);
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        file.createReadStream()
            .on('data', (chunk) => {
                chunks.push(chunk);
            })
            .on('end', () => {
                resolve(Buffer.concat(chunks));
            })
            .on('error', reject);
    });
};
