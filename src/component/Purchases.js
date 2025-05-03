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
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import axios from "axios";
import { green } from "@mui/material/colors";

export default function Purchases() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const open = Boolean(anchorEl);

  const profileMenu = [
    { label: "Home", path: "/" },
    { label: "Logout", path: "/logout" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/sale-transactions/");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 🛠 Updated handleStatusChange
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/sale-transactions/${id}/`, {
        status: newStatus,
      });

      const updated = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const openConfirmDialog = (order) => {
    setOrderToDelete(order);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setOrderToDelete(null);
    setConfirmDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/sale-transactions/${orderToDelete.id}/`);
      const updated = orders.filter((order) => order.id !== orderToDelete.id);
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      closeConfirmDialog();
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    const filtered = orders.filter((order) =>
      order.farm.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography>Loading purchased farms...</Typography>
      </Container>
    );
  }

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: green[700], py: 2 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Farm Seller Dashboard
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Manage listings, track sales, and grow your network.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  sx={{ color: "black" }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom color="green">
          Purchased Farms
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Total Farms Added: {filteredOrders.length}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 4 }}>
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
              <TableRow>
                <TableCell>Farm</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
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
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon sx={{ color: "green" }} />
                      <Typography>{order.farm.location}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.farm.size}</TableCell>
                  <TableCell>{order.farm.price} Tshs</TableCell>
                  <TableCell>
                    <Typography
                      color={
                        order.status === "Confirmed"
                          ? "green"
                          : order.status === "Cancelled"
                          ? "red"
                          : "orange"
                      }
                    >
                      {order.status || "Pending"}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.transaction_id || "-"}</TableCell>
                  <TableCell>{order.buyer_email || "-"}</TableCell>
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
                    <IconButton color="error" onClick={() => openConfirmDialog(order)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Box
        component="footer"
        sx={{ py: 3, textAlign: "center", backgroundColor: "#e8f5e9" }}
      >
        <Typography variant="body2" color="green">
          &copy; 2025 Farm Purchases Admin Panel. All rights reserved.
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the transaction for{" "}
            <strong>{orderToDelete?.farm.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
