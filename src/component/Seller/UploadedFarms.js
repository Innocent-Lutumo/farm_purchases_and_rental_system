import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  DialogActions,
  Dialog,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  Paper,
  Tooltip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  DialogTitle,
  DialogContent,
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
  AttachMoney as AttachMoneyIcon,
  SquareFoot as SquareFootIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import SellerDrawer from "./SellerDrawer";
import SellerAppBar from "./SellerAppBar";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import ViewFarmDialog from "./ViewFarmDialog";
import EditFarmDialog from "./EditFarmDialog";

const BASE_URL = "http://127.0.0.1:8000";

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
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedPassportFile, setSelectedPassportFile] = useState(null);
  const [previewPassport, setPreviewPassport] = useState(null);
  const [selectedOwnershipCertificateFile, setSelectedOwnershipCertificateFile] = useState(null);
  const [previewOwnershipCertificate, setPreviewOwnershipCertificate] = useState(null);

  const navigate = useNavigate();
  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);
  const drawerWidth = 240;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/LoginPage";
      return;
    }
    fetchFarms();
  }, []);

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

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  useEffect(() => {
    return () => {
      if (previewPassport && typeof previewPassport === "string" && previewPassport.startsWith("blob:")) {
        URL.revokeObjectURL(previewPassport);
      }
      if (previewOwnershipCertificate && typeof previewOwnershipCertificate === "string" && previewOwnershipCertificate.startsWith("blob:")) {
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
      const data = Array.isArray(res.data) ? res.data.map((farm) => farm.data || farm) : [];

      const userEmail = localStorage.getItem("user_email");
      const userFarms = userEmail ? data.filter((farm) => farm.email === userEmail) : data;

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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEditClick = (farm) => {
    const farmCopy = JSON.parse(JSON.stringify(farm));
    setEditedFarm(farmCopy);
    setSelectedFarm(farmCopy);
    setOriginalFarmUniqueId(farm.uniqueId);

    setSelectedFiles([]);
    setPreviewImages([]);
    setSelectedPassportFile(null);
    setPreviewPassport(null);
    setSelectedOwnershipCertificateFile(null);
    setPreviewOwnershipCertificate(null);

    if (farm.passport) setPreviewPassport(`${BASE_URL}${farm.passport}`);
    if (farm.ownership_certificate) {
      setPreviewOwnershipCertificate(`${BASE_URL}${farm.ownership_certificate}`);
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

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

  const getFarmTypeForApi = (farmType) => farmType.toLowerCase();

  const handleSaveEdit = async () => {
    try {
      if (!editedFarm.id || !editedFarm.farm_type) {
        throw new Error("Missing required farm fields: id or farm_type");
      }

      const newUniqueId = `${editedFarm.id}-${editedFarm.farm_type}`;
      if (newUniqueId !== originalFarmUniqueId && farms.find((farm) => farm.uniqueId === newUniqueId)) {
        setError("A farm with the same ID and type already exists.");
        return;
      }

      const token = localStorage.getItem("access");
      if (!token) throw new Error("Authentication token missing");

      const formData = new FormData();
      Object.keys(editedFarm).forEach((key) => {
        if (
          key !== "images" &&
          key !== "passport" &&
          key !== "ownership_certificate" &&
          editedFarm[key] !== null &&
          editedFarm[key] !== undefined
        ) {
          formData.append(key, editedFarm[key]);
        }
      });

      selectedFiles.forEach((file) => formData.append("images", file));
      if (selectedPassportFile) formData.append("passport", selectedPassportFile);
      if (selectedOwnershipCertificateFile) {
        formData.append("ownership_certificate", selectedOwnershipCertificateFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const farmTypeForApi = getFarmTypeForApi(editedFarm.farm_type);
      await axios.put(
        `${BASE_URL}/api/all-farms/${farmTypeForApi}/${selectedFarm.id}/`,
        formData,
        config
      );

      await fetchFarms();
      setOpenEditDialog(false);
      setSelectedFiles([]);
      setPreviewImages([]);
      setSelectedPassportFile(null);
      setPreviewPassport(null);
      setSelectedOwnershipCertificateFile(null);
      setPreviewOwnershipCertificate(null);
      setError(null);
    } catch (error) {
      console.error("Failed to update farm:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/LoginPage";
      } else {
        let errorMessage = "Failed to update farm. Please try again.";
        if (error.response?.data) {
          if (error.response.data.passport?.includes("No file was submitted")) {
            errorMessage = "Passport: Please select a file or leave it empty if not changing.";
          } else if (error.response.data.ownership_certificate?.includes("No file was submitted")) {
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
      if (!token) throw new Error("Authentication token missing");

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

      const updatedFarms = farms.filter((farm) => farm.uniqueId !== selectedFarm.uniqueId);
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
          `Failed to delete farm: ${error.response?.data?.detail || error.message || "Please try again."}`
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

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };
  const handleDrawerToggle = useCallback(() => setDrawerOpen((prev) => !prev), []);
  const handleThemeToggle = useCallback(() => setDarkMode((prev) => !prev), []);
  const handleViewModeChange = (event, newMode) => newMode !== null && setViewMode(newMode);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
        />

        <SellerDrawer
          drawerOpen={drawerOpen}
          drawerWidth={drawerWidth}
          theme={theme}
          handleLogout={handleLogout}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${drawerOpen ? drawerWidth : theme.spacing(7)}px)`,
            mt: 8,
          }}
        >
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

          <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Farm Status Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<CheckCircle size={16} />}
                  label={`Validated: ${farms.filter((f) => f.is_validated && !f.is_rejected).length}`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<XCircle size={16} />}
                  label={`Rejected: ${farms.filter((f) => f.is_rejected).length}`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<Clock size={16} />}
                  label={`Pending: ${farms.filter((f) => !f.is_validated && !f.is_rejected).length}`}
                  color="warning"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
            >
              <ToggleButton value="table" aria-label="table view">
                <TableIcon size={20} />
                <Typography variant="button" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Table View
                </Typography>
              </ToggleButton>
              <ToggleButton value="card" aria-label="card view">
                <CardIcon size={20} />
                <Typography variant="button" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Card View
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8, color: "primary.main" }}>
              <CircularProgress />
            </Box>
          ) : filteredFarms.length === 0 ? (
            <Box sx={{ width: "100%", mt: 3, textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? `No farms found for "${searchQuery}"` : "No farms found"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
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
          ) : viewMode === "table" ? (
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
                      <TableRow key={farm.uniqueId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell component="th" scope="row">{farm.location}</TableCell>
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
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={3}>
                {filteredFarms.map((farm) => {
                  const statusInfo = getValidationStatusInfo(farm);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={farm.uniqueId}>
                      <motion.div variants={itemVariants}>
                        <StyledCard>
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
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                image={`${BASE_URL}${farm.images[imageIndexes[farm.uniqueId] || 0]?.image}`}
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
                                    backgroundColor: "rgba(255,255,255,0.7)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
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
                                    backgroundColor: "rgba(255,255,255,0.7)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
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
                                    backgroundColor: "rgba(0,0,0,0.6)",
                                    color: "white",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {(imageIndexes[farm.uniqueId] || 0) + 1}/{farm.images.length}
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
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <AttachMoneyIcon color="action" sx={{ mr: 0.5, fontSize: "1rem" }} />
                              <Typography variant="body2" color="text.secondary">
                                Price: {farm.price}TZS
                              </Typography>
                            </Box>
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
          )}
        </Box>
      </Box>

      <EditFarmDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        editedFarm={editedFarm}
        handleEditChange={handleEditChange}
        handleSaveEdit={handleSaveEdit}
        BASE_URL={BASE_URL}
        error={error}
        selectedFiles={selectedFiles}
        previewImages={previewImages}
        handleFileChange={handleFileChange}
        selectedPassportFile={selectedPassportFile}
        previewPassport={previewPassport}
        handlePassportFileChange={handlePassportFileChange}
        selectedOwnershipCertificateFile={selectedOwnershipCertificateFile}
        previewOwnershipCertificate={previewOwnershipCertificate}
        handleOwnershipCertificateFileChange={handleOwnershipCertificateFileChange}
      />

      <ViewFarmDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        selectedFarm={selectedFarm}
        imageIndexes={imageIndexes}
        handlePrevImage={handlePrevImage}
        handleNextImage={handleNextImage}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
        BASE_URL={BASE_URL}
        getValidationStatusInfo={getValidationStatusInfo}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
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
    </ThemeProvider>
  );
};

export default UploadedFarms;