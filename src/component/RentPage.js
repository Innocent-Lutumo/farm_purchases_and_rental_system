import React, { useState, useEffect } from "react";
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
  Modal,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";

const RentPage = () => {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [imageToView, setImageToView] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleProfileIconClick = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  const handleImageClick = (imgSrc) => {
    setImageToView(imgSrc);
    setImageModalOpen(true);
  };
  const handleImageClose = () => {
    setImageModalOpen(false);
    setImageToView(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;

  const handleDialogOpen = (farm) => {
    const confirmRent = window.confirm(
      `Are you sure you want to rent the "${farm.name}" farm?`
    );
    if (confirmRent) {
      window.location.href = `/farm/${farm.id}`;
    }
  };

  // Fetch farms from the backend
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/farmsrent/?type=Rent"
        ); // Adjust endpoint as needed
        const data = await response.json();
        setFarms(data);
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const filteredFarms = farms.filter((farm) =>
    farm.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ background: "green", height: "80px" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Farm Finder</Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              Find your ideal farmland for rent.
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleProfileIconClick}>
            <AccountCircleIcon sx={{ fontSize: "2.5rem" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Popover */}
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
            <ListItem button component={Link} to="#">
              <ListItemText primary="My profile" />
            </ListItem>
            <ListItem button component={Link} to="/RentPage">
              <ListItemText primary="Home" />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/PurchasesPage">
              <ListItemText primary="History" />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/HomePage" sx={{ color: "red" }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Popover>

      {/* Main Content */}
      <Container sx={{ my: 4, flex: 1 }}>
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
          Below are the available farmlands for rent. Explore and find your
          ideal property.
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
          <Box textAlign="center" mt={5}>
            <CircularProgress color="success" />
            <Typography>Loading farms...</Typography>
          </Box>
        ) : (
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
                  overflow: "hidden",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <Box sx={{ display: "flex" }}>
                  <CardMedia
                    component="img"
                    image={`http://localhost:8000${farm.image}`}
                    alt={farm.name}
                    sx={{
                      width: "40%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: 2,
                      margin: 1,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleImageClick(`http://localhost:8000${farm.image}`)
                    }
                  />
                  <CardContent sx={{ width: "60%", padding: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {farm.name}
                    </Typography>
                    <Typography>
                      <strong>Price:</strong> {farm.price}/= Tshs
                    </Typography>
                    <Typography>
                      <strong>Size:</strong> {farm.size}
                    </Typography>
                    <Typography>
                      <strong>Quality:</strong> {farm.quality}
                    </Typography>
                    <Typography fontSize="12px">
                      <strong>Location:</strong> {farm.location}{" "}
                      <LocationOnIcon />
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => handleDialogOpen(farm)}
                      sx={{ mt: 2, fontSize: 10 }}
                    >
                      Click to Rent
                    </Button>
                  </CardContent>
                </Box>
                <Typography sx={{ p: 1, backgroundColor: "#d8f9d8" }}>
                  {farm.description}
                </Typography>
                {farm.rent_duration && (
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      color: "#333",
                      ml: 2,
                      mt: 1,
                    }}
                  >
                    {farm.rent_duration} Months
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* Image Modal */}
      <Modal open={imageModalOpen} onClose={handleImageClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 2,
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={handleImageClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "white",
              zIndex: 10,
            }}
          >
            <CloseIcon sx={{ fontSize: 25 }} />
          </IconButton>
          <img
            src={imageToView}
            alt="Farm Full"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        </Box>
      </Modal>

      {/* Footer */}
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
        <Typography fontSize={14}>
          Created by <strong>S/N 19</strong>
        </Typography>
        <Typography fontSize={14}>
          Contacts: 2557 4757 0004 <br /> Email: serialnumber19@gmail.com
        </Typography>
      </Box>
    </Box>
  );
};

export default RentPage;
