export interface Product {
    id: number;
    productId: string;
    price: number;
    description: string;
    inStock: number;
    pendingOrders: number;
    fulfilledOrders: number;
    imageUrl: string;
}
