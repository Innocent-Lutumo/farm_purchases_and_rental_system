import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Button,
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
  ImageList,
  ImageListItem,
  Modal,
  CardMedia,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

// Icon imports consolidated
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Spa as FarmIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import axios from "axios";

// Theme creation moved to separate function
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

// Component for status chip to reduce duplication
const StatusChip = ({ farm }) => {
  const getStatusColor = (farm) => {
    if (farm.is_validated) return "success";
    if (farm.is_rejected) return "error";
    return "warning";
  };

  const getStatusIcon = (farm) => {
    if (farm.is_validated) return <CheckCircleIcon fontSize="small" />;
    if (farm.is_rejected) return <CancelIcon fontSize="small" />;
    return <HourglassEmptyIcon fontSize="small" />;
  };

  const getStatusText = (farm) => {
    if (farm.is_validated) return "Approved";
    if (farm.is_rejected) return "Rejected";
    return "Pending";
  };

  return (
    <Chip
      icon={getStatusIcon(farm)}
      label={getStatusText(farm)}
      color={getStatusColor(farm)}
      size="small"
      variant="outlined"
    />
  );
};

// Image gallery component
const ImageGallery = ({ images, baseUrl = "http://127.0.0.1:8000" }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}
      >
        <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
        <Typography variant="body2">No images</Typography>
      </Box>
    );
  }

  return (
    <>
      <ImageList sx={{ height: 120 }} cols={3} rowHeight={100} gap={8}>
        {images.map((img, index) => (
          <ImageListItem
            key={index}
            sx={{
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: 1,
              "&:hover": {
                opacity: 0.8,
                transition: "0.3s",
              },
            }}
            onClick={() => handleImageClick(`${baseUrl}${img.image}`)}
          >
            <img
              src={`${baseUrl}${img.image}`}
              alt={`Farm ${index + 1}`}
              loading="lazy"
              style={{ objectFit: "cover", height: "100%" }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="image-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
          <IconButton
            sx={{
              position: "absolute",
              top: -28,
              right: -28,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.7)",
              },
            }}
            onClick={handleCloseModal}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={selectedImage}
            alt="Enlarged farm view"
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              border: "2px solid white",
              borderRadius: "4px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

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

function AdminDashboard() {
  // State management
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeView, setActiveView] = useState("table");
  const [loading, setLoading] = useState(false);
  const [expandedFarm, setExpandedFarm] = useState(null);

  // Menu items configuration
  const menuItems = useMemo(
    () => [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/Dashboard" },
      { text: "Sellers", icon: <PeopleIcon />, path: "/SellerList" },
      { text: "Farm Rentals", icon: <CalendarIcon />, path: "/FarmRentals" },
      { text: "Farm Sales", icon: <FarmIcon />, path: "/FarmSales" },
    ],
    []
  );

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/AdminLogin");
  };

  // Theme setup
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  // Calculate statistics from farm data
  const stats = useMemo(
    () => ({
      approved: farms.filter((farm) => farm.is_validated).length,
      pending: farms.filter((farm) => !farm.is_validated && !farm.is_rejected)
        .length,
      rejected: farms.filter((farm) => farm.is_rejected).length,
      total: farms.length,
    }),
    [farms]
  );

  // Load saved feedback for each farm when farms data is fetched
  const loadFeedback = useCallback((farmsList) => {
    const newFeedbackMap = {};
    farmsList.forEach(farm => {
      // Use admin_feedback from the server if it exists
      if (farm.admin_feedback) {
        newFeedbackMap[`${farm.farm_type}-${farm.id}`] = farm.admin_feedback;
      }
    });
    setFeedbackMap(newFeedbackMap);
  }, []);

  // API handling functions
  const fetchFarms = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://127.0.0.1:8000/api/farmsale/"),
      axios.get("http://127.0.0.1:8000/api/farmsrent/"),
    ])
      .then(([saleRes, rentRes]) => {
        // Combine and process farm data
        const combinedFarms = [
          ...saleRes.data.map((farm) => ({ ...farm, farm_type: "Sale" })),
          ...rentRes.data.map((farm) => ({ ...farm, farm_type: "Rent" })),
        ];
        setFarms(combinedFarms);
        // Load feedback for farms
        loadFeedback(combinedFarms);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching farms:", err);
        setLoading(false);
      });
  }, [loadFeedback]);

  // Generate unique key for farm feedback
  const getFarmFeedbackKey = useCallback((farm) => {
    return `${farm.farm_type}-${farm.id}`;
  }, []);

  // Get feedback for specific farm
  const getFeedback = useCallback((farm) => {
    const key = getFarmFeedbackKey(farm);
    return feedbackMap[key] || "";
  }, [feedbackMap, getFarmFeedbackKey]);

  const handleValidate = useCallback(
    (farm, status) => {
      setLoading(true);
      
      // Get farm ID and type
      const id = farm.id;
      const farmType = farm.farm_type;
      
      // Get current feedback for this specific farm
      const key = getFarmFeedbackKey(farm);
      const currentFeedback = feedbackMap[key] || "";
      
      const payload = {
        is_validated: status === "approve",
        is_rejected: status === "reject",
        admin_feedback: currentFeedback,
      };

      console.log("Sending payload:", payload);

      axios
        .patch(
          `http://127.0.0.1:8000/api/${
            farmType === "Sale" ? "farmsale" : "farmsrent"
          }/${id}/`,
          payload
        )
        .then((response) => {
          console.log("API response:", response.data);

          // Update only the specific farm that was changed
          setFarms((prevFarms) =>
            prevFarms.map((farmItem) =>
              farmItem.id === id && farmItem.farm_type === farmType
                ? {
                    ...farmItem,
                    is_validated: payload.is_validated,
                    is_rejected: payload.is_rejected,
                    admin_feedback: payload.admin_feedback,
                  }
                : farmItem
            )
          );
        })
        .catch((err) => {
          console.error("Error validating farm:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [feedbackMap, getFarmFeedbackKey]
  );

  // Event handlers
  const handleFeedbackChange = useCallback((farm, value) => {
    const key = getFarmFeedbackKey(farm);
    setFeedbackMap((prev) => ({ ...prev, [key]: value }));
  }, [getFarmFeedbackKey]);

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

  const handleExpandFarm = useCallback((farm) => {
    setExpandedFarm(farm);
  }, []);

  const handleCloseExpanded = useCallback(() => {
    setExpandedFarm(null);
  }, []);

  // Filter farms based on criteria
  const filterFarms = useCallback(() => {
    if (!farms.length) return;

    const filtered = farms.filter((farm) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "approved" && farm.is_validated) ||
        (filter === "rejected" && farm.is_rejected) ||
        (filter === "pending" && !farm.is_validated && !farm.is_rejected);

      const searchableFields = [
        farm.location,
        farm.price?.toString(),
        farm.farm_type,
        farm.user?.toString(),
        farm.description,
        farm.quality,
      ].filter(Boolean);

      const matchesSearch =
        searchQuery === "" ||
        searchableFields.some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesFilter && matchesSearch;
    });

    setFilteredFarms(filtered);
  }, [farms, filter, searchQuery]);

  // Effects
  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  useEffect(() => {
    filterFarms();
  }, [filterFarms]);

  // Display farms for current page
  const displayedFarms = useMemo(
    () =>
      filteredFarms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredFarms, page, rowsPerPage]
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
                placeholder="Search farms..."
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
                onClick={fetchFarms}
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
                // eslint-disable-next-line no-restricted-globals
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
              Farm Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review, approve or reject submitted farms
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Farms"
                value={stats.total}
                icon={<FarmIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Approved"
                value={stats.approved}
                color="success.main"
                icon={<CheckCircleIcon color="success" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending"
                value={stats.pending}
                color="warning.main"
                icon={<HourglassEmptyIcon color="warning" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Rejected"
                value={stats.rejected}
                color="error.main"
                icon={<CancelIcon color="error" />}
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
              <Typography variant="h6">Farms</Typography>

              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {["all", "approved", "pending", "rejected"].map(
                  (filterOption) => (
                    <Chip
                      key={filterOption}
                      label={
                        filterOption.charAt(0).toUpperCase() +
                        filterOption.slice(1)
                      }
                      onClick={() => setFilter(filterOption)}
                      variant={filter === filterOption ? "filled" : "outlined"}
                      color={
                        filterOption === "approved"
                          ? "success"
                          : filterOption === "pending"
                          ? "warning"
                          : filterOption === "rejected"
                          ? "error"
                          : filter === filterOption
                          ? "primary"
                          : "default"
                      }
                    />
                  )
                )}
              </Box>

              <Box sx={{ display: { sm: "none" } }}>
                <Button
                  startIcon={<FilterListIcon />}
                  variant="outlined"
                  size="small"
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </Box>
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
                      <TableCell>Price (Tshs)</TableCell>
                      <TableCell>Size (Acres)</TableCell>
                      <TableCell>Farm Number</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Images</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedFarms.map((farm) => (
                      <TableRow
                        key={`${farm.farm_type}-${farm.id}`}
                        hover
                        onClick={() => handleExpandFarm(farm)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{farm.location}</TableCell>
                        <TableCell>{farm.price}</TableCell>
                        <TableCell>{farm.size}</TableCell>
                        <TableCell>{farm.farm_number}</TableCell>
                        <TableCell>{farm.farm_type}</TableCell>
                        <TableCell>
                          {farm.images && farm.images.length > 0 ? (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <img
                                src={`http://127.0.0.1:8000${farm.images[0].image}`}
                                alt="Farm thumbnail"
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginRight: "8px",
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {farm.images.length} image
                                {farm.images.length > 1 ? "s" : ""}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              No images
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusChip farm={farm} />
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Approve">
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleValidate(farm, "approve");
                                  }}
                                  disabled={farm.is_validated}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleValidate(farm, "reject");
                                  }}
                                  disabled={farm.is_rejected}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayedFarms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No farms found matching your criteria
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
                count={filteredFarms.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}

          {/* Cards View */}
{!loading && activeView === "cards" && (
  <Grid container spacing={3}>
    {displayedFarms.map((farm) => (
      <Grid item xs={12} sm={6} md={4} key={`${farm.farm_type}-${farm.id}`}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              transition: 'all 0.2s'
            }
          }}
          onClick={() => handleExpandFarm(farm)}
        >
          {farm.images && farm.images.length > 0 ? (
            <CardMedia
              component="img"
              height="160"
              image={`http://127.0.0.1:8000${farm.images[0].image}`}
              alt="Farm image"
            />
          ) : (
            <Box 
              sx={{ 
                height: 160, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'action.hover' 
              }}
            >
              <ImageIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
          )}
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="div" noWrap>
                {farm.location}
              </Typography>
              <StatusChip farm={farm} />
            </Box>
            
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Farm Type
                </Typography>
                <Typography variant="body1">
                  {farm.farm_type}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Size
                </Typography>
                <Typography variant="body1">
                  {farm.size} acres
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {farm.price} Tshs
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Farm #
                </Typography>
                <Typography variant="body1">
                  {farm.farm_number}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleValidate(farm, "approve");
                }}
                disabled={farm.is_validated}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<CancelIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleValidate(farm, "reject");
                }}
                disabled={farm.is_rejected}
              >
                Reject
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
    
    {displayedFarms.length === 0 && (
      <Grid item xs={12}>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No farms found matching your criteria
          </Typography>
        </Box>
      </Grid>
    )}
  </Grid>
)}

{/* Expanded Farm Modal */}
<Modal
  open={expandedFarm !== null}
  onClose={handleCloseExpanded}
  aria-labelledby="farm-detail-modal"
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Paper
    sx={{
      maxWidth: 800,
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      p: 3,
      outline: 'none',
    }}
  >
    {expandedFarm && (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Farm Details
          </Typography>
          <IconButton onClick={handleCloseExpanded}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expandedFarm.location}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expandedFarm.description || 'No description provided'}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Soil Quality
            </Typography>
            <Typography variant="body1" gutterBottom>
              {expandedFarm.quality || 'Not specified'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Farm Type
                </Typography>
                <Typography variant="body1">
                  {expandedFarm.farm_type}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Size
                </Typography>
                <Typography variant="body1">
                  {expandedFarm.size} acres
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expandedFarm.price} Tshs
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Farm Number
                </Typography>
                <Typography variant="body1">
                  {expandedFarm.farm_number}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <StatusChip farm={expandedFarm} />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Seller ID
                </Typography>
                <Typography variant="body1">
                  {expandedFarm.user}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Farm Images */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Farm Images
            </Typography>
            <ImageGallery images={expandedFarm.images || []} />
          </Grid>
          
          {/* Admin Feedback */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Admin Feedback
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Enter feedback for the farm owner..."
              value={getFeedback(expandedFarm)}
              onChange={(e) => handleFeedbackChange(expandedFarm, e.target.value)}
            />
          </Grid>
          
          {/* Action Buttons */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleValidate(expandedFarm, "reject")}
                disabled={expandedFarm.is_rejected}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleValidate(expandedFarm, "approve")}
                disabled={expandedFarm.is_validated}
              >
                Approve
              </Button>
            </Box>
          </Grid>
        </Grid>
      </>
    )}
  </Paper>
</Modal>
    </Box>
  </Box>
</ThemeProvider>
);
}

export default AdminDashboard;