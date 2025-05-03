import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import axios from "axios";

// Fetch coordinates from OpenStreetMap if needed
const fetchCoordinates = async (locationName) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: locationName,
          format: "json",
          limit: 1,
        },
      }
    );
    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat, lng: lon };
    } else {
      console.error("No coordinates found for:", locationName);
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

// Open Google Maps navigation
const openNavigation = async (farmLat, farmLng, locationName) => {
  if (!farmLat || !farmLng) {
    const coords = await fetchCoordinates(locationName);
    if (coords) {
      farmLat = coords.lat;
      farmLng = coords.lng;
    } else {
      alert("Unable to find farm location.");
      return;
    }
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${farmLat},${farmLng}`;
      window.open(url, "_blank");
    },
    (error) => {
      console.error("Error getting user location:", error);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${farmLat},${farmLng}`;
      window.open(url, "_blank");
    }
  );
};

const FinalDraft = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);

  const [fullName, setFullName] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [nationalId, setNationalId] = useState("");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/farmrent/${id}`
        );
        setFarm(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching farm data:", err);
        setError("Failed to load farm data.");
        setLoading(false);
      }
    };

    fetchFarm();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  }, [id]);

  const generateRandomId = () =>
    Math.floor(1000000000 + Math.random() * 9000000000);

  const handleRentClick = () => {
    setOpenDialog(true);
    setTransactionComplete(false);
    setFullName("");
    setRenterEmail("");
    setRenterPhone("");
    setResidence("");
    setNationalId("");
  };

  const handleEmailSubmit = async () => {
    if (!fullName || !renterEmail || !renterPhone || !residence) {
      alert("Please fill in all fields.");
      return;
    }

    const transactionId = generateRandomId();
    setIsSubmitting(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/transactions/", {
        farm_id: farm.id,
        transaction_id: transactionId,
        renter_email: renterEmail,
        renter_phone: renterPhone,
        full_name: fullName,
        residence,
        national_id: nationalId,
      });

      await axios.post(
        "http://127.0.0.1:8000/api/send-transaction-email-rent/",
        {
          renter_email: renterEmail,
          transaction_id: transactionId,
        }
      );

      setTransactionComplete(true);
    } catch (error) {
      console.error("Failed to submit rental:", error);
      alert("Submission failed.");
      setOpenDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setTransactionComplete(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (farm.images?.length || 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + (farm.images?.length || 1)) % (farm.images?.length || 1)
    );
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
  };

  if (loading)
    return <Typography textAlign="center">Loading farm details...</Typography>;
  if (error)
    return (
      <Typography color="error" textAlign="center">
        {error}
      </Typography>
    );
  if (!farm) return <Typography textAlign="center">Farm not found.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Farm Finder
          </Typography>
          <Button color="inherit" component={Link} to="/RentPage">
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ my: 4, flex: 1 }}>
        <Typography
          variant="h5"
          color="green"
          textAlign="center"
          fontWeight={600}
          gutterBottom
        >
          Featured Farm
        </Typography>

        <Box display="flex" justifyContent="center">
          <Card
            key={farm.id}
            sx={{
              maxWidth: "1500px",
              minWidth: "800px",
              boxShadow: 5,
              borderRadius: 3,
              overflow: "hidden",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Box sx={{ display: "flex" }}>
              {/* Image section */}
              <Box
                sx={{
                  width: "40%",
                  padding: 2,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {farm.images && farm.images.length > 0 ? (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{ position: "absolute", left: 10 }}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>

                    <Box
                      component="img"
                      src={getImageUrl(farm.images[currentImageIndex].image)}
                      alt={`Farm ${currentImageIndex + 1}`}
                      sx={{
                        height: 330,
                        width: 300,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />

                    <IconButton
                      onClick={handleNextImage}
                      sx={{ position: "absolute", right: 10 }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </>
                ) : (
                  <Typography>No images</Typography>
                )}
              </Box>

              {/* Details section */}
              <CardContent sx={{ width: "60%", padding: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {farm.name}
                </Typography>
                <Typography>
                  <strong>Price:</strong> {farm.price} Tshs
                </Typography>
                <Typography>
                  <strong>Size:</strong> {farm.size}
                </Typography>
                <Typography>
                  <strong>Quality:</strong> {farm.quality}
                </Typography>

                <Typography fontSize="12px">
                  <strong style={{ fontSize: "18px" }}>Farm Location:</strong>{" "}
                  {farm.location}
                  <Tooltip title="Navigate to farm">
                    <LocationOnIcon
                      onClick={() =>
                        openNavigation(farm.lat, farm.lng, farm.location)
                      }
                      sx={{
                        cursor: "pointer",
                        ml: 1,
                        "&:hover": { color: "green" },
                      }}
                    />
                  </Tooltip>
                </Typography>

                {/* User location */}
                {userLocation.lat && (
                  <Typography fontSize="12px" sx={{ mt: 1 }}>
                    <strong style={{ fontSize: "18px" }}>
                      Your Current Position:
                    </strong>
                    <MyLocationIcon sx={{ ml: 1 }} />
                    Lat: {userLocation.lat.toFixed(4)}, Lng:{" "}
                    {userLocation.lng.toFixed(4)}
                  </Typography>
                )}

                <Box sx={{ marginTop: 2 }}>
                  <Typography
                    sx={{ color: "green", textDecoration: "underline" }}
                  >
                    <strong>SELLER CONTACTS</strong>
                  </Typography>
                  <Typography sx={{ ml: 1 }}>
                    <strong>Email:</strong> {farm.email}
                  </Typography>
                  <Typography sx={{ ml: 1 }}>
                    <strong>Phone:</strong> {farm.phone}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handleRentClick}
                >
                  Rent
                </Button>
              </CardContent>
            </Box>

            {/* Description */}
            <Typography sx={{ p: 2, backgroundColor: "#d8f9d8" }}>
              {farm.description}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: "bold",
                color: "#333",
                ml: 2,
              }}
            >
              Rent Duration: {farm.rent_duration} Months
            </Typography>
          </Card>
        </Box>
      </Container>

      {/* Rent Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Rent This Farm</DialogTitle>
        <DialogContent>
          {transactionComplete ? (
            <Box textAlign="center" my={3}>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "green" }} />
              <Typography variant="h6" color="green" mt={2}>
                Rental Successful!
              </Typography>
            </Box>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Full Name"
                type="text"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Phone Number"
                type="text"
                fullWidth
                value={renterPhone}
                onChange={(e) => setRenterPhone(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Residence"
                type="text"
                fullWidth
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
              />
              <TextField
                margin="dense"
                label="National ID (Optional)"
                type="text"
                fullWidth
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!transactionComplete && (
            <Button
              onClick={handleEmailSubmit}
              color="primary"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          )}
          <Button onClick={handleDialogClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinalDraft;
