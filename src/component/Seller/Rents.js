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
  ToggleButton,
  ToggleButtonGroup,
  CardMedia,
  CardActions,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Home as RentsIcon,
  CheckCircle as AcceptedIcon,
  Delete as DeleteIcon,
  HourglassEmpty as PendingIcon,
  MonetizationOn as SoldIcon,
  ViewList as TableViewIcon,
  Description as AgreementIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  PhotoLibrary as GalleryIcon,
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ViewModule,
  BrokenImage as BrokenImageIcon,
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
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "8px",
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

export default function Rents() {
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
    totalRents: 0,
    confirmed: 0,
    pending: 0,
    rented: 0,
  });
  const [imageErrors, setImageErrors] = useState({});
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [currentFarm, setCurrentFarm] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Image gallery states
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navigate = useNavigate();
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  // Helper function to safely get farm images
  const getFarmImages = (farm) => {
    try {
      if (!farm) return [];
      
      // Check for images array first
      if (Array.isArray(farm?.images) && farm.images.length > 0) {
        return farm.images.map(img => {
          // Handle both full URLs and relative paths
          if (img?.image?.startsWith('http')) return img.image;
          return `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}${img.image}`;
        }).filter(Boolean);
      }
      
      // Fallback to single image
      if (farm?.image) {
        if (farm.image.startsWith('http')) return [farm.image];
        return [`${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}${farm.image}`];
      }
      
      return [];
    } catch (error) {
      console.error("Error processing farm images:", error);
      return [];
    }
  };

  // Handle image loading errors
  const handleImageError = (orderId, imageIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [`${orderId}-${imageIndex}`]: true
    }));
  };

  // Image gallery handlers
  const handleOpenImageGallery = (images, startIndex = 0) => {
    if (!images || images.length === 0) return;
    setSelectedImages(images);
    setCurrentImageIndex(startIndex);
    setImageGalleryOpen(true);
  };

  const handleCloseImageGallery = () => {
    setImageGalleryOpen(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev =>
      prev === selectedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? selectedImages.length - 1 : prev - 1
    );
  };

  // Memoized function to filter orders based on active tab and search query
  const filterOrdersByTab = useCallback(
    (ordersData, tabIndex) => {
      let filtered = [];
      if (tabIndex === 0) {
        filtered = ordersData.filter((order) => order.farm.is_rented === true);
      } else if (tabIndex === 1) {
        filtered = ordersData.filter(
          (order) =>
            order.farm.is_rented === true && order.status === "Confirmed"
        );
      }

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
        `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/api/rent-transactions/`,
        { headers }
      );
      setOrders(data);

      const totalRents = data.filter(
        (order) => order.farm.is_rented === true
      ).length;
      const confirmed = data.filter(
        (o) => o.status === "Confirmed" && o.farm.is_rented === true
      ).length;
      const pending = data.filter(
        (o) => o.status === "Pending" && o.farm.is_rented === true
      ).length;
      const rented = data.filter(
        (o) => o.farm.is_rented === true && o.status === "Confirmed"
      ).length;

      setStats({
        totalRents,
        confirmed,
        pending,
        rented,
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

  // Handler to update transaction status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/api/rent-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error.response || error);
    }
  };

  // Handler for opening availability dialog
  const handleOpenAvailabilityDialog = (farmId, isRented) => {
    setCurrentFarm({ id: farmId, isRented });
    setOpenAvailabilityDialog(true);
  };

  // Handler for closing availability dialog
  const handleCloseAvailabilityDialog = () => {
    setOpenAvailabilityDialog(false);
    setCurrentFarm(null);
  };

  // Handler for farm availability toggle with deletion
  const handleFarmAvailabilityToggle = async () => {
    if (!currentFarm) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("access");

      if (currentFarm.isRented) {
        // If marking as available (is_rented=false), also delete the transaction
        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/api/farmsrent/${currentFarm.id}/`,
          { is_rented: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Find and delete the corresponding transaction
        const transactionToDelete = orders.find(
          (order) => order.farm.id === currentFarm.id
        );
        if (transactionToDelete) {
          await axios.delete(
            `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/api/rent-transactions/${transactionToDelete.id}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // If marking as rented (is_rented=true), just update the farm status
        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/api/farmsrent/${currentFarm.id}/`,
          { is_rented: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchOrders(); // Refresh the data
    } catch (error) {
      console.error(
        "Failed to update farm availability:",
        error.response || error
      );
    } finally {
      setIsProcessing(false);
      handleCloseAvailabilityDialog();
    }
  };

  // Handler for confirming and performing deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const token = localStorage.getItem("access");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/api/rent-transactions/${deleteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete transaction:", error.response || error);
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
  const FarmCard = ({ order, index }) => {
    const farmImages = getFarmImages(order.farm);
    const hasMultipleImages = farmImages.length > 1;
    const mainImageErrorKey = `${order.id}-0`;

    return (
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
          <Box sx={{ position: "relative", height: 140 }}>
            {imageErrors[mainImageErrorKey] || farmImages.length === 0 ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a',
                  color: theme.palette.text.secondary,
                }}
              >
                <BrokenImageIcon sx={{ fontSize: 48 }} />
                <Typography variant="caption">Image not available</Typography>
              </Box>
            ) : (
              <CardMedia
                component="img"
                height="140"
                image={farmImages[0]}
                alt={order.farm.farm_number}
                onError={() => handleImageError(order.id, 0)}
                sx={{
                  filter: order.farm.is_rented ? "grayscale(50%)" : "none",
                  cursor: farmImages.length > 0 ? "pointer" : "default",
                  objectFit: "cover",
                  width: "100%",
                }}
                onClick={() => handleOpenImageGallery(farmImages, 0)}
              />
            )}

            {hasMultipleImages && !imageErrors[mainImageErrorKey] && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenImageGallery(farmImages, 0);
                }}
              >
                <GalleryIcon sx={{ fontSize: 14 }} />
                {farmImages.length}
              </Box>
            )}

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
              {order.farm.farm_number}
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
                  color: order.farm.is_rented ? "text.secondary" : "success.main",
                  fontSize: "0.9rem",
                }}
              >
                {order.farm.price} TZS
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Duration:</strong> {order.farm.rent_duration || "N/A"}
              </Typography>
            </Box>

            {(order.renter_phone || order.renter_email) && (
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                {order.renter_phone && (
                  <Tooltip title={`Renter Phone: ${order.renter_phone}`}>
                    <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  </Tooltip>
                )}
                {order.renter_email && (
                  <Tooltip title={`Renter Email: ${order.renter_email}`}>
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
              title={order.farm.is_rented ? "Mark as Available" : "Mark as Rented"}
            >
              <Switch
                checked={!order.farm.is_rented}
                onChange={() =>
                  handleOpenAvailabilityDialog(
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
              Farm Rentals Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm rentals and track rental transactions
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
                <ToggleButton value="card" aria-label="card view">
                  <Tooltip title="Card View">
                    <ViewModule />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ p: 2 }}>
              {filteredOrders.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  <RentsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No rentals found
                  </Typography>
                  <Typography variant="body2">
                    {activeTab === 0
                      ? "You haven't made any farm rentals yet."
                      : "No rented farms found."}
                  </Typography>
                </Box>
              ) : viewMode === "table" ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Farm</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Size(Acres)</TableCell>
                        <TableCell>Rental time</TableCell>
                        <TableCell>Price(TZS)</TableCell>
                        <TableCell>TransactionID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders.map((order, index) => {
                        const farmImages = getFarmImages(order.farm);
                        const avatarErrorKey = `${order.id}-avatar`;
                        
                        return (
                          <TableRow
                            key={order.id}
                            sx={{
                              opacity: order.farm.is_rented ? 0.7 : 1,
                              backgroundColor: order.farm.is_rented
                                ? "rgba(244, 67, 54, 0.05)"
                                : "inherit",
                              "&:hover": {
                                backgroundColor: order.farm.is_rented
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                {imageErrors[avatarErrorKey] || farmImages.length === 0 ? (
                                  <Avatar sx={{ width: 40, height: 40 }}>
                                    <BrokenImageIcon />
                                  </Avatar>
                                ) : (
                                  <Avatar
                                    src={farmImages[0]}
                                    alt={order.farm.farm_number}
                                    onError={() => handleImageError(order.id, 'avatar')}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      cursor: farmImages.length > 0 ? "pointer" : "default",
                                      filter: order.farm.is_rented ? "grayscale(50%)" : "none",
                                    }}
                                    onClick={() => handleOpenImageGallery(farmImages, 0)}
                                  />
                                )}
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{
                                      color: order.farm.is_rented ? "text.secondary" : "text.primary",
                                    }}
                                  >
                                    {order.farm.farm_number}
                                  </Typography>
                                  {order.farm.is_rented && (
                                    <Chip
                                      label="RENTED"
                                      size="small"
                                      color="error"
                                      sx={{ fontSize: "0.6rem", height: 16 }}
                                    />
                                  )}
                                  {farmImages.length > 1 && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mt: 0.5,
                                        cursor: "pointer",
                                        color: "primary.main",
                                        fontSize: "0.7rem",
                                      }}
                                      onClick={() =>
                                        handleOpenImageGallery(farmImages, 0)
                                      }
                                    >
                                      <GalleryIcon sx={{ fontSize: 12 }} />
                                      {farmImages.length} photos
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LocationOnIcon
                                  sx={{ fontSize: 16, color: "primary.main" }}
                                />
                                <Typography variant="body2">
                                  {order.farm.location}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {order.farm.size}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {order.farm.rent_duration || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  order.farm.is_rented
                                    ? "text.secondary"
                                    : "success.main"
                                }
                              >
                                {order.farm.price} 
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  order.farm.is_rented
                                    ? "text.secondary"
                                    : "success.main"
                                }
                              >
                                {order.transaction_id || "N/A"} 
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
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {order.renter_phone && (
                                  <Tooltip
                                    title={`Phone: ${order.renter_phone}`}
                                  >
                                    <PhoneIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "text.secondary",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {order.renter_email && (
                                  <Tooltip
                                    title={`Email: ${order.renter_email}`}
                                  >
                                    <EmailIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "text.secondary",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <Select
                                    value={order.status || "Pending"}
                                    onChange={(e) =>
                                      handleStatusChange(order.id, e.target.value)
                                    }
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

                                {order.farm.is_rented && activeTab === 1 && (
                                  <Tooltip title="View Agreement">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleViewAgreement(order)}
                                    >
                                      <AgreementIcon />
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
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>

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
                                      handleOpenAvailabilityDialog(
                                        order.farm.id,
                                        order.farm.is_rented
                                      )
                                    }
                                    color={order.farm.is_rented ? "error" : "success"}
                                    size="small"
                                  />
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Grid container spacing={3}>
                  {filteredOrders.map((order, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                      <FarmCard order={order} index={index} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
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

          {/* Availability Confirmation Dialog */}
          <Dialog
            open={openAvailabilityDialog}
            onClose={handleCloseAvailabilityDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {currentFarm?.isRented
                ? "Mark Farm as Available"
                : "Mark Farm as Rented"}
            </DialogTitle>
            <DialogContent>
              <Typography>
                {currentFarm?.isRented
                  ? "Are you sure you want to mark this farm as available to the market and remove it from rentals? This action cannot be undone."
                  : "Are you sure you want to mark this farm as rented? This will remove it from the available listings."}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseAvailabilityDialog}
                color="primary"
                variant="outlined"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFarmAvailabilityToggle}
                color={currentFarm?.isRented ? "success" : "error"}
                variant="contained"
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={16} /> : null}
              >
                {isProcessing
                  ? "Processing..."
                  : currentFarm?.isRented
                  ? "Mark Available"
                  : "Mark Rented"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Image Gallery Dialog */}
          <Dialog
            open={imageGalleryOpen}
            onClose={handleCloseImageGallery}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiDialog-paper": {
                bgcolor: "background.paper",
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  Farm Images ({currentImageIndex + 1} of{" "}
                  {selectedImages.length})
                </Typography>
                <IconButton onClick={handleCloseImageGallery}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedImages.length > 0 ? (
                <>
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 400,
                    }}
                  >
                    <img
                      src={selectedImages[currentImageIndex]}
                      alt={`Farm ${currentImageIndex + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "70vh",
                        objectFit: "contain",
                        borderRadius: 8,
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/500x300?text=Image+Not+Available";
                      }}
                    />

                    {selectedImages.length > 1 && (
                      <>
                        <IconButton
                          onClick={handlePreviousImage}
                          sx={{
                            position: "absolute",
                            left: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.7)",
                            },
                          }}
                        >
                          <PrevIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleNextImage}
                          sx={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.7)",
                            },
                          }}
                        >
                          <NextIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {selectedImages.length > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mt: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      {selectedImages.map((image, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            overflow: "hidden",
                            cursor: "pointer",
                            border: index === currentImageIndex ? 2 : 1,
                            borderColor:
                              index === currentImageIndex
                                ? "primary.main"
                                : "divider",
                            opacity: index === currentImageIndex ? 1 : 0.7,
                            "&:hover": {
                              opacity: 1,
                            },
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/60x60?text=Image";
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 300,
                    color: "text.secondary",
                  }}
                >
                  <BrokenImageIcon sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6">No images available</Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
}