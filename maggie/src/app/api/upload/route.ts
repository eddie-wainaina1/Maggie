import { uploadFile } from "@/db/cloudStorage";
import { Product } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
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
