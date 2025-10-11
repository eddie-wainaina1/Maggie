import { fetchFile, uploadFile, getFileMetadata } from "@/db/cloudStorage";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");
  if (!_id) {
    return NextResponse.json({ error: "_id query required" }, { status: 400 });
  }
  try {
    // Validate a signed token to prevent public/unrestricted downloads.
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const signingKey = process.env.IMAGE_SIGNING_KEY;
    if (!signingKey) {
      return NextResponse.json(
        { error: "Server misconfigured: IMAGE_SIGNING_KEY" },
        { status: 500 },
      );
    }

    // Token format: base64url(data). data = id:expiry:hmacHex
    const buf = Buffer.from(token, "base64url");
    const data = buf.toString("utf8");
    const parts = data.split(":");
    if (parts.length < 3) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const [tid, expiryStr, hmacHex] = parts;
    const expiry = Number(expiryStr);
    if (tid !== _id) {
      return NextResponse.json(
        { error: "Token does not match id" },
        { status: 401 },
      );
    }
    if (Number.isNaN(expiry) || Date.now() > expiry) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    const hmac = crypto
      .createHmac("sha256", signingKey)
      .update(`${tid}:${expiry}`)
      .digest("hex");
    if (
      !crypto.timingSafeEqual(
        Buffer.from(hmacHex, "hex"),
        Buffer.from(hmac, "hex"),
      )
    ) {
      return NextResponse.json(
        { error: "Invalid token signature" },
        { status: 401 },
      );
    }

    // Token valid. Stream the (possibly decrypted) bytes from GridFS to the client
    const stream = await fetchFile(_id);
    const meta = await getFileMetadata(_id);
    const contentType = meta?.metadata?.type ?? "application/octet-stream";

    const responseStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${meta?.filename ?? _id}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Signed": "true",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error fetching image", details: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 },
      );
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
