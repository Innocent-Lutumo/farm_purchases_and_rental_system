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
} from "@mui/material";
import { MapPin } from "lucide-react";
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

const Header = () => (
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
      {/* Title Section with Reduced Font Size */}
      <Box>
        <Typography
          variant="h5" // Reduced font size here
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: "1.6rem", // Smaller font size for the title
            letterSpacing: "1.2px",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          My Uploaded Farms
        </Typography>

        {/* Subtitle/Introduction Text */}
        <Typography
          variant="body2" // Reduced font size for the subtitle
          sx={{
            color: "white",
            fontSize: "0.9rem", // Smaller font size for subtitle
            marginTop: 1,
            fontStyle: "italic",
            letterSpacing: "0.5px",
          }}
        >
          Browse and manage the farms you've uploaded. Edit, delete, or view
          details.
        </Typography>
      </Box>

      {/* Navigation Button with Reduced Font Size and Aligned to the Right */}
      <Button
        color="inherit"
        href="/"
        sx={{
          fontSize: "1rem",
          fontWeight: "bold",
          padding: "8px 16px",
          color: "white",
          borderRadius: "20px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          marginLeft: "auto",
          "&:hover": {
            backgroundColor: "#218838",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        Home
      </Button>
    </Toolbar>
  </AppBar>
);
const UploadedFarms = () => {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

      const res = await axios.get(`${BASE_URL}/api/all-farms/`, config);
      const data = Array.isArray(res.data)
        ? res.data.map((farm) => farm.data || farm)
        : [];

      const userEmail = localStorage.getItem("user_email");
      const userFarms = userEmail
        ? data.filter((farm) => farm.email === userEmail)
        : data;

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
    const result = farms.filter((farm) =>
      farm.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFarms(result);
  };

  const handleEditClick = (farm) => {
    setEditedFarm(farm);
    setSelectedFarm(farm);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (farm) => {
    setSelectedFarm(farm);
    setOpenDeleteDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedFarm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      if (!editedFarm.id) throw new Error("Missing farm ID");

      const token = localStorage.getItem("access");
      if (!token) throw new Error("Authentication token missing");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `${BASE_URL}/api/all-farms/${editedFarm.id}/`,
        editedFarm,
        config
      );

      fetchFarms();
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: "Farm updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/login";
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update farm. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedFarm.id) throw new Error("Missing farm ID");

      const token = localStorage.getItem("access");
      if (!token) throw new Error("Authentication token missing");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(
        `${BASE_URL}/api/all-farms/${selectedFarm.id}/`,
        config
      );

      fetchFarms();
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: "Farm deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/login";
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete farm. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handlePrevImage = (farmId) => {
    setImageIndexes((prev) => {
      const currentIndex = prev[farmId] || 0;
      const total =
        filteredFarms.find((f) => f.id === farmId)?.images?.length || 0;
      return {
        ...prev,
        [farmId]: (currentIndex - 1 + total) % total,
      };
    });
  };

  const handleNextImage = (farmId) => {
    setImageIndexes((prev) => {
      const currentIndex = prev[farmId] || 0;
      const total =
        filteredFarms.find((f) => f.id === farmId)?.images?.length || 0;
      return {
        ...prev,
        [farmId]: (currentIndex + 1) % total,
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
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search by Location"
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
                <Grid item xs={12} sm={6} md={4} key={farm.id}>
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
                            farm.images[imageIndexes[farm.id] || 0]?.image
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
                          onClick={() => handlePrevImage(farm.id)}
                          sx={{ mx: 1 }}
                        >
                          &lt;
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleNextImage(farm.id)}
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
          <DialogTitle>Edit Farm</DialogTitle>
          <DialogContent>
            {[
              "location",
              "size",
              "price",
              "quality",
              "description",
              "email",
              "phone",
              "farm_type",
            ].map((field) => (
              <TextField
                key={field}
                margin="dense"
                label={
                  field === "farm_type"
                    ? "Farm Type"
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                name={field}
                value={editedFarm[field] || ""}
                onChange={handleEditChange}
                fullWidth
                multiline={field === "description"}
                rows={field === "description" ? 3 : 1}
              />
            ))}
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
          <DialogTitle>Delete Farm</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this farm?</Typography>
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
