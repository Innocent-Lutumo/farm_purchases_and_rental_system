import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { validateToken } from "./auth";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }

      const result = await validateToken(token);

      if (result.isValid) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        // Clear invalid tokens from local storage
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        console.error("Token validation failed:", result.error);
      }

      setIsValidating(false);
    };

    checkToken();
  }, []); // Empty dependency array means this runs once on mount

  // Show loading while validating token
  if (isValidating) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5", // Light grey background
        }}
      >
        <CircularProgress sx={{ color: "primary.main", mb: 2 }} />{" "}
        {/* MUI Spinner */}
        <Typography variant="h6" color="text.secondary">
          Validating session...
        </Typography>
      </Box>
    );
  }

  // If user has a valid token and tries to access the login page, redirect to SellerPage
  // This prevents logged-in users from seeing the login form
  if (
    isTokenValid &&
    (location.pathname === "/login" || location.pathname === "/LoginPage")
  ) {
    return <Navigate to="/SellerPage" replace />;
  }

  // If no valid token and not on the login page, redirect to login
  // This protects routes that require authentication
  if (
    !isTokenValid &&
    location.pathname !== "/login" &&
    location.pathname !== "/LoginPage"
  ) {
    return <Navigate to="/LoginPage" replace state={{ from: location }} />;
  }

  // If user has a valid token and is accessing a protected route, render children
  // If not a protected route and no token (e.g., public pages), render children too.
  return children;
};

export default ProtectedRoute;
