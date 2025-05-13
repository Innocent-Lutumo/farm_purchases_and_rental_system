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
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get(
          "http://127.0.0.1:8000/api/sale-transactions/",
          { headers }
        );
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `http://127.0.0.1:8000/api/sale-transactions/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const token = localStorage.getItem("access");
      await axios.delete(
        `http://127.0.0.1:8000/api/sale-transactions/${deleteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = orders.filter((order) => order.id !== deleteId);
      setOrders(updated);
      setFilteredOrders(updated);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    const filtered = orders.filter((order) =>
      order.farm.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const openConfirmationDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const closeConfirmationDialog = () => setOpenDeleteDialog(false);

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography>Loading purchased farms...</Typography>
      </Container>
    );
  }

  return (
    <Box>
      {/* AppBar */}
      <AppBar
        position="static"
        sx={{ bgcolor: green[700], py: 2, boxShadow: 4 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Farm Seller Dashboard
            </Typography>
            <Typography variant="body2">
              Manage listings, track sales, and grow your network.
            </Typography>
          </Box>
          <IconButton
            onClick={handleMenu}
            color="inherit"
            aria-label="account menu"
          >
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
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom color="green">
          Purchased Farms
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          <strong>Total Farms Added: {filteredOrders.length}</strong>
        </Typography>

        {/* Search Bar */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 4 }}
        >
          <TextField
            variant="outlined"
            placeholder="Search Farms by Location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: "70%",
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: 1,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ bgcolor: green[600], borderRadius: 2, px: 3, boxShadow: 2 }}
          >
            Search
          </Button>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 4, boxShadow: 3 }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
              <TableRow>
                <TableCell>Farm</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Edit Status</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow
                  key={order.id}
                  className="fade-in"
                  sx={{
                    animationDelay: `${index * 0.1}s`,
                    backgroundColor: "#f9f9f9",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#f1f8e9" },
                  }}
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
                      {order.status}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.renter_phone || "-"}</TableCell>
                  <TableCell>{order.transaction_id}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={closeConfirmationDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          {isDeleting ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress color="success" />
            </Box>
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
