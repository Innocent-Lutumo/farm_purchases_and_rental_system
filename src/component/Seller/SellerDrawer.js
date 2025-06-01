import React from "react";
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
} from "@mui/material";
import {
  ShoppingBag as PurchasesIcon,
  Home as RentsIcon,
  CloudUpload as UploadIcon,
  CheckCircle as AcceptedIcon,
  Cancel as SoldoutsIcon,
  AddCircle as UploadNewIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";

// Menu items configuration
const menuItems = [
  {
    text: "Purchases",
    icon: <PurchasesIcon />,
    path: "/Purchases",
    description: "Track all farm purchase",
  },
  {
    text: "Rents",
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
    text: "Accepted List",
    icon: <AcceptedIcon />,
    path: "/accepted",
    description: "Review approved farm transactions",
  },
  {
    text: "Soldouts",
    icon: <SoldoutsIcon />,
    path: "/soldouts",
    description: "Archive of completed sales",
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

  return (
    <Drawer
      variant="permanent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? drawerWidth : theme.spacing(7),
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerOpen ? drawerWidth : theme.spacing(7),
          boxSizing: "border-box",
          whiteSpace: "nowrap",
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar /> {/* Add this to account for the AppBar height */}
      <Box sx={{ overflow: "auto", mt: 2, p: 2 }}>
        {drawerOpen && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
              pt: 2, // Add padding to ensure visibility
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mb: 2,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              JF
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              John Farmer
            </Typography>
          </Box>
        )}

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
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 48 : "100%",
                    color: isActive ? theme.palette.primary.main : "inherit",
                    justifyContent: "center",
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
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: drawerOpen ? 48 : "100%",
                justifyContent: "center",
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