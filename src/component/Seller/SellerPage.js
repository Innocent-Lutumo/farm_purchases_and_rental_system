import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  CardActionArea,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ShoppingBag as PurchasesIcon,
  Home as RentsIcon,
  CloudUpload as UploadIcon,
  CheckCircle as AcceptedIcon,
  AddCircle as UploadNewIcon,
  Refresh as RefreshIcon,
  Lightbulb,
  Image as ImageIcon,
  ChevronRight,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import SellerAppBar from "./SellerAppBar";
import SellerDrawer from "./SellerDrawer";

// Theme creation
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2e7d32" },
      secondary: { main: "#f50057" },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",  //change light to dark
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

// Styled Card Component
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 150, 0, 0.2)",
  },
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

// Menu items configuration
const menuItems = [
  {
    text: "Purchases Requests",
    icon: <PurchasesIcon />,
    path: "/Purchases",
    description: "Track all farm purchase",
  },
  {
    text: "Rental Requests",
    icon: <RentsIcon />,
    path: "/Rents",
    description: "Manage your property rentals",
  },
  {
    text: "Uploaded Farms",
    icon: <UploadIcon />,
    path: "/UploadedFarms",
    description: "View your farm listings",
  },
  {
    text: "Upload New Farm",
    icon: <UploadNewIcon />,
    path: "/UploadFarmForm",
    description: "Create a new farm listing",
  },
];

