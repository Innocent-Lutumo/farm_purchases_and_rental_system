import React, { useState } from "react";
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
  InputAdornment,
  IconButton,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import img7 from "../images/img7.jpg";
import img8 from "../images/img8.jpg";
import img9 from "../images/img9.jpg";
import profileImage from "../images/img8.jpg";

const farms = [
  {
    id: 1,
    name: "Green Acres",
    price: "$10,000",
    size: "5 acres",
    location: "Nairobi, Kenya",
    quality: "High",
    description: "Lush farmlands for eco-friendly farming.",
    image: img9,
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
    image: img7,
    clickCount: 40,
  },
  {
    id: 3,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
];

const Trial = () => {
  const [search, setSearch] = useState(""); // Move useState inside the component

  // Filter farms based on the search input
  const filteredFarms = farms.filter((farm) =>
    farm.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header Section */}
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Farm Finder
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Search Bar */}
      <Container sx={{ my: 3, marginBottom: 1 }}>
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search Farms by Location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Container>

      <Container sx={{ my: 4, flex: 1, marginLeft: 0 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Profile and Navigation */}
          <Box
            sx={{
              width: "250px",
              backgroundColor: "#f4f4f4",
              boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
              padding: 3,
              borderRadius: 2,
              marginRight: 0,
            }}
          >
            <Box
              sx={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                marginBottom: 2,
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "grayscale(50%)",
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", marginBottom: 3 }}
            >
              John Doe
            </Typography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              component={Link}
              to="/"
              sx={{
                marginBottom: 2,
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "20px",
              }}
            >
              Home
            </Button>
            <Button
              variant="outlined"
              color="success"
              fullWidth
              component={Link}
              to="/history"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "20px",
              }}
            >
              History
            </Button>
          </Box>

          {/* Farms Display */}
          <Box sx={{ flex: 1, marginLeft: "10px", marginRight: "10px" }}>
            <Typography
              variant="h5"
              color="green"
              textAlign="center"
              fontWeight={600}
              gutterBottom
            >
              Featured Farmlands
            </Typography>
            <Typography textAlign="center" sx={{ mb: 2 }}>
              Explore some of the best farmlands available for sale or rent.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 6,
              }}
            >
              {filteredFarms.map((farm) => (
                <Card
                  key={farm.id}
                  sx={{
                    boxShadow: 5,
                    borderRadius: 3,
                    textDecoration: "none",
                    overflow: "hidden",
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  component={Link}
                  to={`/purchase/${farm.id}`}
                >
                  <Box sx={{ display: "flex" }}>
                    <CardMedia
                      component="img"
                      image={farm.image}
                      alt={farm.name}
                      sx={{
                        width: "40%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                    <CardContent
                      sx={{ width: "60%", padding: 2, fontSize: "14px" }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {farm.name}
                      </Typography>
                      <Typography>
                        <strong>Price:</strong> {farm.price}
                      </Typography>
                      <Typography>
                        <strong>Size:</strong> {farm.size}
                      </Typography>
                      <Typography>
                        <strong>Quality:</strong> {farm.quality}
                      </Typography>
                      <Typography fontSize="12px">
                        <strong fontSize="18px">Location:</strong>{" "}
                        {farm.location} <LocationOnIcon />
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        component={Link}
                        to="/"
                        sx={{ marginTop: 2, fontSize: 14 }}
                      >
                        click to purchase
                      </Button>
                    </CardContent>
                  </Box>
                  <Typography
                    sx={{
                      padding: 2,
                      backgroundColor: "#d8f9d8",
                      borderRadius: 2,
                    }}
                  >
                    {farm.description}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      color: "#333",
                      textAlign: "left",
                      marginLeft: 2,
                      mt: 1,
                    }}
                  >
                    {farm.clickCount} Orders
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* footer section */}
      <Box
        sx={{
          backgroundColor: "#d8f9d8",
          textAlign: "center",
          padding: 2,
          mt: "auto",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <IconButton
            href="https://www.instagram.com"
            target="_blank"
            sx={{ color: "#E4405F", mx: 1 }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://www.twitter.com"
            target="_blank"
            sx={{ color: "#1DA1F2", mx: 1 }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.facebook.com"
            target="_blank"
            sx={{ color: "#1877F2", mx: 1 }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.linkedin.com"
            target="_blank"
            sx={{ color: "#0077B5", mx: 1 }}
          >
            <LinkedInIcon />
          </IconButton>
        </Box>
        <Typography fontSize={12}>
          Created by <strong>S/N 19</strong>
        </Typography>
        <Typography fontSize={12}>
          Contacts: 2557 475 700 004 <br /> Email: serialnumber19@gmail.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Trial;
