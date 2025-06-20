// src/pages/LoginPage.js (UPDATED to use ForgotPasswordDialog)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import axios from "axios";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material"; // Removed Email import as it's now in dialog
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
// Import the new ForgotPasswordDialog
import ForgotPasswordDialog from './ForgotPasswordDialog'; 

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset password dialog state (moved resetEmail, resetLoading, etc. to ForgotPasswordDialog)
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Ensure password is hidden when form is submitted
    setShowPassword(false);

    if (!username || !password) {
      setError("Please fill in both fields");
      setIsLoading(false);
      return;
    }

    try {
      // Assuming your login endpoint is at /api/login/
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      console.log("Login successful:", response.data);
      navigate("/SellerPage"); // Or your desired redirect page
    } catch (err) {
      console.error("Login failed:", err);
      // More specific error handling if backend provides details (e.g., status codes)
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setShowPassword(false); // Hide password during Google login
    
    try {
      // Assuming your Google login endpoint is at /api/google-login/
      const response = await axios.post(
        "http://127.0.0.1:8000/api/google-login/",
        {
          access: credentialResponse.credential, 
        }
      );

      const { access, refresh } = response.data; 
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      console.log("Google login successful:", response.data);
      navigate("/SellerPage"); // Or your desired redirect page
    } catch (err) {
      console.error("Google login failed:", err);
      console.error("Error details:", err.response?.data);
      setError("Google login failed: " + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevShow => !prevShow);
  };

  // Animation variants
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
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 },
  };

  const textFieldVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "20px 0" }}
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
            Welcome Back
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            gutterBottom
            sx={{ marginBottom: "30px", fontSize: "0.9rem" }}
          >
            Please sign in to your account
          </Typography>
        </motion.div>

        <Box
          component={motion.form}
          variants={itemVariants}
          onSubmit={handleSubmit}
          sx={{ mt: 2 }}
        >
          <motion.div
            variants={itemVariants}
            whileFocus="focus"
          >
            <TextField
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileFocus="focus"
          >
            <TextField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              component={motion.div}
              variants={textFieldVariants}
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "10px",
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
                      type="button" // Prevent form submission
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>

          {/* Forgot Password Link */}
          <motion.div
            variants={itemVariants}
            style={{ textAlign: "right", marginBottom: "20px" }}
          >
            <Button
              onClick={() => setResetDialogOpen(true)} // Open the dialog
              sx={{
                color: "green",
                textTransform: "none",
                fontSize: "0.85rem",
                fontWeight: "500",
                padding: "4px 8px",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                },
              }}
            >
              Forgot Password?
            </Button>
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
                  border: "1px solid #ffcdd2"
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
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
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    width: 20, 
                    height: 20, 
                    border: "2px solid #ffffff", 
                    borderTop: "2px solid transparent", 
                    borderRadius: "50%" 
                  }}
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </motion.div>
        </Box>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body2"
            align="center"
            sx={{ 
              marginBottom: "20px", 
              color: "#888888",
              fontSize: "0.85rem",
              fontWeight: "500"
            }}
          >
            OR
          </Typography>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            marginBottom: "25px"
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setError("Google login failed")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "#666666",
              fontSize: "0.9rem"
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/RegisterPage"
              component={motion.a}
              whileHover={{ scale: 1.05 }}
              style={{
                color: "green",
                fontWeight: "bold",
                textDecoration: "none",
                borderBottom: "1px solid transparent",
                transition: "border-bottom 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderBottom = "1px solid green";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderBottom = "1px solid transparent";
              }}
            >
              Create one
            </Link>
          </Typography>
        </motion.div>
      </Container>

      {/* Render the extracted ForgotPasswordDialog */}
      <ForgotPasswordDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      />
    </motion.div>
  );
};

export default LoginPage;
