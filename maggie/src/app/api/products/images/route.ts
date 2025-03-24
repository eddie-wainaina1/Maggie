import { fetchFile, uploadFile } from "@/db/cloudStorage";
import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
    const url = new URL(req.url as string);
    const _id = url.searchParams.get("_id");
    if (!_id) {
        return NextResponse.json({ error: "_id query required" }, { status: 400 });
    }

    try {
        const stream = fetchFile(_id);
        
        const responseStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk) => controller.enqueue(chunk));
                stream.on("end", () => controller.close());
                stream.on("error", (err) => controller.error(err));
            },
        });

        return new NextResponse(responseStream, {
            headers: { "Content-Type": "application/octet-stream" }, // Generic type, can be updated dynamically
        });

    } catch (err) {
        return NextResponse.json({ error: "Error fetching image", details: err }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No files received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/\s/g, "_");

        const metadata = {
            type: file.type,
            lastModified: file.lastModified,
            size_bytes: file.size,
        };

        const id = await uploadFile(buffer, filename, metadata);

        return NextResponse.json({ id: id.toString() });
    } catch (err) {
        return NextResponse.json({ error: "File upload failed", details: err }, { status: 500 });
    }
}
