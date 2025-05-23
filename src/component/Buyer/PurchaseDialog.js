import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import axios from "axios";

const PurchaseDialog = ({ open, onClose, farm, onFarmSold }) => {
  // Add onFarmSold prop
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const generateRandomId = () =>
    Math.floor(1000000000 + Math.random() * 9000000000);

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
        // Send email
        await axios.post("http://127.0.0.1:8000/api/send-transaction-email/", {
          buyer_email: userEmail,
          transaction_id: transactionId,
        });

        // Update farm's is_sold status
        await axios.patch(
          `http://127.0.0.1:8000/api/farmsale/${farm.id}/update_sold_status/`,
          { is_sold: true }
        );

        // Notify parent component that the farm is sold
        if (onFarmSold) {
          onFarmSold(farm.id);
        }

        onClose();
        setSuccessDialogOpen(true);
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Info (Phone)"
                fullWidth
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="National ID / Passport (Optional)"
                fullWidth
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
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

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      >
        <DialogTitle>Success!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your purchase request has been recorded, and a transaction ID has
            been sent to your email.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>Close</Button>
          <Button href="/payment" color="success">
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PurchaseDialog;
