import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Typography,
  TextField,
  Grid,
  Box,
  Chip,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Icon imports
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Spa as FarmIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
  CalendarMonth as CalendarIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from "@mui/icons-material";

import axios from "axios";

// Theme creation function
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2e7d32" },
      secondary: { main: "#f50057" },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: "none", fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0px 2px 4px -1px rgba(0,0,0,0.1)"
                : "0px 2px 4px -1px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
      h6: { fontWeight: 600 },
    },
  });

// Stat card component
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            backgroundColor: `rgba(${
              color === "error.main"
                ? "244, 67, 54"
                : color === "warning.main"
                ? "255, 167, 38"
                : color === "success.main"
                ? "76, 175, 80"
                : "46, 125, 50"
            }, 0.1)`,
            p: 1,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

function FarmRentals() {
  // State management
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeView, setActiveView] = useState("table");
  const [loading, setLoading] = useState(false);
  
  // Edit states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRental, setCurrentRental] = useState(null);
  const [editFormData, setEditFormData] = useState({
    rental_rate: "",
    rental_period: "",
    start_date: "",
    end_date: ""
  });
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRentalId, setDeleteRentalId] = useState(null);

  // Menu items configuration
  const menuItems = useMemo(
    () => [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/Dashboard" },
      { text: "Sellers", icon: <PeopleIcon />, path: "/SellerList" },
      { text: "Farm Rentals", icon: <FarmIcon />, path: "/FarmRentals" },
    ],
    []
  );

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/AdminLogin");
  };

  // Theme setup
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  // Calculate statistics from rental data
  const stats = useMemo(
    () => ({
      totalConfirmed: rentals.length,
      thisMonth: rentals.filter((rental) => {
        const today = new Date();
        const rentalDate = new Date(rental.created_at);
        return rentalDate.getMonth() === today.getMonth() && 
               rentalDate.getFullYear() === today.getFullYear();
      }).length,
      longTerm: rentals.filter(rental => 
        rental.rental_period === "Long-term" || 
        rental.rental_period === "Annual"
      ).length,
      shortTerm: rentals.filter(rental => 
        rental.rental_period === "Short-term" || 
        rental.rental_period === "Monthly" ||
        rental.rental_period === "Seasonal"
      ).length,
    }),
    [rentals]
  );

  // API handling functions
  const fetchRentals = useCallback(() => {
    setLoading(true);
    axios
      .get("http://127.0.0.1:8000/api/farmsale/")
      .then((response) => {
        // Filter only confirmed rental transactions
        const confirmedRentals = response.data.filter(
          (transaction) => 
            transaction.transaction_type === "rental" && 
            transaction.is_validated === true
        );
        setRentals(confirmedRentals);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching confirmed farm rentals:", err);
        setLoading(false);
      });
  }, []);

  // Event handlers
  const handleDrawerToggle = useCallback(
    () => setDrawerOpen((prev) => !prev),
    []
  );

  const handleThemeToggle = useCallback(() => setDarkMode((prev) => !prev), []);

  const handleChangePage = useCallback(
    (event, newPage) => setPage(newPage),
    []
  );

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Edit handlers
  const handleEditOpen = (rental) => {
    setCurrentRental(rental);
    setEditFormData({
      rental_rate: rental.rental_rate || "",
      rental_period: rental.rental_period || "",
      start_date: rental.start_date || "",
      end_date: rental.end_date || ""
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCurrentRental(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = () => {
    setLoading(true);
    
    axios
      .patch(
        `http://127.0.0.1:8000/api/get-transactions/rental/${currentRental.id}/`,
        editFormData
      )
      .then((response) => {
        setRentals(prevRentals =>
          prevRentals.map(rental =>
            rental.id === currentRental.id ? { ...rental, ...editFormData } : rental
          )
        );
        handleEditClose();
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error updating rental:", err);
        setLoading(false);
      });
  };

  // Delete handlers
  const handleDeleteOpen = (id) => {
    setDeleteRentalId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setDeleteRentalId(null);
  };

  const handleDeleteConfirm = () => {
    setLoading(true);
    
    axios
      .delete(`http://127.0.0.1:8000/api/get-transactions/rental/${deleteRentalId}/`)
      .then(() => {
        setRentals(prevRentals =>
          prevRentals.filter(rental => rental.id !== deleteRentalId)
        );
        handleDeleteClose();
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error deleting rental:", err);
        setLoading(false);
      });
  };

  // Filter rentals based on search query
  const filterRentals = useCallback(() => {
    if (!rentals.length) return;

    const filtered = rentals.filter((rental) => {
      const matchesSearch =
        searchQuery === "" ||
        (rental.farm?.location && rental.farm.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rental.farm?.user && rental.farm.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rental.rental_period && rental.rental_period.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });

    setFilteredRentals(filtered);
  }, [rentals, searchQuery]);

  // Effects
  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  useEffect(() => {
    filterRentals();
  }, [filterRentals]);

  // Display rentals for current page
  const displayedRentals = useMemo(
    () =>
      filteredRentals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRentals, page, rowsPerPage]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: "none" }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Farm Admin Dashboard
            </Typography>

            {/* Search */}
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: 2,
                mr: 2,
                display: { xs: "none", md: "flex" },
                width: 300,
              }}
            >
              <TextField
                placeholder="Search rentals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "white", mx: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mx: 1, color: "white", "& input": { color: "white" } }}
              />
            </Box>

            {/* Action buttons */}
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton
                color="inherit"
                onClick={fetchRentals}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <IconButton edge="end" color="inherit" sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: theme.palette.secondary.main,
                }}
              >
                A
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Side Drawer */}
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? drawerWidth : theme.spacing(7),
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerOpen ? drawerWidth : theme.spacing(7),
              boxSizing: "border-box",
              whiteSpace: "nowrap",
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "hidden", mt: 2 }}>
            {drawerOpen && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  A
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Admin User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  admin@example.com
                </Typography>
              </Box>
            )}

            <List>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <ListItem
                    key={item.text}
                    component={Link}
                    to={item.path}
                    button
                    sx={{
                      backgroundColor: isActive
                        ? theme.palette.action.selected
                        : "transparent",
                      borderRadius: drawerOpen ? 1 : 0,
                      mx: drawerOpen ? 1 : 0,
                      mb: 0.5,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerOpen ? 48 : "100%",
                        color: isActive
                          ? theme.palette.primary.main
                          : "inherit",
                        textAlign: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? theme.palette.primary.main
                            : "inherit",
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: drawerOpen ? 1 : 0,
                  mx: drawerOpen ? 1 : 0,
                  mb: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 48 : "100%",
                    textAlign: "center",
                  }}
                >
                  <ExitToAppIcon />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Logout" />}
              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${
              drawerOpen ? drawerWidth : theme.spacing(7)
            }px)`,
            mt: 8,
          }}
        >
          {/* Dashboard Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Confirmed Farm Rentals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your confirmed farm rental orders
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Confirmed"
                value={stats.totalConfirmed}
                icon={<CalendarIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="This Month"
                value={stats.thisMonth}
                color="success.main"
                icon={<CalendarIcon color="success" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Long-term"
                value={stats.longTerm}
                color="warning.main"
                icon={<CalendarIcon color="warning" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Short-term"
                value={stats.shortTerm}
                color="info.main"
                icon={<CalendarIcon color="info" />}
              />
            </Grid>
          </Grid>

          {/* Filters & Controls */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6">Confirmed Rentals</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant={activeView === "table" ? "contained" : "outlined"}
                size="small"
                onClick={() => setActiveView("table")}
              >
                Table
              </Button>
              <Button
                variant={activeView === "cards" ? "contained" : "outlined"}
                size="small"
                onClick={() => setActiveView("cards")}
              >
                Cards
              </Button>
            </Box>
          </Paper>

          {/* Loading indicator */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Loading...</Typography>
            </Box>
          )}

          {/* Table View */}
          {!loading && activeView === "table" && (
            <Paper sx={{ mb: 4 }}>
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Rental Rate</TableCell>
                      <TableCell>Rental Period</TableCell>
                      <TableCell>Size (Acres)</TableCell>
                      <TableCell>Renter</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRentals.map((rental) => (
                      <TableRow key={rental.id} hover>
                        <TableCell>{rental.farm?.location || "N/A"}</TableCell>
                        <TableCell>{rental.rental_rate || "N/A"} Tshs/month</TableCell>
                        <TableCell>{rental.rental_period || "N/A"}</TableCell>
                        <TableCell>{rental.farm?.size || "N/A"}</TableCell>
                        <TableCell>{rental.farm?.user || "N/A"}</TableCell>
                        <TableCell>{rental.start_date || "N/A"}</TableCell>
                        <TableCell>{rental.end_date || "N/A"}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditOpen(rental)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteOpen(rental.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayedRentals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No confirmed farm rentals found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRentals.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}

          {/* Cards View */}
          {!loading && activeView === "cards" && (
            <>
              <Grid container spacing={3}>
                {displayedRentals.map((rental) => (
                  <Grid item xs={12} md={6} lg={4} key={rental.id}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2
                          }}
                        >
                          <Typography variant="h6">
                            {rental.farm?.name || "Farm Rental"}
                          </Typography>
                          <Chip 
                            label="Confirmed" 
                            color="success" 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Location:</strong> {rental.farm?.location || "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Size:</strong> {rental.farm?.size || "N/A"} acres
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Buyer:</strong> {rental.farm?.user || "N/A"}
                          </Typography>
                        </Box>

                        <Box display="flex" gap={2}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditOpen(rental)}
                            startIcon={<EditIcon />}
                            fullWidth
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteOpen(rental.id)}
                            startIcon={<DeleteIcon />}
                            fullWidth
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {displayedRentals.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body1" color="text.secondary">
                        No confirmed farm purchase found
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              {/* Pagination for Cards View */}
              {filteredRentals.length > rowsPerPage && (
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <TablePagination
                    component="div"
                    count={filteredRentals.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </Box>
              )}
            </>
          )}

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
            <DialogTitle>
              Edit Rental Details
              <IconButton
                aria-label="close"
                onClick={handleEditClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Rental Rate (Tshs/month)"
                    name="rental_rate"
                    value={editFormData.rental_rate}
                    onChange={handleEditInputChange}
                    fullWidth
                    margin="normal"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="rental-period-label">Rental Period</InputLabel>
                    <Select
                      labelId="rental-period-label"
                      name="rental_period"
                      value={editFormData.rental_period}
                      onChange={handleEditInputChange}
                      label="Rental Period"
                    >
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Seasonal">Seasonal</MenuItem>
                      <MenuItem value="Annual">Annual</MenuItem>
                      <MenuItem value="Short-term">Short-term</MenuItem>
                      <MenuItem value="Long-term">Long-term</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    name="start_date"
                    value={editFormData.start_date}
                    onChange={handleEditInputChange}
                    fullWidth
                    margin="normal"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Date"
                    name="end_date"
                    value={editFormData.end_date}
                    onChange={handleEditInputChange}
                    fullWidth
                    margin="normal"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} color="inherit">
                Cancel
              </Button>
              <Button 
                onClick={handleEditSubmit} 
                color="primary" 
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">
              Confirm Deletion
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this purchase record? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteClose} color="inherit">
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error" 
                variant="contained"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default FarmRentals;
            