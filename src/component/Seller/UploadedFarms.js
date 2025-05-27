import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
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
  Snackbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import { MapPin, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link as RouterLink } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";

// Base URL for your API
const BASE_URL = "http://127.0.0.1:8000";

// ---
// ## Header Component
// Manages the navigation bar with dashboard title and user menu.
// ---
const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#28a745", // Green theme color
        padding: { xs: "8px 16px", sm: "12px 24px", md: "16px 32px" },
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Title Section */}
        <Box sx={{ mb: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Farm Seller Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Manage listings, track sales, and grow your network.
          </Typography>
        </Box>

        {/* Right Section: Home + Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleMenuOpen} color="inherit">
            <AccountCircleIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "account-menu-button",
            }}
          >
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleMenuClose}
              sx={{ color: "black" }}
            >
              My Profile
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/SellerPage"
              onClick={handleMenuClose}
              sx={{ color: "red" }}
            >
              Back
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// ---
// ## Helper function to get validation status info
// ---
const getValidationStatusInfo = (farm) => {
  if (farm.is_rejected) {
    return {
      status: 'rejected',
      color: '#f44336',
      backgroundColor: '#ffebee',
      icon: <XCircle size={16} />,
      label: 'REJECTED',
      chipColor: 'error'
    };
  } else if (farm.is_validated) {
    return {
      status: 'validated',
      color: '#4caf50',
      backgroundColor: '#e8f5e8',
      icon: <CheckCircle size={16} />,
      label: 'VALIDATED',
      chipColor: 'success'
    };
  } else {
    return {
      status: 'pending',
      color: '#ff9800',
      backgroundColor: '#fff3e0',
      icon: <Clock size={16} />,
      label: 'PENDING REVIEW',
      chipColor: 'warning'
    };
  }
};

// ---
// ## UploadedFarms Component
// Displays a grid of uploaded farm listings, with search, edit, delete, and view functionalities.
// ---
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [debug, setDebug] = useState({
    lastAction: null,
    actionId: null,
    farmType: null,
    success: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      console.warn("No token found. Redirecting to login.");
      window.location.href = "/LoginPage";
      return;
    }
    fetchFarms();
  }, []);

  // Fetches farm data from the API
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

      console.log("Fetching farms from API...");
      const res = await axios.get(`${BASE_URL}/api/all-farms/`, config);
      console.log("API Response:", res.data);

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

      console.log("Filtered farms by user email:", userFarms);
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
        setSnackbar({
          open: true,
          message: "Failed to load farms. Please try again later.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handles search functionality based on selected filter
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

  // Opens the edit dialog and sets the farm to be edited
  const handleEditClick = (farm) => {
    console.log("Edit clicked for farm:", farm);
    const farmCopy = JSON.parse(JSON.stringify(farm));
    setDebug({
      lastAction: "edit_clicked",
      actionId: farm.id,
      farmType: farm.farm_type,
      success: true,
    });
    setEditedFarm(farmCopy);
    setSelectedFarm(farmCopy);
    setOpenEditDialog(true);
  };

  // Opens the delete confirmation dialog
  const handleDeleteClick = (farm) => {
    console.log("Delete clicked for farm:", farm);
    setSelectedFarm(farm);
    setOpenDeleteDialog(true);
  };

  // Opens the view details dialog
  const handleViewDetailsClick = (farm) => {
    setSelectedFarm(farm);
    setOpenViewDialog(true);
  };

  // Handles changes in the edit form fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    console.log(`Editing field ${name} to value: ${value}`);
    setEditedFarm((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to get the correct API path for farm type (lowercase)
  const getFarmTypeForApi = (farmType) => {
    return farmType.toLowerCase();
  };

  // Saves the edited farm data to the API
  const handleSaveEdit = async () => {
    try {
      console.log("Attempting to save edited farm:", editedFarm);

      if (!editedFarm.id || !editedFarm.farm_type) {
        throw new Error("Missing required farm fields: id or farm_type");
      }

      const newUniqueId = `${editedFarm.id}-${editedFarm.farm_type}`;

      const duplicate = farms.find(
        (farm) =>
          farm.uniqueId === newUniqueId && farm.uniqueId !== editedFarm.uniqueId
      );

      if (duplicate) {
        setSnackbar({
          open: true,
          message: "A farm with the same ID and type already exists.",
          severity: "error",
        });
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

      const existingFarmIndex = farms.findIndex(
        (farm) => farm.uniqueId === editedFarm.uniqueId
      );

      if (existingFarmIndex === -1) {
        throw new Error("Farm not found in local data with matching uniqueId");
      }

      const farmTypeForApi = getFarmTypeForApi(farmToUpdate.farm_type);
      const response = await axios.put(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${farmToUpdate.id}/`,
        farmToUpdate,
        config
      );
      console.log("API response after update:", response.data);

      const updatedFarms = [...farms];
      updatedFarms[existingFarmIndex] = {
        ...farms[existingFarmIndex],
        ...farmToUpdate,
      };
      setFarms(updatedFarms);

      setFilteredFarms((prevFiltered) => {
        const filteredIndex = prevFiltered.findIndex(
          (farm) => farm.uniqueId === editedFarm.uniqueId
        );

        if (filteredIndex >= 0) {
          const newFiltered = [...prevFiltered];
          newFiltered[filteredIndex] = {
            ...prevFiltered[filteredIndex],
            ...farmToUpdate,
          };
          return newFiltered;
        }
        return prevFiltered;
      });

      setDebug({
        lastAction: "save_edit",
        actionId: farmToUpdate.id,
        farmType: farmToUpdate.farm_type,
        success: true,
      });

      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: "Farm updated successfully!",
        severity: "success",
      });

      setTimeout(() => {
        fetchFarms();
      }, 1000);
    } catch (error) {
      console.error("Failed to update farm:", error);

      setDebug({
        lastAction: "save_edit_failed",
        actionId: editedFarm.id,
        farmType: editedFarm.farm_type,
        success: false,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setSnackbar({
          open: true,
          message: `Failed to update farm: ${
            error.response?.data?.detail || error.message || "Please try again."
          }`,
          severity: "error",
        });
      }
    }
  };

  // Confirms and executes farm deletion
  const handleConfirmDelete = async () => {
    try {
      console.log("Attempting to delete farm:", selectedFarm);

      if (!selectedFarm?.id || !selectedFarm?.farm_type) {
        console.error("Missing farm ID or type for deletion");
        throw new Error("Missing farm ID or type");
      }

      const token = localStorage.getItem("access");
      if (!token) {
        console.error("Authentication token missing");
        throw new Error("Authentication token missing");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const farmTypeForApi = getFarmTypeForApi(selectedFarm.farm_type);
      const deleteUrl = `${BASE_URL}/api/all-farms/${farmTypeForApi}/${selectedFarm.id}/`;
      console.log("Delete endpoint:", deleteUrl);

      const updatedFarms = farms.filter(
        (farm) => farm.uniqueId !== selectedFarm.uniqueId
      );
      setFarms(updatedFarms);
      setFilteredFarms((prevFiltered) =>
        prevFiltered.filter((farm) => farm.uniqueId !== selectedFarm.uniqueId)
      );

      const response = await axios.delete(deleteUrl, config);
      console.log("Delete response:", response);

      setDebug({
        lastAction: "delete",
        actionId: selectedFarm.id,
        farmType: selectedFarm.farm_type,
        success: true,
      });
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: "Farm deleted successfully!",
        severity: "success",
      });

      setTimeout(() => {
        fetchFarms();
      }, 1000);
    } catch (error) {
      console.error("Failed to delete farm:", error);
      setDebug({
        lastAction: "delete_failed",
        actionId: selectedFarm?.id,
        farmType: selectedFarm?.farm_type,
        success: false,
      });

      fetchFarms();

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setSnackbar({
          open: true,
          message: `Failed to delete farm: ${
            error.response?.data?.detail || error.message || "Please try again."
          }`,
          severity: "error",
        });
      }
    }
  };

  // Moves to the previous image in the carousel for a given farm
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

  // Moves to the next image in the carousel for a given farm
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

  // Closes the snackbar notification
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Debug Info (visible during development) */}
        {debug.lastAction && (
          <Alert severity={debug.success ? "info" : "warning"} sx={{ mb: 2 }}>
            **Last action:** {debug.lastAction} | **ID:** {debug.actionId} |{" "}
            **Type:** {debug.farmType} | **Success:**{" "}
            {debug.success ? "Yes" : "No"}
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="search-filter-label" size="small">
              Search By
            </InputLabel>
            <Select
              labelId="search-filter-label"
              id="search-filter"
              value={searchFilter}
              label="Search By"
              onChange={(e) => setSearchFilter(e.target.value)}
              size="small"
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
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleSearch}
            sx={{ minWidth: { xs: "100%", sm: "auto" } }}
          >
            Search
          </Button>
        </Box>

        {/* Status Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Farm Status Summary
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<CheckCircle size={16} />}
              label={`Validated: ${farms.filter(f => f.is_validated && !f.is_rejected).length}`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<XCircle size={16} />}
              label={`Rejected: ${farms.filter(f => f.is_rejected).length}`}
              color="error"
              variant="outlined"
            />
            <Chip
              icon={<Clock size={16} />}
              label={`Pending: ${farms.filter(f => !f.is_validated && !f.is_rejected).length}`}
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>

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
              color: "green",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          /* Farm Listings Grid */
          <Grid container spacing={4}>
            {filteredFarms.length === 0 ? (
              <Box sx={{ width: "100%", mt: 3, textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No farms found.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  You haven't uploaded any farms yet, or your search returned no
                  results.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  component={RouterLink}
                  to="/uploadFarmForm"
                >
                  Upload New Farm
                </Button>
              </Box>
            ) : (
              filteredFarms.map((farm) => {
                const statusInfo = getValidationStatusInfo(farm);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={farm.uniqueId}>
                    <Card
                      sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        borderRadius: 3,
                        boxShadow: 4,
                        overflow: "hidden",
                        transition:
                          "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                        "&:hover": {
                          boxShadow: 8,
                          transform: "translateY(-5px)",
                        },
                        // Add special styling for rejected farms
                        ...(farm.is_rejected && {
                          border: '3px solid #f44336',
                          backgroundColor: '#fafafa',
                        }),
                      }}
                    >
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
                        }}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                        {farm.is_rejected && <AlertTriangle size={16} />}
                      </Box>

                      {/* Pinned Farm Type Label */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 40, // Moved down to accommodate status banner
                          left: 16,
                          transform: "rotate(-10deg)",
                          backgroundColor:
                            farm.farm_type === "Sale" ? "#28a745" : "#ff9800",
                          color: "white",
                          px: 2,
                          py: 0.5,
                          borderRadius: "4px",
                          boxShadow: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          zIndex: 2,
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MapPin
                            size={14}
                            color={
                              farm.farm_type === "Sale" ? "#28a745" : "#ff9800"
                            }
                          />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                          {farm.farm_type}
                        </Typography>
                      </Box>

                      {/* Rejected Farm Overlay */}
                      {farm.is_rejected && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%) rotate(-20deg)",
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                            border: "3px solid #f44336",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            zIndex: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <XCircle size={24} color="#f44336" />
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#f44336",
                              fontWeight: "bold",
                              textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                            }}
                          >
                            REJECTED
                          </Typography>
                        </Box>
                      )}

                      {/* Image Section with Carousel Controls */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 200,
                          width: "100%",
                          overflow: "hidden",
                          position: "relative",
                          mt: 4, // Add margin top to accommodate status banner
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
                              farm.images[imageIndexes[farm.uniqueId] || 0]?.image
                            }`}
                            alt={`${farm.location} farm`}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
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
                                  backgroundColor: "rgba(255,255,255,0.9)",
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
                                  backgroundColor: "rgba(255,255,255,0.9)",
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <Typography component="span" fontWeight="bold">
                            Quality:
                          </Typography>{" "}
                          {farm.quality}
                        </Typography>
                        
                        {/* Admin Feedback for Rejected Farms */}
                        {farm.is_rejected && farm.admin_feedback && (
                          <Alert severity="error" sx={{ mt: 1, fontSize: "0.75rem" }}>
                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
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
                          borderTop: "1px solid #eee",
                          mt: "auto",
                          gap: 1,
                        }}
                      >
                        <Button
                          startIcon={<VisibilityIcon />}
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDetailsClick(farm)}
                          sx={{ flexGrow: 1 }}
                        >
                          View</Button>
                        <Button
                          startIcon={<EditIcon />}
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditClick(farm)}
                          sx={{ flexGrow: 1 }}
                          disabled={farm.is_rejected} // Disable editing for rejected farms
                        >
                          Edit
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(farm)}
                          sx={{ flexGrow: 1 }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
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
              {/* First Row */}
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

              {/* Second Row */}
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

              {/* Third Row */}
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
                  name="contact_number"
                  value={editedFarm.contact_number || ""}
                  onChange={handleEditChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Fourth Row - Full Width Description */}
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
              color="success"
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
              <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
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
                      <strong>Contact:</strong> {selectedFarm.contact_number}
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
                        backgroundColor: getValidationStatusInfo(selectedFarm).backgroundColor,
                        borderRadius: 1,
                        border: `1px solid ${getValidationStatusInfo(selectedFarm).color}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Validation Status
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        {getValidationStatusInfo(selectedFarm).icon}
                        <Typography variant="body2">
                          {getValidationStatusInfo(selectedFarm).label}
                        </Typography>
                      </Box>
                      
                      {selectedFarm.is_rejected && selectedFarm.admin_feedback && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#f44336" }}>
                            Rejection Reason:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {selectedFarm.admin_feedback}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedFarm.is_validated && (
                        <Typography variant="body2" sx={{ color: "#4caf50", mt: 1 }}>
                          This farm has been verified and approved by our admin team.
                        </Typography>
                      )}
                      
                      {!selectedFarm.is_validated && !selectedFarm.is_rejected && (
                        <Typography variant="body2" sx={{ color: "#ff9800", mt: 1 }}>
                          This farm is currently under review by our admin team.
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
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default UploadedFarms;