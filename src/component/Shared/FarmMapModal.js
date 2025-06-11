import React from "react";
import { Modal, Box } from "@mui/material";
// Corrected import: Use default import syntax if MapTilerFarmMap is a default export
import MapTilerFarmMap from "./UserMap"; // Assuming the file is named MapTilerFarmMap.jsx

const FarmMapModal = ({ open, onClose, farm }) => {
  // The userLocation state is managed internally by MapTilerFarmMap.
  // It's not typically passed in this way if MapTilerFarmMap handles its own location logic.
  // If you *do* need to pass userLocation from here, ensure MapTilerFarmMap accepts and uses it.
  // For now, let's remove it as MapTilerFarmMap already handles getting user's location.
  // const [userLocation, setUserLocation] = React.useState({ lat: 0, lng: 0 });

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          height: "100vh", // Consider using a fixed height or max height if 100vh is too tall on some screens
          overflow: "hidden",
          borderRadius: "12px", // Added border radius for consistency with the map component's Paper style
          boxShadow: 24, // Add a shadow to the modal content box
        }}
      >
        <MapTilerFarmMap
          farm={farm}
          onClose={onClose}
          // Remove userLocation and setUserLocation props if MapTilerFarmMap manages its own user location
          // userLocation={userLocation}
          // setUserLocation={setUserLocation}
        />
      </Box>
    </Modal>
  );
};

export default FarmMapModal;