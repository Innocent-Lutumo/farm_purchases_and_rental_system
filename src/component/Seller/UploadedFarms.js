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
  InputAdornment,
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
} from "@mui/material";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("location");
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

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredFarms(farms);
      return;
    }

    const result = farms.filter((farm) => {
      const searchValue = farm[searchFilter]?.toLowerCase() || "";
      return searchValue.includes(searchQuery.toLowerCase());
    });

    setFilteredFarms(result);
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
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel id="search-filter-label">Search By</InputLabel>
                <Select
                  labelId="search-filter-label"
                  id="search-filter"
                  value={searchFilter}
                  label="Search By"
                  onChange={(e) => setSearchFilter(e.target.value)}
                >
                  <MenuItem value="location">Location</MenuItem>
                  <MenuItem value="farm_type">Farm Type</MenuItem>
                  <MenuItem value="quality">Quality</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                </Select>
              </FormControl>

              <TextField
                sx={{ flexGrow: 1 }}
                variant="outlined"
                size="small"
                placeholder={`Search by ${searchFilter}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                Search
              </Button>
            </Box>

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
                      No farms found
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      You haven't uploaded any farms yet, or your search
                      returned no results.
                    </Typography>
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
            maxWidth="md"
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
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Farm Details
              {selectedFarm && (
                <Chip
                  icon={getValidationStatusInfo(selectedFarm).icon}
                  label={getValidationStatusInfo(selectedFarm).label}
                  color={getValidationStatusInfo(selectedFarm).chipColor}
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </DialogTitle>
            <DialogContent>
              {selectedFarm && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Image Gallery */}
                  {selectedFarm.images?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Images
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          overflowX: "auto",
                          pb: 1,
                        }}
                      >
                        {selectedFarm.images.map((img, index) => (
                          <Box
                            key={index}
                            sx={{
                              minWidth: 150,
                              height: 100,
                              borderRadius: 1,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={`${BASE_URL}${img.image}`}
                              alt={`Farm ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Farm Details */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Location:</strong> {selectedFarm.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Farm Type:</strong> {selectedFarm.farm_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Price:</strong> {selectedFarm.price}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Quality:</strong> {selectedFarm.quality}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Size:</strong> {selectedFarm.size} acres
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Contact:</strong> {selectedFarm.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Description:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedFarm.description || "No description provided."}
                      </Typography>
                    </Grid>

                    {/* Validation Status Details */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor:
                            getValidationStatusInfo(selectedFarm)
                              .backgroundColor,
                          borderRadius: 1,
                          border: `1px solid ${
                            getValidationStatusInfo(selectedFarm).color
                          }`,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mb: 1 }}
                        >
                          Validation Status
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          {getValidationStatusInfo(selectedFarm).icon}
                          <Typography variant="body2">
                            {getValidationStatusInfo(selectedFarm).label}
                          </Typography>
                        </Box>

                        {selectedFarm.is_rejected &&
                          selectedFarm.admin_feedback && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold", color: "#f44336" }}
                              >
                                Rejection Reason:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {selectedFarm.admin_feedback}
                              </Typography>
                            </Box>
                          )}

                        {selectedFarm.is_validated && (
                          <Typography
                            variant="body2"
                            sx={{ color: "#4caf50", mt: 1 }}
                          >
                            This farm has been verified and approved by our
                            admin team.
                          </Typography>
                        )}

                        {!selectedFarm.is_validated &&
                          !selectedFarm.is_rejected && (
                            <Typography
                              variant="body2"
                              sx={{ color: "#ff9800", mt: 1 }}
                            >
                              This farm is currently under review by our admin
                              team.
                            </Typography>
                          )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              {selectedFarm && !selectedFarm.is_rejected && (
                <Button
                  onClick={() => {
                    setOpenViewDialog(false);
                    handleEditClick(selectedFarm);
                  }}
                  variant="outlined"
                  startIcon={<Edit size={20} />}
                >
                  Edit
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UploadedFarms;
