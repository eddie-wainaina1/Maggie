"use client";
// import styles from "@/app/page.module.css";
import { Box, Grid, Typography } from "@mui/material";
import ProductCard from "./productCard";
import type { Product } from "@/types/srcTypes";
import { useEffect, useState } from "react";

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const json = await res.json();
        setProducts(json.data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        padding: 1,
        border: "none",
      }}
    >
      <Typography variant="h4">Marketplace</Typography>

      <Grid container spacing={3}>
        {products.map((product, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={product.productId ?? product.id ?? index}
          >
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
