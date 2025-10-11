import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

// Creates a short-lived signed token for a given image id. The token is returned as base64url
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");
  if (!_id)
    return NextResponse.json({ error: "_id required" }, { status: 400 });

  const signingKey = process.env.IMAGE_SIGNING_KEY;
  if (!signingKey)
    return NextResponse.json(
      { error: "Server misconfigured: IMAGE_SIGNING_KEY" },
      { status: 500 },
    );

  // allow client to request TTL (optional)
  const ttl = Number(url.searchParams.get("ttl") ?? 300000); // default 5 minutes
  const expiry = Date.now() + ttl;

  const hmac = crypto
    .createHmac("sha256", signingKey)
    .update(`${_id}:${expiry}`)
    .digest("hex");
  const tokenPayload = `${_id}:${expiry}:${hmac}`;
  const token = Buffer.from(tokenPayload, "utf8").toString("base64url");

  return NextResponse.json({ token });
}
