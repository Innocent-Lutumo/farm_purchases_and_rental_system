import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

const Footer = () => {
  return (
    <Box sx={{ textAlign: "center", p: 3, bgcolor: "#d8f9d8", mt: 6 }}>
      {/* Social Media Icons */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <IconButton
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#E4405F", mx: 1 }}
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          href="https://www.twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#1DA1F2", mx: 1 }}
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#1877F2", mx: 1 }}
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#0077B5", mx: 1 }}
        >
          <LinkedInIcon />
        </IconButton>
      </Box>

      {/* Footer Text */}
      <Typography fontSize={14} sx={{ fontWeight: "bold" }}>
        Created by S/N 19
      </Typography>
      <Typography fontSize={14}>
        Contacts: 2557 475 700 004 | Email: serialnumber19@gmail.com
      </Typography>
    </Box>
  );
};

export default Footer;
