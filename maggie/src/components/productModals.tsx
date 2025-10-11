import type { ProductAdmin, ProductFields } from "@/types/srcTypes";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { useState, type ChangeEvent } from "react";
import Dropzone from "react-dropzone";

interface UpdateProductsModalProps {
  isModalOpen: boolean;
  handleCloseModal: () => any;
  editData: ProductAdmin[];
  handleDragDrop: (file: any[], product: ProductAdmin) => any;
  handleUpdateProducts: () => any;
}

interface DragDropProps {
  url?: string;
  onDragDrop: (url: string) => any;
}

export const DragDrop = ({ url, onDragDrop }: DragDropProps) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(url);
  const handleDragDrop = async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const { id } = await res.json();

      // Ensure we use `window.location.origin` to include protocol + hostname + port
      const _imageUrl = `${window.location.origin}/api/products/images?_id=${id}`;

      setImageUrl(_imageUrl);
      onDragDrop(_imageUrl);
    } catch (err) {
      console.error("Image upload error:", err);
    }
  };
  return (
    <Dropzone onDrop={handleDragDrop}>
      {({ getRootProps, getInputProps }) => (
        <Box
          {...getRootProps()}
          p={2}
          textAlign="center"
          border="1px dashed grey"
          my={2}
        >
          <input {...getInputProps()} />
          <Typography variant="body2">Drag & Drop Image Here</Typography>
          <img src={imageUrl} alt="product" width="100%" />
        </Box>
      )}
    </Dropzone>
  );
};

export const UpdateProductsModal = ({
  isModalOpen,
  handleCloseModal,
  handleDragDrop,
  handleUpdateProducts,
  editData,
}: UpdateProductsModalProps) => {
  return (
    <Modal open={isModalOpen} onClose={handleCloseModal}>
      <Box
        p={4}
        bgcolor="white"
        mx="auto"
        my="20vh"
        width="50vw"
        maxHeight="60vh"
        overflow="auto" // Scrollable modal
      >
        <Typography variant="h6">Update Product(s)</Typography>
        {editData.map((product) => (
          <div key={product.id.toString()}>
            <TextField
              fullWidth
              margin="normal"
              label="Product ID"
              value={product.productId ?? ""}
              disabled
            />
            <TextField
              fullWidth
              margin="normal"
              label="Price"
              defaultValue={product.price}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              defaultValue={product.description}
            />
            <TextField
              fullWidth
              margin="normal"
              label="In Stock"
              defaultValue={product.inStock}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Pending Orders"
              defaultValue={product.pendingOrders}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Fulfilled Orders"
              defaultValue={product.fulfilledOrders}
            />
            <Dropzone
              onDrop={(acceptedFiles) => handleDragDrop(acceptedFiles, product)}
            >
              {({ getRootProps, getInputProps }) => (
                <Box
                  {...getRootProps()}
                  p={2}
                  textAlign="center"
                  border="1px dashed grey"
                  my={2}
                >
                  <input {...getInputProps()} />
                  <Typography variant="body2">
                    Drag & Drop Image Here
                  </Typography>
                  <img src={product.imageUrl} alt="product" width="100%" />
                </Box>
              )}
            </Dropzone>
            <hr style={{ margin: "20px 0" }} />
          </div>
        ))}
        <Button variant="contained" fullWidth onClick={handleUpdateProducts}>
          Confirm Update
        </Button>
      </Box>
    </Modal>
  );
};

interface AddProductModalProps {
  isOpen: boolean;
  handleModalClose: () => any;
}
export const AddProductModal = ({
  isOpen,
  handleModalClose,
}: AddProductModalProps) => {
  const [product, setProduct] = useState<ProductFields>({});

  const updateProduct = (key: string, value: any) => {
    const newProduct = JSON.parse(JSON.stringify(product));
    newProduct[key] = value;
    setProduct(newProduct);
  };

  const onTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    const val = e.target.value;
    const field = e.target.id;
    // If the input type is number, convert empty string to undefined and parse numeric value
    const inputType = (e.target as HTMLInputElement).type;
    if (inputType === "number") {
      const numeric = val === "" ? undefined : Number(val);
      updateProduct(field, numeric);
    } else {
      updateProduct(field, val);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleModalClose}>
      <Box
        p={4}
        bgcolor="white"
        mx="auto"
        my="20vh"
        width="50vw"
        maxHeight="60vh"
        overflow="auto" // Scrollable modal
      >
        <Typography variant="h6">Add Product</Typography>
        <div aria-label="add-product-form" role="form">
          <TextField
            fullWidth
            id="name"
            margin="normal"
            label="Name"
            type="text"
            onChange={onTextChange}
            value={product.name ?? ""}
            required={true}
          />
          <TextField
            fullWidth
            id="description"
            margin="normal"
            label="Description"
            type="text"
            onChange={onTextChange}
            value={product.description ?? ""}
            required={true}
          />
          <TextField
            fullWidth
            id="price"
            margin="normal"
            label="Price"
            type="number"
            onChange={onTextChange}
            value={product.price ?? ""}
            required={true}
          />
          <TextField
            fullWidth
            id="inStock"
            margin="normal"
            label="In Stock"
            type="number"
            onChange={onTextChange}
            value={product.inStock ?? ""}
            required={true}
          />
          <DragDrop
            onDragDrop={(url: string) => {
              updateProduct("imageUrl", url);
            }}
          />
          <Button
            role="submit"
            variant="contained"
            fullWidth
            onClick={() => {}}
          >
            Submit
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
