import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  Button,
  Box,
  Typography,
  TextField,
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
import AssignmentIcon from "@mui/icons-material/Assignment"; 

const RegistrationDialog = ({ open, onClose, farm }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showAgreementIcon, setShowAgreementIcon] = useState(false); 

  useEffect(() => {
    if (farm?.images?.length > 0) {
      setImageIndex(0);
    }
  }, [farm]);

  useEffect(() => {
    if (open) {
      setShowContact(false);
      setTransactionId("");
      setShowEmail(false);
      setShowPhone(false);
      setShowAgreementIcon(false);
    }
  }, [open]);

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

  const handleTransactionSubmit = () => {
    const entered = transactionId.trim().toLowerCase();
    const expected = (farm.transactionId || "").trim().toLowerCase();

    if (entered === expected) {
      setShowContact(true);
      setShowAgreementIcon(true); 
    } else {
      alert("Invalid transaction ID");
      setShowAgreementIcon(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxHeight: "80vh",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ backgroundColor: "white", borderRadius: 2, p: 2 }}>
        <DialogTitle>Farm Details</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            height: "calc(80vh - 150px)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2, position: "relative" }}>
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
                  sx={{ position: "absolute", left: 16, top: "45%" }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{ position: "absolute", right: 16, top: "45%" }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}
          </Box>
          <Typography variant="h6" color="green" fontWeight="bold">
            {farm.title}
          </Typography>
          <Typography variant="body2">Location: {farm.location}</Typography>
          <Typography variant="body2">Size: {farm.size} acres</Typography>
          <Typography variant="body2">Price: {farm.price}/=Tshs</Typography>

          <Box sx={{ mt: 2 }}>
            {["Confirmed", "Completed"].includes(farm.purchaseStatus) ? (
              !showContact ? (
                <>
                  <Typography sx={{ mb: 1 }}>
                    Enter your Transaction ID to view contact info and agreement:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      variant="outlined"
                      label="Transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleTransactionSubmit()
                      }
                      fullWidth
                      sx={{
                        "& label.Mui-focused": {
                          color: "green",
                        },
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: "green",
                          },
                          height: 48,
                        },
                        "& .MuiInputBase-input": {
                          padding: "12px",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleTransactionSubmit}
                      color="success"
                    >
                      Submit
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography color="success">
                    Contact the Landowner:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Tooltip title="Click to show email">
                        <IconButton
                          sx={{ color: "green" }}
                          onClick={() => setShowEmail((prev) => !prev)}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      {showEmail && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {farm.email || "N/A"}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Tooltip title="Click to show phone">
                        <IconButton
                          sx={{ color: "green" }}
                          onClick={() => setShowPhone((prev) => !prev)}
                        >
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                      {showPhone && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {farm.phone || "N/A"}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            ) : (
              <Typography color="warning">Wait for confirmation</Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="error">
            Close
          </Button>
          {showAgreementIcon && ( 
            <Button
              component={Link}
              to={{
                pathname: "/RentalAgreement",
                state: { farmId: farm.id } 
              }}
              variant="outlined"
              color="success"
              startIcon={<AssignmentIcon />} 
            >
              Agreement
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RegistrationDialog;