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
  IconButton,
  Button,
  Modal,
  CircularProgress,
  Tooltip,
  InputBase,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import PurchaseDialog from "./PurchaseDialog";
import FarmMapModal from "../Shared/FarmMapModal";
// import AppFooter from "../Shared/AppFooter";

const Trial = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentFarm, setCurrentFarm] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [miniSidebarOpen, setMiniSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/farmsale/validated/"
        );
        setFarms(
          response.data.filter((farm) => farm.is_validated && !farm.is_rejected)
        );
      } catch (error) {
        console.error("Error fetching farms:", error);
        setError("Failed to load farms");
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleImageClick = (farm, index) => {
    setCurrentFarm(farm);
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const handleImageClose = () => {
    setImageModalOpen(false);
  };

  const handleNextImage = () => {
    if (currentFarm && currentFarm.images) {
      const nextIndex = (currentImageIndex + 1) % currentFarm.images.length;
      setCurrentImageIndex(nextIndex);
    }
  };

  const handlePrevImage = () => {
    if (currentFarm && currentFarm.images) {
      const prevIndex =
        (currentImageIndex - 1 + currentFarm.images.length) %
        currentFarm.images.length;
      setCurrentImageIndex(prevIndex);
    }
  };

  const handlePurchase = (farm) => {
    if (farm.is_sold) {
      return;
    }
    setSelectedFarm(farm);
    setConfirmPurchaseOpen(true);
  };

  const handleConfirmPurchase = () => {
    setConfirmPurchaseOpen(false);
    setPurchaseDialogOpen(true);
  };

  // Function to update the farm's `is_sold` status (called by PurchaseDialog)
  const handleFarmSold = (farmId) => {
    setFarms((prevFarms) =>
      prevFarms.map((farm) =>
        farm.id === farmId ? { ...farm, is_sold: true } : farm
      )
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleMiniSidebar = () => {
    setMiniSidebarOpen(!miniSidebarOpen);
  };

  // Filter farms for the main display and search (already handled in useEffect and here)
  const filteredDisplayFarms = farms.filter(
    (farm) =>
      farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (farm.price &&
        farm.price
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      farm.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (farm.seller_username &&
        farm.seller_username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          {/* Menu Icon - toggles the mini sidebar */}
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleToggleMiniSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{ fontSize: "1.5rem" }} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: "white" }}>
              Farm Finder
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              Find your ideal farmland for purchase.
            </Typography>
          </Box>

          {/* Search Input and Button */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            {showSearchInput && (
              <InputBase
                placeholder="Search farms..."
                inputProps={{ "aria-label": "search" }}
                value={searchTerm}
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

          {/* Profile Icon on the right */}
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
            onClick={() => setMiniSidebarOpen(false)}
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
            to="/PurchasesPage2"
            sx={{ color: "black" }}
          >
            <ListItemIcon>
              <HistoryIcon sx={{ color: "green" }} />
            </ListItemIcon>
            {miniSidebarOpen && <ListItemText primary="History" />}
          </ListItem>
          <Divider />
        </List>
      </Box>

      {/* Main Content Area */}
      <Container
        sx={{
          my: 4,
          flex: 1,
          ml: 0,
          pt: "80px",
          transition: (theme) =>
            theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {/* Only the main display logic remains */}
        <>
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

          {loading ? (
            <Box textAlign="center" mt={5}>
              <CircularProgress color="success" />
              <Typography>Loading farms...</Typography>
            </Box>
          ) : error ? (
            <Typography textAlign="center" color="error">
              {error}
            </Typography>
          ) : filteredDisplayFarms.length === 0 ? (
            <Typography textAlign="center">
              {searchTerm
                ? `No farms found matching "${searchTerm}".`
                : "No farms available at the moment."}
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 6,
              }}
            >
              {filteredDisplayFarms.map((farm) => (
                <Card
                  key={farm.id}
                  sx={{
                    boxShadow: 5,
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                    position: "relative",
                    opacity: farm.is_sold ? 0.7 : 1,
                  }}
                >
                  {farm.is_sold && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 3,
                      }}
                    >
                      <Typography
                        variant="h4"
                        color="white"
                        fontWeight="bold"
                        sx={{
                          transform: "rotate(-25deg)",
                          border: "2px solid white",
                          padding: "8px 16px",
                          borderRadius: "5px",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                        }}
                      >
                        SOLD
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex" }}>
                    {farm.images && farm.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        image={`http://localhost:8000${farm.images[0].image}`}
                        alt={farm.name}
                        onClick={() => handleImageClick(farm, 0)}
                        sx={{
                          width: "40%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: 2,
                          margin: 1,
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "40%",
                          height: "200px",
                          margin: 1,
                          backgroundColor: "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography>No Image</Typography>
                      </Box>
                    )}

                    <CardContent sx={{ width: "60%", padding: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {farm.name}
                      </Typography>

                      {/* Seller Username Display */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <AccountCircleIcon
                          sx={{ fontSize: "16px", color: "green", mr: 0.5 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "12px",
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          <strong>Seller:</strong>{" "}
                          {farm.username || farm.seller || "Unknown"}
                        </Typography>
                      </Box>

                      <Typography>
                        <strong>Price:</strong> {farm.price}/= Tshs
                      </Typography>
                      <Typography>
                        <strong>Size:</strong> {farm.size}
                      </Typography>
                      <Typography>
                        <strong>Quality:</strong> {farm.quality}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography fontSize="12px">
                          <strong>Location:</strong> {farm.location}
                        </Typography>
                        <Tooltip title="Show on Map">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFarm(farm);
                              setShowMap(true);
                            }}
                          >
                            <LocationOnIcon fontSize="small" color="success" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => handlePurchase(farm)}
                        sx={{ mt: 2, fontSize: 10 }}
                        disabled={farm.is_sold}
                      >
                        {farm.is_sold ? "SOLD OUT" : "Click to Purchase"}
                      </Button>
                    </CardContent>
                  </Box>
                  <Typography sx={{ p: 1, backgroundColor: "#d8f9d8" }}>
                    {farm.description}
                  </Typography>
                </Card>
              ))}
            </Box>
          )}
        </>
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
              color: "black",
              zIndex: 10,
            }}
          >
            <CloseIcon sx={{ fontSize: 25 }} />
          </IconButton>
          {currentFarm && currentFarm.images && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton onClick={handlePrevImage} sx={{ color: "black" }}>
                <ArrowBackIcon />
              </IconButton>
              <img
                src={`http://localhost:8000${currentFarm.images[currentImageIndex].image}`}
                alt="Farm View"
                style={{
                  width: "600px",
                  height: "400px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
              <IconButton onClick={handleNextImage} sx={{ color: "black" }}>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmPurchaseOpen}
        onClose={() => setConfirmPurchaseOpen(false)}
        aria-labelledby="confirm-purchase-title"
        aria-describedby="confirm-purchase-description"
      >
        <DialogTitle id="confirm-purchase-title">Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-purchase-description">
            Are you sure you want to proceed with purchasing{" "}
            <Typography component="span" fontWeight="bold">
              {selectedFarm?.name || "this farm"}
            </Typography>
            ? This action will initiate the purchase process.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPurchaseOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmPurchase} color="success" autoFocus>
            Yes, I'm sure
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        farm={selectedFarm}
        onFarmSold={handleFarmSold}
      />

      {/* Map Modal */}
      <FarmMapModal
        open={showMap}
        onClose={() => setShowMap(false)}
        farm={selectedFarm}
      />

      {/* <AppFooter /> */}
    </Box>
  );
};

export default Trial;
