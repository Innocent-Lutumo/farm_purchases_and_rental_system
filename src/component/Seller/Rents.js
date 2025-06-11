import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Avatar,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  CircularProgress,
  Switch,
  Grid,
  Card,
  CardContent,
  CssBaseline,
  ThemeProvider,
  Tabs,
  Tab,
  Chip,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  CardMedia,
  CardActions,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  ShoppingBag as PurchasesIcon,
  Home as RentsIcon,
  CloudUpload as UploadIcon,
  CheckCircle as AcceptedIcon,
  AddCircle as UploadNewIcon,
  Delete as DeleteIcon,
  HourglassEmpty as PendingIcon,
  MonetizationOn as SoldIcon,
  ViewList as TableViewIcon,
  ViewModule as CardViewIcon,
  Description as AgreementIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { createTheme } from "@mui/material/styles";
import SellerDrawer from "./SellerDrawer";
import SellerAppBar from "./SellerAppBar";

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
    text: "Upload New Farm",
    icon: <UploadNewIcon />,
    path: "/UploadFarmForm",
    description: "Create a new farm listing",
  },
];

export default function Rents() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0); 
  const [viewMode, setViewMode] = useState("table"); 
  const [stats, setStats] = useState({
    totalRents: 0,
    confirmed: 0,
    pending: 0,
    rented: 0,
  });

  // Missing states for AppBar and Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navigate = useNavigate();
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  // Updated filter function to include both is_rented and status conditions
  const filterOrdersByTab = useCallback(
    (ordersData, tabIndex) => {
      let filtered = [];
      if (tabIndex === 0) {
        // All Rents - Only show farms that are rented (is_rented = true)
        filtered = ordersData.filter(order => order.farm.is_rented === true);
      } else if (tabIndex === 1) {
        // Rented - farms with is_rented = true AND status = confirmed
        filtered = ordersData.filter(
          (order) =>
            order.farm.is_rented === true && order.status === "Confirmed"
        );
      }

      // Apply search filter if exists
      if (searchQuery.trim()) {
        filtered = filtered.filter((order) =>
          order.farm.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredOrders(filtered);
    },
    [searchQuery]
  );

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("access");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(
        "http://127.0.0.1:8000/api/rent-transactions/",
        { headers }
      );
      setOrders(data);

      // Calculate stats based on fetched data
      const totalRents = data.filter(order => order.farm.is_rented === true).length;
      const confirmed = data.filter((o) => o.status === "Confirmed" && o.farm.is_rented === true).length;
      const pending = data.filter((o) => o.status === "Pending" && o.farm.is_rented === true).length;
      const rented = data.filter(
        (o) => o.farm.is_rented === true && o.status === "Confirmed"
      ).length;

      setStats({
        totalRents,
        confirmed,
        pending,
        rented,
      });

      // Filter based on active tab
      filterOrdersByTab(data, activeTab);
    } catch (error) {
      console.error("Error fetching orders:", error.response || error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterOrdersByTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    filterOrdersByTab(orders, activeTab);
  }, [activeTab, orders, searchQuery, filterOrdersByTab]);

  const handleThemeToggle = () => setDarkMode((prev) => !prev);
  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    filterOrdersByTab(orders, activeTab);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `http://127.0.0.1:8000/api/rent-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh data after status change
      fetchOrders();
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
        `http://127.0.0.1:8000/api/rent-transactions/${deleteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh data after deletion
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
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
      // Refresh data after availability toggle
      fetchOrders();
    } catch (error) {
      console.error("Failed to update farm availability:", error);
    }
  };

  const openConfirmationDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleViewAgreement = (order) => {
    // Handle view agreement logic here
    console.log("View agreement for:", order.transaction_id);
    // You can implement modal or navigation to agreement page
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

  // Card Component
  const FarmCard = ({ order, index }) => (
    <motion.div
      variants={itemVariants}
      className="fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
          },
          opacity: order.farm.is_rented ? 0.85 : 1,
        }}
      >
        {/* Farm Image */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="140"
            image={`http://127.0.0.1:8000${order.farm.image}`}
            alt={order.farm.name}
            sx={{
              filter: order.farm.is_rented ? "grayscale(50%)" : "none",
            }}
          />

          {/* Status Badge */}
          <Chip
            label={order.status}
            color={
              order.status === "Confirmed"
                ? "success"
                : order.status === "Cancelled"
                ? "error"
                : "warning"
            }
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />

          {/* Rented Badge */}
          {order.farm.is_rented && (
            <Chip
              label="RENTED"
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: "error.main",
                color: "white",
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Farm Name */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: "1rem",
              textDecoration: order.farm.is_rented ? "line-through" : "none",
              color: order.farm.is_rented ? "text.secondary" : "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {order.farm.name}
          </Typography>

          {/* Location */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LocationOnIcon
              sx={{ fontSize: 16, color: "primary.main", mr: 0.5 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {order.farm.location}
            </Typography>
          </Box>

          {/* Size and Price */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Size:</strong> {order.farm.size}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: order.farm.is_rented ? "text.secondary" : "success.main",
                fontSize: "0.9rem",
              }}
            >
              {order.farm.price} Tshs
            </Typography>
          </Box>

          {/* Rental Duration */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Duration:</strong> {order.farm.rent_duration || "N/A"}
            </Typography>
          </Box>

          {/* Contact Info (Compact) */}
          {(order.renter_phone || order.renter_email) && (
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              {order.renter_phone && (
                <Tooltip title={order.renter_phone}>
                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                </Tooltip>
              )}
              {order.renter_email && (
                <Tooltip title={order.renter_email}>
                  <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                </Tooltip>
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          {/* Status Change Select - Always Active */}
          <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
            <Select
              value={order.status || "Pending"}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              sx={{
                fontSize: "0.8rem",
                "& .MuiSelect-select": {
                  py: 0.5,
                  color:
                    order.status === "Confirmed"
                      ? theme.palette.success.main
                      : order.status === "Cancelled"
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                },
              }}
            >
              <MenuItem value="Confirmed" sx={{ fontSize: "0.8rem" }}>
                Confirmed
              </MenuItem>
              <MenuItem value="Cancelled" sx={{ fontSize: "0.8rem" }}>
                Cancelled
              </MenuItem>
              <MenuItem value="Pending" sx={{ fontSize: "0.8rem" }}>
                Pending
              </MenuItem>
            </Select>
          </FormControl>

          {/* Agreement Icon (Only for Rented in Card View) */}
          {order.farm.is_rented && activeTab === 1 && (
            <Tooltip title="View Agreement">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleViewAgreement(order)}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <AgreementIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete Button */}
          <Tooltip title="Delete Transaction">
            <IconButton
              size="small"
              color="error"
              onClick={() => openConfirmationDialog(order.id)}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Availability Toggle */}
          <Tooltip
            title={
              order.farm.is_rented ? "Mark as Available" : "Mark as Rented"
            }
          >
            <Switch
              checked={!order.farm.is_rented}
              onChange={() =>
                handleFarmAvailabilityToggle(
                  order.farm.id,
                  order.farm.is_rented
                )
              }
              color={order.farm.is_rented ? "error" : "success"}
              size="small"
            />
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );

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
        <SellerAppBar
          handleDrawerToggle={handleDrawerToggle}
          darkMode={darkMode}
          handleThemeToggle={handleThemeToggle}
          fetchFarms={fetchOrders}
          anchorEl={anchorEl}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleLogout={handleLogout}
          showSearchInput={showSearchInput}
          setShowSearchInput={setShowSearchInput}
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />

        <SellerDrawer
          drawerOpen={drawerOpen}
          drawerWidth={drawerWidth}
          theme={theme}
          handleLogout={handleLogout}
          menuItems={menuItems}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
          }}
        >
          {/* Dashboard Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Farm Rentals Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm rentals and track rental transactions
            </Typography>
          </Box>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
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
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="primary"
                          >
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
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="success.main"
                          >
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
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="warning.main"
                          >
                            {stats.pending}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(255, 167, 38, 0.1)",
                            p: 1,
                          }}
                        >
                          <PendingIcon color="warning" />
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
                            Rented
                          </Typography>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="error.main"
                          >
                            {stats.rented}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                            p: 1,
                          }}
                        >
                          <SoldIcon color="error" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>

          {/* Tabs and View Toggle Section */}
          <Paper sx={{ borderRadius: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                pb: 0,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      All Rents
                      <Chip
                        label={stats.totalRents}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: "0.75rem" }}
                      />
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Rented
                      <Chip
                        label={stats.rented}
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: "0.75rem" }}
                      />
                    </Box>
                  }
                />
              </Tabs>

              {/* View Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    border: "1px solid",
                    borderColor: "divider",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="table" aria-label="table view">
                  <Tooltip title="Table View">
                    <TableViewIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="cards" aria-label="card view">
                  <Tooltip title="Card View">
                    <CardViewIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>

          {/* Content - Table or Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {viewMode === "table" ? (
              // Table View
              <TableContainer
                component={Paper}
                sx={{ borderRadius: 3, boxShadow: 3 }}
              >
                <Table>
                  <TableHead
                    sx={{ backgroundColor: theme.palette.action.selected }}
                  >
                    <TableRow>
                      <TableCell>Farm</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Rental Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Rent Date</TableCell>
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
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}></Box>
                            <Badge
                              badgeContent={
                                order.farm.is_rented ? "RENTED" : ""
                              }
                              color="error"
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.6rem",
                                  height: 16,
                                  minWidth: 16,
                                },
                              }}
                            >
                              <Avatar
                                src={`http://127.0.0.1:8000${order.farm.image}`}
                                variant="rounded"
                                sx={{
                                  width: 80,
                                  height: 80,
                                  opacity: order.farm.is_rented ? 0.7 : 1,
                                }}
                              />
                            </Badge>
                            <Box>
                              <Typography
                                sx={{
                                  textDecoration: order.farm.is_rented
                                    ? "line-through"
                                    : "none",
                                  color: order.farm.is_rented
                                    ? "text.secondary"
                                    : "text.primary",
                                }}
                              >
                                {order.farm.name}
                              </Typography>
                              {order.farm.is_rented && (
                                <Chip
                                  label="Rented"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{mt: 0.5,
                                    fontSize: "0.7rem",
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <LocationOnIcon
                                sx={{ mr: 1, color: "primary.main" }}
                              />
                              {order.farm.location}
                            </Box>
                          </TableCell>
                          <TableCell>{order.farm.size}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: order.farm.is_rented
                                  ? "text.secondary"
                                  : "success.main",
                              }}
                            >
                              {order.farm.price} Tshs
                            </Typography>
                          </TableCell>
                          <TableCell>{order.farm.rent_duration || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={
                                order.status === "Confirmed"
                                  ? "success"
                                  : order.status === "Cancelled"
                                  ? "error"
                                  : "warning"
                              }
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>{order.renter_phone || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(order.rent_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                backgroundColor: "action.selected",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              {order.transaction_id}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.renter_email || "N/A"}</TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
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
                            <Tooltip title="Delete Transaction">
                              <IconButton
                                color="error"
                                onClick={() => openConfirmationDialog(order.id)}
                                disabled={isDeleting}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                order.farm.is_rented
                                  ? "Mark as Available"
                                  : "Mark as Rented"
                              }
                            >
                              <Switch
                                checked={!order.farm.is_rented}
                                onChange={() =>
                                  handleFarmAvailabilityToggle(
                                    order.farm.id,
                                    order.farm.is_rented
                                  )
                                }
                                color={order.farm.is_rented ? "error" : "success"}
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredOrders.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="text.secondary">
                        No rental transactions found.
                      </Typography>
                    </Box>
                  )}
                </TableContainer>
              ) : (
                // Card View
                <Grid container spacing={3}>
                  {filteredOrders.map((order, index) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      <FarmCard order={order} index={index} />
                    </Grid>
                  ))}
                  {filteredOrders.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                        >
                          No rental transactions found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeTab === 0
                            ? "No rented farms available."
                            : "No confirmed rental transactions found."}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </motion.div>
          </Box>
  
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight="bold">
                Confirm Deletion
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this rental transaction? This
                action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => setOpenDeleteDialog(false)}
                color="primary"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                color="error"
                variant="contained"
                disabled={isDeleting}
                startIcon={
                  isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />
                }
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider>
    );
  }