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
  Cancel as SoldoutsIcon,
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
      statusConfirmed: { main: "#4caf50" },
      statusPending: { main: "#ffc107" },
      statusCancelled: { main: "#f44336" },
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
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
  });

// Menu items for SellerDrawer
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
  // State variables
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
    totalPurchases: 0,
    confirmed: 0,
    pending: 0,
    soldOuts: 0,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navigate = useNavigate();
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  // Memoized function to filter orders based on active tab and search query
  const filterOrdersByTab = useCallback(
    (ordersData, tabIndex) => {
      let filtered = [];
      if (tabIndex === 0) {

        filtered = ordersData.filter(
          (order) => order.farm.is_sold === true || order.status === "Pending"
        );
      } else if (tabIndex === 1) {
        // Sold Outs - farms with is_sold = true AND status = "Confirmed"
        filtered = ordersData.filter(
          (order) => order.farm.is_sold === true && order.status === "Confirmed"
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

  // Function to fetch orders from the API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(
        "http://127.0.0.1:8000/api/sale-transactions/",
        { headers }
      );
      setOrders(data);

      // Calculate stats based on fetched data
      const totalPurchases = data.length;
      const confirmed = data.filter((o) => o.status === "Confirmed").length;
      const pending = data.filter((o) => o.status === "Pending").length;
      const soldOuts = data.filter(
        (o) => o.farm.is_sold === true && o.status === "Confirmed"
      ).length;

      setStats({
        totalPurchases,
        confirmed,
        pending,
        soldOuts,
      });

      filterOrdersByTab(data, activeTab);
    } catch (error) {
      console.error("Error fetching orders:", error.response || error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access");
        navigate("/LoginPage");
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterOrdersByTab, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    filterOrdersByTab(orders, activeTab);
  }, [activeTab, orders, searchQuery, filterOrdersByTab]);

  // Handler for theme toggle
  const handleThemeToggle = () => setDarkMode((prev) => !prev);
  
  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  // Handler for drawer toggle (mobile)
  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  // Handlers for AppBar menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Search input change handler
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Search submission handler
  const handleSearchSubmit = () => {
    filterOrdersByTab(orders, activeTab);
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // View mode toggle handler
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Handler to update transaction status - ALWAYS ACTIVE
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `http://127.0.0.1:8000/api/sale-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh data after status change
    } catch (error) {
      console.error("Failed to update order status:", error.response || error);
    }
  };

  // Handler for farm availability toggle - automatically removes from page when marked as available
  const handleFarmAvailabilityToggle = async (farmId, currentIsSold) => {
    try {
      const token = localStorage.getItem("access");
      const newIsSoldStatus = !currentIsSold;
      await axios.patch(
        `http://127.0.0.1:8000/api/farmsale/${farmId}/`,
        { is_sold: newIsSoldStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh data after availability toggle
      // The filtering logic will automatically remove items where is_sold = false
      fetchOrders();
    } catch (error) {
      console.error(
        "Failed to update farm availability:",
        error.response || error
      );
    }
  };

  // Handler for confirming and performing deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const token = localStorage.getItem("access");
      await axios.delete(
        `http://127.0.0.1:8000/api/sale-transactions/${deleteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error(
        "Failed to delete transaction:",
        error.response || error
      );
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Opens the delete confirmation dialog
  const openConfirmationDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // Handles viewing the agreement
  const handleViewAgreement = (order) => {
    console.log("View agreement for:", order.transaction_id);
  };

  // Framer Motion variants for animations
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

  // FarmCard component for card view
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
          opacity: order.farm.is_sold ? 0.85 : 1,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="140"
            image={`http://127.0.0.1:8000${order.farm.image}`}
            alt={order.farm.name}
            sx={{
              filter: order.farm.is_sold ? "grayscale(50%)" : "none",
            }}
          />

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

          {order.farm.is_sold && (
            <Chip
              label="SOLD OUT"
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
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: "1rem",
              textDecoration: order.farm.is_sold ? "line-through" : "none",
              color: order.farm.is_sold ? "text.secondary" : "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {order.farm.name}
          </Typography>

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
                color: order.farm.is_sold ? "text.secondary" : "success.main",
                fontSize: "0.9rem",
              }}
            >
              {order.farm.price} TZS
            </Typography>
          </Box>

          {(order.contact_info || order.buyer_email) && (
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              {order.contact_info && (
                <Tooltip title={`Buyer Phone: ${order.contact_info}`}>
                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                </Tooltip>
              )}
              {order.buyer_email && (
                <Tooltip title={`Buyer Email: ${order.buyer_email}`}>
                  <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                </Tooltip>
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          {/* Status Change Dropdown - Always Active */}
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

          {order.farm.is_sold && activeTab === 1 && (
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

          <Tooltip title="Delete Transaction">
            <IconButton
              size="small"
              color="error"
              onClick={() => openConfirmationDialog(order.id)}
              disabled={isDeleting}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={order.farm.is_sold ? "Mark as Available" : "Mark as Sold"}
          >
            <Switch
              checked={!order.farm.is_sold}
              onChange={() =>
                handleFarmAvailabilityToggle(order.farm.id, order.farm.is_sold)
              }
              color={order.farm.is_sold ? "error" : "success"}
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
          <Typography>Loading purchased farms...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <SellerAppBar
          handleDrawerToggle={handleDrawerToggle}
          darkMode={darkMode}
          handleThemeToggle={handleThemeToggle}
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

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Farm Purchases Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm sales and track purchase transactions
            </Typography>
          </Box>

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
                            Total Purchases
                          </Typography>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="primary"
                          >
                            {stats.totalPurchases}
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
                            Sold Outs
                          </Typography>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="error.main"
                          >
                            {stats.soldOuts}
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

          <Paper sx={{ borderRadius: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                pb: 0,
                flexWrap: "wrap",
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
                      All
                      <Chip
                        label={stats.totalPurchases}
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
                      Sold-Outs
                      <Chip
                        label={stats.soldOuts}
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: "0.75rem" }}
                      />
                    </Box>
                  }
                />
              </Tabs>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  ml: { xs: 0, sm: 2 },
                  mt: { xs: 2, sm: 0 },
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredOrders.length === 0 ? (
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No purchase transactions found for this view.
                </Typography>
              </Paper>
            ) : viewMode === "table" ? (
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
                      <TableCell>Price(TZS)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Buyer Phone</TableCell>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Buyer Email</TableCell>
                      <TableCell>Update Status</TableCell>
                      <TableCell>Delete</TableCell>
                      <TableCell>Availability</TableCell>
                      {activeTab === 1 && <TableCell>Agreement</TableCell>}
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
                          <Box display="flex" alignItems="center" gap={2}>
                            <Badge
                              badgeContent={order.farm.is_sold ? "SOLD" : ""}
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
                                alt={order.farm.name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  filter: order.farm.is_sold ? "grayscale(50%)" : "none",
                                }}
                              />
                            </Badge>
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  textDecoration: order.farm.is_sold ? "line-through" : "none",
                                  color: order.farm.is_sold ? "text.secondary" : "text.primary",
                                }}
                              >
                                {order.farm.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon
                              sx={{ fontSize: 16, color: "primary.main" }}
                            />
                            <Typography variant="body2">
                              {order.farm.location}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{order.farm.size}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={order.farm.is_sold ? "text.secondary" : "success.main"}
                          >
                            {order.farm.price} 
                          </Typography>
                        </TableCell>
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
                        <TableCell>
                          <Typography variant="body2">
                            {order.contact_info || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {order.transaction_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.buyer_email || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={order.status || "Pending"}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={order.farm.is_sold ? "Mark as Available" : "Mark as Sold"}
                          >
                            <Switch
                              checked={!order.farm.is_sold}
                              onChange={() =>
                                handleFarmAvailabilityToggle(order.farm.id, order.farm.is_sold)
                              }
                              color={order.farm.is_sold ? "error" : "success"}
                              size="small"
                            />
                          </Tooltip>
                        </TableCell>
                        {activeTab === 1 && (
                          <TableCell>
                            <Tooltip title="View Agreement">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewAgreement(order)}
                                size="small"
                              >
                                <AgreementIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3}>
                {filteredOrders.map((order, index) => (
                  <Grid item xs={12} sm={6} md={4} key={order.id}>
                    <FarmCard order={order} index={index} />
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading overlay for deletion */}
      {isDeleting && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              p: 3,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={24} />
            <Typography>Deleting transaction...</Typography>
          </Box>
        </Box>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </ThemeProvider>
  );
}