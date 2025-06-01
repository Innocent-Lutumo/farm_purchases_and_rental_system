import React from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Home = () => {
  const farmOptions = [
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 60, color: "#4caf50" }} />,
      title: "Buy Farm",
      description: "Find the perfect farmland to purchase with ease and confidence.",
      link: "/trial"
    },
    {
      icon: <HomeIcon sx={{ fontSize: 60, color: "#ff9800" }} />,
      title: "Rent Farm",
      description: "Explore rental options for profitable land utilization.",
      link: "/RentPage"
    },
    {
      icon: <SellIcon sx={{ fontSize: 60, color: "#f44336" }} />,
      title: "Sell Farm",
      description: "Learn how to sell your farmland efficiently and profitably.",
      link: "/LoginPage"
    },
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
              width: "100%"
            }}
          >
            Farm Purchase and Rental System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ textAlign: "center", my: 6 }}>
        {/* About Section with Navigation Links */}
        <Typography
          variant="h6"
          sx={{ maxWidth: "800px", margin: "auto", color: "#333", mb: 4, lineHeight: 1.8 }}
        >
          Welcome to our comprehensive farm management platform. Whether you're looking to{" "}
          <Typography 
            component={Link} 
            to="/trial"
            sx={{ 
              color: "#4caf50", 
              fontWeight: "bold",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" }
            }}
          >
            buy your dream farmland
          </Typography>, 
          find{" "}
          <Typography 
            component={Link} 
            to="/RentPage"
            sx={{ 
              color: "#ff9800", 
              fontWeight: "bold",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" }
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
              "&:hover": { textDecoration: "underline" }
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
          Our system provides detailed land information, competitive pricing, direct seller contacts, 
          and precise Google Map locations for seamless navigation and decision-making.
        </Typography>

        {/* Service Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            justifyContent: "center",
            flexWrap: "wrap",
            mt: 4
          }}
        >
          {farmOptions.map((option, index) => (
            <Card
              key={index}
              component={Link}
              to={option.link}
              sx={{
                width: 280,
                height: 200,
                borderRadius: 4,
                boxShadow: 3,
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s ease-in-out",
                "&:hover": { 
                  transform: "translateY(-8px)", 
                  boxShadow: 6,
                  backgroundColor: "#f8f9fa"
                },
                cursor: "pointer",
                backgroundColor: "white"
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {option.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#333", mb: 1 }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#666", lineHeight: 1.5 }}
                >
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;