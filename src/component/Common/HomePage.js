import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppFooter from "../Shared/AppFooter";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Fade,
  Fab,
  Zoom,
  CircularProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Home as HomeIcon,
  Sell as SellIcon,
  Dashboard as DashboardIcon,
  Agriculture as AgricultureIcon,
  // Info as InfoIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [currentFarmIndex, setCurrentFarmIndex] = useState(0);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAnimationTrigger(true);

    const fetchFarms = async () => {
      try {
        setLoading(true);
        const [salesResponse, rentResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/farmsale/validated/"),
          fetch("http://127.0.0.1:8000/api/farmsrent/validated/"),
        ]);

        if (!salesResponse.ok || !rentResponse.ok) {
          throw new Error("Failed to fetch farm data");
        }

        const [salesData, rentData] = await Promise.all([
          salesResponse.json(),
          rentResponse.json(),
        ]);

        const combinedFarms = [
          ...salesData.map((farm) => ({
            ...farm,
            type: "sale",
            displayPrice: farm.price
              ? `$${parseFloat(farm.price).toLocaleString()}`
              : "Price not available",
            size: farm.size ? `${farm.size} acres` : "Size not available",
            mainImage:
              farm.images?.[0]?.image ||
              "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
          })),
          ...rentData.map((farm) => ({
            ...farm,
            type: "rent",
            displayPrice: farm.price
              ? `$${parseFloat(farm.price).toLocaleString()}/month`
              : "Rent not available",
            size: farm.size ? `${farm.size} acres` : "Size not available",
            mainImage:
              farm.images?.[0]?.image ||
              "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
          })),
        ];

        setFarms(combinedFarms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching farm data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFarms();

    const interval = setInterval(() => {
      if (farms.length > 0) {
        setCurrentFarmIndex((prevIndex) =>
          prevIndex === farms.length - 1 ? 0 : prevIndex + 1
        );
      }
     }, 5000);   // time interval image change

    return () => clearInterval(interval);
  }, [farms.length]);

  const handleNext = () => {
    if (farms.length > 0) {
      setCurrentFarmIndex((prevIndex) =>
        prevIndex === farms.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrev = () => {
    if (farms.length > 0) {
      setCurrentFarmIndex((prevIndex) =>
        prevIndex === 0 ? farms.length - 1 : prevIndex - 1
      );
    }
  };

  const navigationItems = [
    { text: "Buy Farm", icon: <ShoppingCartIcon />, link: "/trial" },
    { text: "Rent Farm", icon: <HomeIcon />, link: "/RentPage" },
    { text: "Sell Farm", icon: <SellIcon />, link: "/LoginPage" },
    { text: "Admin Dashboard", icon: <DashboardIcon />, link: "/Dashboard" },
    // { text: "About", icon: <InfoIcon />, link: "/about" },
  ];

  const farmOptions = [
    {
      icon: <ShoppingCartIcon sx={{ fontSize: "1.5rem" }} />,
      title: "Buy Farmland",
      description:
        "Discover premium agricultural properties with verified ownership.",
      link: "/trial",
    },
    {
      icon: <HomeIcon sx={{ fontSize: "1.5rem" }} />,
      title: "Rent Farmland",
      description: "Access fertile lands with flexible rental terms.",
      link: "/RentPage",
    },
    {
      icon: <SellIcon sx={{ fontSize: "1.5rem" }} />,
      title: "Sell Farmland",
      description: "Connect with verified buyers for your property.",
      link: "/LoginPage",
    },
  ];

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const FeaturedFarmCard = () => (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        position: "relative",
        minHeight: loading ? "400px" : "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: loading ? "center" : "flex-start",
        height: "100%",
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress color="success" />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">Error loading farms: {error}</Typography>
        </Box>
      ) : farms.length > 0 ? (
        <>
          <Box
            sx={{
              height: "250px",
              backgroundImage: `url(http://127.0.0.1:8000${farms[currentFarmIndex]?.mainImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Box sx={{ p: 3, bgcolor: "background.paper", flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#2e7d32",
                mb: 2,
                textAlign: "center",
              }}
            >
              Featured Farm
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                {farms[currentFarmIndex]?.farm_number || "Farm"}
              </Typography>
              <Chip
                label={
                  farms[currentFarmIndex]?.type === "sale"
                    ? "For Sale"
                    : "For Rent"
                }
                color={
                  farms[currentFarmIndex]?.type === "sale"
                    ? "success"
                    : "success"
                }
                size="small"
              />
            </Box>

            {/* Grid Layout for Farm Details */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "#666" }}>
                <strong>Location:</strong>{" "}
                {farms[currentFarmIndex]?.location || "Location not specified"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                <strong>Size:</strong>{" "}
                {farms[currentFarmIndex]?.size || "Size not specified"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                <strong>Soil Quality:</strong>{" "}
                {farms[currentFarmIndex]?.quality || "Not specified"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#4caf50",
                  alignSelf: "center",
                  justifySelf: "end",
                }}
              >
                {farms[currentFarmIndex]?.price || "Price not available"} TZS 
              </Typography>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>No farms available</Typography>
        </Box>
      )}

      {farms.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 10,
              top: "40%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 10,
              top: "40%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Card>
  );

  const ServicesCard = () => (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#2e7d32",
            mb: 3,
            textAlign: "center",
          }}
        >
          Our Services
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {farmOptions.map((option, index) => (
            <Card
              key={index}
              component={Link}
              to={option.link}
              sx={{
                p: 2,
                textAlign: "center",
                textDecoration: "none",
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                backgroundColor: "white",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  backgroundColor: "#f8f9fa",
                },
              }}
            >
              <Box sx={{ color: "#4caf50", mb: 1 }}>{option.icon}</Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1, fontSize: "0.9rem" }}
              >
                {option.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  fontSize: "0.8rem",
                  lineHeight: 1.3,
                }}
              >
                {option.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: "#fafafa" }}>
      {/* Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{ background: "linear-gradient(135deg, #2e7d32, #4caf50)" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AgricultureIcon sx={{ fontSize: "2rem" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              S/N19 Farm Finder
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            background:
              "linear-gradient(180deg,rgb(10, 127, 64) 0%,rgb(46, 107, 69) 100%)",
            color: "white",
            borderRadius: "20px 20px 20px 20px",
            marginLeft: 1,
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Navigation
          </Typography>
          <IconButton onClick={toggleDrawer(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ px: 2 }}>
          {navigationItems.map((item, index) => (
            <ListItem
              key={index}
              component={Link}
              to={item.link}
              onClick={toggleDrawer(false)}
              sx={{
                borderRadius: 2,
                mb: 1,
                color: "white",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          height: "90vh",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Container>
          <Fade in={animationTrigger} timeout={1000}>
            <Box>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                Your Gateway to Premium Farmland
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: "600px",
                  margin: "auto",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                  opacity: 0.9,
                }}
              >
                Discover, rent, buy, and sell the finest farmlands with our
                platform.
              </Typography>
            </Box>
          </Fade>

          {/* Admin Panel Icon */}
          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              right: 40,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Zoom in={animationTrigger} timeout={2000}>
              <Fab
                color="success"
                component={Link}
                to="/Dashboard"
                sx={{
                  background:
                    "linear-gradient(45deg,rgb(5, 110, 12),rgb(10, 117, 24))",
                  "&:hover": { transform: "scale(1.1)" },
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                <Tooltip title="Admin Dashboard" arrow>
                  <DashboardIcon />
                </Tooltip>
              </Fab>
            </Zoom>
          </Box>
        </Container>
      </Box>

      {/* Featured Farms & Services Section */}
      <Container sx={{ py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 4,
            color: "#2e7d32",
          }}
        >
          Featured Farms & Our Services
        </Typography>

        <Grid container spacing={4} alignItems="stretch">
          {/* Featured Farm Card - Takes up more space */}
          <Grid item xs={12} md={7}>
            <Fade in={animationTrigger} timeout={1500}>
              <Box sx={{ height: "100%" }}>
                <FeaturedFarmCard />
              </Box>
            </Fade>
          </Grid>

          {/* Services Card - Grouped together in one card */}
          <Grid item xs={12} md={5}>
            <Fade in={animationTrigger} timeout={1800}>
              <Box sx={{ height: "100%" }}>
                <ServicesCard />
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      <AppFooter />
    </Box>
  );
};

export default Home;
