import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Container } from "@mui/material";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // For redirecting after successful login

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Simulate API call for login
      const response = await axios.post("/api/login", { email, password });
      console.log("Login successful:", response.data);

      // Redirect to dashboard or another page
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
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
        Login
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
        Welcome back! Please login to your account.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        />
        {error && (
          <Typography
            color="error"
            sx={{
              marginBottom: "20px",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
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
          Login
        </Button>
      </Box>

      <Typography
        variant="body2"
        align="center"
        sx={{
          marginTop: "20px",
          color: "#555555",
        }}
      >
        Don't have an account?{" "}
        <Link
          to="/RegisterPage"
          style={{
            color: "green",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Register here
        </Link>
      </Typography>
    </Container>
  );
};

export default LoginPage;
