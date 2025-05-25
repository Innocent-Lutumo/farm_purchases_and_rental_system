import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton, // Import IconButton
} from '@mui/material';
import {
  Download,
  AttachMoney,
  Agriculture,
  ContactPage,
  Gavel,
  CheckCircle,
  Phone,
  Email,
  Person,
  Home,
  ArrowBack, // Import ArrowBack icon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const RentalAgreement = () => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate hook

  // API Endpoints
  const FARM_RENT_API_ENDPOINT = 'http://127.0.0.1:8000/api/farmsrent/validated/';
  const ADMIN_SELLERS_API_ENDPOINT = 'http://127.0.0.1:8000/api/admin-sellers/';

  useEffect(() => {
    fetchContractData();
  }, []);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      const [farmRentResponse, adminSellersResponse] = await Promise.all([
        fetch(FARM_RENT_API_ENDPOINT),
        fetch(ADMIN_SELLERS_API_ENDPOINT),
      ]);

      if (!farmRentResponse.ok) {
        throw new Error('Failed to fetch farm rental data');
      }
      const farmRentData = await farmRentResponse.json();

      let adminSellersData = null;
      if (!adminSellersResponse.ok) {
        console.warn('Failed to fetch admin sellers data. Proceeding without it.');
      } else {
        try {
          adminSellersData = await adminSellersResponse.json();
          if (Array.isArray(adminSellersData) && adminSellersData.length > 0) {
            adminSellersData = adminSellersData[0];
          } else if (adminSellersData && typeof adminSellersData === 'object') {
          } else {
            adminSellersData = null;
          }
        } catch (jsonError) {
          console.warn('Could not parse admin sellers JSON:', jsonError);
          adminSellersData = null;
        }
      }

      const finalContractData = {
        ...farmRentData,
        landlord_name: adminSellersData && adminSellersData.name ? adminSellersData.name : (farmRentData.name || 'Jina la Mkodishaji'),
        phone: adminSellersData && adminSellersData.phone ? adminSellersData.phone : (farmRentData.phone || '+255 7XX XXX XXX'),
        email: adminSellersData && adminSellersData.email ? adminSellersData.email : (farmRentData.email || 'mkodishaji@mfano.com'),
        landlord_residence: adminSellersData && adminSellersData.residence ? adminSellersData.residence : 'Makazi ya Mkodishaji',
        tenant_name: farmRentData.full_name || 'Jina la Mkodishwa',
        tenant_phone: farmRentData.phone || '+255 7XX XXX XXX',
        tenant_email: farmRentData.email || 'mkodishwa@mfano.com',
        tenant_residence: farmRentData.tenant_residence || 'Makazi ya Mkodishwa',
      };
      setContractData(finalContractData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadContract = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/download-contract/${contractData.id}/`
      );
      if (!response.ok) {
        throw new Error("Failed to download contract");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Mkataba_wa_Kukodisha_Shamba_${
        contractData.farm_number || contractData.id
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setModalMessage("Imeshindwa kupakua mkataba: " + err.message);
      setShowErrorModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "TZS 0";
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setModalMessage("");
  };

  const handleGoBack = () => {
    navigate(-1); // Navigates back one entry in the history stack
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Inapakia maelezo ya mkataba...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Kosa: {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchContractData}
            sx={{ mt: 2 }}
          >
            Jaribu Tena
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!contractData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Hakuna data ya mkataba
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 2 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, pt: 2, pb: 2, overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 2, position: 'relative' }}>
            {/* Back Button */}
            <IconButton
              onClick={handleGoBack}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                color: 'text.secondary',
              }}
            >
              <ArrowBack />
            </IconButton>

            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              JAMHURI YA MUUNGANO WA TANZANIA
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              color="success"
            >
              MKATABA WA KUKODISHA SHAMBA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              (Farm Rental Agreement)
            </Typography>
            <Chip
              label={`Namba ya Mkataba: ${
                contractData.farm_number || `MKS-${contractData.id}`
              }`}
              color="success"
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Tarehe: {formatDate(contractData.created_at)}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Parties Section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <ContactPage fontSize="small" /> WAHUSIKA WA MKATABA
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  MKODISHAJI (LANDLORD):
                </Typography>
                <List dense disablePadding>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Person fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.landlord_name} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Phone fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.phone} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Email fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.email} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Home fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.landlord_residence} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  MKODISHWA (TENANT):
                </Typography>
                <List dense disablePadding>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Person fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.tenant_name} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Phone fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.tenant_phone} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Email fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.tenant_email} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Home fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.tenant_residence} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Property Description */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Agriculture fontSize="small" /> MAELEZO YA SHAMBA
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Eneo:</strong> {contractData.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Ukubwa:</strong> {contractData.size} Ekari
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Udongo:</strong> {contractData.quality}
                </Typography>
                <Typography variant="body2">
                  <strong>Aina:</strong> {contractData.farm_type}
                </Typography>
              </Grid>
            </Grid>
            {contractData.description && (
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                **Maelezo Ziada:** {contractData.description}
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Financial Terms */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <AttachMoney fontSize="small" /> MASHARTI YA KIFEDHA
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="body2">
                  <strong>Kodi ya Mwezi:</strong>
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCurrency(contractData.price)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">
                  <strong>Dhamana:</strong>
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(contractData.price * 2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">
                  <strong>Malipo ya Awali:</strong>
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(contractData.price)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Terms and Conditions (Condensed) */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Gavel fontSize="small" /> MUHTASARI WA MASHARTI NA HALI
            </Typography>
            <List dense sx={{ ml: -2, py: 0 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={`Mkataba wa miezi 12 kuanzia ${formatDate(
                    contractData.created_at
                  )}.`}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary="Kodi hulipwa mwanzoni mwa kila mwezi, faini ya 5% kwa kuchelewa." />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary="Mkodishwa atatunza shamba na kutumia kwa kilimo pekee." />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary="Mkodi ahakikishe haki ya matumizi na kutoa msaada inapohitajika." />
              </ListItem>
            </List>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              *Masharti kamili yanapatikana katika mkataba wa kupakua.*
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Signatures & Witnesses (Simplified) */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              SAHIHI NA MASHAHIDI
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "grey.400",
                    pb: 0.5,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    MKODISHAJI:
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: _________________________
                  </Typography>
                  <Typography variant="caption">
                    Tarehe: {formatDate(new Date())}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "grey.400",
                    pb: 0.5,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    MKODISHWA:
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: _________________________
                  </Typography>
                  <Typography variant="caption">
                    Tarehe: __________________
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "grey.400",
                    pb: 0.5,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    SHAHIDI WA KWANZA:
                  </Typography>
                  <Typography variant="caption">
                    Jina: ______________________________ <br />
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: ___________________
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "grey.400",
                    pb: 0.5,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    SHAHIDI WA PILI:
                  </Typography>
                  <Typography variant="caption">
                    Jina: _________________________ <br />
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: __________________
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Footer & Download Button */}
          <Box
            sx={{
              textAlign: "center",
              pt: 2,
              borderTop: 1,
              borderColor: "grey.300",
            }}
          >
            <Button
              color="success"
              variant="contained"
              size="medium"
              startIcon={<Download />}
              onClick={downloadContract}
              disabled={!contractData || loading} // Keep this disabled check
              sx={{ mb: 1 }}
            >
              Pakua Mkataba Kamili (PDF)
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Mkataba huu umesajiliwa chini ya sheria za Tanzania.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Custom Error Modal */}
      <Dialog
        open={showErrorModal}
        onClose={handleCloseErrorModal}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">
          {"Kosa la Kupakua Mkataba"}
        </DialogTitle>
        <DialogContent>
          <Typography id="error-dialog-description">{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorModal} autoFocus>
            Funga
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalAgreement;