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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  ListItemIcon,
  InputBase,
  alpha,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import axios from "axios";

const Purchases2 = () => {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [miniSidebarOpen, setMiniSidebarOpen] = useState(false);

  const handleCardClick = (farm, purchase) => {
    // Store the farm.id in local storage
    localStorage.setItem('selectedAgreementFarmId', farm.id.toString());
    console.log(`Stored farm ID ${farm.id} for agreement page.`);

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

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleToggleMiniSidebar = () => {
    setMiniSidebarOpen(!miniSidebarOpen);
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
    const matchesSearch = 
      purchase.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      purchase.full_name.toLowerCase().includes(search.toLowerCase()) ||
      purchase.farm.location.toLowerCase().includes(search.toLowerCase()) ||
      purchase.status.toLowerCase().includes(search.toLowerCase());

    const isActualSoldPurchase =
      (purchase.status === 'Confirmed' || purchase.status === 'Completed') &&
      purchase.farm &&
      purchase.farm.is_sold === true;

    const isPendingPurchase = purchase.status === 'Pending';
    const isRelevantPurchase = isActualSoldPurchase || isPendingPurchase;
    const isCancelled = purchase.status === 'Cancelled';

    return matchesSearch && isRelevantPurchase && !isCancelled;
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          background: "green",
          height: "80px",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleToggleMiniSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{ fontSize: "1.5rem" }} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Farm Finder</Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              Find your ideal farmland for purchase.
            </Typography>
          </Box>

          {/* Search Input and Button */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            {showSearchInput && (
              <InputBase
                placeholder="Search purchases..."
                inputProps={{ "aria-label": "search" }}
                value={search}
                onChange={handleSearchChange}
                sx={{
                  color: "inherit",
                  "& .MuiInputBase-input": {
                    padding: (theme) => theme.spacing(1, 1, 1, 0),
                    paddingLeft: `calc(1em + 24px)`,
                    transition: (theme) => theme.transitions.create("width"),
                    width: "120px",
                    "&:focus": {
                      width: "200px",
                    },
                    borderBottom: "1px solid",
                    borderColor: alpha("#fff", 0.7),
                  },
                  backgroundColor: alpha("#fff", 0.15),
                  borderRadius: (theme) => theme.shape.borderRadius,
                  "&:hover": {
                    backgroundColor: alpha("#fff", 0.25),
                  },
                  position: "relative",
                  marginRight: (theme) => theme.spacing(1),
                }}
              />
            )}
            <IconButton
              color="inherit"
              onClick={() => setShowSearchInput(!showSearchInput)}
            >
              <SearchIcon sx={{ fontSize: "2.0rem" }} />
            </IconButton>
          </Box>
          <Tooltip title="My Profile">
            <IconButton color="inherit" component={Link} to="#" sx={{ ml: 2 }}>
              <PersonIcon sx={{ fontSize: "2.5rem" }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Custom Mini-Sidebar */}
      <Box
        sx={{
          width: miniSidebarOpen ? 200 : 60,
          flexShrink: 0,
          whiteSpace: "nowrap",
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          backgroundColor: "#f0f0f0",
          pt: "80px",
          borderRight: "1px solid #ccc",
        }}
      >
        <List>
          <ListItem
            button
            component={Link}
            to="/HomePage"
            sx={{ color: "black" }}
          >
            <ListItemIcon>
              <HomeIcon sx={{ color: "green" }} />
            </ListItemIcon>
            {miniSidebarOpen && <ListItemText primary="Home" />}
          </ListItem>
          <Divider />
          <ListItem
            button
            component={Link}
            to="/trial"
            sx={{ color: "black" }}
          >
            <ListItemIcon>
              <HistoryIcon sx={{ color: "green" }} />
            </ListItemIcon>
            {miniSidebarOpen && <ListItemText primary="Back" />}
          </ListItem>
          <Divider />
        </List>
      </Box>

      {/* Main Content Area */}
      <Container
        sx={{
          my: 4,
          flex: 1,
          ml: 3,
          pt: "80px",
          transition: (theme) =>
            theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {/* Advertisement Section */}
        <Box sx={{ mb: 4 }}>
          <AdvertisementSection />
        </Box>

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
          Search for your purchases using transaction ID, buyer name, location, or status.
        </Typography>

        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress color="success" />
            <Typography>Loading purchases...</Typography>
          </Box>
        ) : filteredAndDisplayPurchases.length === 0 ? (
          <Typography textAlign="center">
            {search
              ? `No active purchases found matching "${search}"`
              : "No active purchase history to display."}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredAndDisplayPurchases.map((purchase, index) => {
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
                      height: 200,
                      borderRadius: 3,
                      boxShadow: 5,
                      overflow: "hidden",
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
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
                      <Typography variant="body2" fontWeight="bold">
                        {farm.name || "Farm"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Buyer:</strong> {purchase.full_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {farm.location}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Size:</strong> {farm.size}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Price:</strong> {farm.price}/= Tshs
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong>{" "}
                        <span
                          style={{
                            color: ["Completed", "Confirmed"].includes(
                              purchase.status
                            )
                              ? "green"
                              : "orange",
                            fontWeight: "bold",
                          }}
                        >
                          {purchase.status}
                        </span>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
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