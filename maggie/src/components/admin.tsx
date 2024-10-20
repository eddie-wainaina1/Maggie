import { Button, Card, Divider, Typography } from "@mui/material";

export default function Admin() {
    return (
        <div>
            <Typography variant="h4">Admin</Typography>
            <Divider/>
            <Card title="controls">
                <Typography variant="h6">Controls</Typography>
                <Button variant="contained" color="primary">
                    Add Product
                </Button>
                <Button variant="contained" color="secondary">
                    Delete Product
                </Button>
                <Button variant="contained" color="success">
                    Update Product
                </Button>
            </Card>
        </div>
    );
}