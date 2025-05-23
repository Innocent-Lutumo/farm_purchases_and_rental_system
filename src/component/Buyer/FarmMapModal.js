import React from "react";
import { Modal, Box } from "@mui/material";
import { MapTilerFarmMap } from "../Shared/UserMap";

const FarmMapModal = ({ open, onClose, farm }) => {
  const [userLocation, setUserLocation] = React.useState({ lat: 0, lng: 0 });

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
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <MapTilerFarmMap
          farm={farm}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          onClose={onClose}
        />
      </Box>
    </Modal>
  );
};

export default FarmMapModal;