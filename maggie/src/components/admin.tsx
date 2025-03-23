"use client";
import { useState, type SyntheticEvent } from "react";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Divider, Tab, Typography } from "@mui/material";
import { ProductTable } from "./table";
import productsData from "@/miscl/productsSample";
import { Orders } from "./orders";
import Users from "./users";


export default function Admin(params: {
    searchParams: Promise<{ search?: string }>;
  }) {
    const [activePanel, setActivePanel] = useState<string>('orders');

    const handleTabChange = (event: SyntheticEvent<Element, Event>, newPanel: string) => {
        setActivePanel(newPanel);
    };

    return (
        <div>
            <Typography variant="h4" sx={{
                marginTop: 2
            }}>Admin</Typography>
            <Divider sx={
                {
                    marginBottom: 4,
                    marginTop: 0
                }
            }/>
                <TabContext value={activePanel}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleTabChange}>
                            <Tab label="Orders" value="orders" />
                            <Tab label="Products" value="products" />
                            <Tab label="Users" value="users" />
                            <Tab label="Report" value="report" />
                        </TabList>
                    </Box>
                    <TabPanel value="orders">
                        <Orders/>
                    </TabPanel>
                    <TabPanel value="products">
                        <ProductTable productsData={productsData}/>
                    </TabPanel>
                    <TabPanel value="users">
                        <Users searchParams={params.searchParams}/>
                    </TabPanel>
                    <TabPanel value="report">
                        <ProductTable productsData={productsData}/>
                    </TabPanel>
                </TabContext>
        </div>
    );
}
