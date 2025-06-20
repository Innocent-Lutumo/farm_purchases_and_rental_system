import React from "react";
import { Modal, Box, IconButton, Fade, Backdrop } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import GoogleMapsFarmDirections from "./UserMap";

const FarmMapModal = ({ open, onClose, farm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Fade in={open} timeout={500}>
        <Box
          sx={{
            position: "relative",
            width: { xs: "90%", sm: "80%", md: "70%" }, // Reduced width
            maxWidth: "600px", // Max width adjusted
            height: { xs: "80vh", sm: "75vh", md: "70vh" }, // Reduced height
            maxHeight: "800px", // Max height adjusted
            borderRadius: { xs: "8px", sm: "16px", md: "20px" },
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)",
            background: "green", // Green gradient
            border: "1px solid rgba(255, 255, 255, 0.2)",
            transform: "scale(1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.5), 0 12px 40px rgba(0, 0, 0, 0.4)",
            }
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 12, md: 16 },
              right: { xs: 8, sm: 12, md: 16 },
              zIndex: 1300,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              width: { xs: 36, sm: 40, md: 44 },
              height: { xs: 36, sm: 40, md: 44 },
              "&:hover": {
                backgroundColor: "rgba(76, 175, 80, 0.1)", 
                transform: "scale(1.1)",
                boxShadow: "0 6px 25px rgba(76, 175, 80, 0.3)",
              },
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <CloseIcon 
              sx={{ 
                fontSize: { xs: 20, sm: 22, md: 24 },
                color: "#666",
                "&:hover": {
                  color: "#4caf50" // Green close icon
                }
              }} 
            />
          </IconButton>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "green",
              zIndex: 1200,
            }}
          />

          {/* Content Container */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "green",
                borderRadius: "4px",
                "&:hover": {
                  background: "green",
                },
              },
            }}
          >
            <GoogleMapsFarmDirections
              farm={farm}
              onClose={onClose}
              isModal={true}
            />
          </Box>

          {/* Subtle Glow Effect */}
          <Box
            sx={{
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: { xs: "10px", sm: "18px", md: "22px" },
              background: "green",
              opacity: 0.1,
              zIndex: -1,
              filter: "blur(4px)",
            }}
          />
        </Box>
      </Fade>
    </Modal>
  );
};

export default FarmMapModal;