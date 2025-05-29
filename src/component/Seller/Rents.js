import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Menu,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Card,
  CardContent,
  CssBaseline,
  ThemeProvider,
  Badge,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
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
  Lightbulb,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { createTheme } from "@mui/material/styles";
import "../../styles/Animation.css";

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

// Menu items configuration
const menuItems = [
  {
    text: "Purchases",
    icon: <PurchasesIcon />,
    path: "/Purchases",
    description: "Track all farm purchases",
  },
  {
    text: "Rents",
    icon: <RentsIcon />,
    path: "/Rents",
    description: "Manage your property rentals",
    badge: 0,
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

export default function Rent() {
  const currentLocation = useLocation();
  const [orders, setOrders] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalRents: 0,
    confirmed: 0,
    pending: 0,
    available: 0,
  });

  const navigate = useNavigate();
  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);
  const drawerWidth = 240;

  // Function to apply current filters (search and is_rented status)
  const applyFilters = (currentOrders, currentSearchQuery) => {
    return currentOrders.filter(
      (order) =>
        order.farm.is_rented && 
        order.farm.location
          .toLowerCase()
          .includes(currentSearchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(
          "http://127.0.0.1:8000/api/rent-transactions/",
          { headers }
        );
        setOrders(response.data);
        const filtered = applyFilters(response.data, searchQuery);
        setFilteredOrders(filtered);
        
        // Update stats
        setStats({
          totalRents: filtered.length,
          confirmed: filtered.filter(o => o.status === "Confirmed").length,
          pending: filtered.filter(o => o.status === "Pending").length,
          available: filtered.filter(o => !o.farm.is_rented).length,
        });
      } catch (error) {
        console.error("Error fetching orders:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchQuery]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);
  const handleThemeToggle = () => setDarkMode((prev) => !prev);
  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `http://127.0.0.1:8000/api/rent-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrders = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(applyFilters(updatedOrders, searchQuery));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const token = localStorage.getItem("access");
      await axios.delete(
        `http://127.0.0.1:8000/api/rent-transactions/${deleteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrders = orders.filter((order) => order.id !== deleteId);
      setOrders(updatedOrders);
      setFilteredOrders(applyFilters(updatedOrders, searchQuery));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFarmAvailabilityToggle = async (farmId, currentIsRented) => {
    try {
      const token = localStorage.getItem("access");
      const newIsRentedStatus = !currentIsRented; 
      await axios.patch(
        `http://127.0.0.1:8000/api/farmsrent/${farmId}/`,
        { is_rented: newIsRentedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrders = orders.map((order) =>
        order.farm.id === farmId
          ? { ...order, farm: { ...order.farm, is_rented: newIsRentedStatus } }
          : order
      );
      setOrders(updatedOrders); 
      setFilteredOrders(applyFilters(updatedOrders, searchQuery));
    } catch (error) {
      console.error("Failed to update farm availability:", error);
      alert("Failed to update farm availability. Please try again.");
    }
  };

  const handleSearch = () => {
    setFilteredOrders(applyFilters(orders, searchQuery));
  };

  const openConfirmationDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container sx={{ py: 4, textAlign: "center" }}>
          <CircularProgress color="primary" />
          <Typography>Loading rented farms...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

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
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Farm Rentals Management
            </Typography>

            {/* Action buttons */}
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton color="inherit" onClick={() => window.location.reload()}>
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
              {menuItems.map((item) => (
                <ListItem
                  key={item.text}
                  component={Link}
                  to={item.path}
                  button
                  sx={{
                    backgroundColor: currentLocation.pathname === item.path
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
                      color: currentLocation.pathname === item.path ? theme.palette.primary.main : "inherit",
                      textAlign: "center",
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: currentLocation.pathname === item.path ? 600 : 400,
                        color: currentLocation.pathname === item.path ? theme.palette.primary.main : "inherit",
                      }}
                    />
                  )}
                </ListItem>
              ))}
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
              Rented Farms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm rentals and tenant information
            </Typography>
          </Box>

          {/* Stats Cards */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div variants={itemVariants}>
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
                            Total Rents
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {stats.totalRents}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(46, 125, 50, 0.1)",
                            p: 1,
                          }}
                        >
                          <RentsIcon color="primary" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div variants={itemVariants}>
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
                            Confirmed
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {stats.confirmed}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                            p: 1,
                          }}
                        >
                          <AcceptedIcon color="success" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div variants={itemVariants}>
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
                            Pending
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {stats.pending}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(255, 167, 38, 0.1)",
                            p: 1,
                          }}
                        >
                          <UploadIcon color="warning" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div variants={itemVariants}>
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
                            Available
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="info.main">
                            {stats.available}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(41, 121, 255, 0.1)",
                            p: 1,
                          }}
                        >
                          <PurchasesIcon color="info" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search Farms by Location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ minWidth: 120 }}
              >
                Search
              </Button>
            </Paper>
          </motion.div>

          {/* Empty State or Table */}
          {filteredOrders.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 4,
                  borderRadius: 3,
                  bgcolor: theme.palette.background.default,
                  border: `2px dashed ${theme.palette.divider}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 3,
                    bgcolor: theme.palette.action.selected,
                  }}
                >
                  <RentsIcon sx={{ fontSize: 40 }} color="action" />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  No Rented Farms Found
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
                >
                  {searchQuery
                    ? `No farms found matching "${searchQuery}". Try adjusting your search terms.`
                    : "No farms are currently rented or available for rent. Check your farm listings to enable rentals."}
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/UploadedFarms"
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  View Farm Listings
                </Button>
              </Paper>
            </motion.div>
          ) : (
            /* Table */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <TableContainer
                component={Paper}
                sx={{ borderRadius: 3, boxShadow: 3 }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: theme.palette.action.selected }}>
                    <TableRow>
                      <TableCell>Farm</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Rental Time</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Rent Date</TableCell>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Update Status</TableCell>
                      <TableCell>Delete</TableCell>
                      <TableCell>Availability</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <TableRow
                        key={order.id}
                        className="fade-in"
                        sx={{
                          animationDelay: `${index * 0.1}s`,
                          backgroundColor: theme.palette.background.paper,
                          transition: "0.3s",
                          "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={`http://127.0.0.1:8000${order.farm.image}`}
                              variant="rounded"
                              sx={{ width: 80, height: 80 }}
                            />
                            <Typography>{order.farm.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/farm-location/${order.farm.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Tooltip title="View Location">
                                <LocationOnIcon color="primary" />
                              </Tooltip>
                              <Typography color="primary">
                                {order.farm.location}
                              </Typography>
                            </Box>
                          </Link>
                        </TableCell>
                        <TableCell>{order.farm.size}</TableCell>
                        <TableCell>{order.farm.price} Tshs</TableCell>
                        <TableCell>
                          <Typography
                            className={
                              order.status === "Confirmed"
                                ? "confirmed"
                                : order.status === "Cancelled"
                                ? "cancelled"
                                : "pending"
                            }
                          >
                            {order.status || "Pending"}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.farm.rent_duration || "-"}</TableCell>
                        <TableCell>{order.renter_phone || "-"}</TableCell>
                        <TableCell>
                          {order.rent_date
                            ? new Date(order.rent_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{order.transaction_id || "-"}</TableCell>
                        <TableCell>{order.renter_email || "-"}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={order.status || "Pending"}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              sx={{
                                "& .MuiSelect-select": {
                                  color:
                                    order.status === "Confirmed"
                                      ? theme.palette.success.main
                                      : order.status === "Cancelled"
                                      ? theme.palette.error.main
                                      : theme.palette.warning.main,
                                },
                              }}
                            >
                              <MenuItem value="Confirmed">Confirmed</MenuItem>
                              <MenuItem value="Cancelled">Cancelled</MenuItem>
                              <MenuItem value="Pending">Pending</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => openConfirmationDialog(order.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!order.farm.is_rented}
                                onChange={() =>
                                  handleFarmAvailabilityToggle(
                                    order.farm.id,
                                    order.farm.is_rented
                                  )
                                }
                                color={order.farm.is_rented ? "warning" : "success"}
                              />
                            }
                            label={order.farm.is_rented ? "Rented" : "Available"}
                            sx={{
                              color: order.farm.is_rented
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          )}

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                p: 3,
                mt: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.warning.main,
                    width: 32,
                    height: 32,
                  }}
                >
                  <Lightbulb />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Farm Rental Management Tips
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Here are some helpful tips to manage your farm rentals effectively:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Regular Communication:</strong> Stay in touch with your tenants to ensure smooth operations
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Status Updates:</strong> Keep transaction statuses updated to maintain clear records
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Availability Management:</strong> Toggle farm availability to control rental opportunities
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>Documentation:</strong> Maintain proper records of all rental agreements and payments
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Confirmation Dialog for Deletion */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Confirm Deletion
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="text.secondary">
              Are you sure you want to delete this rental transaction? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={isDeleting}
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              {isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}