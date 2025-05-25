import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { green } from "@mui/material/colors";

const steps = ["Farm Details", "Uploads", "Confirmation"];

const UploadFarmForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [farmTypeDialogOpen, setFarmTypeDialogOpen] = useState(true);
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: green[700] },
    },
  });

  const formik = useFormik({
    initialValues: {
      size: "",
      price: "",
      quality: "",
      location: "",
      email: "",
      phone: "",
      description: "",
      farmNumber: "",
      rentTime: "",
      farmType: "",
      passport: null,
      ownershipCertificate: null,
    },
    validationSchema: Yup.object({
      size: Yup.string().required("Required"),
      price: Yup.string().required("Required"),
      quality: Yup.string().required("Required"),
      location: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      phone: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      farmNumber: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      if (images.length < 4 || images.length > 10) {
        alert("Please upload between 4 and 10 images.");
        return;
      }

      const token = localStorage.getItem("access");
      if (!token) {
        alert("You must be logged in to submit.");
        return;
      }

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      fetch("http://127.0.0.1:8000/api/UploadFarm/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data?.detail || "Submission failed");
          }
          return res.json();
        })
        .then(() => {
          alert("Farm submitted successfully!");
          navigate("/SellerPage"); 
        })
        .catch((err) => {
          alert(`Error: ${err.message}`);
        });
    },
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFileChange = (e, fieldName) => {
    formik.setFieldValue(fieldName, e.target.files[0]);
  };

  const handleImageUpload = (e) => {
    const selected = Array.from(e.target.files);
    const total = selected.length;

    if (total < 4 || total > 10) {
      alert("Please upload between 4 and 10 images.");
      return;
    }

    setImages(selected);
  };

  const handleFarmTypeSelect = (type) => {
    formik.setFieldValue("farmType", type);
    setFarmTypeDialogOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Dialog open={farmTypeDialogOpen}>
          <DialogTitle>Select Farm Type</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="center" gap={2} py={2}>
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

        {!farmTypeDialogOpen && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="primary">
                Upload Farm - {formik.values.farmType}
              </Typography>
              <Box>
                <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              </Box>
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={formik.handleSubmit}>
              <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 3 }}>
                {activeStep === 0 && (
                  <Grid container spacing={2}>
                    {[
                      "size",
                      "price",
                      "quality",
                      "location",
                      "email",
                      "phone",
                      "description",
                    ].map((field) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <TextField
                          fullWidth
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          name={field}
                          value={formik.values[field]}
                          onChange={formik.handleChange}
                          error={formik.touched[field] && Boolean(formik.errors[field])}
                          helperText={formik.touched[field] && formik.errors[field]}
                        />
                      </Grid>
                    ))}

                    {formik.values.farmType === "Rent" && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Rent Duration"
                          name="rentTime"
                          value={formik.values.rentTime}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    )}
                  </Grid>
                )}

                {activeStep === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Farm Number"
                        name="farmNumber"
                        value={formik.values.farmNumber}
                        onChange={formik.handleChange}
                        error={formik.touched.farmNumber && Boolean(formik.errors.farmNumber)}
                        helperText={formik.touched.farmNumber && formik.errors.farmNumber}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth>
                        Upload Passport
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileChange(e, "passport")}
                        />
                      </Button>
                      {formik.values.passport && (
                        <Typography>{formik.values.passport.name}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth>
                        Upload Certificate
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileChange(e, "ownershipCertificate")}
                        />
                      </Button>
                      {formik.values.ownershipCertificate && (
                        <Typography>{formik.values.ownershipCertificate.name}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" component="label">
                        Upload Farm Images (4–10)
                        <input
                          type="file"
                          multiple
                          hidden
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Button>
                      {images.length > 0 && (
                        <Box mt={2}>
                          {images.map((file, idx) => (
                            <Typography key={idx}>{file.name}</Typography>
                          ))}
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      Please review your information
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(formik.values).map(([key, value]) => {
                        if (key === "passport" || key === "ownershipCertificate") return null;
                        const displayValue = value ? value.toString() : "(not provided)";
                        return (
                          <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="subtitle2" color="textSecondary">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Typography>
                            <Typography variant="body1">{displayValue}</Typography>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                <Box mt={4} display="flex" justifyContent="space-between">
                  {activeStep > 0 && (
                    <Button variant="outlined" onClick={handleBack} color="success">
                      Back
                    </Button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <Button variant="contained" onClick={handleNext} color="success">
                      Next
                    </Button>
                  ) : (
                    <Button variant="contained" type="submit" color="success">
                      Submit
                    </Button>
                  )}
                </Box>
              </Paper>
            </form>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default UploadFarmForm;
