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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useParams } from "react-router-dom";
import axios from "axios";

// Header Component
const Header = () => (
  <AppBar position="static" sx={{ backgroundColor: "green" }}>
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Farm Dashboard
      </Typography>
      <Box sx={{ ml: "auto" }}>
        <Button variant="text" sx={{ color: "white" }} href="/">
          Home
        </Button>
      </Box>
    </Toolbar>
  </AppBar>
);

// Footer Component
const Footer = () => (
  <Container component="footer" sx={{ textAlign: "center", py: 3, mt: 5 }}>
    <Typography variant="body2" color="textSecondary">
      &copy; {new Date().getFullYear()} Farm App. All rights reserved.
    </Typography>
  </Container>
);

const UploadedFarms = () => {
  const { farmId } = useParams();
  const [farm, setFarm] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFarm, setEditedFarm] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/farms/${farmId}`);
        setFarm(res.data);
        setEditedFarm(res.data);
      } catch (error) {
        console.error("Failed to fetch farm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarm();
  }, [farmId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/farms/${farmId}`);
      console.log("Farm deleted successfully");
    } catch (error) {
      console.error("Failed to delete farm:", error);
    }
    setOpenDeleteDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedFarm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/farms/${farmId}`, editedFarm);
      setFarm(response.data);
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save farm:", error);
    }
  };

  const isMatch = () =>
    !searchQuery ||
    farm?.location?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <>
      <Header />

      <Container sx={{ marginTop: 5 }}>
        {/* Search Input */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            my: 3,
          }}
        >
          <TextField
            variant="standard"
            placeholder="Search Farms by Location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: "80%", }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            color="success"
            onClick={() => console.log("Search triggered:", searchQuery)}
            sx={{ height: 36 }}
          >
            Search
          </Button>
        </Box>

        {/* Loading Spinner */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {farm && isMatch() ? (
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  borderRadius: 4,
                  boxShadow: 4,
                }}
              >
                {farm.image && (
                  <CardMedia
                    component="img"
                    image={farm.image}
                    alt="Farm"
                    sx={{
                      width: "40%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "8px 0 0 8px",
                    }}
                  />
                )}

                <CardContent sx={{ width: "60%", padding: 3 }}>
                  {isEditMode ? (
                    <>
                      <TextField
                        label="Location"
                        name="location"
                        value={editedFarm.location}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Size"
                        name="size"
                        value={editedFarm.size}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Price"
                        name="price"
                        value={editedFarm.price}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Quality"
                        name="quality"
                        value={editedFarm.quality}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Description"
                        name="description"
                        value={editedFarm.description}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Email"
                        name="email"
                        value={editedFarm.email}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Phone"
                        name="phone"
                        value={editedFarm.phone}
                        onChange={handleChange}
                        fullWidth
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {farm.location}
                      </Typography>
                      <Typography>
                        <strong>Size:</strong> {farm.size}
                      </Typography>
                      <Typography>
                        <strong>Price:</strong> {farm.price}
                      </Typography>
                      <Typography>
                        <strong>Quality:</strong> {farm.quality}
                      </Typography>
                      <Typography sx={{ mt: 1, mb: 1 }}>
                        <strong>Description:</strong> {farm.description}
                      </Typography>
                      <Typography>
                        <strong>Email:</strong> {farm.email}
                      </Typography>
                      <Typography>
                        <strong>Phone:</strong> {farm.phone}
                      </Typography>
                    </>
                  )}

                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    {isEditMode ? (
                      <>
                        <Grid item xs={6}>
                          <Button
                            variant="contained"
                            onClick={handleSave}
                            fullWidth
                            sx={{ backgroundColor: "green", color: "#fff" }}
                          >
                            Save
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="outlined"
                            onClick={() => setIsEditMode(false)}
                            fullWidth
                          >
                            Cancel
                          </Button>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={6}>
                          <Button
                            variant="contained"
                            onClick={() => setIsEditMode(true)}
                            fullWidth
                          >
                            Edit
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setOpenDeleteDialog(true)}
                            fullWidth
                          >
                            Delete
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Typography align="center" mt={4}>
                No farms match this location.
              </Typography>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
            >
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete this farm? This action cannot
                  be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDelete} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>

      <Footer />
    </>
  );
};

export default UploadedFarms;
