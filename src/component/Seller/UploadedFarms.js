import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Typography,
  Paper,
  Tooltip,
  MenuItem,
  IconButton,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
} from "lucide-react";
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  LocationOn as LocationOnIcon,
  Agriculture as AgricultureIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  SquareFoot as SquareFootIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import SellerDrawer from "./SellerDrawer";
import SellerAppBar from "./SellerAppBar";

// Base URL for your API
const BASE_URL = "http://127.0.0.1:8000";

// Function to get validation status information
const getValidationStatusInfo = (farm) => {
  if (farm.is_validated) {
    return {
      label: "Validated",
      color: "#4caf50",
      chipColor: "success",
      icon: <CheckCircle size={16} />,
      backgroundColor: "#e8f5e9",
    };
  } else if (farm.is_rejected) {
    return {
      label: "Rejected",
      color: "#f44336",
      chipColor: "error",
      icon: <XCircle size={16} />,
      backgroundColor: "#ffebee",
    };
  } else {
    return {
      label: "Pending",
      color: "#ff9800",
      chipColor: "warning",
      icon: <Clock size={16} />,
      backgroundColor: "#fff3e0",
    };
  }
};

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

const UploadedFarms = () => {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [editedFarm, setEditedFarm] = useState({});
  const [imageIndexes, setImageIndexes] = useState({});
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  // Search functionality states
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      console.warn("No token found. Redirecting to login.");
      window.location.href = "/LoginPage";
      return;
    }
    fetchFarms();
  }, []);

  // Search effect - filter farms when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFarms(farms);
    } else {
      const filtered = farms.filter((farm) => {
        const query = searchQuery.toLowerCase();
        return (
          farm.location?.toLowerCase().includes(query) ||
          farm.farm_type?.toLowerCase().includes(query) ||
          farm.quality?.toLowerCase().includes(query) ||
          farm.description?.toLowerCase().includes(query) ||
          farm.price?.toString().toLowerCase().includes(query)
        );
      });
      setFilteredFarms(filtered);
    }
  }, [searchQuery, farms]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Authentication token missing");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(`${BASE_URL}/api/all-farms/`, config);
      const data = Array.isArray(res.data)
        ? res.data.map((farm) => farm.data || farm)
        : [];

      const userEmail = localStorage.getItem("user_email");
      const userFarms = userEmail
        ? data.filter((farm) => farm.email === userEmail)
        : data;

      userFarms.forEach((farm) => {
        farm.uniqueId = `${farm.id}-${farm.farm_type}`;
      });

      setFarms(userFarms);
      setFilteredFarms(userFarms);
      setError(null);
    } catch (error) {
      console.error("Error fetching farms:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setError("Failed to load farms. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Search handlers
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {

    console.log("Search submitted with query:", searchQuery);
  };

  const handleEditClick = (farm) => {
    const farmCopy = JSON.parse(JSON.stringify(farm));
    setEditedFarm(farmCopy);
    setSelectedFarm(farmCopy);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (farm) => {
    setSelectedFarm(farm);
    setOpenDeleteDialog(true);
  };

  const handleViewDetailsClick = (farm) => {
    setSelectedFarm(farm);
    setOpenViewDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedFarm((prev) => ({ ...prev, [name]: value }));
  };

  const getFarmTypeForApi = (farmType) => {
    return farmType.toLowerCase();
  };

  const handleSaveEdit = async () => {
    try {
      if (!editedFarm.id || !editedFarm.farm_type) {
        throw new Error("Missing required farm fields: id or farm_type");
      }

      const newUniqueId = `${editedFarm.id}-${editedFarm.farm_type}`;

      const duplicate = farms.find(
        (farm) =>
          farm.uniqueId === newUniqueId && farm.uniqueId !== editedFarm.uniqueId
      );

      if (duplicate) {
        setError("A farm with the same ID and type already exists.");
        return;
      }

      const token = localStorage.getItem("access");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const farmToUpdate = {
        ...editedFarm,
        uniqueId: newUniqueId,
      };

      const farmTypeForApi = getFarmTypeForApi(farmToUpdate.farm_type);
      await axios.put(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${farmToUpdate.id}/`,
        farmToUpdate,
        config
      );

      const updatedFarms = farms.map((farm) =>
        farm.uniqueId === editedFarm.uniqueId ? farmToUpdate : farm
      );

      setFarms(updatedFarms);
      setFilteredFarms(updatedFarms);
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Failed to update farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setError(
          `Failed to update farm: ${
            error.response?.data?.detail || error.message || "Please try again."
          }`
        );
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedFarm?.id || !selectedFarm?.farm_type) {
        throw new Error("Missing farm ID or type");
      }

      const token = localStorage.getItem("access");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const farmTypeForApi = getFarmTypeForApi(selectedFarm.farm_type);
      await axios.delete(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${selectedFarm.id}/`,
        config
      );

      const updatedFarms = farms.filter(
        (farm) => farm.uniqueId !== selectedFarm.uniqueId
      );
      setFarms(updatedFarms);
      setFilteredFarms(updatedFarms);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setError(
          `Failed to delete farm: ${
            error.response?.data?.detail || error.message || "Please try again."
          }`
        );
      }
    }
  };

  const handlePrevImage = (uniqueId) => {
    setImageIndexes((prev) => {
      const currentIndex = prev[uniqueId] || 0;
      const farm = filteredFarms.find((f) => f.uniqueId === uniqueId);
      const total = farm?.images?.length || 0;
      return {
        ...prev,
        [uniqueId]: (currentIndex - 1 + total) % total,
      };
    });
  };

  const handleNextImage = (uniqueId) => {
    setImageIndexes((prev) => {
      const currentIndex = prev[uniqueId] || 0;
      const farm = filteredFarms.find((f) => f.uniqueId === uniqueId);
      const total = farm?.images?.length || 0;
      return {
        ...prev,
        [uniqueId]: (currentIndex + 1) % total,
      };
    });
  };

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

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

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
        <SellerAppBar
          handleDrawerToggle={handleDrawerToggle}
          darkMode={darkMode}
          handleThemeToggle={handleThemeToggle}
          fetchFarms={fetchFarms}
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
              Uploaded Farms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm listings and track their status
            </Typography>
            {searchQuery && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Showing {filteredFarms.length} result
                {filteredFarms.length !== 1 ? "s" : ""} for "{searchQuery}"
              </Typography>
            )}
          </Box>

          {/* Search and Filter Section */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
            }}
          >
            {/* Status Summary */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Farm Status Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<CheckCircle size={16} />}
                  label={`Validated: ${
                    farms.filter((f) => f.is_validated && !f.is_rejected).length
                  }`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<XCircle size={16} />}
                  label={`Rejected: ${
                    farms.filter((f) => f.is_rejected).length
                  }`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<Clock size={16} />}
                  label={`Pending: ${
                    farms.filter((f) => !f.is_validated && !f.is_rejected)
                      .length
                  }`}
                  color="warning"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>

          {/* Error Message Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 8,
                color: "primary.main",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            /* Farm Listings Grid */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {filteredFarms.length === 0 ? (
                  <Box
                    sx={{
                      width: "100%",
                      mt: 3,
                      textAlign: "center",
                      py: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      {searchQuery
                        ? `No farms found for "${searchQuery}"`
                        : "No farms found"}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {searchQuery
                        ? "Try adjusting your search terms or browse all farms."
                        : "You haven't uploaded any farms yet."}
                    </Typography>
                    {searchQuery && (
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 1, mr: 2 }}
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      component={RouterLink}
                      to="/UploadFarmForm"
                      startIcon={<PlusCircle size={20} />}
                    >
                      Upload New Farm
                    </Button>
                  </Box>
                ) : (
                  filteredFarms.map((farm) => {
                    const statusInfo = getValidationStatusInfo(farm);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={farm.uniqueId}>
                        <motion.div variants={itemVariants}>
                          <StyledCard>
                            {/* Validation Status Banner */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: statusInfo.color,
                                color: "white",
                                py: 0.5,
                                px: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                zIndex: 3,
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                              }}
                            >
                              {statusInfo.icon}
                              {statusInfo.label}
                              {farm.is_rejected && <AlertTriangle size={16} />}
                            </Box>

                            {/* Image Section with Carousel Controls */}
                            <Box
                              sx={{
                                height: 200,
                                width: "100%",
                                overflow: "hidden",
                                position: "relative",
                                mt: 4,
                                ...(farm.is_rejected && {
                                  filter: "grayscale(50%) opacity(0.7)",
                                }),
                              }}
                            >
                              {farm.images?.length > 0 ? (
                                <CardMedia
                                  component="img"
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  image={`${BASE_URL}${
                                    farm.images[
                                      imageIndexes[farm.uniqueId] || 0
                                    ]?.image
                                  }`}
                                  alt={`${farm.location} farm`}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    height: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  No Image Available
                                </Typography>
                              )}

                              {/* Carousel Controls */}
                              {farm.images?.length > 1 && (
                                <>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrevImage(farm.uniqueId);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      left: 8,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      backgroundColor: "rgba(255,255,255,0.7)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(255,255,255,0.9)",
                                      },
                                      zIndex: 1,
                                    }}
                                    size="small"
                                  >
                                    &lt;
                                  </IconButton>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNextImage(farm.uniqueId);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      right: 8,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      backgroundColor: "rgba(255,255,255,0.7)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(255,255,255,0.9)",
                                      },
                                      zIndex: 1,
                                    }}
                                    size="small"
                                  >
                                    &gt;
                                  </IconButton>
                                </>
                              )}
                            </Box>

                            {/* Card Details */}
                            <CardContent sx={{ flex: 1, pb: 1 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                              >
                                <Typography component="span" fontWeight="bold">
                                  Location:
                                </Typography>{" "}
                                {farm.location}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                              >
                                <Typography component="span" fontWeight="bold">
                                  Price:
                                </Typography>{" "}
                                {farm.price}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                <Typography component="span" fontWeight="bold">
                                  Quality:
                                </Typography>{" "}
                                {farm.quality}
                              </Typography>

                              {/* Admin Feedback for Rejected Farms */}
                              {farm.is_rejected && farm.admin_feedback && (
                                <Alert
                                  severity="error"
                                  sx={{ mt: 1, fontSize: "0.75rem" }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Rejection Reason:
                                  </Typography>
                                  <br />
                                  {farm.admin_feedback}
                                </Alert>
                              )}
                            </CardContent>

                            {/* Actions: View, Edit, Delete */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-around",
                                px: 2,
                                py: 1,
                                borderTop: "1px solid",
                                borderColor: "divider",
                                mt: "auto",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="View details">
                                <IconButton
                                  onClick={() => handleViewDetailsClick(farm)}
                                  color="primary"
                                >
                                  <Eye size={20} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit farm">
                                <IconButton
                                  onClick={() => handleEditClick(farm)}
                                  color="primary"
                                  disabled={farm.is_rejected}
                                >
                                  <Edit size={20} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete farm">
                                <IconButton
                                  onClick={() => handleDeleteClick(farm)}
                                  color="error"
                                >
                                  <Trash2 size={20} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </StyledCard>
                        </motion.div>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </motion.div>
          )}

          {/* Edit Dialog */}
          <Dialog
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit Farm Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    name="location"
                    value={editedFarm.location || ""}
                    onChange={handleEditChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    name="price"
                    value={editedFarm.price || ""}
                    onChange={handleEditChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quality"
                    name="quality"
                    value={editedFarm.quality || ""}
                    onChange={handleEditChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Farm Type</InputLabel>
                    <Select
                      name="farm_type"
                      value={editedFarm.farm_type || ""}
                      label="Farm Type"
                      onChange={(e) =>
                        handleEditChange({
                          target: { name: "farm_type", value: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="Sale">Sale</MenuItem>
                      <MenuItem value="Rent">Rent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Size (in acres)"
                    name="size"
                    value={editedFarm.size || ""}
                    onChange={handleEditChange}
                    fullWidth
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Number"
                    name="phone"
                    value={editedFarm.phone || ""}
                    onChange={handleEditChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={editedFarm.description || ""}
                    onChange={handleEditChange}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSaveEdit}
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this farm listing? This action
                cannot be undone.
              </Typography>
              {selectedFarm && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "background.default",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Location:</strong> {selectedFarm.location}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedFarm.farm_type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Price:</strong> {selectedFarm.price}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog
            open={openViewDialog}
            onClose={() => setOpenViewDialog(false)}
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" component="div">
                  {" "}
                  {/* Smaller title variant */}
                  Farm Details
                </Typography>
                <Box>
                  <IconButton
                    onClick={() => {
                      setOpenViewDialog(false);
                      setEditedFarm(selectedFarm);
                      setOpenEditDialog(true);
                    }}
                    color="primary"
                    title="Edit Farm"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setOpenViewDialog(false)}
                    sx={{ color: "grey.500" }}
                    title="Close"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              {" "}
              {/* Add dividers for better visual separation */}
              {selectedFarm && (
                <Stack spacing={3}>
                  {" "}
                  {selectedFarm.images?.length > 0 && (
                    <Card variant="outlined">
                      {" "}
                      {/* Use outlined variant for a lighter look */}
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          {" "}
                          {/* Smaller heading */}
                          <ImageIcon sx={{ mr: 1 }} />
                          Farm Images
                        </Typography>
                        <Grid container spacing={1}>
                          {" "}
                          {/* Reduced spacing for images */}
                          {selectedFarm.images.map((image, index) => (
                            <Grid item xs={4} sm={3} md={2} key={index}>
                              {" "}
                              {/* More images per row */}
                              <Card elevation={0}>
                                {" "}
                                {/* No elevation for images, cleaner */}
                                <CardMedia
                                  component="img"
                                  sx={{
                                    width: "100%",
                                    height: 80,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                  }}
                                  image={`${BASE_URL}${image.image}`}
                                  alt={`Farm image ${index + 1}`}
                                />
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  )}
                  {/* Basic Information Section */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <InfoIcon sx={{ mr: 1 }} />
                        Basic Information
                      </Typography>
                      <Grid container spacing={2}>
                        {" "}
                        {/* Smaller spacing for info grid */}
                        {[
                          {
                            label: "Location",
                            value: selectedFarm.location,
                            icon: <LocationOnIcon />,
                          },
                          {
                            label: "Farm Type",
                            value: selectedFarm.farm_type,
                            icon: <AgricultureIcon />,
                          },
                          {
                            label: "Price",
                            value: selectedFarm.price,
                            icon: <AttachMoneyIcon />,
                            color: "primary.main",
                          },
                          {
                            label: "Quality",
                            value: selectedFarm.quality,
                            icon: <StarIcon />,
                          },
                          {
                            label: "Size",
                            value: `${selectedFarm.size} acres`,
                            icon: <SquareFootIcon />,
                          },
                          {
                            label: "Contact Number",
                            value: selectedFarm.phone,
                            icon: <PhoneIcon />,
                          },
                        ].map((item, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              {item.icon && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mr: 1,
                                  }}
                                >
                                  {item.icon}
                                </Typography>
                              )}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mr: 1 }}
                              >
                                {item.label}:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                color={item.color || "text.primary"}
                              >
                                {item.value}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                  {/* Description Section */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <DescriptionIcon sx={{ mr: 1 }} />
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {" "}
                        {/* Smaller body text and line height */}
                        {selectedFarm.description}
                      </Typography>
                    </CardContent>
                  </Card>
                  {/* Status Section */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <AssignmentIcon sx={{ mr: 1 }} />
                        Status Information
                      </Typography>
                      <Chip
                        icon={getValidationStatusInfo(selectedFarm).icon}
                        label={getValidationStatusInfo(selectedFarm).label}
                        color={getValidationStatusInfo(selectedFarm).chipColor}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />

                      {/* Rejection Feedback Section */}
                      {selectedFarm.is_rejected &&
                        selectedFarm.admin_feedback && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <FeedbackIcon
                                sx={{
                                  fontSize: 16,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                              Rejection Reason:
                            </Typography>
                            <Alert
                              severity="error"
                              sx={{
                                mt: 0.5, 
                                "& .MuiAlert-message": {
                                  fontSize: "0.85rem",
                                },
                              }}
                            >
                              {selectedFarm.admin_feedback}
                            </Alert>
                          </Box>
                        )}
                    </CardContent>
                  </Card>
                </Stack>
              )}
            </DialogContent>

            {/* <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={() => setOpenViewDialog(false)}
                color="inherit"
                startIcon={<CloseIcon />}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setOpenViewDialog(false);
                  setEditedFarm(selectedFarm);
                  setOpenEditDialog(true);
                }}
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
              >
                Edit Farm
              </Button>
            </DialogActions> */}
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UploadedFarms;
