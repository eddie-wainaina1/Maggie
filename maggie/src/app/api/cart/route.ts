import { NextResponse, type NextRequest } from "next/server";
import { getCart } from "./utils";
import redis from "@/cache/redis";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get("deviceId")?.value;

  if (!deviceId) {
    return NextResponse.json(
      { message: "An unexpected error occurred!!" },
      { status: 400 },
    );
  }

  const cart = await getCart(deviceId);
  return NextResponse.json({ cart }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get("deviceId")?.value;

  if (!deviceId) {
    return NextResponse.json(
      { message: "An unexpected error occured!!" },
      { status: 400 },
    );
  }
  const body = await req.json();
  const { product } = body;
  const cart = await getCart(deviceId);
  const productId = product.id;
  const quantity = product.quantity;
  cart[productId] = product;
  if (quantity <= 0) {
    delete cart[productId];
  }
  const serialized = JSON.stringify(cart);
  const MAX_CART_BYTES = 150 * 1024; // 150KB
  if (serialized.length > MAX_CART_BYTES) {
    return NextResponse.json({ message: "Cart too large" }, { status: 413 });
  }
  // Set cart with TTL (30 days)
  await redis.set(deviceId, serialized, "EX", 60 * 60 * 24 * 30);
  return NextResponse.json({ cart }, { status: 200 });
}
