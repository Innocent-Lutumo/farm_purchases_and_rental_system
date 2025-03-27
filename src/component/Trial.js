import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
  Box,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";

const farms = [
  {
    id: 1,
    name: "Green Acres",
    price: "$10,000",
    size: "5 acres",
    location: "Nairobi, Kenya",
    quality: "High",
    description: "Lush farmlands for eco-friendly farming.",
    image: "/images/farm1.jpg",
    clickCount: 25,
  },
  {
    id: 2,
    name: "Golden Harvest",
    price: "$15,000",
    size: "10 acres",
    location: "Kampala, Uganda",
    quality: "Medium",
    description: "Experience farming like never before!",
    image: "/images/farm2.jpg",
    clickCount: 40,
  },
  {
    id: 3,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "Dar es Salaam, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: "/images/farm3.jpg",
    clickCount: 18,
  },
];

const Detailed = () => {
  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Farm Finder
          </Typography>
          <Button color="inherit" component={Link} to="/LoginPage">
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Featured Farmlands */}
      <Container sx={{ my: 4 }}>
        <Typography variant="h5" color="green" textAlign="center" gutterBottom>
          Featured Farmlands
        </Typography>
        <Typography textAlign="center" sx={{ mb: 2 }}>
          Explore some of the best farmlands available for sale or rent.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {farms.map((farm) => (
            <Card
              key={farm.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)" },
              }}
              component={Link}
              to={`/purchase/${farm.id}`} // Link to another page
            >
              {/* "Click to Purchase" Label */}
              <Typography
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundColor: "rgba(0, 128, 0, 0.8)",
                  color: "#fff",
                  padding: "5px 10px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                Click to Purchase
              </Typography>

              {/* Farm Image */}
              <CardMedia
                component="img"
                image={farm.image}
                alt={farm.name}
                sx={{
                  width: "40%",
                  float: "left",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Farm Details */}
              <CardContent
                sx={{
                  width: "60%",
                  float: "right",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {farm.name}
                </Typography>
                <Typography>Price: {farm.price}</Typography>
                <Typography>Size: {farm.size}</Typography>
                <Typography>
                  Location: {farm.location}{" "}
                  <IconButton
                    href={`https://www.google.com/maps/search/?api=1&query=${farm.location}`}
                    target="_blank"
                    sx={{ padding: 0, marginLeft: 1 }}
                  >
                    <MapIcon color="primary" />
                  </IconButton>
                </Typography>
                <Typography>Quality: {farm.quality}</Typography>
              </CardContent>

              {/* Farm Description */}
              <Box
                sx={{
                  clear: "both",
                  padding: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography>{farm.description}</Typography>
              </Box>

              {/* Click Count */}
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "#fff",
                  padding: "5px 10px",
                  fontSize: "0.8rem",
                }}
              >
                Clicks: {farm.clickCount}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Detailed;
