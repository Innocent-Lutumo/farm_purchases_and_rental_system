import React, { useState, useEffect } from "react";
import { MapTilerFarmMap } from "../Shared/UserMap";
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
  Grid,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Modal,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";

const FinalDraft1 = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [intendedUse, setIntendedUse] = useState("");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/farms/${id}`
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
  }, [id]);

  const generateRandomId = () =>
    Math.floor(1000000000 + Math.random() * 9000000000);

  const handlePurchaseClick = () => setEmailDialogOpen(true);

  const handleEmailSubmit = async () => {
    const transactionId = generateRandomId();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const transactionResponse = await axios.post(
        "http://127.0.0.1:8000/api/transactionsale/",
        {
          farm_id: farm.id,
          transaction_id: transactionId,
          buyer_email: userEmail,
          full_name: fullName,
          address,
          contact_info: contactInfo,
          national_id: nationalId,
          intended_use: intendedUse,
        }
      );

      if (transactionResponse.status === 201) {
        await axios.post("http://127.0.0.1:8000/api/send-transaction-email/", {
          buyer_email: userEmail,
          transaction_id: transactionId,
        });

        setEmailDialogOpen(false);
        setOpenDialog(true);
      } else {
        alert("Failed to save transaction.");
      }
    } catch (error) {
      console.error(
        "Error processing transaction:",
        error.response?.data || error.message
      );
      alert("Something went wrong. Please try again.");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
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

  if (loading)
    return (
      <Typography variant="h5" textAlign="center">
        Loading farm details...
      </Typography>
    );
  if (error)
    return (
      <Typography variant="h5" color="error" textAlign="center">
        {error}
      </Typography>
    );
  if (!farm)
    return (
      <Typography variant="h5" textAlign="center">
        Farm not found.
      </Typography>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Farm Finder
          </Typography>
          <Button color="inherit" component={Link} to="/trial">
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
              {/* Image Carousel */}
              <Box
                sx={{
                  position: "relative",
                  width: "40%",
                  padding: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {farm.images && farm.images.length > 0 ? (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: "absolute",
                        left: 10,
                        backgroundColor: "#ffffffcc",
                        "&:hover": { backgroundColor: "#ffffff" },
                      }}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>

                    <Box
                      component="img"
                      src={getImageUrl(farm.images[currentImageIndex].image)}
                      alt={`Farm Image ${currentImageIndex + 1}`}
                      sx={{
                        height: 330,
                        width: 300,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />

                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: "absolute",
                        right: 10,
                        backgroundColor: "#ffffffcc",
                        "&:hover": { backgroundColor: "#ffffff" },
                      }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </>
                ) : (
                  <Typography>No images available</Typography>
                )}
              </Box>

              {/* Farm Details */}
              <CardContent sx={{ width: "60%", padding: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Featured Farm
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
                <Box sx={{ mt: 1, display: "flex", alignItems: "flex-start" }}>
                  <Typography fontSize="14px">
                    <strong style={{ fontSize: "16px" }}>Farm Location:</strong>{" "}
                  </Typography>
                  <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                    <Typography fontSize="14px">{farm.location}</Typography>
                    <Tooltip title="Show on Map">
                      <IconButton size="small" onClick={() => setShowMap(true)}>
                        <LocationOnIcon fontSize="small" color="success" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Map modal or conditional box */}
                  <Modal
                    open={showMap}
                    onClose={() => setShowMap(false)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "95%",
                        maxWidth: "1600px",
                        height: "100vh",
                        overflow: "hidden",
                      }}
                    >
                      <MapTilerFarmMap
                        farm={farm}
                        userLocation={userLocation}
                        setUserLocation={setUserLocation}
                        onClose={() => setShowMap(false)}
                      />
                    </Box>
                  </Modal>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handlePurchaseClick}
                  sx={{ marginTop: 2, fontSize: 14 }}
                >
                  Purchase
                </Button>
              </CardContent>
            </Box>

            <Typography
              sx={{ padding: 2, backgroundColor: "#d8f9d8", borderRadius: 1 }}
            >
              {farm.description}
            </Typography>
          </Card>
        </Box>
      </Container>

      {/* Buyer Form Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", color: "green" }}>
          Buyer Information
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Names"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Info (Phone)"
                fullWidth
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="National ID / Passport (Optional)"
                fullWidth
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Intended Use of Farm"
                multiline
                rows={2}
                fullWidth
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialogOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleEmailSubmit}
            disabled={!userEmail}
            variant="contained"
            color="success"
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Success!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your purchase request has been recorded, and a transaction ID has
            been sent to your email.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button component={Link} to="/payment" color="success">
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinalDraft1;
