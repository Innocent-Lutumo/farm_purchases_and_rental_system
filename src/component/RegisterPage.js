import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    names: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    names: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.names.trim()) {
      newErrors.names = "Full Names are required";
      valid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone Number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone Number must be 10 digits";
      valid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post("/api/register", formData);
      console.log("Registration successful:", response.data);
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        server: "Registration failed. Please try again.",
      }));
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        padding: "30px",
        marginTop: "50px",
        animation: "fadeIn 0.5s ease-in-out",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "green",
        }}
      >
        Register
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="textSecondary"
        gutterBottom
        sx={{
          marginBottom: "20px",
        }}
      >
        Create an account to access our services.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Full Names"
              name="names"
              value={formData.names}
              onChange={handleChange}
              error={!!errors.names}
              helperText={errors.names}
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              error={!!errors.phone_number}
              helperText={errors.phone_number}
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
              }}
            />
          </Grid>
        </Grid>
        {errors.server && (
          <Typography
            color="error"
            sx={{
              marginTop: "20px",
              fontSize: "0.9rem",
            }}
          >
            {errors.server}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            marginTop: "30px",
            backgroundColor: "green",
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            "&:hover": {
              backgroundColor: "#0f920f",
            },
          }}
        >
          Register
        </Button>
      </Box>

      {/* Link to Login Page */}
      <Typography
        variant="body2"
        align="center"
        sx={{
          marginTop: "20px",
          color: "#555555",
        }}
      >
        Already have an account?{" "}
        <Link
          to="/LoginPage"
          style={{
            color: "green",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Login here
        </Link>
      </Typography>
    </Container>
  );
};

export default RegisterPage;
