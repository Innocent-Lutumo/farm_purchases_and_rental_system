import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";
import { keyframes } from "@emotion/react";

// Animation for the checkmark
const tickAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const PurchaseDialog = ({ open, onClose, farm, onFarmSold }) => {
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showTick, setShowTick] = useState(false);

  const generateRandomId = () => {
    const id = Math.floor(1000000000 + Math.random() * 9000000000);
    setTransactionId(id.toString());
    return id;
  };

  const handleSubmit = async () => {
    const transactionId = generateRandomId();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const transactionResponse = await axios.post(
        "http://127.0.0.1:8000/api/transactionsale/",
        {
          farm_id: farm.id,
          transaction_id: transactionId,
          buyer_email: userEmail,
          full_name: fullName,
          address,
          contact_info: contactInfo,
          national_id: nationalId,
          intended_use: intendedUse,
        }
      );

      if (transactionResponse.status === 201) {
        await axios.post("http://127.0.0.1:8000/api/send-transaction-email/", {
          buyer_email: userEmail,
          transaction_id: transactionId,
        });

        await axios.patch(
          `http://127.0.0.1:8000/api/farmsale/${farm.id}/update_sold_status/`,
          { is_sold: true }
        );

        if (onFarmSold) {
          onFarmSold(farm.id);
        }

        onClose();
        setSuccessDialogOpen(true);
        setTimeout(() => setShowTick(true), 500);
      } else {
        alert("Failed to save transaction.");
      }
    } catch (error) {
      console.error(
        "Error processing transaction:",
        error.response?.data || error.message
      );
      alert("Something went wrong. Please try again.");
    }
  };

  const handleSuccessDialogClose = () => {
    setShowTick(false);
    setSuccessDialogOpen(false);
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": {
        borderColor: "#ddd",
        transition: "border-color 0.3s ease",
      },
      "&:hover fieldset": {
        borderColor: "green",
        boxShadow: "0 0 0 1px rgba(0, 128, 0, 0.1)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "green",
        boxShadow: "0 0 0 2px rgba(0, 128, 0, 0.1)",
      },
    },
    "& label.Mui-focused": { color: "green" },
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", color: "green" }}>
          Buyer Information
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Names"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Info (Phone)"
                fullWidth
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="National ID / Passport (Optional)"
                fullWidth
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Intended Use of Farm"
                multiline
                rows={2}
                fullWidth
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!userEmail}
            variant="contained"
            color="success"
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        fullWidth
        scroll="paper" // Disable scrolling
        sx={{
          "& .MuiDialog-paper": {
            maxHeight: "calc(100% - 64px)", // Limits maximum height
            overflow: "hidden", // Prevents internal scrolling
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Checkmark Animation */}
          <Box
            sx={{
              position: "relative",
              width: 60,
              height: 60,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!showTick && (
              <CircularProgress
                size={60}
                thickness={2}
                sx={{ color: "rgba(0, 128, 0, 0.2)", position: "absolute" }}
              />
            )}
            {showTick && (
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 60,
                  color: "green",
                  animation: `${tickAnimation} 0.6s ease-in-out`,
                }}
              />
            )}
          </Box>

          {/* Dialog Title */}
          <DialogTitle
            sx={{
              color: "green",
              fontSize: "1.5rem",
              fontWeight: "bold",
              p: 0,
              mb: 1,
            }}
          >
            Purchase Successful!
          </DialogTitle>

          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1" sx={{ mb: 1.5 }}>
              Your transaction has been processed successfully.
            </Typography>

            {/* Transaction ID Box */}
            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                p: 1.5,
                borderRadius: "6px",
                borderLeft: "3px solid green",
                mb: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Transaction ID:
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "green", fontWeight: "bold" }}
              >
                {transactionId}
              </Typography>
            </Box>

            {/* Email Info */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Confirmation sent to:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "green",
                mb: 1.5,
              }}
            >
              {userEmail}
            </Typography>

            {/* Important Notice */}
            <Box
              sx={{
                backgroundColor: "#fff8e1",
                p: 1.5,
                borderRadius: "6px",
                border: "1px solid #ffd54f",
                mb: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", fontSize: "0.875rem" }}
              >
                <strong>Important:</strong> Keep this transaction ID safe for
                future reference.
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <DialogActions
            sx={{
              justifyContent: "center",
              p: 0,
              pt: 1,
            }}
          >
            <Button
              onClick={handleSuccessDialogClose}
              variant="contained"
              color="success"
              sx={{
                px: 4,
                py: 0.5,
                borderRadius: "20px",
                textTransform: "none",
                fontSize: "0.9375rem",
              }}
            >
              Done
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default PurchaseDialog;
