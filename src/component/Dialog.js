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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Welcome!</DialogTitle>
      <DialogContent>
        <DialogContentText>Have you already registered?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          component={Link}
          to="/RegisterPage"
          color="success"
          variant="contained"
          onClick={onClose} // Close dialog on button click
        >
          Go to Register
        </Button>
        <Button
          component={Link}
          to="/LoginPage"
          color="primary"
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
