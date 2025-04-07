import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { green, } from "@mui/material/colors";

const UploadFarmForm = () => {
  const [formData, setFormData] = useState({
    size: "",
    price: "",
    quality: "",
    location: "",
    email: "",
    description: "",
    phone: "",
    image: null,
    farmType: "",
  });

  const [openDialog, setOpenDialog] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleFarmTypeSelect = (type) => {
    setFormData((prevState) => ({
      ...prevState,
      farmType: type,
    }));
    setOpenDialog(false);
    alert(`Farm uploaded successfully as ${type}!`);
  };

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, p: 3, borderRadius: 2 }}
    >
      <Paper elevation={5} sx={{ p: 4, borderRadius: 2, bgcolor: "#ffffff" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: green[800], mb: 3, textAlign: "center", }}
        >
          Upload a New Farm
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farm Size (acres)"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farm Price ($)"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farm Quality (e.g., Excellent, Good)"
                name="quality"
                value={formData.quality}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farm Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            {/* Move Phone Number here before Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            {/* Farm Description input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Farm Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                variant="outlined"
                sx={{
                  "& label.Mui-focused": {
                    color: "green",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "green",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                sx={{
                  backgroundColor: green[700],
                  color: "#fff",
                  textTransform: "none",
                  "&:hover": { backgroundColor: green[800] },
                }}
              >
                Upload Farm Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                  required
                />
              </Button>

              {formData.image && (
                <Typography variant="body2" sx={{ mt: 2, color: green[800] }}>
                  {formData.image.name} selected
                </Typography>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: green[700],
                color: "#fff",
                textTransform: "none",
                "&:hover": { backgroundColor: green[800] },
              }}
            >
              Submit Farm
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Dialog for farm type selection */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{ "& .MuiDialog-paper": { minWidth: 420 } }} 
      >
        <DialogTitle sx={{ textAlign: "center", }} >Select Farm Type</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center", }}>
            Is your farm for Sale or Rent?
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mr: 2, marginLeft: 13, borderRadius: 3, }}
            onClick={() => handleFarmTypeSelect("Sale")}
          >
            For Sale
          </Button>
          <Button
            variant="contained"
            color="warning"
            sx={{ borderRadius: 3, }}
            onClick={() => handleFarmTypeSelect("Rent")}
          >
            For Rent
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UploadFarmForm;
