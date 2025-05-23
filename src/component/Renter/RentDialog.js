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
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close"; 

const RentDialog = ({ open, onClose, farm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  const [fullName, setFullName] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [nationalId, setNationalId] = useState("");

  // State for custom alert modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  // Function to show custom alert
  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  // Function to close custom alert
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
      // Create transaction
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
        `http://127.0.0.1:8000/api/farmrent/${farm.id}/update_status/`,
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

      // Send email notification
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

  const handleClose = () => {
    onClose();
    if (transactionComplete) {
      setFullName("");
      setRenterEmail("");
      setRenterPhone("");
      setResidence("");
      setNationalId("");
      setTransactionComplete(false);
    }
    closeCustomAlert();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Rent This Farm</DialogTitle>

        <DialogContent>
          {transactionComplete ? (
            <Box sx={{ textAlign: "center", my: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: "green" }} />
              <Typography variant="h5" sx={{ color: "green", mt: 2 }}>
                Rental Successful!
              </Typography>
              <Typography sx={{ mt: 2, fontWeight: 500 }}>
                Transaction ID:
              </Typography>
              <Typography
                sx={{
                  color: "#2e7d32",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  mt: 0.5,
                }}
              >
                {transactionId}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                A confirmation email has been sent to:{" "}
                <strong>{renterEmail}</strong>
              </Typography>
              <Typography sx={{ mt: 2, fontStyle: "italic", color: "#666" }}>
                Please keep the transaction ID for future reference and payment
                tracking.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Residence"
                    fullWidth
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="National ID (Optional)"
                    fullWidth
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!transactionComplete && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="contained"
              color="success"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} color="inherit" />
                  <Box sx={{ ml: 1 }}>Submitting...</Box>
                </>
              ) : (
                "Submit"
              )}
            </Button>
          )}
          <Button onClick={handleClose} variant="outlined" color="success">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Alert Modal */}
      <Modal
        open={showAlertModal}
        onClose={closeCustomAlert}
        aria-labelledby="alert-modal-title"
        aria-describedby="alert-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <DialogTitle id="alert-modal-title" sx={{ pb: 1 }}>
            {alertTitle}
            <Button
              onClick={closeCustomAlert}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
          <DialogContent id="alert-modal-description" sx={{ pt: 0 }}>
            <Typography>{alertMessage}</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
            <Button onClick={closeCustomAlert} variant="contained" color="primary">
              OK
            </Button>
          </DialogActions>
        </Box>
      </Modal>
    </>
  );
};

export default RentDialog;