import React, { useState } from "react";
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
  Menu
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";

const bookedFarms = [
  {
    id: 1,
    name: "Sunnydale Farm",
    location: "Texas, USA",
    size: "150 acres",
    price: "$10,000",
    image: "https://via.placeholder.com/80",
    status: "Pending",
    rentTime: "3 months"
  },
  {
    id: 2,
    name: "Green Valley Estate",
    location: "California, USA",
    size: "200 acres",
    price: "$15,000",
    image: "https://via.placeholder.com/80",
    status: "Confirmed",
    rentTime: "6 months"
  },
  {
    id: 3,
    name: "Riverbend Farm",
    location: "Oregon, USA",
    size: "300 acres",
    price: "$20,000",
    image: "https://via.placeholder.com/80",
    status: "Cancelled",
    rentTime: "1 year"
  }
];

export default function Rents() {
  const [farms, setFarms] = useState(bookedFarms);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedFarms = farms.map(farm =>
      farm.id === id ? { ...farm, status: newStatus } : farm
    );
    setFarms(updatedFarms);
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'green' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Booked Farms
          </Typography>
          <IconButton color="inherit" onClick={handleMenu}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose} component={Link} to="/">
              <HomeIcon fontSize="small" sx={{ mr: 1 }} /> Home
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/logout">
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom color="green">
          Booked Farms
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e8f5e9' }}>
              <TableRow>
                <TableCell>Farm</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Rent Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {farms.map((farm) => (
                <TableRow key={farm.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={farm.image}
                        variant="rounded"
                        sx={{ width: 80, height: 80 }}
                      />
                      <Typography>{farm.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Link to={`/location/${farm.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'green' }}>
                        <LocationOnIcon sx={{ color: 'green' }} />
                        <Typography>{farm.location}</Typography>
                      </Link>
                    </Box>
                  </TableCell>
                  <TableCell>{farm.size}</TableCell>
                  <TableCell>{farm.price}</TableCell>
                  <TableCell>{farm.rentTime}</TableCell>
                  <TableCell>
                    <Typography color={farm.status === 'Confirmed' ? 'green' : farm.status === 'Cancelled' ? 'red' : 'orange'}>
                      {farm.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel>Edit Status</InputLabel>
                      <Select
                        value={farm.status}
                        label="Edit Status"
                        onChange={(e) => handleStatusChange(farm.id, e.target.value)}
                      >
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ py: 3, textAlign: "center", backgroundColor: "#e8f5e9" }}
      >
        <Typography variant="body2" color="green">
          &copy; 2025 Farm Rentals Admin Panel. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
