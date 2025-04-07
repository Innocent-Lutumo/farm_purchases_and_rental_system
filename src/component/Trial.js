import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Box,
  InputAdornment,
  IconButton,
  TextField,
  Popover,
  List,
  ListItem,
  Button,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Profile Icon
import img7 from "../images/img7.jpg";
import img8 from "../images/img8.jpg";
import img9 from "../images/img9.jpg";

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
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); // For managing the popover visibility

  // Filter farms based on the search input
  const filteredFarms = farms.filter((farm) =>
    farm.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleProfileIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header Section */}
      <AppBar position="static" sx={{ background: "green", height: "80px" }}>
        <Toolbar>
          {/* App Name and Description */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Farm Finder</Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              Find your ideal farmland for purchase or rent.
            </Typography>
          </Box>

          {/* Profile Icon on the right */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleProfileIconClick}
            sx={{
              marginLeft: 2,
              fontSize: "2rem", // Enlarged size for the profile icon
            }}
          >
            <AccountCircleIcon sx={{ fontSize: "2.5rem" }} />{" "}
            {/* Enlarge the icon itself */}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box
          sx={{
            width: 150,
            padding: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Navigation List */}
          <List sx={{ padding: 0 }}>
          <ListItem button component={Link} to="/Page">
              <ListItemText
                primary="My profile"
                sx={{
                  color: "black",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              />
            </ListItem>

            <ListItem button component={Link} to="/PurchasesPage">
              <ListItemText
                primary="Home"
                sx={{
                  color: "black",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/PurchasesPage">
              <ListItemText
                primary="History"
                sx={{
                  color: "black",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/">
              <ListItemText
                primary="Logout"
                sx={{
                  color: "red",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Popover>

      {/* Main Content */}
      <Container sx={{ my: 4, flex: 1, marginLeft: 0 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Farms Display */}
          <Box sx={{ flex: 1 }}>
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
              Below are the available farmlands for purchase. Explore and find
              your ideal property.
            </Typography>

            {/* Search Bar */}
            <Container sx={{ my: 3, marginBottom: 1 }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search Farms by Location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  mb: 4,
                  "& .MuiInput-underline:after": {
                    borderBottomColor: "green",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Container>

            {/* Farms Grid */}
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
                  to={`/farm/${farm.id}`}
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
                        marginLeft: 1,
                        marginTop: 1,
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
                      padding: 1,
                      backgroundColor: "#d8f9d8",
                      borderRadius: 1,
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

      {/* Footer Section */}
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
          Contacts: 2557 4757 0004 <br /> Email: serialnumber19@gmail.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Trial;
