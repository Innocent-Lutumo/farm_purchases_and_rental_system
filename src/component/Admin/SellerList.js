import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/AdminLogin";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://localhost:8000/api/token/refresh/",
          { refresh }
        );
        localStorage.setItem("access", response.data.access);

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/AdminLogin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Theme creation moved to separate function
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

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerToDelete, setSellerToDelete] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [drawerOpen, setDrawerOpen] = useState(true); 
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  const navigate = useNavigate();
  const location = useLocation();

  // Theme setup
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  // Menu items configuration
  const menuItems = useMemo(
    () => [
      { text: "Admin Dashboard", icon: <DashboardIcon />, path: "/Dashboard" },
      { text: "Registered Sellers", icon: <PeopleIcon />, path: "/SellerList" },
    ],
    []
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh"); 
    navigate("/AdminLogin");
  }, [navigate]);

  const handleDrawerToggle = useCallback(
    () => setDrawerOpen((prev) => !prev),
    []
  );

  const handleThemeToggle = useCallback(() => setDarkMode((prev) => !prev), []);

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("http://127.0.0.1:8000/api/admin-sellers");
      console.log("Fetched sellers:", response.data);
      setSellers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sellers:", err);

      let errorMessage = "Failed to fetch sellers";
      if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication required. Please login again.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage += ": " + err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterSellers = useCallback(() => {
    if (!sellers.length) {
      setFilteredSellers([]);
      return;
    }

    const filtered = sellers.filter((seller) => {
      const searchableFields = [
        seller.seller_name,
        seller.username,
        seller.seller_residence,
      ].filter(Boolean);

      const matchesSearch =
        searchQuery === "" ||
        searchableFields.some((field) =>
          String(field).toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });

    setFilteredSellers(filtered);
  }, [sellers, searchQuery]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    filterSellers();
  }, [filterSellers]);

  const handleDeleteClick = useCallback((seller) => {
    console.log("Delete clicked for seller:", seller);
    setSellerToDelete({
      id: seller.id || seller.pk,
      seller_name: seller.seller_name,
      username: seller.username,
      seller_residence: seller.seller_residence,
    });
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);

      console.log("Deleting seller with ID:", sellerToDelete.id);

      if (!sellerToDelete.id) {
        throw new Error("Seller ID is missing");
      }

      await api.delete(
        `http://127.0.0.1:8000/api/admin-sellers/${sellerToDelete.id}/`
      );

      setOpenDeleteDialog(false);
      fetchSellers();
      setSnackbar({
        open: true,
        message: "Seller removed successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting seller:", err);

      let errorMessage = "Failed to delete seller";
      if (err.message === "Seller ID is missing") {
        errorMessage = "Unable to delete: Seller ID is missing";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.status === 404) {
        errorMessage = "Seller not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

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
              Admin Dashboard for Sellers
            </Typography>

            {/* Search */}
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: 2,
                mr: 2,
                display: { xs: "none", md: "flex" },
                width: 300,
              }}
            >
              <TextField
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "white", mx: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mx: 1, color: "white", "& input": { color: "white" } }}
              />
            </Box>

            {/* Action buttons */}
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <IconButton edge="end" color="inherit" sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: theme.palette.secondary.main,
                }}
              >
                A
              </Avatar>
            </IconButton>
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
                  A
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Admin User
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
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: drawerOpen ? 1 : 0,
                  mx: drawerOpen ? 1 : 0,
                  mb: 0.5,
                  color: "red",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 48 : "100%",
                    textAlign: "center",
                    color: "red",
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
          {/* Page Title Section*/}
          <Box sx={{ mb: 4, textAlign: "left" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
                display: "inline-block",
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  width: "60%",
                  height: "4px",
                  bottom: "-8px",
                  left: "0",
                  backgroundColor: theme.palette.primary.main, 
                  borderRadius: "2px",
                },
              }}
            >
              Registered Sellers
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mt: 2, color: "text.secondary", fontWeight: 500 }}
            >
              View and manage all registered sellers in the system
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Loading and Error States */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress
                size={40}
                thickness={4}
                sx={{ color: theme.palette.primary.main }}
              />
            </Box>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 4,
                borderRadius: 2,
                "& .MuiAlert-icon": { fontSize: "1.5rem" },
              }}
            >
              {error}
            </Alert>
          )}

          {!loading && filteredSellers.length === 0 && !error && (
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: 2,
                "& .MuiAlert-icon": { fontSize: "1.5rem" },
              }}
            >
              No sellers found matching your criteria.
            </Alert>
          )}

          {/* Table and action buttons */}
          {!loading && filteredSellers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Paper
                elevation={3}
                sx={{
                  overflowX: "auto",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: theme.palette.primary.main }}
                    >
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          padding: "8px 12px",
                        }}
                      >
                        Seller Name
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          padding: "8px 12px",
                        }}
                      >
                        Username
                      </TableCell>
                      {/* Removed Email column */}
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          padding: "8px 12px",
                        }}
                      >
                        Residence
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          padding: "8px 12px",
                          textAlign: "center",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSellers.map((seller, index) => (
                      <TableRow
                        key={seller.id || index}
                        hover
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: theme.palette.background.default,
                          },
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <TableCell
                          sx={{
                            padding: "8px 12px",
                            fontWeight: 500,
                            fontSize: "0.85rem",
                          }}
                        >
                          {seller.seller_name || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ padding: "8px 12px", fontSize: "0.85rem" }}
                        >
                          {seller.username || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ padding: "8px 12px", fontSize: "0.85rem" }}
                        >
                          {seller.seller_residence || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ padding: "8px 12px", textAlign: "center" }}
                        >
                          <Tooltip title="Delete Seller">
                            <IconButton
                              onClick={() => handleDeleteClick(seller)}
                              disabled={deleteLoading}
                              sx={{
                                color: theme.palette.error.main,
                                "&:hover": {
                                  backgroundColor: theme.palette.action.hover,
                                },
                                padding: "6px",
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: "1.2rem" }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              {/* Additional statistics */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  Summary
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Total registered sellers: <b>{filteredSellers.length}</b>{" "}
                  {/* Use filteredSellers here */}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  Last updated: {new Date().toLocaleString()}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
            maxWidth="xs"
          >
            <DialogTitle>{"Confirm Deletion"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to remove seller "
                <b>{sellerToDelete.seller_name}</b>"? This will remove them from
                the seller group but keep their user account.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDeleteDialog(false)}
                disabled={deleteLoading}
                sx={{ color: theme.palette.text.secondary }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                sx={{ color: theme.palette.error.main }}
                autoFocus
              >
                {deleteLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Remove"
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SellerList;