// Farm Listing Overview Card component
const FarmOverviewCard = ({ title, value, icon, color, subtitle }) => (
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
          <Typography variant="h5" fontWeight="bold" color={color}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
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

function SellerPage() {
  // State management
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // States for real-time stats
  const [totalListings, setTotalListings] = useState(0);
  const [purchaseRequests, setPurchaseRequests] = useState(0);
  const [rentalRequests, setRentalRequests] = useState(0);
  const [farmsUploaded, setFarmsUploaded] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Theme setup
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  const handleDrawerToggle = useCallback(
    () => setDrawerOpen((prev) => !prev),
    []
  );

  const handleThemeToggle = useCallback(() => setDarkMode((prev) => !prev), []);

  // Helper function to get data count from API response
  const getDataCount = (data) => {
    if (typeof data === 'number') return data;
    if (data && typeof data.count === 'number') return data.count;
    if (data && typeof data.length === 'number') return data.length;
    if (Array.isArray(data)) return data.length;
    if (data && data.results && Array.isArray(data.results)) return data.results.length;
    if (data && data.data && Array.isArray(data.data)) return data.data.length;
    return 0;
  };

  // Data Fetching Logic
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(null);

      try {
        const token = localStorage.getItem("access");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch all data in parallel
        const [
          purchaseRes,
          rentalRes,
          uploadedRes,
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/sale-transactions/", { headers }),
          fetch("http://127.0.0.1:8000/api/rent-transactions/", { headers }),
          fetch("http://127.0.0.1:8000/api/all-farms/", { headers }),
        ]);

        // Check for HTTP errors
        if (!purchaseRes.ok) {
          console.warn("Purchase requests API failed:", purchaseRes.status, purchaseRes.statusText);
        }
        if (!rentalRes.ok) {
          console.warn("Rental requests API failed:", rentalRes.status, rentalRes.statusText);
        }
        if (!uploadedRes.ok) {
          console.warn("Uploaded farms API failed:", uploadedRes.status, uploadedRes.statusText);
        }

        // Parse responses
        let purchaseData = 0, rentalData = 0, uploadedData = 0;

        try {
          if (purchaseRes.ok) {
            const data = await purchaseRes.json();
            purchaseData = getDataCount(data);
            console.log("Purchase data:", data, "Count:", purchaseData);
          }
        } catch (e) {
          console.error("Error parsing purchase data:", e);
        }

        try {
          if (rentalRes.ok) {
            const data = await rentalRes.json();
            rentalData = getDataCount(data);
            console.log("Rental data:", data, "Count:", rentalData);
          }
        } catch (e) {
          console.error("Error parsing rental data:", e);
        }

        try {
          if (uploadedRes.ok) {
            const data = await uploadedRes.json();
            uploadedData = getDataCount(data);
            console.log("Uploaded data:", data, "Count:", uploadedData);
          }
        } catch (e) {
          console.error("Error parsing uploaded data:", e);
        }

        // Update states
        setPurchaseRequests(purchaseData);
        setRentalRequests(rentalData);
        setFarmsUploaded(uploadedData);
        
        // Calculate total listings as sum of all other stats
        const total = purchaseData + rentalData + uploadedData;
        setTotalListings(total);

        console.log("Final stats:", {
          purchases: purchaseData,
          rentals: rentalData,
          uploaded: uploadedData,
          total: total
        });

      } catch (error) {
        console.error("Error fetching stats:", error);
        setStatsError(`Failed to load dashboard statistics: ${error.message}`);
        // Reset all values to 0 on error
        setPurchaseRequests(0);
        setRentalRequests(0);
        setFarmsUploaded(0);
        setTotalListings(0);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <SellerAppBar
          handleDrawerToggle={handleDrawerToggle}
          darkMode={darkMode}
          handleThemeToggle={handleThemeToggle}
          anchorEl={anchorEl}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleLogout={handleLogout}
        />

        <SellerDrawer
          drawerOpen={drawerOpen}
          drawerWidth={drawerWidth}
          theme={theme}
          handleLogout={handleLogout}
          location={location}
        />

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
              Seller Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time dashboard metrics and farm management tools
            </Typography>
          </Box>

          {/* Farm Listing Overview */}
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: "bold",
              color: "text.primary",
            }}
          >
            Farm Listing Overview
          </Typography>
          {loadingStats ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 100 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading statistics...</Typography>
            </Box>
          ) : statsError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {statsError}
              <Button 
                variant="text" 
                onClick={() => window.location.reload()} 
                sx={{ ml: 2 }}
              >
                Retry
              </Button>
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FarmOverviewCard
                  title="Total Listings"
                  value={totalListings}
                  icon={<Lightbulb color="primary" />}
                  color="primary.main"
                  subtitle="Sum of all your farm activities"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FarmOverviewCard
                  title="Purchase Requests"
                  value={purchaseRequests}
                  color="warning.main"
                  icon={<PurchasesIcon color="warning" />}
                  subtitle="Total purchase inquiries for your farms"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FarmOverviewCard
                  title="Rental Requests"
                  value={rentalRequests}
                  color="success.main"
                  icon={<RentsIcon color="success" />}
                  subtitle="Total rental requests for your farms"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FarmOverviewCard
                  title="Farms Uploaded"
                  value={farmsUploaded}
                  color="info.main"
                  icon={<UploadIcon color="info" />}
                  subtitle="All uploaded farms for sale and rent"
                />
              </Grid>
            </Grid>
          )}

          {/* Main Navigation Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Farm Management
            </Typography>

            <Grid container spacing={3}>
              {menuItems.map((item, index) => (
                <Grid item xs={12} sm={12} md={3} key={item.text}>
                  <motion.div variants={itemVariants}>
                    <StyledCard elevation={2}>
                      <CardActionArea
                        component={Link}
                        to={item.path}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            height: 8,
                            width: "100%",
                            bgcolor: theme.palette.primary.main,
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: `${theme.palette.primary.main}15`,
                                color: theme.palette.primary.main,
                                width: 56,
                                height: 56,
                                mr: 2,
                              }}
                            >
                              {item.icon}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 0.5,
                                  color: "text.primary",
                                }}
                              >
                                {item.text}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              mt: 1,
                            }}
                          >
                            <ChevronRight color="action" />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </StyledCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper
              elevation={2}
              sx={{
                borderRadius: 4,
                p: 3,
                mt: 4,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Lightbulb />
                Selling Tips
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    tip: "Use high-quality images that showcase your farm's best features",
                    icon: <ImageIcon color="primary" />,
                  },
                  {
                    tip: "Update availability status weekly to keep listings fresh",
                    icon: <RefreshIcon color="success" />,
                  },
                  {
                    tip: "Respond to inquiries within 2 hours for higher conversion rates",
                    icon: <AcceptedIcon color="warning" />,
                  },
                  {
                    tip: "Highlight sustainable farming practices to attract premium buyers",
                    icon: <Lightbulb color="secondary" />,
                  },
                ].map((tip, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 2,
                        bgcolor: "background.default",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateX(5px)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "background.paper",
                          color: "primary.main",
                        }}
                      >
                        {tip.icon}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tip.tip}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                mt: 4,
                bgcolor: "background.paper",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
              >
                🌾 Grow Your Farm Empire!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: 800 }}>
                Selling your land has never been easier or more profitable. Our
                platform connects you with qualified buyers looking for exactly
                what you have to offer.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/UploadFarmForm" style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<UploadNewIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontWeight: "bold",
                      }}
                    >
                      Upload a New Farm
                    </Button>
                  </Link>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default SellerPage;