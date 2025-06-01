import React from "react";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";

const SellerAppBar = ({
  handleDrawerToggle,
  darkMode,
  handleThemeToggle,
  fetchFarms,
  anchorEl,
  handleMenuOpen,
  handleMenuClose,
  handleLogout,
}) => {
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

        {/* Action buttons */}
        <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton color="inherit" onClick={handleThemeToggle}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <IconButton color="inherit" onClick={fetchFarms}>
            <RefreshIcon />
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
            JF
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
              John Farmer
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              Premium Seller
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            component="a"
            href="/profile"
            onClick={handleMenuClose}
            sx={{ py: 1.5, display: "flex", gap: 1.5 }}
          >
            <AccountCircleIcon fontSize="small" color="action" />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleLogout();
              handleMenuClose();
            }}
            sx={{ py: 1.5, display: "flex", gap: 1.5 }}
          >
            <ExitToAppIcon fontSize="small" color="error" />
            <Typography variant="body2" color="error">
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default SellerAppBar;