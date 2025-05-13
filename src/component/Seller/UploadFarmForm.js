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
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState(false);

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
    const files = Array.from(e.target.files);
    if (files.length < 3 || files.length > 10) {
      setImageError("You must upload between 3 and 10 images.");
    } else {
      setImageError("");
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
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
    setLoading(true);

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

    const getAccessToken = async () => {
      let access = localStorage.getItem("access");
      if (!access) {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
          alert("Session expired. Please log in again.");
          setLoading(false);
          return null;
        }

        try {
          const refreshResponse = await fetch(
            "http://127.0.0.1:8000/api/token/refresh/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh }),
            }
          );

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
          Authorization: `Bearer ${access}`,
        },
      });

      if (response.ok) {
        alert(`Farm uploaded successfully as ${formData.farmType}!`);
        setFormData({ ...initialFormData, farmType: formData.farmType });
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(to bottom right, #f1fff1, #ffffff)",
          boxShadow: 4,
        }}
      >
        <Dialog
          open={openDialog}
          PaperProps={{
            component: motion.div,
            initial: { scale: 0.7, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: { duration: 0.4 },
            sx: { borderRadius: 4, p: 2 },
          }}
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            Select Farm Type
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
              Is your farm for Sale or Rent?
            </Typography>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleFarmTypeSelect("Sale")}
                sx={{
                  px: 4,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)", boxShadow: 4 },
                }}
              >
                For Sale
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleFarmTypeSelect("Rent")}
                sx={{
                  px: 4,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)", boxShadow: 4 },
                }}
              >
                For Rent
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {formVisible && (
          <Paper
            elevation={5}
            sx={{ p: 4, borderRadius: 2, bgcolor: "#ffffff" }}
          >
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
                {["size", "price", "quality", "location", "email", "phone"].map(
                  (name, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <TextField
                        fullWidth
                        label={
                          name.charAt(0).toUpperCase() +
                          name.slice(1).replace(/([A-Z])/g, " $1")
                        }
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        sx={{
                          "& label.Mui-focused": { color: "green" },
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "green" },
                          },
                        }}
                        required
                      />
                    </Grid>
                  )
                )}
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
                          "&.Mui-focused fieldset": { borderColor: "green" },
                        },
                      }}
                      required
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    sx={{
                      "& label.Mui-focused": { color: "green" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": { borderColor: "green" },
                      },
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ bgcolor: "green", borderRadius: 2 }}
                  >
                    Upload Farm Images
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      multiple
                      onChange={handleImageChange}
                    />
                  </Button>
                  {imageError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {imageError}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    {formData.images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                          padding: "8px 12px",
                          borderRadius: 8,
                          backgroundColor: "#f9f9f9",
                          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
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
                      </motion.div>
                    ))}
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    background: "linear-gradient(to right, #43a047, #388e3c)",
                    color: "#fff",
                    textTransform: "none",
                    fontSize: 16,
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3,
                    "&:hover": {
                      background: "linear-gradient(to right, #388e3c, #2e7d32)",
                      transform: "scale(1.03)",
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Submit Farm"}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </Container>
    </motion.div>
  );
};

export default UploadFarmForm;
