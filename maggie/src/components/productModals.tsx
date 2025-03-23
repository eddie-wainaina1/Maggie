import type { Product } from "@/types/srcTypes";
import { Box, Button, Modal, TextField, Typography } from "@mui/material"
import Dropzone from "react-dropzone"

interface UpdateProductsModalProps {
    isModalOpen: boolean;
    handleCloseModal: () => any;
    editData: Product[];
    handleDragDrop: (file: any[], product: Product) => any;
    handleUpdateProducts: () => any;
}

export const UpdateProductsModal = ({ isModalOpen, handleCloseModal, handleDragDrop, handleUpdateProducts, editData }: UpdateProductsModalProps) => {
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
                <Typography variant='h6'>Update Product(s)</Typography>
                {editData.map((product) => (
                    <div key={product.id}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Product ID"
                            value={product.productId}
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
                        <Dropzone onDrop={(acceptedFiles) => handleDragDrop(acceptedFiles, product)}>
                            {({ getRootProps, getInputProps }) => (
                                <Box
                                    {...getRootProps()}
                                    p={2}
                                    textAlign="center"
                                    border="1px dashed grey"
                                    my={2}
                                >
                                    <input {...getInputProps()} />
                                    <p>Drag & Drop Image Here</p>
                                    <img src={product.imageUrl} alt="product" width="100%" />
                                </Box>
                            )}
                        </Dropzone>
                        <hr style={{ margin: '20px 0' }} />
                    </div>
                ))}
                <Button variant="contained" fullWidth onClick={handleUpdateProducts}>
                    Confirm Update
                </Button>
            </Box>
        </Modal>
    )
}