import { Product, connect } from "@/db/schema";
import type { ProductFields } from "@/types/srcTypes";
import { ObjectId } from "mongodb";

let connectionPromise: Promise<any> | null = null;
const ensureConnected = async () => {
  if (!connectionPromise) connectionPromise = connect();
  return connectionPromise;
};

export const addProduct = async (productData: ProductFields) => {
  await ensureConnected();
  const product = new Product(productData);
  return await product.save();
};

export const deleteProduct = async (id: String | ObjectId) => {
  await ensureConnected();
  let _id = id;
  if (typeof id === "string") {
    _id = new ObjectId(id);
  }
  await Product.findByIdAndDelete(_id);
};

export const updateProduct = async (
  id: String | ObjectId,
  productData: ProductFields,
) => {
  await ensureConnected();
  let _id = id;
  if (typeof id === "string") {
    _id = new ObjectId(id);
  }
  const product = Product.findByIdAndUpdate(id, productData);
};

export const updateMultipleProducts = async (
  filter: Partial<ProductFields>,
  updateData: Partial<ProductFields>,
) => {
  await ensureConnected();
  return await Product.updateMany(filter, updateData);
};

export const getProducts = async (filter: Partial<ProductFields> = {}) => {
  await ensureConnected();
  const products = await Product.find(filter).lean();
  return products;
};
