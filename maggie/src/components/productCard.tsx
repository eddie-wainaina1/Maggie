"use client";
import type { Product } from "@/types/srcTypes";
import {
  Add,
  AddShoppingCart,
  Remove,
  RemoveShoppingCart,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Paper,
  Rating,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { cartStore } from "@/utils/cartStore";

export interface ProductCardProps {
  product: Product;
}

export interface QuantitySelectorProps {
  product: Product;
}
export function QuantitySelector({ product }: QuantitySelectorProps) {
  const productId = product.id.toString();
  const getLocalQuantity = () => {
    const local = cartStore.getCart().find((c) => (c.productId ?? String(c.id)) === productId);
    return local ? Number(local.quantity ?? 0) : 0;
  };

  const [quantity, setQuantity] = useState<number>(getLocalQuantity());

  const handleIncrease = async () => {
    const res = await fetch(`/api/cart/quantity?productId=${encodeURIComponent(productId)}&action=increase`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (res.ok) {
      const data = await res.json();
      // reflect new quantity in the local store
      cartStore.setQuantity(productId, data.quantity ?? 0);
      await fetchQuantity();
    } else {
      await fetchQuantity();
    }
  }

  const handleDecrease = async () => {
    const res = await fetch(`/api/cart/quantity?productId=${encodeURIComponent(productId)}&action=reduce`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (res.ok) {
      const data = await res.json();
      cartStore.setQuantity(productId, data.quantity ?? 0);
      await fetchQuantity();
    } else {
      await fetchQuantity();
    }
  }

  const fetchQuantity = async () => {
    const res = await fetch(`/api/cart/quantity?productId=${encodeURIComponent(productId)}`);
    if (res.ok) {
      const data = await res.json();
      setQuantity(data.quantity);
    } else {
      setQuantity(0);
    }
  };

  const addToCart = async () => {
    const cartItem = { ...product, quantity: 1 }
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: cartItem }),
      });
      if (response.ok) {
        // Server returned success; sync into local store
        cartStore.addItem(product, 1);
      }
      await fetchQuantity();
      if (!response.ok) throw new Error("Failed to add to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  useEffect(() => {
    // initialize from server and local store
    fetchQuantity();
    const unsubscribe = cartStore.subscribe((items) => {
      const found = items.find((c) => (c.productId ?? String(c.id)) === productId);
      setQuantity(found ? Number(found.quantity ?? 0) : 0);
    });
    return unsubscribe;
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    quantity ? (
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        width="fit-content"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          px: 1,
          py: 0.5,
        }}
      >
        <Button
          size="small"
          variant="text"
          onClick={handleDecrease}
          color="error"
        >
          <AddShoppingCart fontSize="small" />
          &nbsp;
          <Remove fontSize="small" />
        </Button>

        <Typography mx={1} minWidth={20} textAlign="center">
          {quantity}
        </Typography>

        <Button
          size="small"
          variant="text"
          onClick={handleIncrease}
          color="success"
        >
          <Add fontSize="small" />
          &nbsp;
          <RemoveShoppingCart fontSize="small" />
        </Button>
      </Box>
    ) : (
      <Button variant="contained" onClick={addToCart}>
        <AddShoppingCart />
        &nbsp;Add to cart
      </Button>
    )
  );
}

export default function ProductCard({
  product
}: Readonly<ProductCardProps>) {
  const {
    imageUrl,
    name,
    description,
    price,
    rating,
    currency = "KSH",
  } = product;

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: 1,
      }}
    >
      { /* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={`Product: ${name}`} height={285} />
      <Typography variant="h6">{name}</Typography>
      <Typography variant="body1">{description}</Typography>
      <Typography variant="body2">
        {currency} {price}
      </Typography>
      <Rating name="rating" value={rating} defaultValue={0} readOnly />
      <QuantitySelector product={product} />
    </Paper>
  );
}
