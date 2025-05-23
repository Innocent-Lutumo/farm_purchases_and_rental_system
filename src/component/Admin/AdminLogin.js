import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin-login/",
        {
          username,
          password,
        }
      );

      // Store both tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      setAdminData({
        username: response.data.username,
        email: response.data.email,
        is_superuser: response.data.is_superuser,
      });

      navigate("/Dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword); 
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6f9ec 0%, #f0fff4 100%)",
        px: 2,
        position: "relative",
      }}
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "green",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
              transform: "scale(1.05)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <ArrowBack />
        </IconButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.7,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            maxWidth: 500, 
            width: "100%",
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <CardContent sx={{ p: 5 }}> 
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                textAlign="center"
                gutterBottom
                sx={{
                  background: "linear-gradient(45deg, #2e7d32, #4caf50)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 3,
                }}
              >
                Admin Login
              </Typography>
            </motion.div>

            {!adminData ? (
              <motion.form
                onSubmit={handleLogin}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    size="medium" 
                    sx={{
                      mb: 2,
                      "& label.Mui-focused": { color: "#2e7d32" },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: "#c8e6c9" },
                        "&:hover fieldset": { borderColor: "#4caf50" },
                        "&.Mui-focused fieldset": { borderColor: "#2e7d32" },
                        transition: "all 0.3s ease",
                      },
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"} 
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="medium" 
                    sx={{
                      mb: 2,
                      "& label.Mui-focused": { color: "#2e7d32" },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: "#c8e6c9" },
                        "&:hover fieldset": { borderColor: "#4caf50" },
                        "&.Mui-focused fieldset": { borderColor: "#2e7d32" },
                        transition: "all 0.3s ease",
                      },
                    }}
                    InputProps={{ 
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 1,
                      background: "linear-gradient(45deg, #2e7d32, #4caf50)",
                      color: "#fff",
                      fontWeight: 600,
                      py: 1.5, 
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1.1rem", 
                      boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #1b5e20, #388e3c)",
                        boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: "#ccc",
                        boxShadow: "none",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Logging in...
                      </motion.span>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      severity="error"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        fontSize: "0.875rem",
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 150,
                }}
              >
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: "#2e7d32" }}>
                      Welcome back!
                    </Typography>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Username:</strong> {adminData.username}
                    </Typography>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {adminData.email}
                    </Typography>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Typography variant="body2">
                      <strong>Superuser:</strong>{" "}
                      {adminData.is_superuser ? "Yes" : "No"}
                    </Typography>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default AdminLogin;