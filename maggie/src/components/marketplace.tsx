import styles from "@/app/page.module.css";
import { Box, Divider, Grid, Typography } from "@mui/material";
import ProductCard, { ProductCardProps } from "./productCard";
import type { Product } from "@/types/srcTypes";

interface ProductsList {
  products: Product[];
}

export default function Marketplace({ products }: Readonly<ProductsList>) {
  return (
    <Box
      sx={{
        width: "100%",
        padding: 1,
        border: "none",
      }}
    >
      <Typography variant="h4" sx={{ paddingY: 2 }}>
        Marketplace
      </Typography>

      <Grid container spacing={3}>
        {products.map((product, index) => (
          <Grid key={`product-${index + 1}`}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
