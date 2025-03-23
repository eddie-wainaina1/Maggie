"use client";

import { useState, MouseEvent, useEffect } from "react";
import { Box, Button, Card, CardMedia, FormControl, InputLabel, Menu, MenuItem, Modal, Select, TextField, Typography, type SelectChangeEvent } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const ColumnValues = [
    "To Do",
    "In Progress",
    "Shipped",
    "Delivered",
    "Done"
]

const DoneValues = [
    "Completed",
    "Cancelled",
    "Pending",
    "Rejected",
]

interface OrderType {
    productId: string;
    productName: string;
    OrderDescription: string;
    price: number;
    currency: string;
    status: typeof ColumnValues[number];
    doneStatus?: typeof DoneValues[number];
    imageUrl: string;
}

interface OrderSummaryProps {
    productId: string;
    productName: string;
    orderPrice: number;
    orderLocation: string;
    imageUrl: string;
    currency: string;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: () => void;
}

interface StatusMenuProps {
    currentStatus: string;
    onChange: (status: string) => void;
}

interface DoneConfirmationModalProps {
    order: OrderType;
    open: boolean;
    onClose: () => void;
}

const DoneConfirmationModal = ({
    order,
    open,
    onClose
}: DoneConfirmationModalProps) => {
    const [doneValue, setDoneValue] = useState<string>("")
    const [comment, setComment] = useState<string>("");
    const [characterCount, setCharacterCount] = useState<number>(0);

    const handleChangeDoneValue = (e: SelectChangeEvent<string>) => {
        setDoneValue(e.target.value);
    }

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const comment = value.slice(0, 1000);
        setCharacterCount(comment.length);
        setComment(comment);
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Box>
                <Typography variant="body1">Switch to done</Typography>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                        Select Done Status
                    </InputLabel>
                    <Select
                        labelId="select-label"
                        value={doneValue}
                        label="Age"
                        onChange={handleChangeDoneValue}
                    >
                        {
                            DoneValues.map(value => (
                                <MenuItem key={value} value={value}>
                                    {value}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    margin="normal"
                    label={characterCount/1000}
                    multiline
                    rows={4}
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Comment up to 1000 characters"
                />
            </Box>
        </Modal>
    )
}

const StatusMenu = ({ currentStatus, onChange }: StatusMenuProps) => {
    "use client"
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const toggleMenu = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        setMenuOpen(!menuOpen);
    }

    const closeMenu = () => {
        setMenuOpen(false);
    }

    const selectOrderStatus = (status: string) => {
        onChange(status);
        closeMenu();
    }

    return (
        <>
        <Button onClick={toggleMenu} endIcon={<KeyboardArrowDownIcon />}>{currentStatus}</Button>
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={closeMenu}
            MenuListProps={{
            'aria-labelledby': 'button-status',
            }}
        >
            {
                ColumnValues.map(value => (
                    <MenuItem key={value} onClick={() => selectOrderStatus(value)}>
                        {value}
                    </MenuItem>
                ))
            }
        </Menu>
        </>
    )
}

export const OrderSummary = ({
    productId,
    productName,
    orderPrice,
    orderLocation,
    imageUrl,
    currency,
    onDragStart,
    onClick,
}: OrderSummaryProps) => {
    const orderSummaryCardStyles = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        height: "fit-content",
        padding: 2,
        cursor: "pointer"
    };

    return (
        <Card
            sx={orderSummaryCardStyles}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", productId);
                onDragStart(e);
            }}
            onClick={onClick}
        >
            <Box width="70%">
                <Typography variant="h6">{productName} ({productId})</Typography>
                <Typography variant="body2">{currency} {orderPrice}</Typography>
                <Typography variant="body2">{orderLocation}</Typography>
            </Box>
            <CardMedia
                component="img"
                image={imageUrl}
                sx={{ width: "25%" }}
            />
        </Card>
    );
};

export const OrderCard = ({
    productId,
    productName,
    OrderDescription,
    price,
    status,
    doneStatus,
    imageUrl,
    currency,
}: OrderType) => {
    const onStatusChange = () => {
        // Include api call to update the status.
        // fire off an event to update status
    }
    return (
        <Card sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            margin: 2,
            padding: 2,
            borderRadius: 10,
            zIndex: 2,
            width: "80%"
        }}>
            <CardMedia component="img" image={imageUrl}/>
            <Typography variant="h6">{productName}({productId})</Typography>
            <Typography variant="body1">{OrderDescription}</Typography>
            <Typography variant="body2">{currency} {price}</Typography>
            {status!=="Done" && <StatusMenu currentStatus={status} onChange={onStatusChange}/>}
            {doneStatus && <Typography variant="body2">{doneStatus}</Typography>}
        </Card>
    )
}

interface ColumnOrdersProps {
    orders: OrderType[];
    columnValue: typeof ColumnValues[number];
    onOrderStatusChange: (orderId: string, newStatus: typeof ColumnValues[number]) => void;
    onOpenOrder: (order: OrderType) => void;
}

const ColumnOrders = ({ orders, columnValue, onOrderStatusChange, onOpenOrder }: ColumnOrdersProps) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData("text/plain");
        onOrderStatusChange(orderId, columnValue);
    }

    return (
        <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: 2,
                border: "1px solid gray",
                borderRadius: 2,
                width: "300px",
                minHeight: "400px"
            }}
        >
            <Typography variant="h6" textAlign="center">{columnValue}</Typography>
            {orders.map((order) => (
                <OrderSummary
                    key={order.productId}
                    productId={order.productId}
                    productName={order.productName}
                    orderPrice={order.price}
                    orderLocation={order.OrderDescription}
                    imageUrl={order.imageUrl}
                    currency={order.currency}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", order.productId)}
                    onClick={() => onOpenOrder(order)}
                />
            ))}
        </Box>
    );
};

interface ColumnsProps {
    orders: OrderType[];
    onOrderStatusChange: (orderId: string, newStatus: typeof ColumnValues[number]) => void;
}

export const Columns = ({ orders, onOrderStatusChange }: ColumnsProps) => {
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

    const handleOpenOrder = (order: OrderType) => {
        setSelectedOrder(order);
    }

    const handleCloseOrder = () => {
        setSelectedOrder(null);
    }

    return (
        <Box sx={{ display: "flex", gap: 2 }}>
            {ColumnValues.map((columnValue) => (
                <ColumnOrders
                    key={columnValue}
                    columnValue={columnValue}
                    orders={orders.filter((order) => order.status === columnValue)}
                    onOrderStatusChange={onOrderStatusChange}
                    onOpenOrder={handleOpenOrder}
                />
            ))}

            {/* Modal for displaying OrderCard details */}
            <Modal open={!!selectedOrder} onClose={handleCloseOrder}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: 4,
                    borderRadius: 2,
                    maxWidth: 400,
                    width: '80%'
                }}>
                    {selectedOrder && (
                        <OrderCard
                            productId={selectedOrder.productId}
                            productName={selectedOrder.productName}
                            OrderDescription={selectedOrder.OrderDescription}
                            price={selectedOrder.price}
                            currency={selectedOrder.currency}
                            status={selectedOrder.status}
                            doneStatus={selectedOrder.doneStatus}
                            imageUrl={selectedOrder.imageUrl}
                        />
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export const Orders = () => {
    const [orders, setOrders] = useState<OrderType[]>([]);

    const onOrderStatusChange = async () => {
        setOrders([]);
    }
    const fetchOrders = async() => {
        setOrders([]);
    }
    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <Columns
            orders={orders}
            onOrderStatusChange={onOrderStatusChange}
        />
    )
}