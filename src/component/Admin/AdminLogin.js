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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #e6f9ec, #f0fff4)",
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card elevation={6} sx={{ borderRadius: 4, px: 3 }}>
          <CardContent>
            <Typography
              variant="h4"
              fontWeight={600}
              textAlign="center"
              gutterBottom
            >
              Admin Login
            </Typography>

            {!adminData ? (
              <motion.form
                onSubmit={handleLogin}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  sx={{
                    "& label.Mui-focused": { color: "green" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "green" },
                      "&:hover fieldset": { borderColor: "green" },
                      "&.Mui-focused fieldset": { borderColor: "green" },
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    "& label.Mui-focused": { color: "green" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "green" },
                      "&:hover fieldset": { borderColor: "green" },
                      "&.Mui-focused fieldset": { borderColor: "green" },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    backgroundColor: "green",
                    color: "#fff",
                    fontWeight: 600,
                    py: 1.2,
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "#228B22" },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  <strong>Welcome,</strong> {adminData.username}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {adminData.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Superuser:</strong>{" "}
                  {adminData.is_superuser ? "Yes" : "No"}
                </Typography>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default AdminLogin;
