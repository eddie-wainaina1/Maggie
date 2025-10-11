import { uploadFile } from "@/db/cloudStorage";
import { Product } from "@/db/schema";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  // Require admin session
  const { sessionId, sessionClaims } = await auth();
  if (!sessionId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = (formData.get("name") as string) || "";
    const description = (formData.get("description") as string) || "";
    const price = parseFloat((formData.get("price") as string) || "0");
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Validate file type and size
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(imageFile.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (imageFile.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = imageFile.name.replace(/\s/g, "_");
    const metadata = { type: imageFile.type, size_bytes: imageFile.size };

    const id = await uploadFile(buffer, filename, metadata);

    // Save product to MongoDB
    const newProduct = new Product({
      name,
      description,
      price,
      images: [{ name: filename, cloudID: id, publicURL: "" }],
    });

    await newProduct.save();

    return NextResponse.json(
      { message: "Product added successfully", product: newProduct },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as any).message
        : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
