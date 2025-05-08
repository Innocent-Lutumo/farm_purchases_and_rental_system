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
  Tooltip,
  List,
  Button,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
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

const RegistrationDialog = ({ open, onClose, farm }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Ensure images reset on farm data change
  useEffect(() => {
    if (farm && farm.images && farm.images.length > 0) {
      setImageIndex(0); // Reset to first image when farm changes
    }
  }, [farm]);

  // Reset the contact info visibility when dialog closes
  useEffect(() => {
    if (open) {
      setShowEmail(false);
      setShowPhone(false);
    }
  }, [open]);

  // If farm data is not available, return nothing
  if (!farm) return null;

  const images = farm.images || [];

  const getImageUrl = (imgPath) =>
    imgPath.startsWith("http") || imgPath.startsWith("data")
      ? imgPath
      : `http://127.0.0.1:8000${imgPath}`;

  const handleNext = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const currentImage =
    images.length > 0 ? getImageUrl(images[imageIndex].image) : "/fallback.jpg";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          p: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <DialogTitle>Farm Details</DialogTitle>
        <DialogContent>
          <Box sx={{ position: "relative", textAlign: "center", mb: 2 }}>
            <CardMedia
              component="img"
              image={currentImage}
              alt={`Farm image ${imageIndex + 1}`}
              sx={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
            />
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translateY(-50%)",
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translateY(-50%)",
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold" color="green">
              {farm.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Location: {farm.location}
            </Typography>
            <Typography variant="body2">Size: {farm.size} acres</Typography>
            <Typography variant="body2">Price:{farm.price}/=Tshs</Typography>
          </Box>
        </DialogContent>

        {/* Contact Info or Wait Message */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {["Confirmed", "Completed"].includes(farm.purchaseStatus) ? (
            <>
              <Typography variant="body2" sx={{ color: "green" }}>
                Click an icon to contact the landowner and plan an appointment:
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Tooltip title="Show Email">
                  <IconButton
                    onClick={() => setShowEmail((prev) => !prev)}
                    sx={{ color: "green" }}
                  >
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
                {showEmail && (
                  <Typography variant="body2" sx={{ color: "green" }}>
                    {farm.email || "N/A"}
                  </Typography>
                )}

                <Tooltip title="Show Phone">
                  <IconButton
                    onClick={() => setShowPhone((prev) => !prev)}
                    sx={{ color: "green" }}
                  >
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
                {showPhone && (
                  <Typography variant="body2" sx={{ color: "green" }}>
                    {farm.phone || "N/A"}
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Wait for confirmation
            </Typography>
          )}
        </Box>

        <DialogActions>
          <Button onClick={onClose} color="success">
            Close
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);

  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;

  const handleProfileIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = (farm, status) => {
    setSelectedFarm({ ...farm, purchaseStatus: status });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/get-transactions/"
        );
        setPurchases(response.data);
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.transaction_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
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
                sx={{ width: "100%", }}
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

      <Container sx={{ my: 4 }}>
        <Typography
          variant="h5"
          color="green"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          My Farm Purchases
        </Typography>
        <Typography textAlign="center" sx={{ mb: 2 }}>
          Search for your purchases using your transaction ID.
        </Typography>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 4 }}
        >
          <TextField
            variant="standard"
            placeholder="Search by Transaction ID"
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
          <Grid container spacing={3}>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase, index) => {
                const farm = purchase.farm;
                const mainImage =
                  farm.images && farm.images.length > 0 && farm.images[0].image
                    ? farm.images[0].image.startsWith("http") ||
                      farm.images[0].image.startsWith("data")
                      ? farm.images[0].image
                      : `http://127.0.0.1:8000${farm.images[0].image}`
                    : "/fallback.jpg";

                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        height: 180,
                        borderRadius: 2,
                        boxShadow: 4,
                        overflow: "hidden",
                        transition: "0.3s",
                        "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
                        cursor: "pointer",
                      }}
                      onClick={() => handleCardClick(farm, purchase.status)}
                    >
                      <CardMedia
                        component="img"
                        image={mainImage}
                        alt={`farm-${farm.id}`}
                        sx={{ width: "45%", objectFit: "cover", margin: 1, borderRadius: 2, }}
                      />
                      <CardContent
                        sx={{
                          width: "55%",
                          backgroundColor: "#f9fff6",
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          Buyer: {purchase.full_name}
                        </Typography>
                        <Typography variant="body2">
                          Location: {farm.location}
                        </Typography>
                        <Typography variant="body2">
                          Size: {farm.size} acres
                        </Typography>
                        <Typography variant="body2">
                          Price: ${farm.price}
                        </Typography>
                        <Typography variant="body2">
                          Status:{" "}
                          <span
                            style={{
                              color: ["Completed", "Confirmed"].includes(
                                purchase.status
                              )
                                ? "green"
                                : "orange",
                            }}
                          >
                            {purchase.status}
                          </span>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Typography>No purchases found for "{search}"</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      <RegistrationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        farm={selectedFarm}
      />

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

export default Purchase;
