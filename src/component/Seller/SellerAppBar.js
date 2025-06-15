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
  InputBase, // Import InputBase for the search input
} from "@mui/material";
import { alpha } from "@mui/material/styles"; // Import alpha for styling
import {
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon, // Import SearchIcon
} from "@mui/icons-material";

const SellerAppBar = ({
  handleDrawerToggle,
  darkMode,
  handleThemeToggle,
  fetchFarms, // This prop is used by UploadedFarms for refresh
  anchorEl,
  handleMenuOpen,
  handleMenuClose,
  handleLogout,
  // New props for search functionality
  showSearchInput,
  setShowSearchInput,
  searchQuery, // Renamed from 'search' to match UploadedFarms
  handleSearchChange, // Renamed from 'handleSearchChange' to be more descriptive
  handleSearchSubmit, // New prop for triggering search on Enter or explicit button click
}) => {
  // Handle search submission (e.g., on Enter key press in the input)
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
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

        {/* Search Input and Button */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          {showSearchInput && (
            <InputBase
              placeholder="Search farms..."
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown} // Add onKeyDown event listener
              sx={{
                color: "inherit",
                "& .MuiInputBase-input": {
                  padding: (theme) => theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + 24px)`, // Space for the search icon if it were inside
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
              // Optionally trigger search when the search icon is clicked to close the input
              // if (!showSearchInput && searchQuery) {
              //   handleSearchSubmit();
              // }
              if (showSearchInput && searchQuery) {
                handleSearchSubmit(); // Trigger search when closing input if there's a query
              }
            }}
          >
            <SearchIcon sx={{ fontSize: "2.0rem" }} />
          </IconButton>
        </Box>

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
            U
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
              User
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