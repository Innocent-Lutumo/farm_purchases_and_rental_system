// src/pages/ResetPasswordConfirmPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";

// API_URL should match your Django backend base URL
const API_URL = "http://127.0.0.1:8000";

const ResetPasswordConfirmPage = () => {
  // Extract uid and token from the URL parameters using react-router-dom's useParams hook
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // State to track if the link itself seems valid (initially assumed true until API says otherwise)
  const [isValidLink, setIsValidLink] = useState(true);

  // Initial check for uid and token presence in URL
  useEffect(() => {
    if (!uid || !token) {
      setIsValidLink(false);
      setError("Invalid password reset link. Missing UID or token.");
    }
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== reNewPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!uid || !token) {
      setError("Password reset link is incomplete. Please request a new one.");
      setLoading(false);
      setIsValidLink(false);
      return;
    }

    try {
      // Djoser's reset_password_confirm endpoint
      await axios.post(`${API_URL}/auth/users/reset_password_confirm/`, {
        uid,
        token,
        new_password: newPassword,
      });

      setMessage(
        "Your password has been successfully reset. Redirecting to login..."
      );
      setNewPassword("");
      setReNewPassword("");

      // Redirect to login page after a short delay for user to read message
      setTimeout(() => {
        navigate("/LoginPage");
      }, 3000);
    } catch (err) {
      console.error(
        "Password reset confirmation failed:",
        err.response?.data || err.message
      );
      // Djoser often sends specific errors for invalid/expired tokens or password issues
      if (err.response && err.response.status === 400) {
        setError(
          err.response.data.detail ||
            (err.response.data.new_password &&
              err.response.data.new_password[0]) ||
            err.response.data.non_field_errors?.[0] ||
            "The password reset link is invalid or has expired. Please request a new password reset."
        );
        // If the error indicates an invalid token, mark the link as invalid
        if (
          err.response.data.detail === "Invalid token for given user" ||
          err.response.data.detail === "Stale token for given user" ||
          err.response.data.non_field_errors?.[0]?.includes("Invalid token")
        ) {
          setIsValidLink(false);
        }
      } else {
        setError(
          "An unexpected error occurred during password reset. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShow) => !prevShow);
  };

  // Animation variants for a smoother UI
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const textFieldVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px 0",
      }}
    >
      {/* Back Button */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginLeft: "20px", marginBottom: "20px" }}
      >
        <IconButton
          onClick={handleBack}
          component={motion.button}
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          sx={{
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              backgroundColor: "#f8f8f8",
            },
          }}
        >
          <ArrowBack sx={{ color: "green" }} />
        </IconButton>
      </motion.div>

      <Container
        maxWidth="xs"
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
          padding: "40px 30px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
            opacity: 0.1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
            opacity: 0.1,
          }}
        />

        <motion.div variants={itemVariants}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "green",
              marginBottom: "10px",
            }}
          >
            Reset Your Password
          </Typography>
        </motion.div>

        {!isValidLink ? (
          <motion.div variants={itemVariants}>
            <Alert severity="error" sx={{ marginBottom: "20px" }}>
              {error ||
                "The password reset link is invalid or has expired. Please request a new password reset."}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/forgot-password")}
              sx={{
                background: "linear-gradient(135deg, #4CAF50, #45a049)",
                color: "#ffffff",
                fontWeight: "bold",
                textTransform: "none",
                padding: "12px 20px",
                borderRadius: "8px",
              }}
            >
              Request New Password Reset
            </Button>
          </motion.div>
        ) : (
          <Box
            component={motion.form}
            variants={itemVariants}
            onSubmit={handleSubmit}
            sx={{ mt: 2 }}
          >
            <motion.div variants={itemVariants} whileFocus="focus">
              <TextField
                id="newPassword"
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                component={motion.div}
                variants={textFieldVariants}
                sx={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  "& label.Mui-focused": { color: "green" },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                      boxShadow: "0 0 0 2px rgba(76, 175, 80, 0.1)",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        component={motion.button}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                disabled={loading}
              />
            </motion.div>

            <motion.div variants={itemVariants} whileFocus="focus">
              <TextField
                id="reNewPassword"
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                value={reNewPassword}
                onChange={(e) => setReNewPassword(e.target.value)}
                fullWidth
                component={motion.div}
                variants={textFieldVariants}
                sx={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  "& label.Mui-focused": { color: "green" },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                      boxShadow: "0 0 0 2px rgba(76, 175, 80, 0.1)",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        component={motion.button}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                disabled={loading}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  color="error"
                  sx={{
                    marginBottom: "20px",
                    fontSize: "0.9rem",
                    textAlign: "center",
                    backgroundColor: "#ffebee",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ffcdd2",
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  severity="success"
                  sx={{
                    marginBottom: "20px",
                    fontSize: "0.9rem",
                    textAlign: "center",
                    backgroundColor: "#e8f5e9",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #c8e6c9",
                  }}
                >
                  {message}
                </Alert>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                sx={{
                  background: "linear-gradient(135deg, #4CAF50, #45a049)",
                  color: "#ffffff",
                  fontWeight: "bold",
                  textTransform: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  marginBottom: "20px",
                  "&:hover": {
                    background: "linear-gradient(135deg, #45a049, #4CAF50)",
                  },
                  "&:disabled": {
                    background: "#cccccc",
                  },
                }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid #ffffff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  "Set New Password"
                )}
              </Button>
            </motion.div>
          </Box>
        )}
      </Container>
    </motion.div>
  );
};

export default ResetPasswordConfirmPage;
