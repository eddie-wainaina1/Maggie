import { fetchFile, uploadFile } from "@/db/cloudStorage";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
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
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error fetching image", details: err },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    // Validate file type and size (public endpoint but must guard abuse)
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
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
    return NextResponse.json(
      { error: "File upload failed", details: err },
      { status: 500 },
    );
  }
}
