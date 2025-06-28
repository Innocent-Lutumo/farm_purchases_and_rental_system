import React from "react";
import { Link } from "react-router-dom";
import AppFooter from "../Shared/AppFooter";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import img5 from "./images/img5.jpg";
import SellIcon from "@mui/icons-material/Sell";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const farmOptions = [
    {
      icon: <ShoppingCartIcon sx={{ fontSize: "3.75rem", color: "#4caf50" }} />,
      title: "Buy Farm",
      description: "Find the perfect farmland to purchase with ease and confidence.",
      link: "/trial",
      backgroundImage: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <HomeIcon sx={{ fontSize: "3.75rem", color: "#ff9800" }} />,
      title: "Rent Farm",
      description: "Explore rental options for profitable land utilization.",
      link: "/RentPage",
      backgroundImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <SellIcon sx={{ fontSize: "3.75rem", color: "#f44336" }} />,
      title: "Sell Farm",
      description: "Learn how to sell your farmland efficiently and profitably.",
      link: "/LoginPage",
      backgroundImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
  ];

  const farmGallery = [
    {
      url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      title: "Premium Vineyard Estate"
    },
    {
      url: img5,
      title: "Golden Sunflower Fields"
    },
    {
      url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      title: "Organic Harvest Paradise"
    },
    {
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      title: "Expansive Countryside Ranch"
    }
  ];
  
  return (
    <Box sx={{ overflowX: "hidden" }}>
      {/* Enhanced Navbar with Header */}
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar sx={{ flexDirection: "column", py: 2 }}>
          <Typography variant="h6" sx={{ alignSelf: "flex-start", mb: 1 }}>
            S/N 19
          </Typography>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
              width: "100%",
            }}
          >
            Farm Purchase and Rental System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Hero Section with Farm Background */}
      <Box
        sx={{
          height: { xs: "60vh", sm: "500px" },
          backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            sx={{
              fontWeight: "bold",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              px: isMobile ? 2 : 0,
              fontSize: { xs: "2rem", sm: "3rem" }
            }}
          >
            Your Gateway to Premium Farmland
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              maxWidth: "600px",
              margin: "auto",
              textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
              px: isMobile ? 2 : 0,
            }}
          >
            Discover, rent, buy, and sell the finest farmlands with our comprehensive farm management platform
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container sx={{ textAlign: "center", my: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        {/* About Section with Navigation Links */}
        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{
            maxWidth: "800px",
            margin: "auto",
            color: "#333",
            mb: 4,
            lineHeight: 1.8,
          }}
        >
          Welcome to our comprehensive farm management platform. Whether you're
          looking to{" "}
          <Typography
            component={Link}
            to="/trial"
            sx={{
              color: "#4caf50",
              fontWeight: "bold",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              display: "inline",
            }}
          >
            buy your dream farmland
          </Typography>
          , find{" "}
          <Typography
            component={Link}
            to="/RentPage"
            sx={{
              color: "#ff9800",
              fontWeight: "bold",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              display: "inline",
            }}
          >
            rental opportunities
          </Typography>{" "}
          for profitable agriculture, or{" "}
          <Typography
            component={Link}
            to="/LoginPage"
            sx={{
              color: "#f44336",
              fontWeight: "bold",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              display: "inline",
            }}
          >
            sell your farmland
          </Typography>{" "}
          to the right buyer, we've got you covered.
        </Typography>

        <Typography
          variant="body1"
          sx={{ 
            maxWidth: "700px", 
            margin: "auto", 
            color: "#666", 
            mb: { xs: 3, md: 5 },
            px: { xs: 1, sm: 0 }
          }}
        >
          Our system provides detailed land information, competitive pricing,
          direct seller contacts, and precise GPS-based locations for seamless
          navigation and decision-making.
        </Typography>

        {/* Service Cards with Background Images */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            justifyContent: "center",
            flexWrap: "wrap",
            mt: 4,
            mb: 6,
          }}
        >
          {farmOptions.map((option, index) => (
            <Card
              key={index}
              component={Link}
              to={option.link}
              sx={{
                width: { xs: "100%", sm: 250 },
                height: { xs: 180, sm: 250 },
                borderRadius: 4,
                boxShadow: 3,
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                transition: "all 0.3s ease-in-out",
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${option.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{
                textAlign: "center",
                p: 3,
                color: "white",
                position: "relative",
                zIndex: 1,
                width: "100%",
              }}>
                <Box sx={{ mb: 2 }}>
                  {React.cloneElement(option.icon, { sx: { fontSize: { xs: "3rem", sm: "3.75rem" }, color: "white" } })}
                </Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ fontWeight: "bold", color: "white", mb: 1 }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}
                >
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Farm Gallery Section */}
        <Box sx={{ my: { xs: 4, md: 8 } }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: "bold",
              color: "green",
              mb: 2,
              textAlign: "center",
            }}
          >
            Featured Farmlands
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "600px",
              margin: "auto",
              color: "#666",
              mb: 4,
              textAlign: "center",
              px: { xs: 1, sm: 0 }
            }}
          >
            Explore our diverse collection of premium agricultural properties across different farming sectors
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {farmGallery.map((farm, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    minHeight: { xs: 200, sm: 250 },
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 6,
                    },
                    cursor: "pointer",
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${farm.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "flex-end",
                      p: 2,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                      }}
                    >
                      {farm.title}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action Section */}
        <Box
          sx={{
            my: { xs: 4, md: 6 },
            p: { xs: 2, md: 4 },
            backgroundImage: "linear-gradient(135deg, #4caf50, #8bc34a)",
            borderRadius: 4,
            color: "white",
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            Ready to Start Your Agricultural Journey?
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, opacity: 0.9 }}
          >
            Join thousands of satisfied farmers and investors who trust our platform for their agricultural needs
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <AppFooter />
    </Box>
  );
};

export default Home;