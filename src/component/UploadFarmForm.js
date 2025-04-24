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
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { green } from "@mui/material/colors";

const initialFormData = {
  size: "",
  price: "",
  quality: "",
  location: "",
  email: "",
  description: "",
  phone: "",
  image: null,
  farmType: "",
  rentTime: "",
};

const UploadFarmForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [openDialog, setOpenDialog] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  const handleFarmTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      farmType: type,
    }));
    setOpenDialog(false);
    setFormVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        if (key !== "rentTime") {
          formPayload.append(key, value);
        }
      }
    });

    if (formData.farmType === "Rent") {
      formPayload.append("rent_duration", formData.rentTime);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/uploadFarm/", {
        method: "POST",
        body: formPayload,
      });

      if (response.ok) {
        alert(`Farm uploaded successfully as ${formData.farmType}!`);
        setFormData({
          ...initialFormData,
          farmType: formData.farmType,
        });
      } else {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        alert("Failed to upload farm. Check console for error.");
      }
    } catch (error) {
      console.error("Error uploading farm:", error);
      alert("An error occurred while uploading. Please try again.");
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: "transparent" }}
    >
      {/* Dialog for selecting farm type */}
      <Dialog
        open={openDialog}
        onClose={() => {}}
        sx={{ "& .MuiDialog-paper": { minWidth: 420 } }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>Select Farm Type</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            Is your farm for Sale or Rent?
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleFarmTypeSelect("Sale")}
            >
              For Sale
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleFarmTypeSelect("Rent")}
            >
              For Rent
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Main Form */}
      {formVisible && (
        <Paper elevation={5} sx={{ p: 4, borderRadius: 2, bgcolor: "#ffffff" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: green[800],
              mb: 3,
              textAlign: "center",
            }}
          >
            Upload a New Farm ({formData.farmType})
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {[
                { label: "Farm Size (acres)", name: "size" },
                { label: "Farm Price (Tshs)", name: "price" },
                { label: "Farm Quality", name: "quality" },
                { label: "Farm Location", name: "location" },
                { label: "Email Address", name: "email", type: "email" },
                { label: "Phone Number", name: "phone", type: "tel" },
              ].map(({ label, name, type = "text" }, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleInputChange}
                    sx={{
                      "& label.Mui-focused": { color: "green" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "green",
                        },
                      },
                    }}
                    required
                  />
                </Grid>
              ))}

              {/* Rent-specific field */}
              {formData.farmType === "Rent" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rent Duration (e.g., 6 months)"
                    name="rentTime"
                    value={formData.rent_duration}
                    onChange={handleInputChange}
                    sx={{
                      "& label.Mui-focused": { color: "green" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "green",
                        },
                      },
                    }}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Farm Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  sx={{
                    "& label.Mui-focused": { color: "green" },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "green",
                      },
                    },
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ bgcolor: "green", borderRadius: "20" }}
                >
                  Upload Farm Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                    required={!formData.image}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formData.image.name} selected
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  backgroundColor: green[700],
                  color: "#fff",
                  textTransform: "none",
                  px: 4,
                  "&:hover": { backgroundColor: green[800] },
                }}
              >
                Submit Farm
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default UploadFarmForm;
