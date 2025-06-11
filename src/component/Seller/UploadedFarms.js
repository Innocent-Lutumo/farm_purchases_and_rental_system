import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Typography,
  Paper,
  Tooltip,
  MenuItem,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Columns as TableIcon,
  Grid as CardIcon,
} from "lucide-react";
import {
  LocationOn as LocationOnIcon,
  Agriculture as AgricultureIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  SquareFoot as SquareFootIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Feedback as FeedbackIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import SellerDrawer from "./SellerDrawer"; // Assuming this exists
import SellerAppBar from "./SellerAppBar"; // Assuming this exists
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

// Base URL for your API
const BASE_URL = "http://127.0.0.1:8000";

// Function to get validation status information
const getValidationStatusInfo = (farm) => {
  if (farm.is_validated) {
    return {
      label: "Validated",
      color: "#4caf50",
      chipColor: "success",
      icon: <CheckCircle size={16} />,
      backgroundColor: "#e8f5e9",
    };
  } else if (farm.is_rejected) {
    return {
      label: "Rejected",
      color: "#f44336",
      chipColor: "error",
      icon: <XCircle size={16} />,
      backgroundColor: "#ffebee",
    };
  } else {
    return {
      label: "Pending",
      color: "#ff9800",
      chipColor: "warning",
      icon: <Clock size={16} />,
      backgroundColor: "#fff3e0",
    };
  }
};

// Theme creation
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2e7d32" },
      secondary: { main: "#f50057" },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: "none", fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0px 2px 4px -1px rgba(0,0,0,0.1)"
                : "0px 2px 4px -1px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
      h6: { fontWeight: 600 },
    },
  });

// Styled Card Component
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 150, 0, 0.2)",
  },
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

