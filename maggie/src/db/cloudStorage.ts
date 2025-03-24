import * as mongodb from "mongodb";

const mongo_uri = process.env.MONGO_URI;
const fs_db_name = "media_files";

if (!mongo_uri) {
    throw new Error("MONGO_URI is not defined in environment variables.");
}

const client = new mongodb.MongoClient(mongo_uri);
await client.connect(); // Ensure MongoDB connection is established

const db = client.db(fs_db_name);
const bucket = new mongodb.GridFSBucket(db, { bucketName: "fs_media_files" });

export const uploadFile = async (buffer: Buffer, filename: string, metadata: object) => {
    return new Promise<mongodb.ObjectId>((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            chunkSizeBytes: 3145728,
            metadata,
        });

        uploadStream.write(buffer);
        uploadStream.end();

        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", (err) => reject(err));
    });
};

export const fetchFile = (id: string | mongodb.ObjectId) => {
    if (typeof id === "string") {
        id = new mongodb.ObjectId(id);
    }
    return bucket.openDownloadStream(id);
};
