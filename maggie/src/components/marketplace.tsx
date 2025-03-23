import styles from "@/app/page.module.css";
import { Divider, Grid2, Paper, Typography } from "@mui/material";
import ProductCard, { ProductCardProps } from "./productCard";

interface ProductsList {
    products: ProductCardProps[];
}
export default function Marketplace (
    { products }: Readonly<ProductsList>
) {
    return (
        <Paper
            sx={{
                width: "100%",
                padding: 2,
            }}
        >
            <Typography variant="h4"
                sx={{
                    marginTop: 1
                }}
            >
                Marketplace
            </Typography>
            <Divider sx={
                {
                    marginBottom: 4,
                    marginTop: 1
                }
            }/>
            <Grid2 container spacing={4}>
            {
                products.map((product, index) => (
                    <Grid2 key={`product-${index+1}`}>
                        <ProductCard {...product}/>
                    </Grid2>
                ))
            }
            </Grid2>
        </Paper>
    )
}