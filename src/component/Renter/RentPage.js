import React, { useState, useEffect } from "react";
import RentDialog from "./RentDialog";
import FarmStatusIndicator from "./FarmStatusIndicator";
import { MapTilerFarmMap } from "../Shared/UserMap";
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
import axios from "axios";


const RentPage = () => {
  const [search, setSearch] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentFarm, setCurrentFarm] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmStatus, setFarmStatus] = useState({});
  const [rentDialogOpen, setRentDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [farmToConfirm, setFarmToConfirm] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [miniSidebarOpen, setMiniSidebarOpen] = useState(false);

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

  // Handler for opening the map modal (updated to use showMap)
  const handleLocationClick = (farm) => {
    setSelectedFarm(farm); 
    setShowMap(true);
  };

  // Handler for closing the map modal (updated to use showMap)
  const handleMapModalClose = () => {
    setShowMap(false);
    setSelectedFarm(null); 
  };

  // Handler for opening the confirmation dialog
  const handleRentClick = (farm) => {
    setFarmToConfirm(farm);
    setConfirmDialogOpen(true);
  };

  // Handle user's confirmation
  const handleConfirmRent = () => {
    setConfirmDialogOpen(false); 
    setSelectedFarm(farmToConfirm); 
    setRentDialogOpen(true); 
  };

  // Handle cancellation of confirmation
  const handleCancelRent = () => {
    setConfirmDialogOpen(false);
    setFarmToConfirm(null);
  };

  const handleRentDialogClose = () => {
    setRentDialogOpen(false);
    if (selectedFarm) {
      checkFarmStatus(selectedFarm.id);
    }
    // Clear selected farm after closing the main dialog
    setSelectedFarm(null);
  };

  const checkFarmStatus = async (farmId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/transactions/farm/${farmId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to check farm status: ${response.status}`);
      }
      const data = await response.json();
      const isTaken = data.length > 0;
      updateFarmStatus(farmId, isTaken);
      return isTaken;
    } catch (err) {
      console.error("Error checking farm status:", err);
      return false;
    }
  };

  const updateFarmStatus = (farmId, status) => {
    setFarmStatus((prevStatus) => ({
      ...prevStatus,
      [farmId]: status,
    }));
  };

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/farmsrent/validated/"
        );
        const validatedFarms = response.data.filter(
          (farm) => farm.is_validated && !farm.is_rejected
        );

        setFarms(validatedFarms);
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleToggleMiniSidebar = () => {
    setMiniSidebarOpen(!miniSidebarOpen);
  };

  const filteredFarms = farms.filter(
    (farm) =>
      farm.location.toLowerCase().includes(search.toLowerCase()) ||
      (farm.price &&
        farm.price.toString().toLowerCase().includes(search.toLowerCase())) ||
      farm.size.toLowerCase().includes(search.toLowerCase()) ||
      farm.name.toLowerCase().includes(search.toLowerCase()) ||
      farm.description.toLowerCase().includes(search.toLowerCase())
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
            <MenuIcon sx={{ fontSize: "2.5rem" }} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Farm Finder</Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              Find your ideal farmland for rent.
            </Typography>
          </Box>

          {/* Search Input and Button */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            {showSearchInput && (
              <InputBase
                placeholder="Search farms..."
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
            <IconButton
              color="inherit"
              component={Link}
              to="#"
              sx={{ ml: 2 }} 
            >
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
          ml: 3,
          pt: "80px",
          transition: (theme) =>
            theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
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

        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress color="success" />
            <Typography>Loading farms...</Typography>
          </Box>
        ) : filteredFarms.length === 0 ? (
          <Typography textAlign="center">
            {search
              ? `No farms found matching "${search}".`
              : "No farms available for rent at the moment."}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: 6,
            }}
          >
            {filteredFarms.map((farm) => {
              const isTaken = farmStatus[farm.id] || false;

              return (
                <Card
                  key={farm.id}
                  sx={{
                    boxShadow: 5,
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "0.3s",
                    "&:hover": { transform: isTaken ? "none" : "scale(1.05)" },
                    position: "relative",
                    opacity: isTaken ? 0.6 : 1,
                    backgroundColor: isTaken ? "#f0f0f0" : "white",
                    filter: isTaken ? "grayscale(50%)" : "none",
                  }}
                >
                  <FarmStatusIndicator
                    farmId={farm.id}
                    farmType="rent"
                    size="medium"
                    initialStatus={isTaken}
                    statusCallback={(status) => updateFarmStatus(farm.id, status)}
                  />

                  {isTaken && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%) rotate(-30deg)",
                        backgroundColor: "rgba(220, 0, 0, 0.7)",
                        color: "white",
                        padding: "5px 20px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "24px",
                        zIndex: 5,
                        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                        border: "2px solid #fff",
                      }}
                    >
                      TAKEN
                    </Box>
                  )}

                  <Box sx={{ display: "flex" }}>
                    {farm.images && farm.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        image={`http://localhost:8000${farm.images[0].image}`}
                        alt={farm.name}
                        onClick={
                          isTaken ? undefined : () => handleImageClick(farm, 0)
                        }
                        sx={{
                          width: "40%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: 2,
                          margin: 1,
                          cursor: isTaken ? "default" : "pointer",
                          filter: isTaken
                            ? "grayscale(80%) brightness(0.9)"
                            : "none",
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
                            onClick={() => handleLocationClick(farm)}
                          >
                            <LocationOnIcon fontSize="small" color="success" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {farm.rent_duration && (
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            color: "#333",
                            mt: 1,
                          }}
                        >
                          Duration: {farm.rent_duration} Months
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        color={isTaken ? "inherit" : "success"}
                        fullWidth
                        disabled={isTaken}
                        onClick={
                          isTaken ? undefined : () => handleRentClick(farm)
                        }
                        sx={{
                          mt: 2,
                          fontSize: 10,
                          backgroundColor: isTaken ? "#dcdcdc" : undefined,
                          color: isTaken ? "#999" : undefined,
                          cursor: isTaken ? "not-allowed" : "pointer",
                          pointerEvents: isTaken ? "none" : "auto",
                          "&:hover": {
                            backgroundColor: isTaken ? "#dcdcdc" : undefined,
                          },
                          textDecoration: isTaken ? "line-through" : "none",
                        }}
                      >
                        {isTaken ? "Already Rented" : "Click to Rent"}
                      </Button>
                    </CardContent>
                  </Box>
                  <Typography sx={{ p: 1, backgroundColor: isTaken ? "#f0f0f0" : "#d8f9d8" }}>
                    {farm.description}
                  </Typography>
                </Card>
              );
            })}
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

      {/* Map Modal */}
      <Modal open={showMap} onClose={handleMapModalClose}>
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
            width: "80%",
            height: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={handleMapModalClose}
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
          {selectedFarm && selectedFarm.location ? (
            <MapTilerFarmMap
              location={selectedFarm.location}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Typography>Loading map...</Typography>
          )}
        </Box>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelRent}
        aria-labelledby="confirm-rent-title"
        aria-describedby="confirm-rent-description"
      >
        <DialogTitle id="confirm-rent-title">Confirm Rental</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-rent-description">
            Are you sure you want to proceed with renting{" "}
            <Typography component="span" fontWeight="bold">
              {farmToConfirm?.name || "this farm"}
            </Typography>
            ? This action will initiate the rental process.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRent} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRent} color="success" autoFocus>
            Yes, I'm sure
          </Button>
        </DialogActions>
      </Dialog>

      <RentDialog
        open={rentDialogOpen}
        onClose={handleRentDialogClose}
        farm={selectedFarm}
      />
    </Box>
  );
};

export default RentPage;