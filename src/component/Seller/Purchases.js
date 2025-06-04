import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for All Purchases, 1 for Sold Outs
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
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

  const filterOrdersByTab = useCallback(
    (ordersData, tabIndex) => {
      let filtered = [];
      if (tabIndex === 0) {
        // All Purchases
        filtered = ordersData;
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

  const fetchOrders = useCallback(async () => {
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
        `http://127.0.0.1:8000/api/sale-transactions/${id}/`,
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
        `http://127.0.0.1:8000/api/sale-transactions/${deleteId}/`,
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
    console.log("View agreement for:", order.transaction_id);
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
              {order.farm.price} Tshs
            </Typography>
          </Box>

          {(order.contact_info || order.buyer_email) && (
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              {order.contact_info && (
                <Tooltip title={order.contact_info}>
                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                </Tooltip>
              )}
              {order.buyer_email && (
                <Tooltip title={order.buyer_email}>
                  <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                </Tooltip>
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
            <Select
              value={order.status || "Pending"}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              disabled={order.farm.is_sold}
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
            {viewMode === "table" ? (
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
                                variant="rounded"
                                sx={{
                                  width: 80,
                                  height: 80,
                                  opacity: order.farm.is_sold ? 0.7 : 1,
                                }}
                              />
                            </Badge>
                            <Box>
                              <Typography
                                sx={{
                                  textDecoration: order.farm.is_sold
                                    ? "line-through"
                                    : "none",
                                  color: order.farm.is_sold
                                    ? "text.secondary"
                                    : "text.primary",
                                }}
                              >
                                {order.farm.name}
                              </Typography>
                              {order.farm.is_sold && (
                                <Chip
                                  label="Sold Out"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{
                                    mt: 0.5,
                                    fontSize: "0.7rem",
                                    height: 18,
                                  }}
                                />
                              )}
                            </Box>
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
                        <TableCell>
                          <Typography
                            color={
                              order.farm.is_sold
                                ? "text.secondary"
                                : "success.main"
                            }
                            fontWeight="bold"
                          >
                            {order.farm.price} Tshs
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
                          {order.contact_info ? (
                            <Tooltip title="Call">
                              <IconButton
                                color="primary"
                                href={`tel:${order.contact_info}`}
                                size="small"
                              >
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{order.transaction_id}</TableCell>
                        <TableCell>
                          {order.buyer_email ? (
                            <Tooltip title={order.buyer_email}>
                              <IconButton
                                color="primary"
                                href={`mailto:${order.buyer_email}`}
                                size="small"
                              >
                                <EmailIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={order.status || "Pending"}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              disabled={order.farm.is_sold}
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
                              <MenuItem
                                value="Confirmed"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                Confirmed
                              </MenuItem>
                              <MenuItem
                                value="Pending"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                Pending
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Delete Transaction">
                            <IconButton
                              color="error"
                              onClick={() => openConfirmationDialog(order.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              order.farm.is_sold
                                ? "Mark as Available"
                                : "Mark as Sold"
                            }
                          >
                            <Switch
                              checked={!order.farm.is_sold}
                              onChange={() =>
                                handleFarmAvailabilityToggle(
                                  order.farm.id,
                                  order.farm.is_sold
                                )
                              }
                              color={order.farm.is_sold ? "error" : "success"}
                            />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} align="center">
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ py: 3 }}
                          >
                            No orders found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3}>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
                      <FarmCard order={order} index={index} />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: "center",
                        borderRadius: 3,
                        boxShadow: 3,
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        No orders found.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </motion.div>
        </Box>

        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              color="primary"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" disabled={isDeleting}>
              {isDeleting ? <CircularProgress size={24} /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
