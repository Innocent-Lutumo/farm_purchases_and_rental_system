import React, { useEffect, useState } from "react";
import RegistrationDialog from "../Shared/FeedbackDialog";
import AdvertisementSection from "../Shared/Advertisement";
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
  Grid,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import axios from "axios";

const Purchases2 = () => {
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

  const handleCardClick = (farm, purchase) => {
    setSelectedFarm({
      ...farm,
      transactionId: purchase.transaction_id,
      purchaseStatus: purchase.status,
      email: purchase.farm.email,
      phone: purchase.farm.phone,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/get-transactionsale/"
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

  // Filter purchases for display based on transaction ID AND the associated farm's is_sold status
  const filteredAndDisplayPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.transaction_id.toLowerCase().includes(search.toLowerCase());

    // A purchase should be displayed in history only if:
    // 1. The transaction is still considered 'active' (not 'Cancelled')
    // AND
    // 2. If it was a 'Confirmed' or 'Completed' sale, the farm associated with it is *still* marked as sold (is_sold: true).
    //    If the farm's `is_sold` is `false`, it means it has been reactivated and should be hidden.
    //    'Pending' transactions should always show as they represent an ongoing process.

    const isActualSoldPurchase =
      (purchase.status === 'Confirmed' || purchase.status === 'Completed') &&
      purchase.farm &&
      purchase.farm.is_sold === true; // Keep if the farm is *still* sold

    const isPendingPurchase = purchase.status === 'Pending'; // Always show pending transactions

    const isRelevantPurchase = isActualSoldPurchase || isPendingPurchase;

    // Additionally, you might want to explicitly exclude 'Cancelled' transactions from history
    const isCancelled = purchase.status === 'Cancelled';

    return matchesSearch && isRelevantPurchase && !isCancelled;
  });

  return (
    <Box>
      {/* AppBar */}
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

      {/* Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ width: 150, padding: 2 }}>
          <List sx={{ padding: 0 }}>
            <ListItem button component={Link} to="#">
              <ListItemText primary="My profile" />
            </ListItem>
            <ListItem button component={Link} to="/trial">
              <ListItemText primary="Back" />
            </ListItem>
            <Divider />
            <ListItem button component={Link} to="/HomePage">
              <ListItemText primary="Home" />
            </ListItem>
          </List>
        </Box>
      </Popover>

      <Container sx={{ my: 4 }}>
        <AdvertisementSection />
      </Container>

      <Container sx={{ my: 4 }}>
        <Typography
          variant="h5"
          color="green"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          All Farm Purchases
        </Typography>
        <Typography textAlign="center" sx={{ mb: 2 }}>
          Search for your purchases using your transaction ID.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 4 }}>
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
            {filteredAndDisplayPurchases.length > 0 ? (
              filteredAndDisplayPurchases.map((purchase, index) => {
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
                      onClick={() => handleCardClick(farm, purchase)}
                    >
                      <CardMedia
                        component="img"
                        image={mainImage}
                        alt={`farm-${farm.id}`}
                        sx={{
                          width: "45%",
                          objectFit: "cover",
                          margin: 1,
                          borderRadius: 2,
                        }}
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
                          Price: {farm.price}TZS
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
                <Typography>
                  {search
                    ? `No active purchases found matching "${search}"`
                    : "No active purchase history to display."}
                </Typography>
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
    </Box>
  );
};

export default Purchases2;