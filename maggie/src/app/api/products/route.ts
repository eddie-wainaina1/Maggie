import { getProducts, addProduct } from "@/db/product";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const products = await getProducts();
  return NextResponse.json({ data: products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await addProduct(body);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    console.error("Failed to add product", err);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 },
    );
  }
}
