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
import { Link } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    seller_name: "",
    username: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const { seller_name, username, seller_residence, password, confirmPassword } = formData;

    if (!seller_name || !username || !seller_residence || !password || !confirmPassword) {
      setErrors({ form: "Please fill out all the fields." });
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
      const response = await axios.post("http://127.0.0.1:8000/api/register/", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Registration successful:", response.data);
      setSuccessMessage("Registration successful! You can now log in.");
      setOpenSnackbar(true);

      setFormData({
        seller_name: "",
        username: "",
        seller_residence: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({
        server: error.response?.data?.detail || "Registration failed. Please try again.",
      });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={3} sx={{ p: 5, borderRadius: 4 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: "green" }}>
              Create Account
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4, color: "#666" }}>
              Join our farming platform and start your journey today.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {errors.form && (
                  <Grid item xs={12}>
                    <Typography color="error" align="center">{errors.form}</Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
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
                </Grid>

                <Grid item xs={12} sm={6}>
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
                </Grid>

                <Grid item xs={12}>
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
                </Grid>

                <Grid item xs={12} sm={6}>
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
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
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
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {errors.server && (
                  <Grid item xs={12}>
                    <Typography color="error" align="center">{errors.server}</Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "green",
                        padding: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "1rem",
                        "&:hover": { backgroundColor: "#116d11" },
                      }}
                    >
                      Register
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
              message={successMessage}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            />

            <Typography variant="body2" align="center" sx={{ mt: 4, color: "#555" }}>
              Already have an account?{" "}
              <Link to="/LoginPage" style={{ color: "green", fontWeight: "bold" }}>
                Login here
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

const fieldStyle = {
  backgroundColor: "#f9f9f9",
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#ccc" },
    "&:hover fieldset": { borderColor: "green" },
    "&.Mui-focused fieldset": { borderColor: "green" },
  },
  "& label.Mui-focused": { color: "green" },
};

export default RegisterPage;
