import React, { useEffect, useState } from "react";
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
  TextField,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import { Link } from "react-router-dom";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import img5 from "../images/img5.jpg";
import img6 from "../images/img6.jpg";
import img7 from "../images/img7.jpg";
import img8 from "../images/img8.jpg";
import img9 from "../images/img9.jpg";
import RegistrationDialog from "./Dialog";

const advertisements = [
  {
    image: img7,
    title: "Green Acres",
    description: "Lush farmlands for eco-friendly farming.",
  },
  {
    image: img9,
    title: "Golden Harvest",
    description: "Experience farming like never before!",
  },
  {
    image: img8,
    title: "Valley Farms",
    description: "Ideal for organic and sustainable produce.",
  },
  {
    image: img5,
    title: "Sunset Meadows",
    description: "Beautiful farmlands with amazing sunsets.",
  },
  {
    image: img6,
    title: "Riverside Pastures",
    description: "Farms along the river for serene agriculture.",
  },
];

const Purchases = () => {
  const [farms, setFarms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get("/api/farms/");
        setFarms(response.data);
      } catch (error) {
        console.error("Error fetching farm data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const handleCardClick = () => {
    setDialogOpen(true); // Open the dialog when a card is clicked
  };

  const handleDialogClose = () => {
    setDialogOpen(false); // Close the dialog
  };

  const filteredFarms = farms.filter((farm) =>
    farm.location.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search Bar */}
      <Container sx={{ my: 3 }}>
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

      {/* Advertisement Carousel */}
      <Container sx={{ overflow: "hidden", my: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            animation: "scroll 20s linear infinite",
            height: "250px",
            "@keyframes scroll": {
              from: { transform: "translateX(100%)" },
              to: { transform: "translateX(-100%)" },
            },
          }}
        >
          {advertisements.map((ad, index) => (
            <Box
              key={index}
              sx={{
                minWidth: "350px",
                boxShadow: 4,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="img"
                height="150"
                image={ad.image}
                alt={ad.title}
                sx={{ width: "100%" }}
              />
              <Box sx={{ p: 2, backgroundColor: "#f1f8e9" }}>
                <Typography variant="h6" color="green" fontWeight="bold">
                  {ad.title}
                </Typography>
                <Typography>{ad.description}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Featured Farmlands */}
      <Container sx={{ my: 4 }}>
        <Typography variant="h5" color="green" fontWeight={600} textAlign="center" gutterBottom>
          Featured Farmlands
        </Typography>
        <Typography textAlign="center" sx={{ mb: 2 }}>
        Below are the available farmlands for purchase. Explore and find your ideal property
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress color="success" />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {filteredFarms.length > 0 ? (
              filteredFarms.map((farm, index) => (
                <Card
                  key={index}
                  sx={{
                    width: 300,
                    boxShadow: 3,
                    borderRadius: 2,
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  onClick={handleCardClick} // Trigger dialog on card click
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={farm.image || "/fallback.jpg"} // Use fallback image if farm.image is undefined
                    alt={`farm${index + 1}`}
                  />
                  <CardContent>
                    <Typography variant="h6">{farm.name}</Typography>
                    <Typography>Location: {farm.location}</Typography>
                    <Typography>Size: {farm.size}</Typography>
                    <Typography>Price: {farm.price}</Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography>No farms found for "{search}"</Typography>
            )}
          </Box>
        )}
      </Container>

      {/* Dialog Component */}
      <RegistrationDialog open={dialogOpen} onClose={handleDialogClose} />

      {/* Footer */}
      <Box sx={{ textAlign: "center", p: 2, bgcolor: "#d8f9d8", mt: 4 }}>
        {/* Social Media Icons */}
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
        {/* Footer contact information */}
        <Typography fontSize={10}>
          Created by <strong>S/N 19</strong>
        </Typography>
        <Typography fontSize={10}>
          Contacts: 2557 475 700 004 <br /> Email: serialnumber19@gmail.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Purchases;
