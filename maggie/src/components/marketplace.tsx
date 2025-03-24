import styles from "@/app/page.module.css";
import { Box, Divider, Grid2, Typography } from "@mui/material";
import ProductCard, { ProductCardProps } from "./productCard";

interface ProductsList {
    products: ProductCardProps[];
}
export default function Marketplace (
    { products }: Readonly<ProductsList>
) {
    return (
        <Box
            sx={{
                width: "100%",
                padding: 1,
                border: "none",
            }}
        >
            <Typography variant="h4" sx={{paddingY: 2}}>
                Marketplace
            </Typography>

            <Grid2 container spacing={3}>
            {
                products.map((product, index) => (
                    <Grid2 key={`product-${index+1}`}>
                        <ProductCard {...product}/>
                    </Grid2>
                ))
            }
            </Grid2>
        </Box>
    )
}