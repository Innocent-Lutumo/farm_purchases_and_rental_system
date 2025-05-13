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
} from "@mui/material";
import { MapPin } from "lucide-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

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
        backgroundColor: "#28a745",
        padding: "16px 32px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Title Section */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: "1.6rem",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Farm Seller Dashboard
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            Manage listings, track sales, and grow your network.
          </Typography>
        </Box>

        {/* Right Section: Home + Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleMenuOpen} color="inherit">
            <AccountCircleIcon sx={{ fontSize: 40 }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              component={Link}
              to="/profile"
              onClick={handleMenuClose}
              sx={{ color: "black" }}
            >
              My Profile
            </MenuItem>
            <MenuItem
              component={Link}
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

const UploadedFarms = () => {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("location");
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [editedFarm, setEditedFarm] = useState({});
  const [imageIndexes, setImageIndexes] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  // Debug state to track operations
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
      window.location.href = "/login";
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

      // Create a truly unique identifier for each farm by combining ID and farm_type
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
        window.location.href = "/login";
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
    console.log("Edit clicked for farm:", farm);

    // Create a deep copy to ensure we don't mutate state directly
    const farmCopy = JSON.parse(JSON.stringify(farm));

    // Set debug info
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

  const handleDeleteClick = (farm) => {
    console.log("Delete clicked for farm:", farm);
    setSelectedFarm(farm);
    setOpenDeleteDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    console.log(`Editing field ${name} to value: ${value}`);
    setEditedFarm((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Updated edited farm:", updated);
      return updated;
    });
  };

  // Convert farm_type to lowercase for API path
  const getFarmTypeForApi = (farmType) => {
    return farmType.toLowerCase();
  };

  const handleSaveEdit = async () => {
    try {
      console.log("Attempting to save edited farm:", editedFarm);

      if (!editedFarm.id || !editedFarm.farm_type) {
        throw new Error("Missing required farm fields: id or farm_type");
      }

      const newUniqueId = `${editedFarm.id}-${editedFarm.farm_type}`;

      // Prevent editing to a duplicate uniqueId
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

      // Ensure we're updating uniqueId before saving
      const farmToUpdate = {
        ...editedFarm,
        uniqueId: newUniqueId,
      };

      // Find farm by previous uniqueId
      const existingFarmIndex = farms.findIndex(
        (farm) => farm.uniqueId === editedFarm.uniqueId
      );

      if (existingFarmIndex === -1) {
        throw new Error("Farm not found in local data with matching uniqueId");
      }

      // Convert farm_type to lowercase for API path (backend expects lowercase)
      const farmTypeForApi = getFarmTypeForApi(farmToUpdate.farm_type);

      const response = await axios.put(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${farmToUpdate.id}/`,
        farmToUpdate,
        config
      );

      console.log("API response after update:", response.data);

      // Update local farm data
      const updatedFarms = [...farms];
      updatedFarms[existingFarmIndex] = {
        ...farms[existingFarmIndex],
        ...farmToUpdate,
      };
      setFarms(updatedFarms);

      // Update filtered farms
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

      // Success state
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

      // Optionally refetch to sync with backend
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
        window.location.href = "/login";
      } else {
        setSnackbar({
          open: true,
          message: `Failed to update farm: ${
            error.message || "Please try again."
          }`,
          severity: "error",
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      console.log("Attempting to delete farm:", selectedFarm);

      if (!selectedFarm.id) {
        console.error("Missing farm ID for deletion");
        throw new Error("Missing farm ID");
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

      // Convert farm_type to lowercase for API path (backend expects lowercase)
      const farmTypeForApi = getFarmTypeForApi(selectedFarm.farm_type);

      const deleteUrl = `${BASE_URL}/api/all-farms/${farmTypeForApi}/${selectedFarm.id}/`;
      console.log("Delete endpoint:", deleteUrl);

      // Find the farm with matching uniqueId in our local data
      const existingFarmIndex = farms.findIndex(
        (farm) => farm.uniqueId === selectedFarm.uniqueId
      );

      if (existingFarmIndex === -1) {
        console.error("Farm not found in local data with matching uniqueId");
        throw new Error("Farm not found with matching uniqueId");
      }

      // Now proceed with deletion - fixed URL endpoint
      const response = await axios.delete(deleteUrl, config);

      console.log("Delete response:", response);

      // Remove from local state immediately for better UX
      const updatedFarms = farms.filter(
        (farm) => farm.uniqueId !== selectedFarm.uniqueId
      );
      setFarms(updatedFarms);

      setFilteredFarms((prevFiltered) =>
        prevFiltered.filter((farm) => farm.uniqueId !== selectedFarm.uniqueId)
      );

      // Update debug info
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

      // Refresh data from server to ensure consistency
      setTimeout(() => {
        fetchFarms();
      }, 1000);
    } catch (error) {
      console.error("Failed to delete farm:", error);

      // Update debug info
      setDebug({
        lastAction: "delete_failed",
        actionId: selectedFarm.id,
        farmType: selectedFarm.farm_type,
        success: false,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/login";
      } else {
        setSnackbar({
          open: true,
          message: `Failed to delete farm: ${
            error.message || "Please try again."
          }`,
          severity: "error",
        });
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Header />
      <Container sx={{ mt: 4 }}>
        {/* Debug Info */}
        {debug.lastAction && (
          <Alert severity={debug.success ? "info" : "warning"} sx={{ mb: 2 }}>
            Last action: {debug.lastAction} | ID: {debug.actionId} | Type:{" "}
            {debug.farmType} | Success: {debug.success ? "Yes" : "No"}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="search-filter-label">Search By</InputLabel>
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
            fullWidth
            variant="outlined"
            size="small"
            placeholder={`Search by ${searchFilter}`}
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
          <Button variant="contained" color="success" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
          <Grid container spacing={4}>
            {filteredFarms.length === 0 ? (
              <Box sx={{ width: "100%", mt: 3, textAlign: "center" }}>
                <Typography>
                  No farms found. You haven't uploaded any farms yet.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  href="/uploadFarmForm"
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
                      borderRadius: 3,
                      boxShadow: 4,
                      overflow: "hidden",
                      transition: "0.3s",
                      "&:hover": { boxShadow: 8 },
                    }}
                  >
      
                    {/* Pinned Farm Type Label */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        transform: "rotate(-10deg)",
                        backgroundColor:
                          farm.farm_type === "Sale" ? "green" : "orange",
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
                          color={farm.farm_type === "Sale" ? "green" : "orange"}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        {farm.farm_type}
                      </Typography>
                    </Box>

                    {/* Image */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 200,
                      }}
                    >
                      {farm.images?.length > 0 && (
                        <CardMedia
                          component="img"
                          sx={{
                            width: "auto",
                            maxHeight: "200px",
                            objectFit: "contain",
                            borderRadius: 1,
                          }}
                          image={`${BASE_URL}${
                            farm.images[imageIndexes[farm.uniqueId] || 0]?.image
                          }`}
                          alt="Farm Image"
                        />
                      )}
                    </Box>

                    {/* Carousel Controls */}
                    {farm.images?.length > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => handlePrevImage(farm.uniqueId)}
                          sx={{ mx: 1 }}
                        >
                          &lt;
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleNextImage(farm.uniqueId)}
                          sx={{ mx: 1 }}
                        >
                          &gt;
                        </Button>
                      </Box>
                    )}

                    {/* Details Grid */}
                    <CardContent sx={{ flex: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Location:</strong> {farm.location}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Price:</strong> {farm.price}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Size:</strong> {farm.size}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Quality:</strong> {farm.quality}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Email:</strong> {farm.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Phone:</strong> {farm.phone}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              bgcolor: "#d8f9d8",
                              p: 1,
                              borderRadius: 1,
                            }}
                          >
                            {farm.description}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>

                    {/* Edit/Delete Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1,
                      }}
                    >
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditClick(farm)}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(farm)}
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

        {/* Edit Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Edit {editedFarm.farm_type} Farm
            <Typography variant="subtitle2" color="text.secondary">
              ID: {editedFarm.id} | Type: {editedFarm.farm_type} | UniqueID:{" "}
              {editedFarm.uniqueId}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {[
              "location",
              "size",
              "price",
              "quality",
              "description",
              "email",
              "phone",
            ].map((field) => (
              <TextField
                key={field}
                margin="dense"
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={editedFarm[field] || ""}
                onChange={handleEditChange}
                fullWidth
                multiline={field === "description"}
                rows={field === "description" ? 3 : 1}
              />
            ))}

            {/* Farm Type Field - Read Only */}
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              color="success"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Delete {selectedFarm?.farm_type} Farm
            <Typography variant="subtitle2" color="text.secondary">
              ID: {selectedFarm?.id} | Type: {selectedFarm?.farm_type} |
              UniqueID: {selectedFarm?.uniqueId}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this farm?</Typography>
            {selectedFarm && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Location: {selectedFarm.location}, Price: {selectedFarm.price}
              </Typography>
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

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
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

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#d8f9d8",
          marginTop: 4,
          textAlign: "left",
          padding: 1.5,
        }}
      >
        <Box sx={{ textAlign: "left", mt: 1 }}>
          <IconButton
            href="https://www.instagram.com"
            target="_blank"
            sx={{ color: "#E4405F" }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://www.twitter.com"
            target="_blank"
            sx={{ color: "#1DA1F2" }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.facebook.com"
            target="_blank"
            sx={{ color: "#1877F2" }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.linkedin.com"
            target="_blank"
            sx={{ color: "#0077B5" }}
          >
            <LinkedInIcon />
          </IconButton>
          <IconButton
            href="https://wa.me/255747570004"
            target="_blank"
            sx={{ color: "#25D366" }}
          >
            <WhatsAppIcon />
          </IconButton>
        </Box>

        <Typography fontSize={13} sx={{ mt: 1 }}>
          &copy; 2025 GreenHarvest — Built with care by S/N 19
        </Typography>
      </Box>
    </>
  );
};

export default UploadedFarms;