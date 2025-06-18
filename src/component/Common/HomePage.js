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
} from "@mui/material";
import img5 from "./images/img5.jpg";
import SellIcon from "@mui/icons-material/Sell";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";


const Home = () => {
  const farmOptions = [
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 60, color: "#4caf50" }} />,
      title: "Buy Farm",
      description:
        "Find the perfect farmland to purchase with ease and confidence.",
      link: "/trial",
      backgroundImage: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <HomeIcon sx={{ fontSize: 60, color: "#ff9800" }} />,
      title: "Rent Farm",
      description: "Explore rental options for profitable land utilization.",
      link: "/RentPage",
      backgroundImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <SellIcon sx={{ fontSize: 60, color: "#f44336" }} />,
      title: "Sell Farm",
      description:
        "Learn how to sell your farmland efficiently and profitably.",
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
    <Box>
      {/* Enhanced Navbar with Header */}
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar sx={{ flexDirection: "column", py: 2 }}>
          <Typography variant="h6" sx={{ alignSelf: "flex-start", mb: 1 }}>
            S/N 19
          </Typography>
          <Typography
            variant="h4"
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
          height: "500px",
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
            variant="h2"
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
            }}
          >
            Discover, rent, buy, and sell the finest farmlands with our comprehensive farm management platform
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container sx={{ textAlign: "center", my: 6 }}>
        {/* About Section with Navigation Links */}
        <Typography
          variant="h6"
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
            }}
          >
            sell your farmland
          </Typography>{" "}
          to the right buyer, we've got you covered.
        </Typography>

        <Typography
          variant="body1"
          sx={{ maxWidth: "700px", margin: "auto", color: "#666", mb: 5 }}
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
                width: 280,
                height: 300,
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
              }}>
                <Box sx={{ mb: 2 }}>
                  {React.cloneElement(option.icon, { sx: { fontSize: 60, color: "white" } })}
                </Box>
                <Typography
                  variant="h6"
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

        {/* --- */}

        {/* Farm Gallery Section */}
        <Box sx={{ my: 8 }}>
          <Typography
            variant="h4"
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
            }}
          >
            Explore our diverse collection of premium agricultural properties across different farming sectors
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {farmGallery.map((farm, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    // Removed fixed height to allow content to dictate height
                    minHeight: 250, // Ensures a minimum height
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 6,
                    },
                    cursor: "pointer",
                    display: 'flex', // Added flex display
                    flexDirection: 'column', // Stack content vertically
                  }}
                >
                  <Box
                    sx={{
                      flexGrow: 1, // Allows this box to take up available space
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${farm.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "flex-end",
                      p: 2,
                      width: '100%', // Ensure the image box takes full width
                    }}
                  >
                    <Typography
                      variant="h6"
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

        {/* --- */}

        {/* Call to Action Section */}
        <Box
          sx={{
            my: 6,
            p: 4,
            backgroundImage: "linear-gradient(135deg, #4caf50, #8bc34a)",
            borderRadius: 4,
            color: "white",
          }}
        >
          <Typography
            variant="h5"
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