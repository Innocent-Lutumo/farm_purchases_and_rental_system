import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    Typography,
    IconButton,
    CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
  } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


const RegistrationDialog = ({ open, onClose, farm }) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
  
    // Ensure images reset on farm data change
    useEffect(() => {
      if (farm && farm.images && farm.images.length > 0) {
        setImageIndex(0);
      }
    }, [farm]);
  
    useEffect(() => {
      if (open) {
        setShowEmail(false);
        setShowPhone(false);
      }
    }, [open]);
  
    // If farm data is not available, return nothing
    if (!farm) return null;
  
    const images = farm.images || [];
  
    const getImageUrl = (imgPath) =>
      imgPath.startsWith("http") || imgPath.startsWith("data")
        ? imgPath
        : `http://127.0.0.1:8000${imgPath}`;
  
    const handleNext = () => {
      setImageIndex((prev) => (prev + 1) % images.length);
    };
  
    const handlePrev = () => {
      setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
  
    const currentImage =
      images.length > 0 ? getImageUrl(images[imageIndex].image) : "/fallback.jpg";
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            p: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <DialogTitle>Farm Details</DialogTitle>
          <DialogContent>
            <Box sx={{ position: "relative", textAlign: "center", mb: 2 }}>
              <CardMedia
                component="img"
                image={currentImage}
                alt={`Farm image ${imageIndex + 1}`}
                sx={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
              />
              {images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      transform: "translateY(-50%)",
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 0,
                      transform: "translateY(-50%)",
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Box>
  
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" color="green">
                {farm.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Location: {farm.location}
              </Typography>
              <Typography variant="body2">Size: {farm.size} acres</Typography>
              <Typography variant="body2">Price:{farm.price}/=Tshs</Typography>
            </Box>
          </DialogContent>
  
          {/* Contact Info or Wait Message */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {["Confirmed", "Completed"].includes(farm.purchaseStatus) ? (
              <>
                <Typography variant="body2" sx={{ color: "green" }}>
                  Click an icon to contact the landowner and plan an appointment:
                </Typography>
  
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Tooltip title="Show Email">
                    <IconButton
                      onClick={() => setShowEmail((prev) => !prev)}
                      sx={{ color: "green" }}
                    >
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                  {showEmail && (
                    <Typography variant="body2" sx={{ color: "green" }}>
                      {farm.email || "N/A"}
                    </Typography>
                  )}
  
                  <Tooltip title="Show Phone">
                    <IconButton
                      onClick={() => setShowPhone((prev) => !prev)}
                      sx={{ color: "green" }}
                    >
                      <PhoneIcon />
                    </IconButton>
                  </Tooltip>
                  {showPhone && (
                    <Typography variant="body2" sx={{ color: "green" }}>
                      {farm.phone || "N/A"}
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Wait for confirmation
              </Typography>
            )}
          </Box>
  
          <DialogActions>
            <Button onClick={onClose} color="success">
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
  };

export default RegistrationDialog;