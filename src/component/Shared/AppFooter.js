import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
// import TikTokIcon from "./TikTokIcon";

function AppFooter() {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#E8F5E9",
        color: "black.light",
        py: 3,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        justifyContent: "center",
        
        mt: "auto",
      }}
    >
      <Typography variant="body2" align="left" sx={{ mb: 2 }}>
        For more updates and assistance, follow us on social media!
      </Typography>
      <Box>
        <IconButton
          color="inherit"
          aria-label="Instagram"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="Facebook"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="TikTok"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* <TikTokIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="WhatsApp"
          href="YOUR_WHATSAPP_LINK"
          target="_blank"
          rel="noopener noreferrer"
        > */}
          <WhatsAppIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="Twitter (X)"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TwitterIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default AppFooter;
