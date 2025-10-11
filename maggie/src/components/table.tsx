"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Modal, Box, Tooltip } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import type { ProductAdmin } from "@/types/srcTypes";
import { AddProductModal, UpdateProductsModal } from "./productModals";
import { PictureDisplayModal } from "./pictureDisplayModal";

interface ProductTableProps {
  productsData: ProductAdmin[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ productsData }) => {
  const [products, setProducts] = useState<ProductAdmin[]>(productsData);
  const [selectedProducts, setSelectedProducts] = useState<(string | number)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProductAdmin[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const columns: GridColDef[] = [
    { field: "productId", headerName: "Product ID", width: 150 },
    { field: "price", headerName: "Price", width: 100, sortable: true },
    { field: "description", headerName: "Description", width: 200 },
    { field: "inStock", headerName: "In Stock", width: 100, sortable: true },
    {
      field: "pendingOrders",
      headerName: "Pending Orders",
      width: 150,
      sortable: true,
    },
    {
      field: "fulfilledOrders",
      headerName: "Fulfilled Orders",
      width: 150,
      sortable: true,
    },
    {
      field: "imageUrl",
      headerName: "View Image",
      width: 150,
      renderCell: (params) => (
        <Tooltip
          title={<img src={params.value} alt="product" width="100" />}
          arrow
        >
          <Button onClick={() => openImageModal(params.value)}>
            View Image
          </Button>
        </Tooltip>
      ),
    },
  ];

  const handleSelectionChange = (newSelection: any) => {
    // DataGrid may pass a selection model; coerce to an array of ids
    setSelectedProducts(Array.isArray(newSelection) ? newSelection : []);
  };

  const handleOpenModal = () => {
    const selectedProductData = products.filter((product) =>
      selectedProducts.includes(product.id as any),
    );
    setEditData(selectedProductData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData([]);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };
  const handleCloseImageModal = () => {
    setCurrentImageUrl("");
  };

  // Load latest products on mount
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const openImageModal = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
  };

  const handleDragDrop = (acceptedFiles: File[], rowData: ProductAdmin) => {
    const updatedProduct = {
      ...rowData,
      imageUrl: URL.createObjectURL(acceptedFiles[0]),
    };
    setProducts((prev) =>
      prev.map((prod) => (prod.id === rowData.id ? updatedProduct : prod)),
    );
  };

  const handleUpdateProducts = () => {
    // Bulk update logic (left empty for now)
    handleCloseModal();
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      const json = await res.json();
      setProducts(json.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  return (
    <div style={{ height: 400, width: "100%" }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            sx={{ mr: 2 }}
            onClick={() => setAddModalOpen(true)}
          >
            Add
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleOpenModal}
            disabled={selectedProducts.length === 0}
            sx={{ mr: 2 }}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={selectedProducts.length === 0}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <DataGrid
        rows={products}
        columns={columns}
        checkboxSelection
        onRowSelectionModelChange={handleSelectionChange}
      />
      <AddProductModal
        isOpen={addModalOpen}
        handleModalClose={handleCloseAddModal}
        onCreated={fetchProducts}
      />
      <UpdateProductsModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        editData={editData}
        handleDragDrop={handleDragDrop}
        handleUpdateProducts={handleUpdateProducts}
      />
      <PictureDisplayModal
        currentImageUrl={currentImageUrl}
        onClose={handleCloseImageModal}
      />
    </div>
  );
};
