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
  Send as SendIcon, // Icon for submit
  Cancel as CancelIcon, // Icon for cancel
  Done as DoneIcon, // Icon for done (success)
  Close as CloseIcon, // Icon for close
  Warning as WarningIcon, // Icon for alert title
} from "@mui/icons-material";

const RentDialog = ({ open, onClose, farm, onRentSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

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

  const generateRandomId = () =>
    Math.floor(1000000000 + Math.random() * 9000000000);

  const handleSubmit = async () => {
    if (!fullName || !renterEmail || !renterPhone || !residence) {
      showCustomAlert("Missing Information", "Please fill in all required fields.");
      return;
    }

    const newTransactionId = generateRandomId();
    setTransactionId(newTransactionId);
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
    } catch (error) {
      console.error("Failed to submit rental:", error);
      showCustomAlert("Submission Failed", "There was an error submitting your request. Please try again.");
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
            backgroundColor: 'white', 
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "green", // Green for success, Blue for default
            color: 'white',
            textAlign: 'center',
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 600,
          }}
        >
          {transactionComplete ? "Rental Confirmed" : "Rent This Farm"}
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          {transactionComplete ? (
            <Fade in={transactionComplete} timeout={500}>
              <Box sx={{ textAlign: "center", my: 2 }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 80,
                    color: "#4CAF50",
                    mb: 2,
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    color: '#4CAF50', 
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  Rental Successful!
                </Typography>

                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #E0E0E0",
                  mb: 3,
                  backgroundColor: '#F9F9F9', // Light grey background
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#424242',
                    }}
                  >
                    Transaction ID:
                  </Typography>
                  <Typography
                    sx={{
                      color: "#1B5E20", // Dark green for ID
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      fontFamily: "monospace",
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: '#E8F5E8', // Lighter green for ID box
                      border: '1px solid #C8E6C9',
                    }}
                  >
                    {transactionId}
                  </Typography>
                </Box>

                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #E0E0E0",
                  backgroundColor: '#F9F9F9', // Light grey background
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#424242',
                    }}
                  >
                    Confirmation sent to:
                  </Typography>
                  <Typography
                    sx={{
                      color: "#1976D2", // Blue for email
                      fontWeight: "bold",
                      fontSize: "1rem",
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: '#E3F2FD', // Lighter blue for email box
                      border: '1px solid #BBDEFB',
                      textAlign: 'center'
                    }}
                  >
                    {renterEmail}
                  </Typography>
                </Box>
              </Box>
            </Fade>
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
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 1 },
                      '& .MuiInputLabel-root': { fontWeight: 400 }
                    }}
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
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 1 },
                      '& .MuiInputLabel-root': { fontWeight: 400 }
                    }}
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
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 1 },
                      '& .MuiInputLabel-root': { fontWeight: 400 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Residence"
                    fullWidth
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 1 },
                      '& .MuiInputLabel-root': { fontWeight: 400 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="National ID Number (Optional)"
                    fullWidth
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 1 },
                      '& .MuiInputLabel-root': { fontWeight: 400 }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          pb: 2,
          pt: 1,
          justifyContent: 'flex-end',
          gap: 1
        }}>
          {!transactionComplete && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="contained"
              size="medium"
              startIcon={isSubmitting ? null : <SendIcon />}
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: 500,
                backgroundColor: 'green', 
                '&:hover': {
                  backgroundColor: '#1976D2',
                },
                '&:disabled': {
                  backgroundColor: '#BDBDBD',
                  color: 'white',
                }
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            startIcon={transactionComplete ? <DoneIcon /> : <CancelIcon />} // Icons for done/cancel
            sx={{
              borderRadius: 1,
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: 500,
              ...(transactionComplete ? {
                backgroundColor: '#4CAF50', // Green for done button
                color: 'white',
                '&:hover': {
                  backgroundColor: '#388E3C',
                }
              } : {
                borderColor: '#616161', // Grey border for cancel
                color: '#616161', // Grey text for cancel
                '&:hover': {
                  backgroundColor: 'rgba(97, 97, 97, 0.04)',
                  borderColor: '#424242',
                }
              }),
            }}
          >
            {transactionComplete ? "Done" : "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Alert Modal - simplified further */}
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
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: 3,
              border: '1px solid #EF5350', // Lighter red for alert border
            }}
          >
            <DialogTitle
              id="alert-modal-title"
              sx={{
                backgroundColor: '#EF5350', // Red for alert title
                color: 'white',
                fontWeight: 600,
                fontSize: '1.2rem',
                textAlign: 'center',
                position: 'relative',
                py: 1.5,
              }}
            >
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> {alertTitle} {/* Warning icon in title */}
              <IconButton
                onClick={closeCustomAlert}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
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
                textAlign: 'center'
              }}
            >
              <Typography sx={{
                fontSize: '1rem',
                color: '#424242'
              }}>
                {alertMessage}
              </Typography>
            </DialogContent>
            <DialogActions sx={{
              justifyContent: 'center',
              pt: 1,
              pb: 2,
              px: 3
            }}>
              <Button
                onClick={closeCustomAlert}
                variant="contained"
                size="medium"
                sx={{
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 500,
                  backgroundColor: '#2196F3',
                  '&:hover': {
                    backgroundColor: '#1976D2',
                  }
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