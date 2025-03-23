import * as React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Language, Search } from "@mui/icons-material";

export default function SearchBar() {
  return (
    <Box sx={{ width: "250px" }}>
      <TextField
        variant="standard"
        fullWidth
        placeholder="Search..."
        slotProps={{
          input: {
            style: { color: "#fff" },
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#fff" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Language sx={{ color: "#fff" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiInput-underline:before": { borderBottomColor: "#fff" }, // Default state underline
          "& .MuiInput-underline:hover:before": { borderBottomColor: "#ddd" }, // Hover effect
          "& .MuiInput-underline:after": { borderBottomColor: "#fff" }, // Focused underline
        }}
      />
    </Box>
  );
}
