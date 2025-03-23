"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { SyntheticEvent } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import { Box, Tab, Tabs } from "@mui/material";
import { ProductTable } from "./table";
import productsData from "@/miscl/productsSample";
import { Orders } from "./orders";
import Users from "./users";

interface TabNavigationProps {
    searchParams: { panel?: string; search?: string };
    users: any[]; // Pass users from server
}

export default function TabNavigation({ searchParams, users }: TabNavigationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const urlSearchParams = useSearchParams();

    const activePanel = searchParams.panel || "orders";

    const handleChange = (_: SyntheticEvent, newPanel: string) => {
        const params = new URLSearchParams(urlSearchParams.toString());
        params.set("panel", newPanel);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <TabContext value={activePanel}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs component="div" onChange={handleChange} value={activePanel}>
                    <Tab label="Orders" value="orders" />
                    <Tab label="Products" value="products" />
                    <Tab label="Users" value="users" />
                    <Tab label="Report" value="report" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value="orders">
                <Orders />
            </TabPanel>
            <TabPanel value="products">
                <ProductTable productsData={productsData} />
            </TabPanel>
            <TabPanel value="users">
                <Users searchParams={searchParams} />
            </TabPanel>
            <TabPanel value="report">
                <ProductTable productsData={productsData} />
            </TabPanel>
        </TabContext>
    );
}
