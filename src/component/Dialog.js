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
          to="/trial"
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
