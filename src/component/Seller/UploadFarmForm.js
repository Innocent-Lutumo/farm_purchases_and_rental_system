import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogActions,
  Paper,
  Alert,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Define a custom theme to override default primary color to a real green
const greenTheme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
      contrastText: "#fff",
    },
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
      contrastText: "#fff",
    },
    error: {
      main: "#f44336",
    },
    background: {
      default: "#f9f9f9",
      paper: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "green",
          "&:hover": {
            backgroundColor: "#388E3C",
          },
        },
        outlinedPrimary: {
          color: "green",
          borderColor: "#4CAF50",
          "&:hover": {
            borderColor: "#388E3C",
            color: "#388E3C",
          },
        },
        textPrimary: {
          color: "green",
          "&:hover": {
            backgroundColor: "rgba(76, 175, 80, 0.04)",
          },
        },
        containedSuccess: {
          backgroundColor: "#4CAF50",
          "&:hover": {
            backgroundColor: "#388E3C",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#4CAF50",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(0, 0, 0, 0.23)",
            },
            "&:hover fieldset": {
              borderColor: "#388E3C",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4CAF50",
            },
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: "#4CAF50",
          },
          "&.Mui-completed": {
            color: "#4CAF50",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          "&.MuiAlert-severitySuccess": {
            backgroundColor: "#e8f5e9",
            color: "#2E7D32",
            "& .MuiAlert-icon": {
              color: "#4CAF50",
            },
          },
        },
      },
    },
  },
});

const steps = ["Farm Details", "Uploads", "Confirmation"];

const UploadFarmForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]);
  const [farmTypeDialogOpen, setFarmTypeDialogOpen] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  // Validation schema
  const validateField = (name, value) => {
    switch (name) {
      case "size":
      case "price":
      case "quality":
      case "location":
      case "description":
      case "farm_number":
        return !value?.trim() ? "This field is required" : "";
      case "email":
        if (!value?.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Invalid email format" : "";
      case "phone":
        return !value?.trim() ? "Phone number is required" : "";
      default:
        return "";
    }
  };

  const [formValues, setFormValues] = useState({
    size: "",
    price: "",
    quality: "",
    location: "",
    email: "",
    phone: "",
    description: "",
    farm_number: "",
    rent_duration: "",
    farmType: "", 
    passport: null,
    ownership_certificate: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Clear success message when user starts typing
    if (successMessage) setSuccessMessage("");

    // Validate field and update errors
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};

    if (step === 0) {
      const requiredFields = [
        "size",
        "price",
        "quality",
        "location",
        "email",
        "phone",
        "description",
      ];
      requiredFields.forEach((field) => {
        const error = validateField(field, formValues[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
      // Also validate rent_duration if farmType is Rent
      if (formValues.farmType === "Rent" && !formValues.rent_duration?.trim()) {
        newErrors.rent_duration = "Rent duration is required for rent farms";
        isValid = false;
      }
    } else if (step === 1) {
      if (!formValues.farm_number?.trim()) {
        newErrors.farm_number = "Farm number is required";
        isValid = false;
      }
      // Check images length
      if (images.length < 4 || images.length > 10) {
        addError("Please upload between 4 and 10 farm images.");
        isValid = false;
      }
      if (!formValues.passport) {
        addError("Passport document is required.");
        isValid = false;
      }
      if (!formValues.ownership_certificate) {
        addError("Ownership certificate is required.");
        isValid = false;
      }
    }

    setFormErrors((prev) => ({ ...prev, ...newErrors }));
    // Mark all relevant fields as touched for immediate feedback on step change
    const newTouched = {};
    Object.keys(newErrors).forEach(field => newTouched[field] = true);
    setTouched(prev => ({...prev, ...newTouched}));

    return isValid;
  };

  const addError = (message, details = null) => {
    const newError = {
      id: Date.now() + Math.random(),
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
    };
    setErrors((prev) => [newError, ...prev]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleNext = () => {
    clearErrors();

    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    clearErrors();
    setActiveStep((prev) => prev - 1);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        addError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
      setFormValues((prev) => ({ ...prev, [fieldName]: file }));
      // Clear any previous file-related errors specific to this field
      setErrors((prev) =>
        prev.filter(
          (error) =>
            !(error.message.includes(fieldName) || error.message.includes("document"))
        )
      );
    }
  };

  const handleImageUpload = (e) => {
    const selected = Array.from(e.target.files);

    // Clear previous image errors BEFORE validation
    setErrors((prev) => prev.filter((error) => !error.message.includes("images") && !error.message.includes("image validation")));

    // Perform validation checks first
    const invalidImages = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    selected.forEach((file, index) => {
      if (file.size > maxSize) {
        invalidImages.push(`Image ${index + 1} (${file.name}) is too large (max 5MB)`);
      }
      if (!validTypes.includes(file.type)) {
        invalidImages.push(
          `Image ${index + 1} (${file.name}) has invalid format (use JPG, PNG, or WebP)`
        );
      }
    });

    if (invalidImages.length > 0) {
      addError("Image validation failed:", invalidImages);
      setImages([]); // Clear images if any validation fails
      return;
    }

    // Now, check the quantity after individual image validation
    if (selected.length < 4 || selected.length > 10) {
      addError(
        `Invalid number of images: ${selected.length}. Please upload between 4 and 10 images.`
      );
      setImages([]); // Clear previously selected images if quantity validation fails
      return;
    }

    // If all validations pass, set the images
    setImages(selected);
  };

  const handleFarmTypeSelect = (type) => {
    setFormValues((prev) => ({ ...prev, farmType: type })); // Changed from farm_type to farmType
    setFarmTypeDialogOpen(false);
    clearErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearErrors();
    setSuccessMessage("");

    // Final validation for both steps
    const step0Valid = validateStep(0);
    const step1Valid = validateStep(1);

    if (!step0Valid || !step1Valid) {
      addError("Please fix all validation errors before submitting.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();

    // Append text fields - using the exact field names expected by backend
    formData.append("farmType", formValues.farmType); // Backend expects "farmType"
    formData.append("size", formValues.size);
    formData.append("price", formValues.price);  
    formData.append("quality", formValues.quality);
    formData.append("location", formValues.location);
    formData.append("email", formValues.email);
    formData.append("phone", formValues.phone);
    formData.append("description", formValues.description);
    formData.append("farm_number", formValues.farm_number);
    
    // Only append rent_duration if it's a Rent type farm
    if (formValues.farmType === "Rent" && formValues.rent_duration) {
      formData.append("rent_duration", formValues.rent_duration);
    }

    // Append file fields
    if (formValues.passport) {
      formData.append("passport", formValues.passport);
    }
    if (formValues.ownership_certificate) {
      formData.append("ownership_certificate", formValues.ownership_certificate);
    }

    // Append images - backend expects 'images' key
    images.forEach((image) => {
      formData.append("images", image); // Backend uses request.FILES.getlist('images')
    });

    // Get the access token from localStorage
    const accessToken = localStorage.getItem("access");

    if (!accessToken) {
      addError("Authentication token not found. Please log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/UploadFarm/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle different error response formats
        if (errorData.error) {
          // Single error message from backend
          throw new Error(errorData.error);
        } else {
          // Multiple field errors (serializer errors)
          const detailedErrors = [];
          for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
              detailedErrors.push(`${key}: ${errorData[key].join(", ")}`);
            } else {
              detailedErrors.push(`${key}: ${errorData[key]}`);
            }
          }
          throw new Error(`Validation errors: ${detailedErrors.join("; ")}`);
        }
      }

      const responseData = await response.json();
      console.log("Farm submitted successfully:", responseData);
      setSuccessMessage(
        responseData.message || "Farm submitted successfully! Redirecting you to the seller page..."
      );

      // Programmatic navigation to SellerPage after a delay
      setTimeout(() => {
        navigate("/SellerPage");
      }, 2000); // 2-second delay before redirection
    } catch (networkError) {
      addError(`Failed to submit farm: ${networkError.message}`);
      console.error("Submit error:", networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeError = (errorId) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  };

  return (
    <ThemeProvider theme={greenTheme}>
      <Box
        sx={{
          maxWidth: 1000,
          margin: "auto",
          mt: 4,
          mb: 4,
          p: 3,
          bgcolor: "background.default",
          color: "#333",
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        {/* Farm Type Selection Dialog */}
        <Dialog open={farmTypeDialogOpen} disableEscapeKeyDown>
          <DialogTitle>Select Farm Type</DialogTitle>
          <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleFarmTypeSelect("Sale")}
            >
              For Sale
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleFarmTypeSelect("Rent")}
            >
              For Rent
            </Button>
          </DialogActions>
        </Dialog>

        {!farmTypeDialogOpen && (
          <>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="h4" component="h1" color="primary">
                Upload Farm - {formValues.farmType}
              </Typography>
            </Box>

            {/* Success Message */}
            <Collapse in={!!successMessage}>
              <Alert
                severity="success"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setSuccessMessage("")}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 3 }}
              >
                <Typography variant="body1">
                  <strong>Success!</strong> {successMessage}
                </Typography>
              </Alert>
            </Collapse>

            {/* Error Display */}
            <Collapse in={errors.length > 0}>
              <Alert
                severity="error"
                action={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      aria-label="toggle-details"
                      color="inherit"
                      size="small"
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                    >
                      {showErrorDetails ? "▲" : "▼"}
                    </IconButton>
                    <IconButton
                      aria-label="clear-all"
                      color="inherit"
                      size="small"
                      onClick={clearErrors}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                }
                sx={{ mb: 3 }}
              >
                <Typography variant="body1">
                  <strong>
                    {errors.length === 1
                      ? "1 Error Found"
                      : `${errors.length} Errors Found`}
                  </strong>
                </Typography>
                <Collapse in={showErrorDetails}>
                  <List dense sx={{ mt: 1 }}>
                    {errors.map((error) => (
                      <Paper key={error.id} sx={{ p: 1.5, mb: 1, bgcolor: "error.light" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {error.message}
                            </Typography>
                            {error.details && (
                              <List
                                dense
                                sx={{ ml: 2, listStyleType: "disc", pl: 2 }}
                              >
                                {Array.isArray(error.details) ? (
                                  error.details.map((detail, idx) => (
                                    <ListItem
                                      key={idx}
                                      sx={{ display: "list-item", py: 0 }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2">
                                            {detail}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  ))
                                ) : (
                                  <ListItem sx={{ display: "list-item", py: 0 }}>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2">
                                          {error.details}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                )}
                              </List>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {error.timestamp}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeError(error.id)}
                            sx={{ ml: 1, mt: -1 }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Collapse>
              </Alert>
            </Collapse>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconProps={{ color: "primary" }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Form Content */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              {/* Step 0: Farm Details */}
              {activeStep === 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  {[
                    { field: "size", label: "Farm Size(Acres)" },
                    { field: "price", label: "Price(TZS)" },
                    { field: "quality", label: "Quality" },
                    { field: "location", label: "Location" },
                    { field: "email", label: "Email", type: "email" },
                    { field: "phone", label: "Phone", type: "tel" },
                  ].map(({ field, label, type = "text" }) => (
                    <TextField
                      key={field}
                      label={label}
                      name={field}
                      type={type}
                      value={formValues[field]}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched[field] && !!formErrors[field]}
                      helperText={touched[field] && formErrors[field]}
                      fullWidth
                      variant="outlined"
                    />
                  ))}

                  <TextField
                    label="Description"
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    error={touched.description && !!formErrors.description}
                    helperText={touched.description && formErrors.description}
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    sx={{ gridColumn: { md: "span 2" } }}
                  />

                  {formValues.farmType === "Rent" && (
                    <TextField
                      label="Rent Duration(Months)"
                      name="rent_duration"
                      value={formValues.rent_duration}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.rent_duration && !!formErrors.rent_duration}
                      helperText={touched.rent_duration && formErrors.rent_duration}
                      fullWidth
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              {/* Step 1: Uploads */}
              {activeStep === 1 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <TextField
                    label="Farm Number"
                    name="farm_number"
                    value={formValues.farm_number}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    error={touched.farm_number && !!formErrors.farm_number}
                    helperText={touched.farm_number && formErrors.farm_number}
                    fullWidth
                    variant="outlined"
                  />

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Passport Document
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadFileIcon />}
                      sx={{ py: 1.5 }}
                      color="primary"
                    >
                      Upload Passport
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "passport")}
                      />
                    </Button>
                    {formValues.passport && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        <CheckCircleOutlineIcon
                          sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                        />
                        {formValues.passport.name}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Ownership Certificate
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadFileIcon />}
                      sx={{ py: 1.5 }}
                      color="primary"
                    >
                      Upload Certificate
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(e, "ownership_certificate")
                        }
                      />
                    </Button>
                    {formValues.ownership_certificate && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        <CheckCircleOutlineIcon
                          sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                        />
                        {formValues.ownership_certificate.name}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ gridColumn: { md: "span 2" } }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Farm Images (4–10 required)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<ImageOutlinedIcon />}
                      sx={{ py: 1.5 }}
                      color="primary"
                    >
                      Upload Farm Images
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                    {images.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          <CheckCircleOutlineIcon
                            sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                          />
                          {images.length} images selected
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{ maxHeight: 150, overflow: "auto", p: 1.5 }}
                        >
                          <List dense>
                            {images.map((file, idx) => (
                              <ListItem key={idx} disableGutters>
                                <ListItemText
                                  primary={`${idx + 1}. ${file.name} (${(
                                    file.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)} MB)`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Step 2: Confirmation */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Please review your information
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {Object.entries(formValues).map(([key, value]) => {
                      if (key === "passport" || key === "ownership_certificate") {
                        return (
                          <Box key={key}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {key.charAt(0).toUpperCase() +
                                key.slice(1).replace("_", " ")}
                            </Typography>
                            <Typography variant="body1">
                              {value ? (
                                <CheckCircleOutlineIcon
                                  color="primary"
                                  sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                                />
                              ) : (
                                <ErrorOutlineIcon
                                  color="error"
                                  sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                                />
                              )}
                              {value ? value.name : "(not provided)"}
                            </Typography>
                          </Box>
                        );
                      }
                      const displayValue = value ? value.toString() : "(not provided)";
                      return (
                        <Box key={key}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {key.charAt(0).toUpperCase() +
                              key.slice(1).replace("_", " ")}
                          </Typography>
                          <Typography variant="body1">{displayValue}</Typography>
                        </Box>
                      );
                    })}
                    <Box sx={{ gridColumn: { md: "span 2" } }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Farm Images
                      </Typography>
                      <Typography variant="body1">
                        {images.length > 0 ? (
                          <CheckCircleOutlineIcon
                            color="primary"
                            sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                          />
                        ) : (
                          <ErrorOutlineIcon
                            color="error"
                            sx={{ verticalAlign: "middle", fontSize: 18, mr: 0.5 }}
                          />
                        )}
                        {images.length > 0
                          ? `${images.length} images ready to upload`
                          : "(no images)"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                
                <Box sx={{ flex: 1 }} />
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? null : <CheckCircleOutlineIcon />}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Farm"}
                  </Button>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default UploadFarmForm;