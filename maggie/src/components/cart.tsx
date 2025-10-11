"use client";

import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import {
  Badge,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getFingerprint } from "@/cache/utils";
import type { Product } from "@/types/srcTypes";
import { cartStore } from "@/utils/cartStore";

export interface CartProps {
  expanded: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export type Cart = CartItem[];

export const CartComponent = ({ expanded }: CartProps) => {
  // start with empty array so server-render and initial client render match
  const [cart, setCart] = useState<Cart>([]);

  const setDeviceCookie = async () => {
    if (!Cookies.get("deviceId")) {
      const fp = await getFingerprint();
      // Set secure flag when on HTTPS, and use sameSite lax to reduce CSRF risk
      const secureFlag = typeof window !== "undefined" && window.location.protocol === "https:";
      Cookies.set("deviceId", fp, {
        expires: 7,
        path: "/",
        secure: secureFlag,
        sameSite: "lax",
      }); // 7-day expiry
    }
  };

  useEffect(() => {
    // initial server sync: hydrate local store from Redis via API
    (async () => {
      await cartStore.init();
      // also fetch server cart in case of mismatch
      await fetchCart();
    })();
    // subscribe to the local cart store for live updates
    const unsubscribe = cartStore.subscribe((items) => {
      setCart(items as Cart);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch the cart items from the API
  const fetchCart = async () => {
    await setDeviceCookie();
    try {
      const response = await fetch("/api/cart", {
        "method": "GET",
        "credentials": "same-origin",
      });
      const data = await response.json();
      const serverCart = (data.cart || {}) as Record<string, unknown>;
      const items = Object.values(serverCart).map((p) => {
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
      // update local store and component state
      cartStore.replaceCart(items);
      setCart(items);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  // Add a product to the cart
  const updateCart = async (product: Product) => {
    await setDeviceCookie();
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");
      // sync server response into the store (for simplicity we reload server cart)
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {expanded ? (
        <>
          <Typography variant="h4">Your Cart</Typography>
          <List>
            {cart.map((item: CartItem) => (
              <ListItem
                key={item.productId}
                secondaryAction={
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => updateCart(item)}
                  >
                    Remove
                  </Button>
                }
              >
                <ListItemText
                  primary={`${item.description} - $${item.price}`}
                  secondary={item.quantity ? `Qty: ${item.quantity}` : undefined}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <IconButton color="inherit" aria-label="cart">
          {(() => {
            const totalCount = Array.isArray(cart)
              ? cart.reduce((sum, it) => sum + (it.quantity ?? 0), 0)
              : 0;
            return (
              <Badge badgeContent={totalCount} color="secondary" showZero>
                <ShoppingCartIcon />
              </Badge>
            );
          })()}
        </IconButton>
      )}
    </div>
  );
};

export default CartComponent;
