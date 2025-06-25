import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Modal,
  IconButton,
  Fade,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Send as SendIcon, 
  Cancel as CancelIcon, 
  Done as DoneIcon, 
  Close as CloseIcon, 
  Warning as WarningIcon, 
} from "@mui/icons-material";
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

const RentDialog = ({ open, onClose, farm, onRentSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [showTick, setShowTick] = useState(false);

  const [fullName, setFullName] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [nationalId, setNationalId] = useState("");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const closeCustomAlert = () => {
    setShowAlertModal(false);
    setAlertTitle("");
    setAlertMessage("");
  };

  const generateRandomId = () => {
    const id = Math.floor(1000000000 + Math.random() * 9000000000);
    setTransactionId(id.toString());
    return id;
  };

  const handleSubmit = async () => {
    if (!fullName || !renterEmail || !renterPhone || !residence) {
      showCustomAlert(
        "Missing Information",
        "Please fill in all required fields."
      );
      return;
    }

    const newTransactionId = generateRandomId();
    setIsSubmitting(true);

    try {
      const transactionResponse = await fetch(
        "http://127.0.0.1:8000/api/transactions/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            farm_id: farm.id,
            transaction_id: newTransactionId,
            renter_email: renterEmail,
            renter_phone: renterPhone,
            full_name: fullName,
            residence,
            national_id: nationalId,
            is_rented: true,
          }),
        }
      );

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      const updateResponse = await fetch(
        `http://127.0.0.1:8000/api/farmsrent/${farm.id}/update_rented_status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_rented: true,
          }),
        }
      );

      if (!updateResponse.ok) {
        console.warn(
          "Failed to update farm status, but transaction was created"
        );
      }

      const emailResponse = await fetch(
        "http://127.0.0.1:8000/api/send-transaction-email-rent/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            renter_email: renterEmail,
            transaction_id: newTransactionId,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.warn("Failed to send email, but transaction was created");
      }

      setTransactionComplete(true);
      setTimeout(() => setShowTick(true), 500);
    } catch (error) {
      console.error("Failed to submit rental:", error);
      showCustomAlert(
        "Submission Failed",
        "There was an error submitting your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setRenterEmail("");
    setRenterPhone("");
    setResidence("");
    setNationalId("");
    setTransactionComplete(false);
    setTransactionId(null);
    setShowTick(false);
  };

  const handleClose = () => {
    if (transactionComplete) {
      if (onRentSuccess) {
        onRentSuccess(farm.id);
      }
      resetForm();
    }
    closeCustomAlert();
    onClose();
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
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={transactionComplete}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "green", 
            color: "white",
            textAlign: "center",
            py: 2,
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          {transactionComplete ? "Rental Confirmed" : "Rent This Farm"}
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          {transactionComplete ? (
            <Box sx={{ 
              textAlign: "center", 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
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
                  <CheckCircleIcon
                    sx={{
                      fontSize: 60,
                      color: "green",
                      animation: `${tickAnimation} 0.6s ease-in-out`,
                    }}
                  />
                )}
              </Box>

              <DialogTitle sx={{ 
                color: "green", 
                fontSize: "1.5rem", 
                fontWeight: "bold",
                p: 0,
                mb: 1
              }}>
                Rental Successful!
              </DialogTitle>

              <Box sx={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  Your rental request has been processed successfully.
                </Typography>
                
                {/* Transaction ID Box */}
                <Box sx={{ 
                  backgroundColor: "#f5f5f5", 
                  p: 1.5, 
                  borderRadius: "6px",
                  borderLeft: "3px solid green",
                  mb: 1.5
                }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Transaction ID:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "green", fontWeight: "bold" }}>
                    {transactionId}
                  </Typography>
                </Box>

                {/* Email Info */}
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Confirmation sent to:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: "bold",
                  color: "green",
                  mb: 1.5
                }}>
                  {renterEmail}
                </Typography>

                {/* Important Notice */}
                <Box sx={{
                  backgroundColor: "#fff8e1",
                  p: 1.5,
                  borderRadius: "6px",
                  border: "1px solid #ffd54f",
                  mb: 1.5
                }}>
                  <Typography variant="body2" sx={{ fontStyle: "italic", fontSize: '0.875rem' }}>
                    <strong>Important:</strong> Keep this transaction ID safe for future reference.
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={renterEmail}
                    onChange={(e) => setRenterEmail(e.target.value)}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    type="tel"
                    fullWidth
                    value={renterPhone}
                    onChange={(e) => setRenterPhone(e.target.value)}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Residence"
                    fullWidth
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="National ID Number (Optional)"
                    fullWidth
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            pt: 1,
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {!transactionComplete && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="contained"
              size="medium"
              startIcon={isSubmitting ? null : <SendIcon />}
              sx={{
                borderRadius: "20px",
                px: 4,
                py: 1,
                fontSize: "1rem",
                fontWeight: 500,
                backgroundColor: "green",
                "&:hover": {
                  backgroundColor: "#2E7D32",
                },
                "&:disabled": {
                  backgroundColor: "#BDBDBD",
                  color: "white",
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Processing...</span>
                </Box>
              ) : (
                "Submit Request"
              )}
            </Button>
          )}
          <Button
            onClick={handleClose}
            variant={transactionComplete ? "contained" : "outlined"}
            size="medium"
            startIcon={transactionComplete ? <DoneIcon /> : <CancelIcon />}
            sx={{
              borderRadius: "20px",
              px: 4,
              py: 1,
              fontSize: "1rem",
              fontWeight: 500,
              ...(transactionComplete
                ? {
                    backgroundColor: "#4CAF50",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#388E3C",
                    },
                  }
                : {
                    borderColor: "#616161",
                    color: "#616161",
                    "&:hover": {
                      backgroundColor: "rgba(97, 97, 97, 0.04)",
                      borderColor: "#424242",
                    },
                  }),
            }}
          >
            {transactionComplete ? "Done" : "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Alert Modal */}
      <Modal
        open={showAlertModal}
        onClose={closeCustomAlert}
        aria-labelledby="alert-modal-title"
        aria-describedby="alert-modal-description"
        closeAfterTransition
      >
        <Fade in={showAlertModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 },
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 3,
              border: "1px solid #EF5350",
            }}
          >
            <DialogTitle
              id="alert-modal-title"
              sx={{
                backgroundColor: "#EF5350",
                color: "white",
                fontWeight: 600,
                fontSize: "1.2rem",
                textAlign: "center",
                position: "relative",
                py: 1.5,
              }}
            >
              <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />{" "}
              {alertTitle}
              <IconButton
                onClick={closeCustomAlert}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: "white",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              id="alert-modal-description"
              sx={{
                pt: 2,
                pb: 1,
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#424242",
                }}
              >
                {alertMessage}
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: "center",
                pt: 1,
                pb: 2,
                px: 3,
              }}
            >
              <Button
                onClick={closeCustomAlert}
                variant="contained"
                size="medium"
                sx={{
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  fontSize: "1rem",
                  fontWeight: 500,
                  backgroundColor: "#2196F3",
                  "&:hover": {
                    backgroundColor: "#1976D2",
                  },
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default RentDialog;