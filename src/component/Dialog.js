import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import img7 from "../images/img7.jpg";
import img8 from "../images/img8.jpg";
import img9 from "../images/img9.jpg";

const farms = [
  {
    id: 1,
    name: "Green Acres",
    price: "$10,000",
    size: "5 acres",
    location: "Nairobi, Kenya",
    quality: "High",
    description: "Lush farmlands for eco-friendly farming.",
    image: img9,
    clickCount: 25,
  },
  {
    id: 2,
    name: "Golden Harvest",
    price: "$15,000",
    size: "10 acres",
    location: "Kampala, Uganda",
    quality: "Medium",
    description: "Experience farming like never before!",
    image: img7,
    clickCount: 40,
  },
  {
    id: 3,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
];

const RegistrationDialog = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" // Set max width
      fullWidth // Ensure full width within maxWidth
      sx={{ "& .MuiDialog-paper": { minWidth: "300px" } }} // Ensure min width
    >
      <DialogTitle sx={{ color: "green", textAlign: "center" }}>Welcome</DialogTitle>
      <DialogContent>
        <DialogContentText>Would you like to register?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          component={Link}
          to={`/farm/${farms.id}`}
          color="success"
          variant="contained"
          onClick={onClose} // Close dialog on button click
        >
          Proceed
        </Button>
        <Button
          component={Link}
          to="/LoginPage"
          color="success"
          variant="outlined"
          onClick={onClose} // Close dialog on button click
        >
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDialog;
