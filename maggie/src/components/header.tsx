import { AppBar, Box, Typography } from "@mui/material";

export default function Header () {
    return (
        <header>
            <Box sx={{flexGrow: 1}}>
                <AppBar
                    position="static"
                    sx={{
                        padding: 2,
                        width: '100%',
                        height: "auto",
                    }}
                >
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        MAGGIE&apos;S
                    </Typography>
                </AppBar>
            </Box>
        </header>
    )
}
