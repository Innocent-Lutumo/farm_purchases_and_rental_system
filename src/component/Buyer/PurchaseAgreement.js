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
  IconButton,
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
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PurchaseAgreement = () => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [farmId, setFarmId] = useState(null); 

  const navigate = useNavigate();

  const RENTAL_AGREEMENT_DETAILS_API_ENDPOINT = 'http://127.0.0.1:8000/api/get-transactionsale/';
  const DOWNLOAD_CONTRACT_API_ENDPOINT = 'http://127.0.0.1:8000/api/download-contract/';
  const ADMIN_SELLERS_API_ENDPOINT = 'http://127.0.0.1:8000/api/admin-sellers_list/'; 

  useEffect(() => {
    const storedFarmId = localStorage.getItem('selectedAgreementFarmId'); 
    if (storedFarmId) {
      setFarmId(storedFarmId);
      fetchContractData(storedFarmId);
    } else {
      setLoading(false);
      setError("No farm ID found for the rental agreement. Please go back and select a farm.");
    }
  }, []);

  const fetchContractData = async (idToFetch) => {
    try {
      setLoading(true);
      setError(null);

      if (!idToFetch) {
        throw new Error("Missing transaction ID to fetch agreement data.");
      }

      const transactionsResponse = await fetch(RENTAL_AGREEMENT_DETAILS_API_ENDPOINT);

      if (!transactionsResponse.ok) {
        const errorText = await transactionsResponse.text();
        throw new Error(`Failed to fetch transactions list. Status: ${transactionsResponse.status}. Response: ${errorText.substring(0, 100)}...`);
      }
      const allTransactions = await transactionsResponse.json();

      const foundContract = allTransactions.find(
        (transaction) => String(transaction.id) === String(idToFetch)
      );

      if (!foundContract) {
        throw new Error(`No rental agreement found for transaction ID ${idToFetch}.`);
      }

      const adminSellersResponse = await fetch(ADMIN_SELLERS_API_ENDPOINT);
      if (!adminSellersResponse.ok) {
        const errorText = await adminSellersResponse.text();
        throw new Error(`Failed to fetch admin sellers data. Status: ${adminSellersResponse.status}. Response: ${errorText.substring(0, 100)}...`);
      }
      const adminSellers = await adminSellersResponse.json();

      const relevantLandlord = adminSellers.find(
        (seller) => seller.username === foundContract.farm.username
      );

      const restructuredData = {
        id: foundContract.id, 
        farm_number: foundContract.farm.farm_number,
        created_at: foundContract.rent_date, 
        location: foundContract.farm.location,
        size: foundContract.farm.size,
        quality: foundContract.farm.quality,
        farm_type: foundContract.farm.farm_type,
        description: foundContract.farm.description,
        price: foundContract.farm.price,
        
        // Renter details (using fetched data)
        full_name: foundContract.full_name,
        phone: foundContract.renter_phone,
        email: foundContract.renter_email,
        tenant_residence: foundContract.residence,

        // Landlord/Admin Seller details (using fetched data)
        landlord_name: relevantLandlord ? relevantLandlord.seller_name : "Jina la Mkodishaji Halipatikani",
        landlord_phone: foundContract.farm.phone,
        landlord_email: foundContract.farm.email, 
        landlord_residence: relevantLandlord ? relevantLandlord.seller_residence : "Makazi ya Mkodishaji Hayapatikani",
      };

      setContractData(restructuredData);

    } catch (err) {
      console.error("Error fetching contract data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadContract = async () => {
    try {
      if (!contractData || !contractData.id) {
        throw new Error("No contract data or ID available for download.");
      }
      const response = await fetch(
        `${DOWNLOAD_CONTRACT_API_ENDPOINT}${contractData.id}/`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download contract. Status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
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
    navigate(-1);
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
            onClick={() => fetchContractData(farmId)} 
            sx={{ mt: 2 }}
          >
            Jaribu Tena
          </Button>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            sx={{ mt: 2, ml: 1 }}
          >
            Rudi Nyuma
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
                    <ListItemText primary={contractData.landlord_phone} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Email fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.landlord_email} />
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
                    <ListItemText primary={contractData.full_name} />
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
              disabled={!contractData || loading}
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

export default PurchaseAgreement;