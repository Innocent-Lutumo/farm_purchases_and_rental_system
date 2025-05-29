import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  CardActionArea,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ShoppingBag as PurchasesIcon,
  Home as RentsIcon,
  CloudUpload as UploadIcon,
  CheckCircle as AcceptedIcon,
  Cancel as SoldoutsIcon,
  AddCircle as UploadNewIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as AccountCircleIcon,
  ChevronRight,
  Lightbulb,
  Image as ImageIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

// Theme creation
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2e7d32" },
      secondary: { main: "#f50057" },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: "none", fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0px 2px 4px -1px rgba(0,0,0,0.1)"
                : "0px 2px 4px -1px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
      h6: { fontWeight: 600 },
    },
  });

// Styled Card Component
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 150, 0, 0.2)",
  },
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

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

// Stat card component
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            backgroundColor: `rgba(${
              color === "error.main"
                ? "244, 67, 54"
                : color === "warning.main"
                ? "255, 167, 38"
                : color === "success.main"
                ? "76, 175, 80"
                : "46, 125, 50"
            }, 0.1)`,
            p: 1,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

function SellerPage() {
  // State management
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats] = useState({
    purchases: 120, 
    rents: 75, 
    uploaded: "12",
    accepted: "45",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Theme setup
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  const handleDrawerToggle = useCallback(
    () => setDrawerOpen((prev) => !prev),
    []
  );

  const handleThemeToggle = useCallback(() => setDarkMode((prev) => !prev), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: "none" }}
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
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Farm Seller Dashboard
            </Typography>

            {/* Action buttons */}
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton color="inherit">
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
                  backgroundColor: theme.palette.secondary.main,
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
              <Box sx={{ px: 2, py: 1.5, bgcolor: theme.palette.primary.light }}>
                <Typography variant="subtitle2" fontWeight="bold" color="white">
                  John Farmer
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  Premium Seller
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                component={Link}
                to="/profile"
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

        {/* Side Drawer */}
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
          <Toolbar />
          <Box sx={{ overflow: "hidden", mt: 2 }}>
            {drawerOpen && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    backgroundColor: theme.palette.primary.main,
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
                    component={Link}
                    to={item.path}
                    button
                    sx={{
                      backgroundColor: isActive
                        ? theme.palette.action.selected
                        : "transparent",
                      borderRadius: drawerOpen ? 1 : 0,
                      mx: drawerOpen ? 1 : 0,
                      mb: 0.5,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerOpen ? 48 : "100%",
                        color: isActive
                          ? theme.palette.primary.main
                          : "inherit",
                        textAlign: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? theme.palette.primary.main
                            : "inherit",
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
            <Divider sx={{ my: 0 }} />
            <List>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: drawerOpen ? 1 : 0,
                  mx: drawerOpen ? 1 : 0,
                  mb: 4,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 48 : "100%",
                    textAlign: "center",
                  }}
                >
                  <ExitToAppIcon />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Logout" />}
              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${
              drawerOpen ? drawerWidth : theme.spacing(7)
            }px)`,
            mt: 8,
          }}
        >
          {/* Dashboard Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Seller Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm listings and transactions
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Purchases"
                value={stats.purchases}
                icon={<PurchasesIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Rents"
                value={stats.rents}
                color="success.main"
                icon={<RentsIcon color="success" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Uploaded Farms"
                value={stats.uploaded}
                color="warning.main"
                icon={<UploadIcon color="warning" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Accepted Offers"
                value={stats.accepted}
                color="info.main"
                icon={<AcceptedIcon color="info" />}
              />
            </Grid>
          </Grid>


          {/* Main Navigation Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Farm Management
            </Typography>

            <Grid container spacing={3}>
              {menuItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.text}>
                  <motion.div variants={itemVariants}>
                    <StyledCard elevation={2}>
                      <CardActionArea
                        component={Link}
                        to={item.path}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            height: 8,
                            width: "100%",
                            bgcolor: theme.palette.primary.main,
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: `${theme.palette.primary.main}15`,
                                color: theme.palette.primary.main,
                                width: 56,
                                height: 56,
                                mr: 2,
                              }}
                            >
                              {item.icon}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 0.5,
                                  color: "text.primary",
                                }}
                              >
                                {item.text}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              mt: 1,
                            }}
                          >
                            <ChevronRight color="action" />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </StyledCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper
              elevation={2}
              sx={{
                borderRadius: 4,
                p: 3,
                mt: 4,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Lightbulb />
                Selling Tips
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    tip: "Use high-quality images that showcase your farm's best features",
                    icon: <ImageIcon color="primary" />,
                  },
                  {
                    tip: "Update availability status weekly to keep listings fresh",
                    icon: <RefreshIcon color="success" />,
                  },
                  {
                    tip: "Respond to inquiries within 2 hours for higher conversion rates",
                    icon: <AcceptedIcon color="warning" />,
                  },
                  {
                    tip: "Highlight sustainable farming practices to attract premium buyers",
                    icon: <Lightbulb color="secondary" />,
                  },
                ].map((tip, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 2,
                        bgcolor: "background.default",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateX(5px)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "background.paper",
                          color: "primary.main",
                        }}
                      >
                        {tip.icon}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tip.tip}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                mt: 4,
                bgcolor: "background.paper",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
              >
                🌾 Grow Your Farm Empire!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: 800 }}>
                Selling your land has never been easier or more profitable. Our
                platform connects you with qualified buyers looking for exactly
                what you have to offer.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/UploadFarmForm" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<UploadNewIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontWeight: "bold",
                      }}
                    >
                      Upload a New Farm
                    </Button>
                  </Link>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default SellerPage;