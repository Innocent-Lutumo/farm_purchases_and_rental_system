import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Box,
  IconButton,
  TextField,
  CircularProgress,
  InputAdornment,
  Popover,
  List,
  Button,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
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
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;

  const handleProfileIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

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
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const filteredFarms = farms.filter((farm) =>
    farm.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Appbar */}
      <AppBar position="static" sx={{ background: "green", height: "80px" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Farm Finder</Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              Find your ideal farmland for purchase.
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleProfileIconClick}>
            <AccountCircleIcon sx={{ fontSize: "2.5rem" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Popover for profile menu */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box
          sx={{
            width: 150,
            padding: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: 2,
          }}
        >
          <List sx={{ padding: 0 }}>
            <ListItem button component={Link} to="/Page">
              <ListItemText primary="My profile" />
            </ListItem>
            <ListItem button component={Link} to="/trial">
              <ListItemText primary="Home" />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/PurchasesPage">
              <ListItemText primary="History" />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/" sx={{ color: "red" }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Popover>

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
        <Typography
          variant="h5"
          color="green"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          Featured Farmlands
        </Typography>
        <Typography textAlign="center" sx={{ mb: 2 }}>
          Below are the available farmlands for purchase. Explore and find your
          ideal property
        </Typography>

        {/* Search Bar */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 4 }}
        >
          <TextField
            variant="standard"
            placeholder="Search Farms by Location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: "80%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" color="success">
            Search
          </Button>
        </Box>

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
                  onClick={handleCardClick}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={farm.image || "/fallback.jpg"}
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
