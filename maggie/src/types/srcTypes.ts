import type { ObjectId } from "mongodb";

export interface Product {
  id: string | ObjectId;
  productId: string;
  price: number;
  description: string;
  inStock: number;
  pendingOrders: number;
  fulfilledOrders: number;
  imageUrl: string;
}

export interface ProductFields {
  name?: string;
  productId?: string;
  price?: number;
  description?: string;
  inStock?: number;
  pendingOrders?: number;
  fulfilledOrders?: number;
  imageUrl?: string;
}
