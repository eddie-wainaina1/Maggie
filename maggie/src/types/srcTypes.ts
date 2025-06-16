import type { ObjectId } from "mongodb";

export interface Product {
  id: string | ObjectId;
  productId: string;
  name: string;
  price: number;
  rating: number | null;
  description: string;
  inStock: number;
  imageUrl: string;
  currency?: string;
}

export interface ProductAdmin extends Product {
  pendingOrders: number;
  fulfilledOrders: number;
}

export interface ProductFields {
  name?: string;
  productId?: string;
  price?: number;
  description?: string;
  inStock?: number;
  currency?: string;
  pendingOrders?: number;
  fulfilledOrders?: number;
  imageUrl?: string;
}
