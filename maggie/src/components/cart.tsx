"use client";

import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import {
  Badge,
  Button,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { QuantitySelector } from "./productCard";
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
  const [open, setOpen] = useState(false);

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
          currency: (prod.currency ?? "KSH") as string | undefined,
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
  // NOTE: adding to cart is handled elsewhere (cartStore.addItem / server API).

  const totalCount = Array.isArray(cart)
    ? cart.reduce((sum, it) => sum + (it.quantity ?? 0), 0)
    : 0;

  const currencyFormat = (amount: number, currency?: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency ?? "KSH",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency ?? "KSH"}${amount.toFixed(2)}`;
    }
  };

  const totalPrice = Array.isArray(cart)
    ? cart.reduce((sum, it) => sum + (Number(it.price ?? 0) * Number(it.quantity ?? 0)), 0)
    : 0;

  // Determine currency to use for the total: if all items share the same currency, use it.
  const totalCurrency = (() => {
    if (!Array.isArray(cart) || cart.length === 0) return undefined;
    const currencies = Array.from(
      new Set(
        cart
          .map((it) => it.currency)
          .filter((c): c is string => typeof c === "string" && c.length > 0)
      )
    );
    return currencies.length === 1 ? currencies[0] : undefined;
  })();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const CartList = (
    <Box sx={{ width: 360, p: 2 }} role="presentation">
      <Typography variant="h6" gutterBottom>
        Your Cart
      </Typography>
      <List>
        {cart.length === 0 ? (
          <ListItem>
            <ListItemText primary="Your cart is empty" />
          </ListItem>
        ) : (
          cart.map((item: CartItem) => {
            const ppu = Number(item.price ?? 0);
            const qty = Number(item.quantity ?? 0);
            const subtotal = ppu * qty;
            return (
              <ListItem key={item.productId} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={700}>{item.name ?? item.description}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">Price: {currencyFormat(ppu, item.currency)}</Typography>
                    <Typography variant="body2">Qty: {qty}</Typography>
                    <Typography variant="body2">Subtotal: {currencyFormat(subtotal, item.currency)}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                      <QuantitySelector product={item} />
                      <Box sx={{ flex: 1 }} />
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            );
          })
        )}
      </List>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="subtitle1">Total:</Typography>
        <Typography variant="subtitle1" fontWeight={700}>{currencyFormat(totalPrice, totalCurrency)}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
        <Button variant="contained" color="primary" onClick={() => { /* TODO: navigate to checkout */ }}>
          Checkout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: '20px' }}>
      {expanded ? (
        // full page cart (existing behavior)
        <Box sx={{ p: '20px' }}>
          <Typography variant="h4">Your Cart</Typography>
          <List>
            {cart.length === 0 ? (
              <ListItem>
                <ListItemText primary="Your cart is empty" />
              </ListItem>
            ) : (
              cart.map((item: CartItem) => {
                const ppu = Number(item.price ?? 0);
                const qty = Number(item.quantity ?? 0);
                const subtotal = ppu * qty;
                return (
                  <ListItem key={item.productId} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={700}>{item.name ?? item.description}</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">Price: {currencyFormat(ppu, item.currency)}</Typography>
                        <Typography variant="body2">Qty: {qty}</Typography>
                        <Typography variant="body2">Subtotal: {currencyFormat(subtotal, item.currency)}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                          <QuantitySelector product={item} />
                          <Box sx={{ flex: 1 }} />
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                );
              })
            )}
          </List>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Typography variant="h6" fontWeight={700}>Total: {currencyFormat(totalPrice, totalCurrency)}</Typography>
          </Box>
        </Box>
      ) : (
        <>
          <IconButton color="inherit" aria-label="cart" onClick={handleOpen}>
            <Badge badgeContent={totalCount} color="secondary" showZero>
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Drawer anchor="right" open={open} onClose={handleClose}>
            {CartList}
          </Drawer>
        </>
      )}
    </Box>
  );
};

export default CartComponent;
