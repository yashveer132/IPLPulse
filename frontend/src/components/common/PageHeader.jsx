import React from "react";
import { Box, Typography } from "@mui/material";

const PageHeader = ({ title, subtitle }) => {
  return (
    <Box sx={{ textAlign: "center", mb: 5, mt: 2 }}>
      <Typography
        variant="h3"
        fontWeight={900}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 900, mx: "auto", mb: 1 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
