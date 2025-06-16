import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse, type NextRequest } from "next/server";
import { getCart } from "./utils";
import redis from "@/cache/redis";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get('deviceId')?.value;

  if (!deviceId) {
    return NextResponse.json({ message: "An unexpected error occurred!!" }, { status: 400 });
  }

  const cart = await getCart(deviceId);
  return NextResponse.json({ cart }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get('deviceId')?.value;

  if (!deviceId) {
    return NextResponse.json({ message: "An unexpected error occured!!" }, { status: 400 });
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
  await redis.set(deviceId, JSON.stringify(cart));
  return NextResponse.json({ cart }, {status: 200});
}