// Styled input for file upload (hidden)
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadedFarms = () => {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [editedFarm, setEditedFarm] = useState({});
  const [originalFarmUniqueId, setOriginalFarmUniqueId] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  // Search functionality states
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // View mode state - Changed default to 'table' as requested
  const [viewMode, setViewMode] = useState("table");

  // Pagination states for table view
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // File upload states for edit dialog (for 'images' field)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // File upload states for 'passport' and 'ownership_certificate'
  const [selectedPassportFile, setSelectedPassportFile] = useState(null);
  const [previewPassport, setPreviewPassport] = useState(null);
  const [selectedOwnershipCertificateFile, setSelectedOwnershipCertificateFile] = useState(null);
  const [previewOwnershipCertificate, setPreviewOwnershipCertificate] = useState(null);

  const navigate = useNavigate();
  const theme = useMemo(
    () => getTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );
  const drawerWidth = 240;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      console.warn("No token found. Redirecting to login.");
      window.location.href = "/LoginPage";
      return;
    }
    fetchFarms();
  }, []);

  // Search effect - filter farms when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFarms(farms);
    } else {
      const filtered = farms.filter((farm) => {
        const query = searchQuery.toLowerCase();
        return (
          farm.location?.toLowerCase().includes(query) ||
          farm.farm_type?.toLowerCase().includes(query) ||
          farm.quality?.toLowerCase().includes(query) ||
          farm.description?.toLowerCase().includes(query) ||
          farm.price?.toString().toLowerCase().includes(query)
        );
      });
      setFilteredFarms(filtered);
    }
  }, [searchQuery, farms]);

  // Cleanup for URL.createObjectURL for images
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Cleanup for URL.createObjectURL for documents
  useEffect(() => {
    return () => {
      if (previewPassport && typeof previewPassport === 'string' && previewPassport.startsWith('blob:')) {
        URL.revokeObjectURL(previewPassport);
      }
      if (previewOwnershipCertificate && typeof previewOwnershipCertificate === 'string' && previewOwnershipCertificate.startsWith('blob:')) {
        URL.revokeObjectURL(previewOwnershipCertificate);
      }
    };
  }, [previewPassport, previewOwnershipCertificate]);


  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Authentication token missing");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(`${BASE_URL}/api/all-farms/`, config);
      // Ensure data is an array, map 'data' if nested
      const data = Array.isArray(res.data)
        ? res.data.map((farm) => farm.data || farm)
        : [];

      const userEmail = localStorage.getItem("user_email");
      const userFarms = userEmail
        ? data.filter((farm) => farm.email === userEmail)
        : data;

      userFarms.forEach((farm) => {
        farm.uniqueId = `${farm.id}-${farm.farm_type}`;
      });

      setFarms(userFarms);
      setFilteredFarms(userFarms);
      setError(null);
    } catch (error) {
      console.error("Error fetching farms:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setError("Failed to load farms. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Search handlers
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    console.log("Search submitted with query:", searchQuery);
  };

  const handleEditClick = (farm) => {
    const farmCopy = JSON.parse(JSON.stringify(farm));
    setEditedFarm(farmCopy);
    setSelectedFarm(farmCopy);
    setOriginalFarmUniqueId(farm.uniqueId);

    // Clear any previously selected new files
    setSelectedFiles([]);
    setPreviewImages([]);
    setSelectedPassportFile(null);
    setPreviewPassport(null);
    setSelectedOwnershipCertificateFile(null);
    setPreviewOwnershipCertificate(null);

    // Set initial previews for existing documents if available
    if (farm.passport) {
        setPreviewPassport(`${BASE_URL}${farm.passport}`);
    } else {
        setPreviewPassport(null);
    }
    if (farm.ownership_certificate) {
        setPreviewOwnershipCertificate(`${BASE_URL}${farm.ownership_certificate}`);
    } else {
        setPreviewOwnershipCertificate(null);
    }

    setOpenEditDialog(true);
  };

  const handleDeleteClick = (farm) => {
    setSelectedFarm(farm);
    setOpenDeleteDialog(true);
  };

  const handleViewDetailsClick = (farm) => {
    setSelectedFarm(farm);
    setOpenViewDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedFarm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection for 'images'
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Handle file selection for 'passport'
  const handlePassportFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedPassportFile(file);
      setPreviewPassport(URL.createObjectURL(file));
    } else {
      setSelectedPassportFile(null);
      setPreviewPassport(null);
    }
  };

  // Handle file selection for 'ownership_certificate'
  const handleOwnershipCertificateFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedOwnershipCertificateFile(file);
      setPreviewOwnershipCertificate(URL.createObjectURL(file));
    } else {
      setSelectedOwnershipCertificateFile(null);
      setPreviewOwnershipCertificate(null);
    }
  };


  const getFarmTypeForApi = (farmType) => {
    return farmType.toLowerCase();
  };

  const handleSaveEdit = async () => {
    try {
      if (!editedFarm.id || !editedFarm.farm_type) {
        throw new Error("Missing required farm fields: id or farm_type");
      }

      const newUniqueId = `${editedFarm.id}-${editedFarm.farm_type}`;

      // Check for duplicate uniqueId only if farm_type or id has changed
      if (newUniqueId !== originalFarmUniqueId) {
        const duplicate = farms.find(
          (farm) => farm.uniqueId === newUniqueId
        );
        if (duplicate) {
          setError("A farm with the same ID and type already exists.");
          return;
        }
      }

      const token = localStorage.getItem("access");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add farm data fields (excluding file fields which are handled separately)
      Object.keys(editedFarm).forEach(key => {
        // Only append non-file fields that are not null/undefined
        if (key !== 'images' && key !== 'passport' && key !== 'ownership_certificate' && editedFarm[key] !== null && editedFarm[key] !== undefined) {
          formData.append(key, editedFarm[key]);
        }
      });

      // Append new images if any are selected
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Append new passport file if selected
      if (selectedPassportFile) {
        formData.append('passport', selectedPassportFile);
      } else if (editedFarm.passport) {
        // If there's an existing passport and no new file is selected,
        // you might need to explicitly tell the backend to keep it.
        // However, with `partial=True` on DRF serializer, if the field is not sent,
        // it retains the old value. So, if `selectedPassportFile` is null and `editedFarm.passport` exists,
        // we just don't append anything, relying on `partial=True`.
      }


      // Append new ownership certificate file if selected
      if (selectedOwnershipCertificateFile) {
        formData.append('ownership_certificate', selectedOwnershipCertificateFile);
      } else if (editedFarm.ownership_certificate) {
        // Similar logic for ownership_certificate
      }


      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Crucial for FormData
        },
      };

      const farmTypeForApi = getFarmTypeForApi(editedFarm.farm_type);

      await axios.put(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${selectedFarm.id}/`,
        formData, // Send FormData directly
        config
      );

      // Refresh farms data after successful update
      await fetchFarms();

      setOpenEditDialog(false);
      setSelectedFiles([]);
      setPreviewImages([]);
      setSelectedPassportFile(null); // Clear selected file for next edit
      setPreviewPassport(null); // Clear preview for next edit
      setSelectedOwnershipCertificateFile(null); // Clear selected file for next edit
      setPreviewOwnershipCertificate(null); // Clear preview for next edit
      setError(null);
    } catch (error) {
      console.error("Failed to update farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        // Display more specific error details from backend
        let errorMessage = "Failed to update farm. Please try again.";
        if (error.response?.data) {
            // Check for specific file errors first
            if (error.response.data.passport && error.response.data.passport[0].includes("No file was submitted")) {
                errorMessage = "Passport: Please select a file or leave it empty if not changing.";
            } else if (error.response.data.ownership_certificate && error.response.data.ownership_certificate[0].includes("No file was submitted")) {
                errorMessage = "Ownership Certificate: Please select a file or leave it empty if not changing.";
            } else {
                errorMessage = `Failed to update farm: ${JSON.stringify(error.response.data)}`;
            }
        } else if (error.message) {
            errorMessage = `Failed to update farm: ${error.message}`;
        }
        setError(errorMessage);
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedFarm?.id || !selectedFarm?.farm_type) {
        throw new Error("Missing farm ID or type");
      }

      const token = localStorage.getItem("access");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const farmTypeForApi = getFarmTypeForApi(selectedFarm.farm_type);
      await axios.delete(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${selectedFarm.id}/`,
        config
      );

      const updatedFarms = farms.filter(
        (farm) => farm.uniqueId !== selectedFarm.uniqueId
      );
      setFarms(updatedFarms);
      setFilteredFarms(updatedFarms);
      setOpenDeleteDialog(false);
      setError(null);
    } catch (error) {
      console.error("Failed to delete farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        setError(
          `Failed to delete farm: ${
          error.response?.data?.detail || error.message || "Please try again."
          }`
        );
      }
    }
  };

  const handlePrevImage = (uniqueId) => {
    setImageIndexes((prev) => {
      const currentIndex = prev[uniqueId] || 0;
      const farm = filteredFarms.find((f) => f.uniqueId === uniqueId);
      const total = farm?.images?.length || 0;
      return {
        ...prev,
        [uniqueId]: (currentIndex - 1 + total) % total,
      };
    });
  };

  const handleNextImage = (uniqueId) => {
    setImageIndexes((prev) => {
      const currentIndex = prev[uniqueId] || 0;
      const farm = filteredFarms.find((f) => f.uniqueId === uniqueId);
      const total = farm?.images?.length || 0;
      return {
        ...prev,
        [uniqueId]: (currentIndex + 1) % total,
      };
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Apply pagination to filteredFarms for table view
  const paginatedFarms = useMemo(() => {
    return filteredFarms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredFarms, page, rowsPerPage]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <SellerAppBar
          handleDrawerToggle={handleDrawerToggle}
          darkMode={darkMode}
          handleThemeToggle={handleThemeToggle}
          fetchFarms={fetchFarms}
          anchorEl={anchorEl}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleLogout={handleLogout}
          showSearchInput={showSearchInput}
          setShowSearchInput={setShowSearchInput}
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />

        <SellerDrawer
          drawerOpen={drawerOpen}
          drawerWidth={drawerWidth}
          theme={theme}
          handleLogout={handleLogout}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${
              drawerOpen ? drawerWidth : theme.spacing(7)
            }px)`,
            mt: 8,
          }}
        >
          {/* Dashboard Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Uploaded Farms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your farm listings and track their status
            </Typography>
            {searchQuery && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Showing {filteredFarms.length} result
                {filteredFarms.length !== 1 ? "s" : ""} for "{searchQuery}"
              </Typography>
            )}
          </Box>

          {/* Search and Filter Section */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
            }}
          >
            {/* Status Summary */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Farm Status Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<CheckCircle size={16} />}
                  label={`Validated: ${
                    farms.filter((f) => f.is_validated && !f.is_rejected).length
                  }`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<XCircle size={16} />}
                  label={`Rejected: ${
                    farms.filter((f) => f.is_rejected).length
                  }`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<Clock size={16} />}
                  label={`Pending: ${
                    farms.filter((f) => !f.is_validated && !f.is_rejected)
                      .length
                  }`}
                  color="warning"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>

          {/* View Mode Toggle */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
            >
              <ToggleButton value="table" aria-label="table view">
                <TableIcon size={20} />
                <Typography variant="button" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>Table View</Typography>
              </ToggleButton>
              <ToggleButton value="card" aria-label="card view">
                <CardIcon size={20} />
                <Typography variant="button" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>Card View</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Error Message Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 8,
                color: "primary.main",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredFarms.length === 0 ? (
            <Box
              sx={{
                width: "100%",
                mt: 3,
                textAlign: "center",
                py: 4,
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
              >
                {searchQuery
                  ? `No farms found for "${searchQuery}"`
                  : "No farms found"}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                {searchQuery
                  ? "Try adjusting your search terms or browse all farms."
                  : "You haven't uploaded any farms yet."}
              </Typography>
              {searchQuery && (
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1, mr: 2 }}
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                component={RouterLink}
                to="/UploadFarmForm"
                startIcon={<PlusCircle size={20} />}
              >
                Upload New Farm
              </Button>
            </Box>
          ) : (
            /* Farm Listings based on View Mode - Table View First */
            viewMode === "table" ? (
              // Table View (Default)
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="farms table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Farm Type</TableCell>
                      <TableCell>Price(TZS)</TableCell>
                      <TableCell>Quality</TableCell>
                      <TableCell>Size (Acres)</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedFarms.map((farm) => {
                      const statusInfo = getValidationStatusInfo(farm);
                      return (
                        <TableRow
                          key={farm.uniqueId}
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {farm.location}
                          </TableCell>
                          <TableCell>{farm.farm_type}</TableCell>
                          <TableCell>{farm.price}</TableCell>
                          <TableCell>{farm.quality}</TableCell>
                          <TableCell>{farm.size} acres</TableCell>
                          <TableCell>{farm.phone}</TableCell>
                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.chipColor}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View details">
                                <IconButton
                                  onClick={() => handleViewDetailsClick(farm)}
                                  color="primary"
                                  size="small"
                                >
                                  <Eye size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit farm">
                                <IconButton
                                  onClick={() => handleEditClick(farm)}
                                  color="primary"
                                  size="small"
                                  disabled={farm.is_rejected}
                                >
                                  <Edit size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete farm">
                                <IconButton
                                  onClick={() => handleDeleteClick(farm)}
                                  color="error"
                                  size="small"
                                >
                                  <Trash2 size={18} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredFarms.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            ) : (
              // Card View
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Grid container spacing={3}>
                  {filteredFarms.map((farm) => {
                    const statusInfo = getValidationStatusInfo(farm);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={farm.uniqueId}>
                        <motion.div variants={itemVariants}>
                          <StyledCard>
                            {/* Validation Status Banner */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: statusInfo.color,
                                color: "white",
                                py: 0.5,
                                px: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                zIndex: 3,
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                              }}
                            >
                              {statusInfo.icon}
                              {statusInfo.label}
                              {farm.is_rejected && <AlertTriangle size={16} />}
                            </Box>

                            {/* Image Section with Carousel Controls */}
                            <Box
                              sx={{
                                height: 200,
                                width: "100%",
                                overflow: "hidden",
                                position: "relative",
                                mt: 4,
                                ...(farm.is_rejected && {
                                  filter: "grayscale(50%) opacity(0.7)",
                                }),
                              }}
                            >
                              {farm.images?.length > 0 ? (
                                <CardMedia
                                  component="img"
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  image={`${BASE_URL}${
                                    farm.images[
                                      imageIndexes[farm.uniqueId] || 0
                                    ]?.image
                                  }`}
                                  alt={`${farm.location} farm`}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    height: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  No Image Available
                                </Typography>
                              )}

                              {/* Carousel Controls */}
                              {farm.images?.length > 1 && (
                                <>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrevImage(farm.uniqueId);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      left: 8,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      backgroundColor:
                                        "rgba(255,255,255,0.7)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(255,255,255,0.9)",
                                      },
                                      zIndex: 1,
                                    }}
                                    size="small"
                                  >
                                    &lt;
                                  </IconButton>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNextImage(farm.uniqueId);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      right: 8,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      backgroundColor:"rgba(255,255,255,0.7)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(255,255,255,0.9)",
                                      },
                                      zIndex: 1,
                                    }}
                                    size="small"
                                  >
                                    &gt;
                                  </IconButton>
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      bottom: 8,
                                      right: 8,
                                      backgroundColor:
                                        "rgba(0,0,0,0.6)",
                                      color: "white",
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {(imageIndexes[farm.uniqueId] || 0) + 1}/
                                    {farm.images.length}
                                  </Box>
                                </>
                              )}
                            </Box>

                            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <LocationOnIcon color="primary" sx={{ mr: 0.5, fontSize: "1rem" }} />
                                <Typography variant="caption" color="text.secondary">
                                  {farm.location}
                                </Typography>
                              </Box>
                              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                                {farm.farm_type === "Sale" ? "Farm for Sale" : "Farm for Rent"}
                              </Typography>
                              {/* <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <AgricultureIcon color="action" sx={{ mr: 0.5, fontSize: "1rem" }} />
                                <Typography variant="body2" color="text.secondary">
                                  Type: {farm.farm_type}
                                </Typography>
                              </Box> */}
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <AttachMoneyIcon color="action" sx={{ mr: 0.5, fontSize: "1rem" }} />
                                <Typography variant="body2" color="text.secondary">
                                  Price: {farm.price}TZS
                                </Typography>
                              </Box>
                              {/* <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <StarIcon color="action" sx={{ mr: 0.5, fontSize: "1rem" }} />
                                <Typography variant="body2" color="text.secondary">
                                  Quality: {farm.quality}
                                </Typography>
                              </Box> */}
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <SquareFootIcon color="action" sx={{ mr: 0.5, fontSize: "1rem" }} />
                                <Typography variant="body2" color="text.secondary">
                                  Size: {farm.size} acres
                                </Typography>
                              </Box>
                            </CardContent>

                            <DialogActions sx={{ p: 2, pt: 0 }}>
                              <Button
                                startIcon={<Eye size={18} />}
                                onClick={() => handleViewDetailsClick(farm)}
                                size="small"
                              >
                                View Details
                              </Button>
                              <Button
                                startIcon={<Edit size={18} />}
                                onClick={() => handleEditClick(farm)}
                                color="primary"
                                size="small"
                                disabled={farm.is_rejected}
                              >
                                Edit
                              </Button>
                              <Button
                                startIcon={<Trash2 size={18} />}
                                onClick={() => handleDeleteClick(farm)}
                                color="error"
                                size="small"
                              >
                                Delete
                              </Button>
                            </DialogActions>
                          </StyledCard>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </motion.div>
            )
          )}
        </Box>
      </Box>

      {/* Edit Farm Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit size={24} /> Edit Farm Listing
        </DialogTitle>
        <DialogContent dividers>
          {editedFarm && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Location"
                  type="text"
                  fullWidth
                  variant="outlined"
                  name="location"
                  value={editedFarm.location || ""}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense" variant="outlined">
                  <InputLabel id="farm-type-label">Farm Type</InputLabel>
                  <Select
                    labelId="farm-type-label"
                    id="farm-type"
                    name="farm_type"
                    value={editedFarm.farm_type || ""}
                    onChange={handleEditChange}
                    label="Farm Type"
                  >
                    <MenuItem value="Sale">Sale</MenuItem>
                    <MenuItem value="Rent">Rent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  name="price"
                  value={editedFarm.price || ""}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Size (Acres)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  name="size"
                  value={editedFarm.size || ""}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Quality"
                  type="text"
                  fullWidth
                  variant="outlined"
                  name="quality"
                  value={editedFarm.quality || ""}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  name="description"
                  value={editedFarm.description || ""}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  variant="outlined"
                  name="phone"
                  value={editedFarm.phone || ""}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  name="email"
                  value={editedFarm.email || ""}
                  onChange={handleEditChange}
                />
              </Grid>

              {/* Passport Upload Field */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Passport Document</Typography>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Upload New Passport
                  <VisuallyHiddenInput type="file" onChange={handlePassportFileChange} accept="image/*,.pdf" />
                </Button>
                <Box sx={{ mt: 1 }}>
                  {previewPassport && (
                    <img src={previewPassport} alt="Passport Preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 4 }} />
                  )}
                  {/* Display link to existing document if no new file is selected */}
                  {!previewPassport && editedFarm.passport && (
                    <Typography variant="body2" color="text.secondary">
                      Existing Passport: <a href={`${BASE_URL}${editedFarm.passport}`} target="_blank" rel="noopener noreferrer">View Current</a>
                    </Typography>
                  )}
                  {/* Message if no document is currently associated */}
                  {!previewPassport && !editedFarm.passport && (
                    <Typography variant="body2" color="text.secondary">No passport uploaded.</Typography>
                  )}
                  {selectedPassportFile && (
                    <Typography variant="body2" color="primary">
                      New passport selected: {selectedPassportFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Ownership Certificate Upload Field */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Ownership Certificate</Typography>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Upload New Ownership Certificate
                  <VisuallyHiddenInput type="file" onChange={handleOwnershipCertificateFileChange} accept="image/*,.pdf" />
                </Button>
                <Box sx={{ mt: 1 }}>
                  {previewOwnershipCertificate && (
                    <img src={previewOwnershipCertificate} alt="Ownership Certificate Preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 4 }} />
                  )}
                  {/* Display link to existing document if no new file is selected */}
                  {!previewOwnershipCertificate && editedFarm.ownership_certificate && (
                    <Typography variant="body2" color="text.secondary">
                      Existing Certificate: <a href={`${BASE_URL}${editedFarm.ownership_certificate}`} target="_blank" rel="noopener noreferrer">View Current</a>
                    </Typography>
                  )}
                   {/* Message if no document is currently associated */}
                  {!previewOwnershipCertificate && !editedFarm.ownership_certificate && (
                    <Typography variant="body2" color="text.secondary">No ownership certificate uploaded.</Typography>
                  )}
                  {selectedOwnershipCertificateFile && (
                    <Typography variant="body2" color="primary">
                      New certificate selected: {selectedOwnershipCertificateFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Existing Images Upload Field */}
              <Grid item xs={12}>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Upload New Images
                  <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} accept="image/*" />
                </Button>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {previewImages.map((src, index) => (
                    <img key={index} src={src} alt={`Preview ${index}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                  ))}
                  {/* Display existing images if no new images are selected for preview */}
                  {selectedFiles.length === 0 && editedFarm.images && editedFarm.images.map((img, index) => (
                    <img key={`existing-${index}`} src={`${BASE_URL}${img.image}`} alt={`Existing ${index}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                  ))}
                </Box>
                {selectedFiles.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedFiles.length} new image(s) selected.
                  </Typography>
                )}
                {selectedFiles.length === 0 && editedFarm.images?.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {editedFarm.images.length} existing image(s). Uploading new images will replace them.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Trash2 size={24} /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the farm listing for "
            {selectedFarm?.location}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Eye size={24} /> Farm Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedFarm && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedFarm.farm_type === "Sale" ? "Farm for Sale" : "Farm for Rent"}
                </Typography>
                <Chip
                  icon={getValidationStatusInfo(selectedFarm).icon}
                  label={getValidationStatusInfo(selectedFarm).label}
                  color={getValidationStatusInfo(selectedFarm).chipColor}
                  sx={{ mb: 2 }}
                />
                <Typography>
                  Reason: {selectedFarm.admin_feedback}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ width: '100%', height: 300, overflow: 'hidden', position: 'relative' }}>
                  {selectedFarm.images?.length > 0 ? (
                    <CardMedia
                      component="img"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain", 
                      }}
                      image={`${BASE_URL}${selectedFarm.images[imageIndexes[selectedFarm.uniqueId] || 0]?.image}`}
                      alt={`${selectedFarm.location} farm`}
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      No Image Available
                    </Typography>
                  )}
                  {selectedFarm.images?.length > 1 && (
                    <>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(selectedFarm.uniqueId); }}
                        sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.5)", color: "white", '&:hover': { backgroundColor: "rgba(0,0,0,0.7)" } }}
                        size="small"
                      >
                        &lt;
                      </IconButton>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleNextImage(selectedFarm.uniqueId); }}
                        sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.5)", color: "white", '&:hover': { backgroundColor: "rgba(0,0,0,0.7)" } }}
                        size="small"
                      >
                        &gt;
                      </IconButton>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {(imageIndexes[selectedFarm.uniqueId] || 0) + 1}/{selectedFarm.images.length}
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Location:</Typography> {selectedFarm.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AgricultureIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Farm Type:</Typography> {selectedFarm.farm_type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Price:</Typography> {selectedFarm.price}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Quality:</Typography> {selectedFarm.quality}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SquareFootIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Size:</Typography> {selectedFarm.size} acres
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <DescriptionIcon color="action" sx={{ mt: 0.5 }} />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Description:</Typography> {selectedFarm.description || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Phone:</Typography> {selectedFarm.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FeedbackIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Email:</Typography> {selectedFarm.email}
                    </Typography>
                  </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudUploadIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Passport:</Typography>{" "}
                      {selectedFarm.passport ? (
                        <a href={`${BASE_URL}${selectedFarm.passport}`} target="_blank" rel="noopener noreferrer">View Document</a>
                      ) : (
                        "Not uploaded"
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudUploadIcon color="action" />
                    <Typography variant="body1">
                      <Typography component="span" fontWeight="bold">Ownership Certificate:</Typography>{" "}
                      {selectedFarm.ownership_certificate ? (
                        <a href={`${BASE_URL}${selectedFarm.ownership_certificate}`} target="_blank" rel="noopener noreferrer">View Document</a>
                      ) : (
                        "Not uploaded"
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default UploadedFarms;