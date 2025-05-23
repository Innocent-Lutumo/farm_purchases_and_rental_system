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
  Link, // Imported Material-UI Link for external URLs
} from "@mui/material";
import { MapPin } from "lucide-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link as RouterLink } from "react-router-dom"; // Alias for react-router-dom Link
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
        padding: { xs: "8px 16px", sm: "12px 24px", md: "16px 32px" }, // Responsive padding
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap", // Allow wrapping on small screens
        }}
      >
        {/* Title Section */}
        <Box sx={{ mb: { xs: 1, sm: 0 } }}> {/* Margin for small screens */}
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" }, // Responsive font size
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Farm Seller Dashboard
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontSize: { xs: "0.8rem", sm: "0.9rem" }, // Responsive font size
            }}
          >
            Manage listings, track sales, and grow your network.
          </Typography>
        </Box>

        {/* Right Section: Home + Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleMenuOpen} color="inherit">
            <AccountCircleIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} /> {/* Responsive icon size */}
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
  const [selectedFarm, setSelectedFarm] = useState(null); // Used for both delete and view
  const [editedFarm, setEditedFarm] = useState({}); // Used for edit dialog
  const [imageIndexes, setImageIndexes] = useState({}); // To manage carousel index for each farm
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
      // Redirect to login page if no token is found
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
        ? res.data.map((farm) => farm.data || farm) // Handle nested 'data' if present
        : [];

      const userEmail = localStorage.getItem("user_email");
      // Filter farms to show only those uploaded by the current user
      const userFarms = userEmail
        ? data.filter((farm) => farm.email === userEmail)
        : data;

      // Add a unique identifier for each farm for consistent keying and image carousel
      userFarms.forEach((farm) => {
        farm.uniqueId = `${farm.id}-${farm.farm_type}`;
      });

      console.log("Filtered farms by user email:", userFarms);
      setFarms(userFarms);
      setFilteredFarms(userFarms);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching farms:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access"); // Clear invalid token
        window.location.href = "/login"; // Redirect to login
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
      setFilteredFarms(farms); // If search query is empty, show all farms
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
    const farmCopy = JSON.parse(JSON.stringify(farm)); // Deep copy to prevent direct state mutation
    setDebug({
      lastAction: "edit_clicked",
      actionId: farm.id,
      farmType: farm.farm_type,
      success: true,
    });
    setEditedFarm(farmCopy);
    setSelectedFarm(farmCopy); // Also set selectedFarm for general dialog context
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

      // Re-calculate uniqueId in case farm_type or id was somehow changed (though they are read-only)
      const newUniqueId = `${editedFarm.id}-${editedFarm.farm_type}`;

      // Prevent editing to a duplicate uniqueId (shouldn't happen if id/type are read-only)
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
        uniqueId: newUniqueId, // Ensure the uniqueId is updated in the object sent
      };

      // Find the index of the farm in the current state using its original uniqueId
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

      // Update the local state with the new data
      const updatedFarms = [...farms];
      updatedFarms[existingFarmIndex] = {
        ...farms[existingFarmIndex], // Keep original properties not sent in update if any
        ...farmToUpdate, // Apply updated fields
      };
      setFarms(updatedFarms);

      // Update filtered farms as well
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

      // Optional: refetch to ensure data consistency with backend after a short delay
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

      // Optimistically remove from UI
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

      // Fetch farms again after a short delay to ensure UI reflects actual backend state
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

      // If delete fails, revert the UI change by re-fetching
      fetchFarms();

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/login";
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
        [uniqueId]: (currentIndex - 1 + total) % total, // Loop back to end
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
        [uniqueId]: (currentIndex + 1) % total, // Loop back to start
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
            alignItems: "flex-end", // Align items at the bottom
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
            sx={{ flexGrow: 1 }} // Allows the text field to expand
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
            sx={{ minWidth: { xs: "100%", sm: "auto" } }} // Full width on small screens
          >
            Search
          </Button>
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
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You haven't uploaded any farms yet, or your search returned no results.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  component={RouterLink} // Use RouterLink for navigation
                  to="/uploadFarmForm"
                >
                  Upload New Farm
                </Button>
              </Box>
            ) : (
              filteredFarms.map((farm) => (
                <Grid item xs={12} sm={6} md={4} key={farm.uniqueId}>
                  <Card
                    sx={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      borderRadius: 3, // Slightly more rounded corners
                      boxShadow: 4, // Soft shadow
                      overflow: "hidden",
                      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                      "&:hover": {
                        boxShadow: 8, // More pronounced shadow on hover
                        transform: "translateY(-5px)", // Subtle lift effect
                      },
                    }}
                  >
                    {/* Pinned Farm Type Label */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        transform: "rotate(-10deg)", // Angled label
                        backgroundColor:
                          farm.farm_type === "Sale" ? "#28a745" : "#ff9800", // Green for Sale, Orange for Rent
                        color: "white",
                        px: 2,
                        py: 0.5,
                        borderRadius: "4px",
                        boxShadow: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        zIndex: 2, // Ensure it's above the image
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
                          color={farm.farm_type === "Sale" ? "#28a745" : "#ff9800"}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        {farm.farm_type}
                      </Typography>
                    </Box>

                    {/* Image Section with Carousel Controls */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 200, // Fixed height for consistent card size
                        width: "100%",
                        overflow: "hidden",
                        position: "relative", // For absolute positioning of controls
                      }}
                    >
                      {farm.images?.length > 0 ? (
                        <CardMedia
                          component="img"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // Ensures image covers the area without distortion
                            // borderRadius: 1, // Apply if you want rounded image corners inside the card
                          }}
                          image={`${BASE_URL}${
                            farm.images[imageIndexes[farm.uniqueId] || 0]?.image
                          }`}
                          alt={`Image of ${farm.location} farm`}
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
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(farm.uniqueId); }}
                            sx={{
                              position: "absolute",
                              left: 8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              backgroundColor: "rgba(255,255,255,0.7)",
                              "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                              zIndex: 1,
                            }}
                            size="small"
                          >
                            &lt;
                          </IconButton>
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleNextImage(farm.uniqueId); }}
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              backgroundColor: "rgba(255,255,255,0.7)",
                              "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                              zIndex: 1,
                            }}
                            size="small"
                          >
                            &gt;
                          </IconButton>
                        </>
                      )}
                    </Box>

                    {/* Minimal Card Details */}
                    <CardContent sx={{ flex: 1, pb: 1 }}> {/* Reduced bottom padding */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <Typography component="span" fontWeight="bold">Location:</Typography> {farm.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <Typography component="span" fontWeight="bold">Price:</Typography> {farm.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight="bold">Quality:</Typography> {farm.quality}
                      </Typography>
                    </CardContent>

                    {/* Actions: View, Edit, Delete */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around", // Distributes space evenly
                        px: 2,
                        py: 1,
                        borderTop: "1px solid #eee",
                        mt: "auto", // Pushes actions to the bottom of the card
                        gap: 1, // Space between buttons
                      }}
                    >
                      <Button
                        startIcon={<VisibilityIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetailsClick(farm)}
                        sx={{ flexGrow: 1 }} // Allows buttons to grow
                      >
                        View
                      </Button>
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditClick(farm)}
                        sx={{ flexGrow: 1 }}
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
              ))
            )}
          </Grid>
        )}

        {/* ---
        ## Edit Farm Dialog
        Allows the seller to update details of their farm listing.
        --- */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Edit {editedFarm.farm_type} Farm
            <Typography variant="subtitle2" color="text.secondary">
              ID: {editedFarm.id} | Type: {editedFarm.farm_type} | UniqueID:{" "}
              {editedFarm.uniqueId}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {[
                "location",
                "size",
                "price",
                "quality",
                "email",
                "phone",
              ].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    margin="dense"
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={editedFarm[field] || ""}
                    onChange={handleEditChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Description"
                  name="description"
                  value={editedFarm.description || ""}
                  onChange={handleEditChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>

              {/* Read-only fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Farm Number"
                  name="farm_number"
                  value={editedFarm.farm_number || "UNKNOWN"}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Farm number cannot be changed."
                  variant="filled" // Differentiate read-only fields
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Farm Type"
                  name="farm_type"
                  value={editedFarm.farm_type || ""}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Farm type cannot be changed. Create a new farm listing instead."
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Admin Feedback"
                  name="admin_feedback"
                  value={editedFarm.admin_feedback || "No feedback yet."}
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Admin feedback cannot be changed by seller."
                  variant="filled"
                />
              </Grid>

              {/* Associated Documents (Read-only links) */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Associated Documents:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Passport"
                  name="passport"
                  value={editedFarm.passport ? "Uploaded" : "Not Uploaded"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText={
                    editedFarm.passport
                      ? <Link href={`${BASE_URL}${editedFarm.passport}`} target="_blank" rel="noopener noreferrer">View Passport</Link>
                      : "No passport uploaded."
                  }
                  variant="standard" // Simpler variant for file info
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Ownership Certificate"
                  name="ownership_certificate"
                  value={
                    editedFarm.ownership_certificate ? "Uploaded" : "Not Uploaded"
                  }
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText={
                    editedFarm.ownership_certificate
                      ? <Link href={`${BASE_URL}${editedFarm.ownership_certificate}`} target="_blank" rel="noopener noreferrer">View Certificate</Link>
                      : "No ownership certificate uploaded."
                  }
                  variant="standard"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              color="success"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* ---
        ## View Details Dialog
        Displays all details of a selected farm in a read-only format.
        --- */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Farm Details</DialogTitle>
          <DialogContent dividers>
            {selectedFarm && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedFarm.farm_type} Farm
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Location:</strong> {selectedFarm.location}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Price:</strong> {selectedFarm.price}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Size:</strong> {selectedFarm.size}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Quality:</strong> {selectedFarm.quality}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedFarm.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {selectedFarm.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Description:</strong> {selectedFarm.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Farm Number:</strong> {selectedFarm.farm_number || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Admin Feedback:</strong> {selectedFarm.admin_feedback || "No feedback yet."}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Passport:</strong>{" "}
                    {selectedFarm.passport ? (
                      <Link
                        href={`${BASE_URL}${selectedFarm.passport}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Passport
                      </Link>
                    ) : (
                      "Not Uploaded"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Ownership Certificate:</strong>{" "}
                    {selectedFarm.ownership_certificate ? (
                      <Link
                        href={`${BASE_URL}${selectedFarm.ownership_certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Certificate
                      </Link>
                    ) : (
                      "Not Uploaded"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Is Sold:</strong> {selectedFarm.is_sold ? "Yes" : "No"}
                  </Typography>
                </Grid>
                {/* Display images in view dialog */}
                {selectedFarm.images && selectedFarm.images.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                            Images:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedFarm.images.map((img, index) => (
                                <CardMedia
                                    key={index}
                                    component="img"
                                    image={`${BASE_URL}${img.image}`}
                                    alt={`Farm image ${index + 1}`}
                                    sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                                />
                            ))}
                        </Box>
                    </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ---
        ## Delete Confirmation Dialog
        Prompts the user to confirm farm deletion.
        --- */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the farm at{" "}
              <strong>{selectedFarm?.location}</strong> (ID:{" "}
              {selectedFarm?.id}, Type: {selectedFarm?.farm_type})? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ---
        ## Snackbar Notification
        Provides transient messages for user feedback (success, error, info).
        --- */}
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