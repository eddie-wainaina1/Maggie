import { getProducts, addProduct } from "@/db/product";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const products = await getProducts();
  const normalized = products.map((p: any) => ({
    // ensure the table has a stable `id` and `productId`
    id: p._id ? String(p._id) : p.id ?? p.productId ?? undefined,
    productId: p.productId ?? (p._id ? String(p._id) : undefined),
    name: p.name ?? "",
    price: p.price ?? 0,
    description: p.description ?? "",
    inStock: p.inStock ?? 0,
    imageUrl: p.imageUrl ?? "",
    pendingOrders: p.pendingOrders ?? 0,
    fulfilledOrders: p.fulfilledOrders ?? 0,
    // preserve any other fields
    ...p,
  }));

  return NextResponse.json({ data: normalized });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await addProduct(body);
    const p = product.toObject ? product.toObject() : product;
    const normalized = {
      id: p._id ? String(p._id) : p.id ?? p.productId,
      productId: p.productId ?? (p._id ? String(p._id) : undefined),
      name: p.name ?? "",
      price: p.price ?? 0,
      description: p.description ?? "",
      inStock: p.inStock ?? 0,
      imageUrl: p.imageUrl ?? "",
      pendingOrders: p.pendingOrders ?? 0,
      fulfilledOrders: p.fulfilledOrders ?? 0,
      ...p,
    };
    return NextResponse.json({ data: normalized }, { status: 201 });
  } catch (err) {
    console.error("Failed to add product", err);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 },
    );
  }
}
