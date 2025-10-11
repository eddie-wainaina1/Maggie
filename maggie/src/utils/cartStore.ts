import type { Product } from "@/types/srcTypes";

export interface CartItem extends Product {
  quantity: number;
}

type Listener = (cart: CartItem[]) => void;

const STORAGE_KEY = "maggie_cart_v1";

let cart: CartItem[] = [];
const listeners: Listener[] = [];

function notify() {
  const snapshot = cart.map((c) => ({ ...c }));
  listeners.forEach((l) => {
    try {
      l(snapshot);
    } catch (err) {
      // log listener errors for visibility
      try {
        // eslint-disable-next-line no-console
        console.error("cartStore listener error:", err);
      } catch {}
    }
  });
}

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cart = JSON.parse(raw) as CartItem[];
    }
  } catch (_err) {
    try {
      // eslint-disable-next-line no-console
      console.error("cartStore load error:", _err);
    } catch {}
    cart = [];
  }
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (_err) {
    try {
      // eslint-disable-next-line no-console
      console.error("cartStore save error:", _err);
    } catch {}
  }
}

export const cartStore = {
  // initialize store from server (Redis) if available
  async init() {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        credentials: "same-origin",
      });
      if (res.ok) {
        const json = await res.json();
        const serverCart = (json.cart || {}) as Record<string, unknown>;
        // serverCart is keyed by productId -> product
        const items: CartItem[] = Object.values(serverCart).map((p) => {
          const prod = p as Record<string, unknown>;
          const item: CartItem = {
            id: (prod.id ?? prod.productId ?? "") as unknown as string,
            productId: (prod.productId ?? String(prod.id ?? "")) as string,
            name: (prod.name ?? "") as string,
            price: Number(prod.price ?? 0),
            rating: (prod.rating ?? null) as number | null,
            description: (prod.description ?? "") as string,
            inStock: Number(prod.inStock ?? 0),
            imageUrl: (prod.imageUrl ?? "") as string,
            currency: (prod.currency ?? undefined) as string | undefined,
            quantity: Number(prod.quantity ?? 0),
          };
          return item;
        });
        if (items.length > 0) {
          cart = items;
          saveToStorage();
          notify();
        }
      }
    } catch (err) {
      try {
        // eslint-disable-next-line no-console
        console.error("cartStore init error:", err);
      } catch {}
    }
  },
  getCart(): CartItem[] {
    return cart.map((c) => ({ ...c }));
  },
  replaceCart(items: CartItem[]) {
    cart = items.map((c) => ({ ...c }));
    saveToStorage();
    notify();
  },
  addItem(product: Product, quantity = 1) {
    const key = (product.productId ?? String(product.id)) as string;
    const idx = cart.findIndex((c) => (c.productId ?? String(c.id)) === key);
    if (idx >= 0) {
      cart[idx].quantity = (cart[idx].quantity ?? 0) + quantity;
    } else {
      const item: CartItem = { ...(product as Product), quantity };
      cart.push(item);
    }
    saveToStorage();
    notify();
  },
  setQuantity(productId: string | number, quantity: number) {
    const key = String(productId);
    const idx = cart.findIndex((c) => (c.productId ?? String(c.id)) === key);
    if (idx >= 0) {
      if (quantity <= 0) {
        cart.splice(idx, 1);
      } else {
        cart[idx].quantity = quantity;
      }
      saveToStorage();
      notify();
    }
  },
  removeItem(productId: string | number) {
    const key = String(productId);
    const idx = cart.findIndex((c) => (c.productId ?? String(c.id)) === key);
    if (idx >= 0) {
      cart.splice(idx, 1);
      saveToStorage();
      notify();
    }
  },
  subscribe(listener: Listener) {
    listeners.push(listener);
    // immediately call with snapshot
    listener(cart.map((c) => ({ ...c })));
    return () => {
      const i = listeners.indexOf(listener);
      if (i >= 0) listeners.splice(i, 1);
    };
  },
};

// initialize from localStorage
loadFromStorage();

export default cartStore;
