import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "", // Added role for Renter or Buyer
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!formData.role) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        role: "Please select a role (Renter or Buyer)",
      }));
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
        sx={{ fontWeight: "bold", color: "green" }}
      >
        Register
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="textSecondary"
        gutterBottom
        sx={{ marginBottom: "20px" }}
      >
        Create an account to access our services.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
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
                "& label.Mui-focused": {
                  color: "green",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "green",
                  },
                },
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
                "& label.Mui-focused": {
                  color: "green",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "green",
                  },
                },
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
                "& label.Mui-focused": {
                  color: "green",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "green",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl
              variant="standard"
              fullWidth
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
                "& label.Mui-focused": {
                  color: "green",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "green",
                },
              }}
            >
              <InputLabel id="role-label">Register As</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                error={!!errors.role}
              >
                <MenuItem value="Buyer">Seller</MenuItem>
                <MenuItem value="Renter">Renter</MenuItem>
                <MenuItem value="Buyer">Buyer</MenuItem>
              </Select>
              {errors.role && (
                <Typography color="error" sx={{ fontSize: "0.8rem", mt: 1 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
        {errors.server && (
          <Typography
            color="error"
            sx={{ marginTop: "20px", fontSize: "0.9rem" }}
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
              backgroundColor: "#116d11",
            },
          }}
        >
          Register
        </Button>
      </Box>

      <Typography
        variant="body2"
        align="center"
        sx={{ marginTop: "20px", color: "#555555" }}
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
