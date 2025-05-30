import { getProducts } from "@/db/product";
import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
  const products = await getProducts();
  return NextResponse.json({ data: products });
}

export async function POST(req: NextApiRequest) {
  const jsonRequest = req.body;
}
