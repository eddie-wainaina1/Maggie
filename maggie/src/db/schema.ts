import mongoose from 'mongoose';

export const connect = async ()=>{
    if (process.env.MONGO_URI){
        return await mongoose.connect(process.env.MONGO_URI);
    }
    else {
        throw new Error("DB URI not found");
    }
}

export const ImageSchema = new mongoose.Schema({
    name: String,
    cloudID: String,
    publicURL: String,
    description: String,
});

export const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    images: [ImageSchema],
    tags: [String],
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
