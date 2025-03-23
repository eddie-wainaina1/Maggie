import { Box, Button, Paper, Rating, Typography } from "@mui/material";


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
                zIndex: 2,
                borderRadius: 10
            }}
        >
            <Paper sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                padding: 1
            }}>
                <img src={imageUrl} alt={`Product: ${title}`} height={392}/>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body1">{description}</Typography>
                <Typography variant="body2">{currency} {price}</Typography>
                <Rating name="rating" value={rating} readOnly/>
                <Button variant="contained">Add to cart</Button>
            </Paper>
        </Box>
    );
}
///
// await Promise.all(
//     bicycles.map((bicycle, i) => client.json.set(`bicycle:${i}`, '$', bicycle))
//   );
