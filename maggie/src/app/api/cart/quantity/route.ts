import { NextResponse, type NextRequest } from "next/server";
import { getCart } from "../utils";
import redis from "@/cache/redis";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  const cookieStore = await cookies();
  const deviceId = cookieStore.get('deviceId')?.value;

  if (!deviceId || !productId) {
    return NextResponse.json({ message: "Missing data" }, { status: 400 });
  }

  const cart = await getCart(deviceId);
  const quantity = cart[productId]?.quantity ?? 0;

  return NextResponse.json({ quantity }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get('deviceId')?.value;
  const productId = req.nextUrl.searchParams.get("productId");
  const action = req.nextUrl.searchParams.get("action");

  if (!deviceId || !productId) {
    return NextResponse.json({ message: "Missing data" }, { status: 400 });
  }

  const cart = await getCart(deviceId);
  const product = cart[productId];

  if (!product) {
    return NextResponse.json(
      { message: "Product not in cart!" },
      { status: 400 },
    );
  }

  console.log({
    action,
    type: typeof action,
    length: action?.length,
    chars: [...action || ""].map(c => c.charCodeAt(0))
  });
  if (action?.trim()=="reduce") {
    product.quantity -= 1;
  } else {
    product.quantity += 1;
  }

  if (product.quantity <= 0) {
    delete cart[productId]
  }
  await redis.set(deviceId, JSON.stringify(cart));

  return NextResponse.json({ quantity: product.quantity }, { status: 200 });
}
