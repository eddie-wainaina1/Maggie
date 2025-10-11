"use client"

import React from "react";
import { SignedIn, SignedOut, useClerk, UserButton } from "@clerk/nextjs";
import { AppBar, Box, Button, Grid, Paper, Typography } from "@mui/material";
import CartComponent from "./cart";
import SearchBar from "./search";

const SignInButton_ = () => {
  const clerk = useClerk();

  const handleClick = async () => {
    try {
      // useClerk's returned object typing is complex; call openSignIn if available
      const maybe = clerk as unknown as { openSignIn?: (opts?: Record<string, unknown>) => void };
      maybe.openSignIn?.({});
    } catch (err) {
      // log error for visibility
      // eslint-disable-next-line no-console
      console.error("Failed to open sign-in modal", err);
    }
  };

  return React.createElement(Button, { variant: "text", color: "secondary", onClick: handleClick }, "Sign In");
};

export default function Header() {
  return (
    <Paper
      sx={{
        width: "100%",
        paddingLeft: 2,
        margin: 10,
      }}
    >
      <AppBar sx={{ width: "100%", paddingX: 2 }}>
        <Grid
          container
          direction={"row"}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Grid>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              MAGGIE&apos;S DESIGNS
            </Typography>
          </Grid>
          <Grid>
            <Box display="flex" alignItems="center" gap={2}>
              <SearchBar />
              <CartComponent expanded={false} />
              <SignedOut>
                {/* Use a direct clerk call instead of the SignInButton component to avoid client/server boundary issues */}
                <SignInButton_ />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </Box>
          </Grid>
        </Grid>
      </AppBar>
    </Paper>
  );
}
