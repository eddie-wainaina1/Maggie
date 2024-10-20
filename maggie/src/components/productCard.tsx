import { Box, Sheet } from "@mui/joy";
import { Rating, Typography } from "@mui/material";


export interface ProductCardProps {
    imageUrl: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    rating: number;
}
export default function ProductCard ({
    imageUrl,
    title,
    description,
    price,
    rating,
    currency="KSH"
}: Readonly<ProductCardProps>) {
    return (
        <Box
            sx={{
                borderRadius: 10,
                zIndex: 2,
                border: "1px solid #ccc",
            }}
        >
            <Sheet sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                margin: 2
            }}>
                <img src={imageUrl} alt={`Product: ${title}`} height={150}/>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body1">{description}</Typography>
                <Typography variant="body2">{currency} {price}</Typography>
                <Rating name="rating" value={rating} readOnly/>
            </Sheet>
        </Box>
    );
}
