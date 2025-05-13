import React, { useState, useEffect } from "react";
// import { MapTilerFarmMap } from "./UserMap"; // Assuming this component exists
import { Link, useParams } from "react-router-dom";
import FarmStatusIndicator from "./FarmStatusIndicator"; // Import the new component

// Material UI imports
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  TextField,
  Toolbar,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

// Material UI Icons
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const FinalDraft = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [isRented, setIsRented] = useState(false);

  const [fullName, setFullName] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [nationalId, setNationalId] = useState("");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  // const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });

  const checkFarmStatus = async () => {
    try {
      const storedStatus = localStorage.getItem(`farm-status-${id}`);
      if (storedStatus === "taken") {
        setIsRented(true);
        return true;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/transactions/farm/${id}`
      );
      if (!response.ok) {
        throw new Error(`Failed to check farm status: ${response.status}`);
      }

      const data = await response.json();
      const isTaken = data.length > 0;

      if (isTaken) {
        setIsRented(true);
        localStorage.setItem(`farm-status-${id}`, "taken");
      }

      return isTaken;
    } catch (err) {
      console.error("Error checking farm status:", err);
      // On error, keep existing status
      return isRented;
    }
  };

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        setLoading(true);

        // First check localStorage for cached status
        const storedStatus = localStorage.getItem(`farm-status-${id}`);
        if (storedStatus === "taken") {
          setIsRented(true);
        }

        // Fetch farm data
        const response = await fetch(
          `http://127.0.0.1:8000/api/farmrent/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch farm data");
        }
        const data = await response.json();
        setFarm(data);

        // Only check API for status if we don't already know it's rented
        if (storedStatus !== "taken") {
          // Check if farm is rented via API
          const farmIsRented = await checkFarmStatus();
          setIsRented(farmIsRented);

          // If rented, update localStorage
          if (farmIsRented) {
            localStorage.setItem(`farm-status-${id}`, "taken");
          }
        }

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

  const handleRentClick = () => {
    // Don't allow renting if the farm is already rented
    if (isRented) {
      return;
    }

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
      // Create the transaction
      const transactionResponse = await fetch(
        "http://127.0.0.1:8000/api/transactions/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            farm_id: farm.id,
            transaction_id: transactionId,
            renter_email: renterEmail,
            renter_phone: renterPhone,
            full_name: fullName,
            residence,
            national_id: nationalId,
            is_rented: true, // Set is_rented to true in the transaction
          }),
        }
      );

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      // Update farm status in backend
      const updateResponse = await fetch(
        `http://127.0.0.1:8000/api/farmrent/${id}/update_status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_rented: true,
          }),
        }
      );

      if (!updateResponse.ok) {
        console.warn(
          "Failed to update farm status, but transaction was created"
        );
      }

      // Send email notification
      const emailResponse = await fetch(
        "http://127.0.0.1:8000/api/send-transaction-email-rent/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            renter_email: renterEmail,
            transaction_id: transactionId,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.warn("Failed to send email, but transaction was created");
      }

      // Update local state and save to localStorage for persistence
      setTransactionComplete(true);
      setIsRented(true);
      localStorage.setItem(`farm-status-${id}`, "taken");
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
    if (transactionComplete) {
      // Re-check farm status when dialog is closed after successful transaction
      checkFarmStatus();
    }
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
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="success" />
        <Typography sx={{ ml: 2 }}>Loading farm details...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  if (!farm)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Farm not found.</Typography>
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ bgcolor: "green" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Farm Finder
          </Typography>
          <Button
            component={Link}
            to="/RentPage"
            color="inherit"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ my: 4, maxWidth: "lg" }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ color: "green", textAlign: "center", fontWeight: 600, mb: 3 }}
        >
          Featured Farm
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Card
            sx={{
              maxWidth: 750,
              width: "90%",
              borderRadius: 2,
              boxShadow: 3,
              opacity: isRented ? 0.7 : 1,
              position: "relative",
              filter: isRented ? "grayscale(30%)" : "none",
              transition: "0.3s",
            }}
          >
            {/* Using our custom FarmStatusIndicator component */}
            <FarmStatusIndicator farmId={id} initialStatus={isRented} />

            <Box sx={{ position: "relative" }}>
              {farm.images && farm.images.length > 0 ? (
                <Box sx={{ position: "relative" }}>
                  <IconButton
                    onClick={handlePrevImage}
                    disabled={isRented}
                    sx={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 2,
                      bgcolor: "white",
                      opacity: isRented ? 0.5 : 1,
                      "&:hover": {
                        bgcolor: "white",
                      },
                    }}
                  >
                    <PrevIcon />
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="280"
                    image={getImageUrl(farm.images[currentImageIndex].image)}
                    alt={`Farm ${currentImageIndex + 1}`}
                    sx={{ objectFit: "cover" }}
                  />

                  <IconButton
                    onClick={handleNextImage}
                    disabled={isRented}
                    sx={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 2,
                      bgcolor: "white",
                      opacity: isRented ? 0.5 : 1,
                      "&:hover": {
                        bgcolor: "white",
                      },
                    }}
                  >
                    <NextIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography>No images available</Typography>
                </Box>
              )}
            </Box>

            <CardContent>
              <Typography
                variant="h5"
                component="h3"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {farm.name}
              </Typography>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography>
                  <strong>Price:</strong> {farm.price} Tshs
                </Typography>
                <Typography>
                  <strong>Size:</strong> {farm.size}
                </Typography>
                <Typography>
                  <strong>Quality:</strong> {farm.quality}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>
                    <strong>Farm Location:</strong>
                  </Typography>
                  <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                    <Typography>{farm.location}</Typography>
                    <IconButton
                      onClick={() => setShowMap(true)}
                      disabled={isRented}
                      color="success"
                      size="small"
                      sx={{
                        ml: 0.5,
                        color: isRented ? "gray" : "green",
                      }}
                    >
                      <LocationIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                onClick={handleRentClick}
                disabled={isRented}
                sx={{
                  bgcolor: isRented ? "#f44336" : "green",
                  "&:hover": {
                    bgcolor: isRented ? "#d32f2f" : "darkgreen",
                  },
                  mt: 2,
                }}
              >
                {isRented ? "Unavailable" : "Rent"}
              </Button>
            </CardContent>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: isRented ? "#f0f0f0" : "#d8f9d8",
              }}
            >
              <Typography>{farm.description}</Typography>
            </Paper>

            <CardContent sx={{ pt: 1, pb: "8px !important" }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Rent Duration: {farm.rent_duration} Months
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Rent Dialog - Using Material UI Dialog component */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rent This Farm</DialogTitle>

        <DialogContent>
          {transactionComplete ? (
            <Box sx={{ textAlign: "center", my: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: "green" }} />
              <Typography variant="h5" sx={{ color: "green", mt: 2 }}>
                Rental Successful!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
              />
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                value={renterPhone}
                onChange={(e) => setRenterPhone(e.target.value)}
              />
              <TextField
                label="Residence"
                fullWidth
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
              />
              <TextField
                label="National ID (Optional)"
                fullWidth
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!transactionComplete && (
            <Button
              onClick={handleEmailSubmit}
              disabled={isSubmitting}
              variant="contained"
              color="success"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            color="success"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map modal with Material UI */}
      <Modal
        open={showMap}
        onClose={() => setShowMap(false)}
        aria-labelledby="map-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95%",
            maxWidth: 1600,
            height: "90vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setShowMap(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100% - 40px)",
            }}
          >
            <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
              Map content would be rendered here
              <Button
                variant="contained"
                color="success"
                sx={{ display: "block", mx: "auto", mt: 2 }}
                onClick={() => setShowMap(false)}
              >
                Close Map
              </Button>
            </Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FinalDraft;
