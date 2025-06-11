import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Box,
  Typography,
  Toolbar,
  Skeleton,
} from "@mui/material";
import {
  ShoppingBag as PurchasesIcon,
  Home as RentsIcon,
  CloudUpload as UploadIcon,
  AddCircle as UploadNewIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";

// Menu items configuration (kept as is, it's well-defined)
const menuItems = [
  {
    text: "Purchased farms",
    icon: <PurchasesIcon />,
    path: "/Purchases",
    description: "Track all farm purchase",
  },
  {
    text: "Rented farms",
    icon: <RentsIcon />,
    path: "/Rents",
    description: "Manage your property rentals",
  },
  {
    text: "Uploaded Farms",
    icon: <UploadIcon />,
    path: "/UploadedFarms",
    description: "View your farm listings",
  },
  {
    text: "Upload New Farm",
    icon: <UploadNewIcon />,
    path: "/UploadFarmForm",
    description: "Create a new farm listing",
  },
];

const SellerDrawer = ({ drawerOpen, drawerWidth, theme, handleLogout }) => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get user initials from name
  const getUserInitials = (name) => {
    if (!name) return "U"; // Default to "U" for User
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2); // Take first 2 initials
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('access') || sessionStorage.getItem('access');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://127.0.0.1:8000/api/admin-sellers-list/', { // Adjust this endpoint to match your API
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Extract user data from the farm data response
        if (data && data.length > 0) {
          const farmData = data[0]; // Get first farm entry to extract user info
          setUserData({
            username: farmData.username,
            email: farmData.email,
            passport: farmData.passport,
          });
        } else {
          throw new Error('No farm data found');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err.message);
        // Fallback to default values or handle error as needed
        setUserData({
          username: 'User',
          email: 'user@example.com',
          passport: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Render user info section
  const renderUserInfo = () => {
    if (!drawerOpen) return null;

    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            pt: 2,
          }}
        >
          <Skeleton variant="circular" width={64} height={64} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={120} height={24} />
        </Box>
      );
    }

    if (error && !userData) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            pt: 2,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mb: 2,
              backgroundColor: theme.palette.grey[400],
              color: theme.palette.getContrastText(theme.palette.grey[400]),
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            ?
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
            Unable to load user
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
          pt: 2,
        }}
      >
        <Avatar
          src={userData?.avatar || userData?.profilePicture} // Try both common field names
          sx={{
            width: 64,
            height: 64,
            mb: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          {!userData?.avatar && !userData?.profilePicture && getUserInitials(userData?.name || userData?.fullName)}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          {userData?.name || userData?.fullName || 'User'}
        </Typography>
        {userData?.email && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {userData.email}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? drawerWidth : theme.spacing(7),
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: drawerOpen ? drawerWidth : theme.spacing(7),
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          [theme.breakpoints.up('sm')]: {
            width: drawerOpen ? drawerWidth : theme.spacing(9),
          },
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", px: 1 }}>
        {/* User Info with real data */}
        {renderUserInfo()}

        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem
                key={item.text}
                component={RouterLink}
                to={item.path}
                button
                sx={{
                  backgroundColor: isActive
                    ? theme.palette.action.selected
                    : "transparent",
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  justifyContent: drawerOpen ? "initial" : "center",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : "auto",
                    justifyContent: "center",
                    display: "flex",
                    color: isActive ? theme.palette.primary.main : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? theme.palette.primary.main : "inherit",
                    }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1 }} />
        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 2,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              justifyContent: drawerOpen ? "initial" : "center",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: drawerOpen ? 3 : "auto",
                justifyContent: "center",
                display: "flex",
                color: theme.palette.error.main,
              }}
            >
              <ExitToAppIcon />
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  color: theme.palette.error.main,
                }}
              />
            )}
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default SellerDrawer;