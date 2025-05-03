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
} from "@mui/material";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      console.log("Login successful:", response.data);
      navigate("/SellerPage");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid username or password");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/google-login/",
        {
          token: credentialResponse.credential,
        }
      );

      const { access_token, refresh_token } = response.data;
      localStorage.setItem("access", access_token);
      localStorage.setItem("refresh", refresh_token);

      console.log("Google login successful:", response.data);
      navigate("/SellerPage");
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Google login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Container
        maxWidth="sm"
        component={motion.div}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          padding: "30px",
          marginTop: "50px",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "green" }}
        >
          Login
        </Typography>

        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
          sx={{ marginBottom: "20px" }}
        >
          Welcome, please login to your account.
        </Typography>

        <Box
          component={motion.form}
          onSubmit={handleSubmit}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          sx={{ mt: 3 }}
        >
          <TextField
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: "#f9f9f9",
              borderRadius: "5px",
              marginBottom: "20px",
              "& label.Mui-focused": { color: "green" },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "green",
                },
              },
            }}
          />
          <TextField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: "#f9f9f9",
              borderRadius: "5px",
              marginBottom: "20px",
              "& label.Mui-focused": { color: "green" },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "green",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography
              color="error"
              sx={{ marginBottom: "20px", fontSize: "0.9rem" }}
            >
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            component={motion.button}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            sx={{
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
            Login
          </Button>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ marginTop: "20px", color: "#555555" }}
        >
          OR
        </Typography>

        <Box
          component={motion.div}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setError("Google login failed")}
          />
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
    </motion.div>
  );
};

export default LoginPage;
