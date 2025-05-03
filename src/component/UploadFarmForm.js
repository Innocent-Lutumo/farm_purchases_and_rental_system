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
  images: [],
  farmType: "",
  rentTime: "",
};

const UploadFarmForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [openDialog, setOpenDialog] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

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
    const files = e.target.files;
    const filesArray = Array.from(files);
    if (filesArray.length < 3 || filesArray.length > 10) {
      setImageError("You must upload between 3 and 10 images.");
    } else {
      setImageError("");
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...filesArray],
      }));
    }
  };

  const handleImageRemove = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        if (key !== "rentTime" && key !== "images") {
          formPayload.append(key, value);
        }
      }
    });

    formData.images.forEach((image) => {
      formPayload.append("images", image);
    });

    if (formData.farmType === "Rent") {
      formPayload.append("rent_duration", formData.rentTime);
    }

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // Function to refresh token if needed
    const getAccessToken = async () => {
      let access= localStorage.getItem("access");
    
      if (!access) {
        console.error("No access token found, attempting refresh...");
        const refresh = localStorage.getItem("refresh");
    
        if (!refresh) {
          alert("Session expired. Please log in again.");
          setLoading(false);
          return null;
        }
    
        try {
          const refreshResponse = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refresh }),
          });
    
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem("access", data.access);
            access = data.access;
          } else {
            alert("Failed to refresh token. Redirecting to login.");
            setLoading(false);
            return null;
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          alert("An error occurred while refreshing token.");
          setLoading(false);
          return null;
        }
      }
    
      return access;
    };
    

    try {
      const access = await getAccessToken();
      if (!access) return;

      const response = await fetch("http://127.0.0.1:8000/api/uploadFarm/", {
        method: "POST",
        body: formPayload,
        headers: {
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${access}`,
        },
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
    } finally {
      setLoading(false);
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
                    value={formData.rentTime}
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

              {/* Image upload with validation */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ bgcolor: "green", borderRadius: "20" }}
                >
                  Upload Farm Images
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handleImageChange}
                    required={!formData.images.length}
                  />
                </Button>
                {imageError && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {imageError}
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  {formData.images.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">{image.name}</Typography>
                      <Button
                        onClick={() => handleImageRemove(index)}
                        color="error"
                        size="small"
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
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
                disabled={loading}  // Disable button when loading
              >
                {loading ? "Uploading..." : "Submit Farm"}  {/* Show loading text */}
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default UploadFarmForm;
