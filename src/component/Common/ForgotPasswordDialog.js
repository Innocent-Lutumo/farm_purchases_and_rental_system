// src/components/ForgotPasswordDialog.js
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import axios from "axios";

// API_URL should match your Django backend base URL
const API_URL = "http://127.0.0.1:8000";

/**
 * ForgotPasswordDialog Component
 *
 * This component handles the initiation of the password reset process.
 * It provides a dialog where the user can enter their email address
 * to receive a password reset link from the backend.
 *
 * Props:
 * - open: Boolean to control the visibility of the dialog.
 * - onClose: Function to call when the dialog should be closed.
 */
const ForgotPasswordDialog = ({ open, onClose }) => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  /**
   * Handles the submission of the reset password email request.
   * Sends the entered email to the Django backend's reset_password endpoint.
   * Displays success or error messages based on the API response.
   */
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email address");
      setResetSuccess(false);
      return;
    }

    setResetLoading(true);
    setResetMessage("");

    try {
      // Djoser's reset_password endpoint
      await axios.post(`${API_URL}/auth/users/reset_password/`, {
        email: resetEmail,
      });

      setResetSuccess(true);
      setResetMessage(
        "If an account with that email exists, a password reset link has been sent to your inbox. Please check your spam folder too."
      );
    } catch (err) {
      console.error("Password reset failed:", err);
      // Display a generic error message, or more specific if backend provides safe details
      setResetSuccess(false);
      setResetMessage(
        err.response?.data?.email?.[0] ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  /**
   * Resets the dialog's state and calls the onClose prop.
   */
  const handleCloseAndResetState = () => {
    setResetEmail("");
    setResetMessage("");
    setResetSuccess(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseAndResetState}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "15px",
          padding: "10px",
        },
      }}
    >
      <DialogTitle
        sx={{ textAlign: "center", color: "green", fontWeight: "bold" }}
      >
        Reset Password
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginBottom: "20px", textAlign: "center" }}
        >
          Enter your email address and we'll send you a link to reset your
          password.
        </Typography>

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          sx={{
            marginBottom: "15px",
            "& label.Mui-focused": { color: "green" },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "green",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: "green" }} />
              </InputAdornment>
            ),
          }}
          disabled={resetLoading || resetSuccess}
        />

        {resetMessage && (
          <Alert
            severity={resetSuccess ? "success" : "error"}
            sx={{ marginBottom: "15px" }}
          >
            {resetMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: "20px", justifyContent: "center" }}>
        <Button
          onClick={handleCloseAndResetState}
          sx={{ color: "#666666", marginRight: "10px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePasswordReset}
          variant="contained"
          disabled={resetLoading || resetSuccess}
          sx={{
            background: "linear-gradient(135deg, #4CAF50, #45a049)",
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "none",
            padding: "8px 24px",
            borderRadius: "8px",
            "&:hover": {
              background: "linear-gradient(135deg, #45a049, #4CAF50)",
            },
            "&:disabled": {
              background: "#cccccc",
              color: "#999999",
            },
          }}
        >
          {resetLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : resetSuccess ? (
            "Email Sent!"
          ) : (
            "Send Reset Email"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
