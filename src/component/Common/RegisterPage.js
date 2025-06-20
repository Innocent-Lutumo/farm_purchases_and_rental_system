import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Snackbar,
  Grid,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    seller_name: "",
    username: "",
    email: "",
    seller_residence: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const {
      seller_name,
      username,
      email,
      seller_residence,
      password,
      confirmPassword,
    } = formData;

    if (
      !seller_name ||
      !username ||
      !email ||
      !seller_residence ||
      !password ||
      !confirmPassword
    ) {
      setErrors({ form: "Please fill out all the fields." });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }

    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters long." });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Registration successful:", response.data);
      setSuccessMessage("Registration successful! You can now log in.");
      setOpenSnackbar(true);

      setFormData({
        seller_name: "",
        username: "",
        email: "",
        seller_residence: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({
        server:
          error.response?.data?.detail ||
          "Registration failed. Please try again.",
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  const backButtonVariants = {
    hover: {
      scale: 1.1,
      backgroundColor: "#e8f5e8",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  return (
    <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">
        {" "}
        {/* Reduced from "md" to "sm" */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} style={{ marginBottom: "1rem" }}>
            <motion.div
              variants={backButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <IconButton
                onClick={handleBack}
                sx={{
                  backgroundColor: "rgba(0, 128, 0, 0.1)",
                  color: "green",
                  border: "1px solid rgba(0, 128, 0, 0.3)",
                  borderRadius: "12px",
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(0, 128, 0, 0.15)",
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Paper
              elevation={6}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
                boxShadow: "0 8px 32px rgba(0, 128, 0, 0.1)",
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography
                  variant="h4"
                  align="center"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "green",
                    background: "linear-gradient(45deg, #2e7d32, #4caf50)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Create Account
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Typography
                  variant="body1"
                  align="center"
                  sx={{ mb: 3, color: "#666" }}
                >
                  Join our farming platform and start your journey today.
                </Typography>
              </motion.div>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  {errors.form && (
                    <Grid item xs={12}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Typography color="error" align="center">
                          {errors.form}
                        </Typography>
                      </motion.div>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <TextField
                        label="Full Names"
                        name="seller_name"
                        value={formData.seller_name}
                        onChange={handleChange}
                        error={!!errors.seller_name}
                        helperText={errors.seller_name}
                        fullWidth
                        variant="outlined"
                        sx={fieldStyle}
                      />
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <TextField
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        error={!!errors.username}
                        helperText={errors.username}
                        fullWidth
                        variant="outlined"
                        sx={fieldStyle}
                      />
                    </motion.div>
                  </Grid>

                  <Grid item xs={12}>
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        fullWidth
                        variant="outlined"
                        sx={fieldStyle}
                      />
                    </motion.div>
                  </Grid>

                  <Grid item xs={12}>
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <TextField
                        label="Residence"
                        name="seller_residence"
                        value={formData.seller_residence}
                        onChange={handleChange}
                        error={!!errors.seller_residence}
                        helperText={errors.seller_residence}
                        fullWidth
                        variant="outlined"
                        sx={fieldStyle}
                      />
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        fullWidth
                        variant="outlined"
                        sx={fieldStyle}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </motion.div>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        fullWidth
                        variant="outlined"
                        sx={fieldStyle}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <IconButton
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </motion.div>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </motion.div>
                  </Grid>

                  {errors.server && (
                    <Grid item xs={12}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Typography color="error" align="center">
                          {errors.server}
                        </Typography>
                      </motion.div>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          background:
                            "linear-gradient(45deg, #2e7d32, #4caf50)",
                          padding: "14px",
                          fontWeight: 600,
                          borderRadius: "12px",
                          textTransform: "none",
                          fontSize: "1.1rem",
                          boxShadow: "0 4px 20px rgba(46, 125, 50, 0.3)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #1b5e20, #2e7d32)",
                            boxShadow: "0 6px 25px rgba(46, 125, 50, 0.4)",
                          },
                        }}
                      >
                        Register
                      </Button>
                    </motion.div>
                  </Grid>
                </Grid>
              </Box>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 3, color: "#555" }}
                >
                  Already have an account?{" "}
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    style={{ display: "inline-block" }}
                  >
                    <Link
                      to="/LoginPage"
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        textDecoration: "none",
                        borderBottom: "1px solid transparent",
                        transition: "border-bottom 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.borderBottom = "1px solid green")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.borderBottom = "1px solid transparent")
                      }
                    >
                      Login here
                    </Link>
                  </motion.span>
                </Typography>
              </motion.div>
            </Paper>
          </motion.div>
        </motion.div>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={successMessage}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </Container>
    </Box>
  );
};

const fieldStyle = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  transition: "all 0.3s ease",
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
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
};

export default RegisterPage;