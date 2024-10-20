import { uploadImage } from '@/db/cloudStorage';
import { Product } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const imageFile = formData.get('image') as Blob;

        if (!imageFile) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const { publicURL, cloudID } = await uploadImage(imageFile);

        // Save product to MongoDB
        const newProduct = new Product({
            name,
            description,
            price,
            images: [{ name: imageFile.name, cloudID, publicURL }],
        });

        await newProduct.save();

        return NextResponse.json({ message: 'Product added successfully', product: newProduct }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
