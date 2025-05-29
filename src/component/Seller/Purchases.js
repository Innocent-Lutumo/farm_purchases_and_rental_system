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
  Menu,
  MenuItem,
  FormControl,
  IconButton,
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
    badge: 0,
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

export default function Purchases() {
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
    purchases: 0,
    rents: 0,
    uploaded: 0,
    accepted: 0,
  });

  const navigate = useNavigate();
  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);
  const drawerWidth = 240;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get(
          "http://127.0.0.1:8000/api/sale-transactions/",
          { headers }
        );
        setOrders(data);
        setFilteredOrders(data);
        setStats({
          purchases: data.length,
          rents: data.filter((o) => o.status === "Confirmed").length,
          uploaded: data.filter((o) => o.farm.is_sold === false).length,
          accepted: data.filter((o) => o.status === "Confirmed").length,
        });
      } catch (error) {
        console.error("Error fetching orders:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
        `http://127.0.0.1:8000/api/sale-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const token = localStorage.getItem("access");
      await axios.delete(
        `http://127.0.0.1:8000/api/sale-transactions/${deleteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = orders.filter((order) => order.id !== deleteId);
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFarmAvailabilityToggle = async (farmId, currentIsSold) => {
    try {
      const token = localStorage.getItem("access");
      const newIsSoldStatus = !currentIsSold;
      await axios.patch(
        `http://127.0.0.1:8000/api/farmsale/${farmId}/`,
        { is_sold: newIsSoldStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrders = orders.map((order) =>
        order.farm.id === farmId
          ? { ...order, farm: { ...order.farm, is_sold: newIsSoldStatus } }
          : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
    } catch (error) {
      console.error("Failed to update farm availability:", error);
    }
  };

  const handleSearch = () => {
    const filtered = orders.filter((order) =>
      order.farm.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
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
          <Typography>Loading purchased farms...</Typography>
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
              Farm Purchases Management
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
              Purchased Farms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm sales and transactions
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
                            Total Purchases
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {stats.purchases}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(46, 125, 50, 0.1)",
                            p: 1,
                          }}
                        >
                          <PurchasesIcon color="primary" />
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
                            {stats.accepted}
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
                            Available Farms
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {stats.uploaded}
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
                            Total Rents
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="info.main">
                            {stats.rents}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(41, 121, 255, 0.1)",
                            p: 1,
                          }}
                        >
                          <RentsIcon color="info" />
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

          {/* Table */}
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
                    <TableCell>Phone</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Edit Status</TableCell>
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
                          {order.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.renter_phone || "-"}</TableCell>
                      <TableCell>{order.transaction_id}</TableCell>
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
                              checked={!order.farm.is_sold}
                              onChange={() =>
                                handleFarmAvailabilityToggle(
                                  order.farm.id,
                                  order.farm.is_sold
                                )
                              }
                              color={order.farm.is_sold ? "warning" : "success"}
                            />
                          }
                          label={order.farm.is_sold ? "Sold" : "Available"}
                          sx={{
                            color: order.farm.is_sold
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
                bgcolor: theme.palette.background.paper,
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
                <Lightbulb color="warning" />
                Sales Tips
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    tip: "Respond to inquiries within 2 hours for higher conversion rates",
                    icon: <AcceptedIcon color="success" />,
                  },
                  {
                    tip: "Update farm status promptly when sold to avoid confusion",
                    icon: <RefreshIcon color="primary" />,
                  },
                  {
                    tip: "Provide clear photos and accurate descriptions to attract buyers",
                    icon: <UploadIcon color="secondary" />,
                  },
                  {
                    tip: "Consider seasonal pricing adjustments for better sales",
                    icon: <Lightbulb color="warning" />,
                  },
                ].map((tip, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.background.default,
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

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{ sx: { borderRadius: 3 } }}
            >
            <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
              Delete Transaction
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this transaction? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setOpenDeleteDialog(false)}
                color="inherit"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                color="error"
                variant="contained"
                disabled={isDeleting}
                startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Empty State */}
          {filteredOrders.length === 0 && !loading && (
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
                  <PurchasesIcon sx={{ fontSize: 40 }} color="action" />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  No Purchases Found
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
                >
                  {searchQuery
                    ? `No farms found matching "${searchQuery}". Try adjusting your search terms.`
                    : "You haven't made any farm purchases yet. Start exploring available farms to make your first purchase."}
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/farms"
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  Browse Farms
                </Button>
              </Paper>
            </motion.div>
          )}

          {/* Loading Overlay */}
          {isDeleting && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={40} color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Deleting Transaction...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we process your request
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}