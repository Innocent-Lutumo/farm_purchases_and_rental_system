import React, { useState, useEffect } from "react";
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
  AppBar,
  Toolbar,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import axios from "axios";
import { green } from "@mui/material/colors";
import "../../styles/Animation.css";

export default function Rent() {
  const [orders, setOrders] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const open = Boolean(anchorEl);

  const profileMenu = [
    { label: "My Profile", path: "#" },
    { label: "Back", path: "/SellerPage" },
  ];

  // Function to apply current filters (search and is_rented status)
  const applyFilters = (currentOrders, currentSearchQuery) => {
    return currentOrders.filter(
      (order) =>
        order.farm.is_rented && 
        order.farm.location
          .toLowerCase()
          .includes(currentSearchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(
          "http://127.0.0.1:8000/api/rent-transactions/",
          { headers }
        );
        setOrders(response.data);
        setFilteredOrders(applyFilters(response.data, searchQuery));
      } catch (error) {
        console.error("Error fetching orders:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchQuery]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `http://127.0.0.1:8000/api/rent-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrders = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(applyFilters(updatedOrders, searchQuery));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const token = localStorage.getItem("access");
      await axios.delete(
        `http://127.0.0.1:8000/api/rent-transactions/${deleteId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedOrders = orders.filter((order) => order.id !== deleteId);
      setOrders(updatedOrders);
      setFilteredOrders(applyFilters(updatedOrders, searchQuery));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // New handler for farm availability toggle
  const handleFarmAvailabilityToggle = async (farmId, currentIsRented) => {
    try {
      const token = localStorage.getItem("access");
      const newIsRentedStatus = !currentIsRented; 
      await axios.patch(
        `http://127.0.0.1:8000/api/farmsrent/${farmId}/`,
        { is_rented: newIsRentedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrders = orders.map((order) =>
        order.farm.id === farmId
          ? { ...order, farm: { ...order.farm, is_rented: newIsRentedStatus } }
          : order
      );
      setOrders(updatedOrders); 
      setFilteredOrders(applyFilters(updatedOrders, searchQuery));
    } catch (error) {
      console.error("Failed to update farm availability:", error);
      alert("Failed to update farm availability. Please try again.");
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);

  };

  const handleSearch = () => {
    // Explicitly call applyFilters when search button is clicked
    setFilteredOrders(applyFilters(orders, searchQuery));
  };

  const openConfirmationDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const closeConfirmationDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress color="success" />
        <Typography>Loading rented farms...</Typography>
      </Container>
    );
  }

  // If there are no filtered orders (after initial load or after un-renting all), display message
  if (filteredOrders.length === 0 && !loading) {
    return (
      <Box>
        <AppBar position="static" sx={{ bgcolor: green[700], py: 2 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" fontWeight="bold">
                Farm Seller Dashboard
              </Typography>
              <Typography variant="body2">
                Manage listings, track rentals, and more.
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={handleMenu} color="inherit">
                <AccountCircleIcon sx={{ fontSize: 40 }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {profileMenu.map((item) => (
                  <MenuItem
                    key={item.label}
                    component={Link}
                    to={item.path}
                    onClick={handleClose}
                    sx={{
                      textDecoration: "none",
                      color: "black",
                      "&:hover": {
                        backgroundColor: green[100],
                        color: green[700],
                      },
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h4" color="green" gutterBottom>
            Rented Farms
          </Typography>
          <Typography variant="h6" color="textSecondary" mt={4}>
            No farms currently rented or found matching your search.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mb: 4,
              mt: 4,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Search Farms by Location"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ width: "80%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" color="success" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: green[700], py: 2 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" fontWeight="bold">
              Farm Seller Dashboard
            </Typography>
            <Typography variant="body2">
              Manage listings, track rentals, and more.
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handleMenu} color="inherit">
              <AccountCircleIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {profileMenu.map((item) => (
                <MenuItem
                  key={item.label}
                  component={Link}
                  to={item.path}
                  onClick={handleClose}
                  sx={{
                    textDecoration: "none",
                    color: "black",
                    "&:hover": {
                      backgroundColor: green[100],
                      color: green[700],
                    },
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" color="green" gutterBottom>
          Rented Farms
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography>
            <strong>Total Farms Rented: {filteredOrders.length}</strong>
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 4 }}
        >
          <TextField
            variant="standard"
            placeholder="Search Farms by Location"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: "80%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" color="success" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        <TableContainer component={Paper} className="fade-in">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Farm</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rental Time</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Rent Date</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Update Status</TableCell>
                <TableCell>Delete</TableCell>
                <TableCell>Availability</TableCell> 
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow
                  key={order.id}
                  className="fade-in"
                  sx={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={`http://127.0.0.1:8000${order.farm.image}`}
                        variant="rounded"
                        sx={{ width: 80, height: 80 }}
                      />
                      <Typography>{order.farm.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/farm-location/${order.farm.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="View Location">
                          <LocationOnIcon sx={{ color: "green" }} />
                        </Tooltip>
                        <Typography color="success.main">
                          {order.farm.location}
                        </Typography>
                      </Box>
                    </Link>
                  </TableCell>
                  <TableCell>{order.farm.size}</TableCell>
                  <TableCell>{order.farm.price} Tshs</TableCell>
                  <TableCell>
                    <Typography
                      className={
                        order.status === "Confirmed"
                          ? "confirmed"
                          : order.status === "Cancelled"
                          ? "cancelled"
                          : "pending"
                      }
                    >
                      {order.status || "Pending"}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.farm.rent_duration || "-"}</TableCell>
                  <TableCell>{order.renter_phone || "-"}</TableCell>
                  <TableCell>
                    {order.rent_date
                      ? new Date(order.rent_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{order.transaction_id || "-"}</TableCell>
                  <TableCell>{order.renter_email || "-"}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel>Edit Status</InputLabel>
                      <Select
                        value={order.status || "Pending"}
                        label="Edit Status"
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => openConfirmationDialog(order.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {/* Availability Switch */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!order.farm.is_rented} 
                          onChange={() =>
                            handleFarmAvailabilityToggle(
                              order.farm.id,
                              order.farm.is_rented
                            )
                          }
                          color={order.farm.is_rented ? "warning" : "success"}
                        />
                      }
                      label={order.farm.is_rented ? "Rented" : "Available"}
                      sx={{
                        color: order.farm.is_rented ? "orange" : green[700],
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog
        open={openDeleteDialog}
        onClose={closeConfirmationDialog}
        aria-labelledby="delete-confirm"
      >
        <DialogTitle id="delete-confirm">Confirm Deletion</DialogTitle>
        <DialogContent>
          {isDeleting ? (
            <CircularProgress color="success" />
          ) : (
            <Typography>
              Are you sure you want to delete this transaction?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmationDialog} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="success"
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}