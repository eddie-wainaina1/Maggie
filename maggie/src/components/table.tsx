"use client"

import React, { useState } from 'react';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Button, Modal, Box, Tooltip} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import type { Product } from '@/types/srcTypes';
import { UpdateProductsModal } from './productModals';
import { PictureDisplayModal } from './pictureDisplayModal';

interface ProductTableProps {
  productsData: Product[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ productsData }) => {
  const [products, setProducts] = useState<Product[]>(productsData);
  const [selectedProducts, setSelectedProducts] = useState<GridRowSelectionModel>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Product[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const columns: GridColDef[] = [
    { field: 'productId', headerName: 'Product ID', width: 150 },
    { field: 'price', headerName: 'Price', width: 100, sortable: true },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'inStock', headerName: 'In Stock', width: 100, sortable: true },
    { field: 'pendingOrders', headerName: 'Pending Orders', width: 150, sortable: true },
    { field: 'fulfilledOrders', headerName: 'Fulfilled Orders', width: 150, sortable: true },
    {
      field: 'imageUrl',
      headerName: 'View Image',
      width: 150,
      renderCell: (params) => (
        <Tooltip title={<img src={params.value} alt="product" width="100" />} arrow>
          <Button onClick={() => openImageModal(params.value)}>View Image</Button>
        </Tooltip>
      ),
    },
  ];

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedProducts(newSelection);
  };

  const handleOpenModal = () => {
    const selectedProductData = products.filter((product) => selectedProducts.includes(product.id));
    setEditData(selectedProductData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData([]);
  };

  const handleCloseImageModal = () => {
    setCurrentImageUrl('');
  };

  const openImageModal = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
  };

  const handleDragDrop = (acceptedFiles: File[], rowData: Product) => {
    const updatedProduct = { ...rowData, imageUrl: URL.createObjectURL(acceptedFiles[0]) };
    setProducts((prev) => prev.map((prod) => (prod.id === rowData.id ? updatedProduct : prod)));
  };

  const handleUpdateProducts = () => {
    // Bulk update logic (left empty for now)
    handleCloseModal();
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Button variant="contained" color="secondary" startIcon={<Add />} sx={{ mr: 2 }}>
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

