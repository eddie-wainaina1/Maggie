"use client";
import {
  Add,
  AddShoppingCart,
  Remove,
  RemoveShoppingCart,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Rating,
  Typography,
} from "@mui/material";

export interface ProductCardProps {
  imageUrl: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  numInCart: number;
}

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => any;
}
function QuantitySelector({ quantity, setQuantity }: QuantitySelectorProps) {
  const handleDecrease = () => setQuantity(Math.max(0, quantity - 1));
  const handleIncrease = () => setQuantity(quantity + 1);

  return (
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
  );
}

export default function ProductCard({
  imageUrl,
  title,
  description,
  price,
  rating,
  currency = "KSH",
  numInCart = 1,
}: Readonly<ProductCardProps>) {
  const setCartQuantity = (quantity: number) => {
    console.log(quantity);
  };
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: 1,
      }}
    >
      <img src={imageUrl} alt={`Product: ${title}`} height={285} />
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">{description}</Typography>
      <Typography variant="body2">
        {currency} {price}
      </Typography>
      <Rating name="rating" value={rating} readOnly />
      {numInCart > 0 ? (
        <QuantitySelector quantity={numInCart} setQuantity={setCartQuantity} />
      ) : (
        <Button variant="contained">
          <AddShoppingCart />
          &nbsp;Add to cart
        </Button>
      )}
    </Paper>
  );
}
