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
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility for password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle visibility for confirm password
  const [successMessage, setSuccessMessage] = useState(""); // Store success message for display
  const [openSnackbar, setOpenSnackbar] = useState(false); // Open/close Snackbar for success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors before validating
    setErrors({});
    setSuccessMessage(""); // Clear success message before validation

    // Ensure required fields are properly filled
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        form: "Please fill out all the fields.",
      }));
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password must be at least 6 characters long.",
      }));
      return;
    }

    // Validate password matching
    if (formData.password !== formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Passwords do not match.",
      }));
      return;
    }

    try {
      // Send the POST request to the backend
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData,
        {
          headers: {
            'Content-Type': 'application/json', // Ensure you're sending JSON data
          },
        }
      );
      console.log("Registration successful:", response.data);
      
      // Set success message and show Snackbar
      setSuccessMessage("Registration successful! You can now log in.");
      setOpenSnackbar(true);

      // Clear the form data after successful registration
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Error during registration:", error);

      // Handle server-side errors
      if (error.response && error.response.data) {
        setErrors((prev) => ({
          ...prev,
          server: error.response.data.detail || "Registration failed. Please try again.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          server: "An unexpected error occurred. Please try again.",
        }));
      }
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        padding: "40px 30px",
        marginTop: "60px",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 700, color: "green", mb: 2 }}
      >
        Create Account
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{ color: "#666", mb: 3 }}
      >
        Join our farming platform and start your journey today.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {errors.form && (
          <Typography color="error" sx={{ fontSize: "0.9rem", textAlign: "center" }}>
            {errors.form}
          </Typography>
        )}

        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
          fullWidth
          variant="outlined"
          sx={{
            backgroundColor: "#f4f4f4",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ccc" },
              "&:hover fieldset": { borderColor: "green" },
              "&.Mui-focused fieldset": { borderColor: "green" },
            },
            "& label.Mui-focused": { color: "green" },
          }}
        />

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
          sx={{
            backgroundColor: "#f4f4f4",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ccc" },
              "&:hover fieldset": { borderColor: "green" },
              "&.Mui-focused fieldset": { borderColor: "green" },
            },
            "& label.Mui-focused": { color: "green" },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

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
          sx={{
            backgroundColor: "#f4f4f4",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ccc" },
              "&:hover fieldset": { borderColor: "green" },
              "&.Mui-focused fieldset": { borderColor: "green" },
            },
            "& label.Mui-focused": { color: "green" },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {errors.server && (
          <Typography color="error" sx={{ fontSize: "0.9rem", textAlign: "center" }}>
            {errors.server}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: "green",
            padding: "12px",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1rem",
            "&:hover": {
              backgroundColor: "#116d11",
            },
          }}
        >
          Register
        </Button>
      </Box>

      {successMessage && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={successMessage}
          anchorOrigin={{
            vertical: "top", // Position the snackbar at the top of the screen
            horizontal: "center", // Center it horizontally
          }}
        />
      )}

      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 4, color: "#555" }}
      >
        Already have an account?{" "}
        <Link
          to="/LoginPage"
          style={{ color: "green", fontWeight: "bold", textDecoration: "none" }}
        >
          Login here
        </Link>
      </Typography>
    </Container>
  );
};

export default RegisterPage;
