import { Product } from "@/db/schema";
import type { ProductFields } from "@/types/srcTypes";
import { ObjectId } from "mongodb";

export const addProduct = async (productData: ProductFields) => {
  const product = new Product(productData);
  return await product.save();
};

export const deleteProduct = async (id: String | ObjectId) => {
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
  return await Product.updateMany(filter, updateData);
};

export const getProducts = async (filter: Partial<ProductFields> = {}) => {
  const products = await Product.find(filter).lean();
  return products;
};
