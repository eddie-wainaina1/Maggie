import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { AppBar, Box, Button, Grid2, Paper, Typography } from "@mui/material";
import CartComponent from "./cart";
import SearchBar from "./search";

export default function Header () {
    return (
        <Paper
            sx={{
                width: "100%",
                paddingLeft: 2,
                margin: 10,
            }}
        >
            <AppBar sx={{width: "100%", paddingX: 2}}>
                <Grid2 container direction={"row"} sx={{justifyContent: "space-between", alignItems: "center"}}>
                    <Grid2>
                        <Typography
                            variant="h5"
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            MAGGIE&apos;S DESIGNS
                        </Typography>
                    </Grid2>
                    <Grid2>
                        <Box display="flex" alignItems="center" gap={2}>
                            <SearchBar/>
                            <CartComponent expanded={false} />
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="contained" color="warning">
                                        Sign In
                                    </Button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </Box>
                    </Grid2>
                </Grid2>
            </AppBar>
        </Paper>
    )
}
