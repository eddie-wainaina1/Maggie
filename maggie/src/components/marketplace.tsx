import { Sheet } from "@mui/joy";
import styles from "@/app/page.module.css";
import { Divider, Grid2, Typography } from "@mui/material";
import ProductCard, { ProductCardProps } from "./productCard";

interface ProductsList {
    products: ProductCardProps[];
}
export default function Marketplace (
    { products }: Readonly<ProductsList>
) {
    return (
        <Sheet
            component="div"
            className={styles.marketplace}
            sx={{
                padding: 2
            }}
        >
            <Typography variant="h4">Marketplace</Typography>
            <Divider sx={
                {
                    marginBottom: 4,
                    marginTop: 2
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
        </Sheet>
    )
}