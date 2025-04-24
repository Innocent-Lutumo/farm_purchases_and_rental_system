import React, { useState, useEffect } from "react";
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import axios from "axios";

const FinalDraft1 = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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

  const generateRandomId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  };

  const handlePurchaseClick = () => {
    setEmailDialogOpen(true);
  };

  const handleEmailSubmit = async () => {
    const transactionId = generateRandomId();

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      // Save transaction to the backend
      const transactionResponse = await axios.post(
        "http://127.0.0.1:8000/api/sale-transactions/",
        {
          farm_id: farm.id,
          transaction_id: transactionId,
          buyer_email: userEmail,
        }
      );

      if (transactionResponse.status === 201) {
        // If the transaction was saved successfully, send transaction email
        await axios.post("http://127.0.0.1:8000/api/send-transaction-email/", {
          buyer_email: userEmail,
          transaction_id: transactionId,
        });

        setEmailDialogOpen(false);
        setOpenDialog(true);
      } else {
        console.error("Transaction creation failed:", transactionResponse);
        alert("Failed to save transaction. Please try again.");
      }
    } catch (error) {
      console.error("Error processing transaction:", error.response?.data || error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <Typography variant="h5" textAlign="center">
        Loading farm details...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h5" color="error" textAlign="center">
        {error}
      </Typography>
    );
  }

  if (!farm) {
    return (
      <Typography variant="h5" textAlign="center">
        Farm not found.
      </Typography>
    );
  }

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
              textDecoration: "none",
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
                  height: "335px",
                  objectFit: "cover",
                  borderRadius: 2,
                  marginTop: 2,
                  marginBottom: 3,
                  marginLeft: 2,
                }}
              />
              <CardContent sx={{ width: "60%", padding: 2, fontSize: "14px" }}>
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
                <Typography fontSize="12px">
                  <strong style={{ fontSize: "18px" }}>Location:</strong>{" "}
                  {farm.location}
                  <Link
                    to="/location"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Tooltip title="Click to view location">
                      <LocationOnIcon
                        sx={{
                          transition: "color 0.3s",
                          "&:hover": { color: "green" },
                        }}
                      />
                    </Tooltip>
                  </Link>
                </Typography>
                <Box sx={{ marginTop: 2 }}>
                  <Typography
                    sx={{ color: "green", textDecoration: "underline" }}
                  >
                    <strong>SELLER'S CONTACTS</strong>
                  </Typography>
                  <Typography
                    sx={{ marginBottom: 2, marginTop: 2, marginLeft: 1 }}
                  >
                    <strong>Email:</strong> {farm.email}
                  </Typography>
                  <Typography
                    sx={{ marginBottom: 3, marginTop: 2, marginLeft: 1 }}
                  >
                    <strong>Phone Number:</strong> {farm.phone}
                  </Typography>
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
              sx={{
                padding: 2,
                backgroundColor: "#d8f9d8",
                borderRadius: 2,
                marginTop: "5px",
              }}
            >
              {farm.description}
            </Typography>
          </Card>
        </Box>
      </Container>

      {/* Email Input Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            padding: 2,
            borderRadius: 2,
            backgroundColor: "#f5f5f5",
            boxShadow: 5,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", color: "green" }}>
          Enter Your Email
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              },
              "& .MuiInputLabel-root": {
                color: "green",
              },
              "& .MuiInputBase-input": {
                color: "green",
              },
              "& .MuiInput-underline:before": {
                borderBottomColor: "green",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "green", 
              },
            }}
          />
        </DialogContent>
        <DialogActions>
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

      {/* Success Dialog */}
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
