import { getProducts, addProduct } from "@/db/product";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  const products = await getProducts();
  const normalized = products.map((p: unknown) => {
    const prod = p as Record<string, unknown>;
    // ensure the table has a stable `id` and `productId`
    const id = prod._id
      ? String(prod._id)
      : (prod.id ?? prod.productId ?? undefined);
    const productId =
      prod.productId ?? (prod._id ? String(prod._id) : undefined);

    return {
      id,
      productId,
      name: prod.name ?? "",
      price: prod.price ?? 0,
      description: prod.description ?? "",
      inStock: prod.inStock ?? 0,
      imageUrl: prod.imageUrl ?? "",
      pendingOrders: prod.pendingOrders ?? 0,
      fulfilledOrders: prod.fulfilledOrders ?? 0,
      // preserve other fields (kept as unknowns)
      ...(prod as Record<string, unknown>),
    };
  });

  return NextResponse.json({ data: normalized });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await addProduct(body);
    const raw = product.toObject ? product.toObject() : product;
    const p = raw as Record<string, unknown>;
    const normalized = {
      id: p._id ? String(p._id) : (p.id ?? p.productId),
      productId: p.productId ?? (p._id ? String(p._id) : undefined),
      name: p.name ?? "",
      price: p.price ?? 0,
      description: p.description ?? "",
      inStock: p.inStock ?? 0,
      imageUrl: p.imageUrl ?? "",
      pendingOrders: p.pendingOrders ?? 0,
      fulfilledOrders: p.fulfilledOrders ?? 0,
      ...(p as Record<string, unknown>),
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
