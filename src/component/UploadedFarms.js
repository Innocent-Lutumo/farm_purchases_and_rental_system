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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const Header = () => (
  <AppBar position="static" sx={{ backgroundColor: "green" }}>
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        My Uploaded Farms
      </Typography>
      <Button color="inherit" href="/">Home</Button>
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

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/all-farms/`);
      const data = res.data.map((item) => item.data);
      setFarms(data);
      setFilteredFarms(data);
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const result = farms.filter(farm =>
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
      await axios.put(`${BASE_URL}/api/all-farms/${editedFarm.id}/`, editedFarm);
      fetchFarms();
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Failed to update farm:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/all-farms/${selectedFarm.id}/`);
      fetchFarms();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete farm:", error);
    }
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

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredFarms.length === 0 ? (
              <Typography>No farms found.</Typography>
            ) : (
              filteredFarms.map((farm) => (
                <Grid item xs={12} sm={6} md={4} key={farm.id}>
                  <Card
                    sx={{
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
                    <Box sx={{ display: "flex", flexDirection: "row", height: 200 }}>
                      {farm.image && (
                        <CardMedia
                          component="img"
                          sx={{ width: 120, objectFit: "cover", borderRadius: 1, mr: 1, margin: 1 }}
                          image={`${BASE_URL}${farm.image}`}
                          alt={farm.location}
                        />
                      )}
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6">{farm.location}</Typography>
                        <Typography variant="body2">Size: {farm.size}</Typography>
                        <Typography variant="body2">Price: {farm.price}</Typography>
                        <Typography variant="body2">Quality: {farm.quality}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>{farm.description}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>Email: {farm.email}</Typography>
                        <Typography variant="body2">Phone: {farm.phone}</Typography>
                      </CardContent>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, py: 1 }}>
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
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Farm</DialogTitle>
          <DialogContent>
            {["location", "size", "price", "quality", "description", "email", "phone"].map((field) => (
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained" color="success">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete <strong>{selectedFarm?.location}</strong>?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default UploadedFarms;
