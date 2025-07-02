import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  InputBase,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

// Custom hook for fetching user data
const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Decode JWT to get current user info
        let currentUserId, currentUserEmail;
        try {
          const decodedToken = jwtDecode(token);
          currentUserId = decodedToken.user_id; 
          currentUserEmail = decodedToken.email;
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
          throw new Error("Invalid authentication token");
        }

        const response = await fetch(
          "http://127.0.0.1:8000/api/admin-sellers-list/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Find the current user in the sellers list
        const currentUserData = data.find(
          (seller) =>
            seller.id === currentUserId ||
            seller.email === currentUserEmail ||
            seller.user_id === currentUserId
        );

        if (currentUserData) {
          setUserData({
            username: currentUserData.username,
            email: currentUserData.email,
            passport: currentUserData.passport,
          });
        } else {
          throw new Error("Current user not found in sellers list");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError(err.message);

        // Fallback user data
        setUserData({
          username: "User",
          email: "user@example.com",
          passport: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading, error };
};

const SellerAppBar = ({
  handleDrawerToggle,
  darkMode,
  handleThemeToggle,
  anchorEl,
  handleMenuOpen,
  handleMenuClose,
  showSearchInput,
  setShowSearchInput,
  searchQuery,
  handleSearchChange,
  handleSearchSubmit,
}) => {
  const { userData, loading, error } = useUserData();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: "none" }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Farm Seller Dashboard
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          {showSearchInput && (
            <InputBase
              placeholder="Search farms..."
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              sx={{
                color: "inherit",
                "& .MuiInputBase-input": {
                  padding: (theme) => theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + 24px)`,
                  transition: (theme) => theme.transitions.create("width"),
                  width: "120px",
                  "&:focus": {
                    width: "200px",
                  },
                  borderBottom: "1px solid",
                  borderColor: alpha("#fff", 0.7),
                },
                backgroundColor: alpha("#fff", 0.15),
                borderRadius: (theme) => theme.shape.borderRadius,
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.25),
                },
                position: "relative",
                marginRight: (theme) => theme.spacing(1),
              }}
            />
          )}
          <IconButton
            color="inherit"
            onClick={() => {
              setShowSearchInput(!showSearchInput);
              if (showSearchInput && searchQuery) {
                handleSearchSubmit();
              }
            }}
          >
            <SearchIcon sx={{ fontSize: "2.0rem" }} />
          </IconButton>
        </Box>

        <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton color="inherit" onClick={handleThemeToggle}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <IconButton
          edge="end"
          color="inherit"
          onClick={handleMenuOpen}
          sx={{ ml: 1 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: (theme) => theme.palette.secondary.main,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              getUserInitials(userData?.username)
            )}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, minWidth: 180 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: "primary.light" }}>
            <Typography variant="subtitle2" fontWeight="bold" color="white">
              {loading ? "Loading..." : userData?.username || "User"}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleDialogOpen} // Open dialog on click
            sx={{ py: 1.5, display: "flex", gap: 1.5 }}
          >
            <AccountCircleIcon fontSize="small" color="action" />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem>
          <Divider />
        </Menu>

        {/* Snackbar for error messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={error}
        />

        {/* Dialog for user data */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle color="green">User Profile</DialogTitle>
          <DialogContent>
            {loading ? (
              <CircularProgress />
            ) : (
              <Box>
                <Typography variant="body1">
                  <strong>Username:</strong> {userData?.username || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {userData?.email || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Passport:</strong> {userData?.passport || "N/A"}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default SellerAppBar;
