"use client";

import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// Define the structure of a product
export interface Product {
  productId: string;
  description: string;
  price: number;
}

export interface CartProps {
  expanded: boolean;
}

export type Cart = Product[];

export const CartComponent = ({ expanded }: CartProps) => {
  const [cart, setCart] = useState<Cart>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  // Fetch the cart items from the API
  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart/get");
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  // Add a product to the cart
  const addToCart = async (product: Product) => {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");
      await fetchCart(); // Refresh the cart after adding
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  // Remove a product from the cart
  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error("Failed to remove from cart");
      await fetchCart(); // Refresh the cart after removal
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {expanded ? (
        <>
          <Typography variant="h4">Your Cart</Typography>
          <List>
            {cart.map((item: Product) => (
              <ListItem
                key={item.productId}
                secondaryAction={
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </Button>
                }
              >
                <ListItemText
                  primary={`${item.description} - $${item.price}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Badge badgeContent={0} color="secondary" showZero>
          <ShoppingCartIcon />
        </Badge>
      )}
    </div>
  );
};

export default CartComponent;
