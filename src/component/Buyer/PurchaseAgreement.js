import React, { useState, useEffect } from "react";
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
  Snackbar,
} from "@mui/material";
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
  Save,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PurchaseAgreement = () => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [farmId, setFarmId] = useState(null);
  const [agreementCreated, setAgreementCreated] = useState(false);
  const [agreementId, setAgreementId] = useState(null);
  const [creatingAgreement, setCreatingAgreement] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  const navigate = useNavigate();

  const PURCHASE_AGREEMENT_DETAILS_API_ENDPOINT =
    "http://127.0.0.1:8000/api/get-transactionsale/";
  const ADMIN_SELLERS_API_ENDPOINT =
    "http://127.0.0.1:8000/api/admin-sellers-list/";
  const CREATE_PURCHASE_AGREEMENT_API_ENDPOINT =
    "http://127.0.0.1:8000/api/create-purchase-agreement/";
  const DOWNLOAD_PURCHASE_AGREEMENT_API_ENDPOINT =
    "http://127.0.0.1:8000/api/download-purchase-agreement/";

  useEffect(() => {
    const storedFarmId = localStorage.getItem("selectedAgreementFarmId");
    if (storedFarmId) {
      setFarmId(storedFarmId);
      fetchContractData(storedFarmId);
    } else {
      setLoading(false);
      setError(
        "No farm ID found for the purchase agreement. Please go back and select a farm."
      );
    }
  }, []);

  const fetchContractData = async (idToFetch) => {
    try {
      setLoading(true);
      setError(null);

      if (!idToFetch) {
        throw new Error("Missing farm ID to fetch agreement data.");
      }

      const transactionsResponse = await fetch(
        PURCHASE_AGREEMENT_DETAILS_API_ENDPOINT
      );

      if (!transactionsResponse.ok) {
        const errorText = await transactionsResponse.text();
        throw new Error(
          `Failed to fetch transactions list. Status: ${
            transactionsResponse.status
          }. Response: ${errorText.substring(0, 100)}...`
        );
      }

      const allTransactions = await transactionsResponse.json();
      const foundContract = allTransactions.find(
        (transaction) => String(transaction.farm.id) === String(idToFetch)
      );

      if (!foundContract) {
        throw new Error(`No purchase agreement found for farm ID ${idToFetch}.`);
      }

      const adminSellersResponse = await fetch(ADMIN_SELLERS_API_ENDPOINT);
      if (!adminSellersResponse.ok) {
        const errorText = await adminSellersResponse.text();
        throw new Error(
          `Failed to fetch admin sellers data. Status: ${
            adminSellersResponse.status
          }. Response: ${errorText.substring(0, 100)}...`
        );
      }

      const adminSellers = await adminSellersResponse.json();
      const relevantSeller = adminSellers.find(
        (seller) => seller.username === foundContract.farm.username
      );

      const restructuredData = {
        id: foundContract.id,
        farm_id: foundContract.farm.id,
        farm_number: foundContract.farm.farm_number,
        created_at: foundContract.sale_date,
        location: foundContract.farm.location,
        size: foundContract.farm.size,
        quality: foundContract.farm.quality,
        farm_type: foundContract.farm.farm_type,
        description: foundContract.farm.description,
        price: foundContract.farm.price,
        payment_method: foundContract.payment_method,
        full_name: foundContract.full_name,
        buyer_phone: foundContract.contact_info,
        buyer_email: foundContract.buyer_email,
        buyer_residence: foundContract.address,
        buyer_passport: foundContract.buyer_passport || null,
        seller_name: relevantSeller
          ? relevantSeller.seller_name
          : "Jina la Muuzaji Halipatikani",
        seller_phone: foundContract.farm.phone,
        seller_email: foundContract.farm.email,
        seller_residence: relevantSeller
          ? relevantSeller.seller_residence
          : "Makazi ya Muuzaji Hayapatikani",
        seller_passport: foundContract.farm.passport || null,
      };

      setContractData(restructuredData);
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseAgreement = async () => {
    try {
      setCreatingAgreement(true);
      setError(null);

      if (!contractData) {
        throw new Error("No contract data available to create agreement.");
      }

      // Validate required fields
      const requiredFields = {
        farm_number: contractData.farm_number,
        size: contractData.size,
        price: contractData.price,
        location: contractData.location,
        full_name: contractData.full_name,
        quality: contractData.quality,
        buyer_email: contractData.buyer_email,
        buyer_phone: contractData.buyer_phone,
        buyer_residence: contractData.buyer_residence,
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (!value || value === undefined || value === null || value === "") {
          missingFields.push(key);
        }
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const agreementPayload = {
        farm_id: contractData.farm_id,
        transaction_id: contractData.id,
        farm_number: contractData.farm_number,
        seller_name: contractData.seller_name,
        seller_phone: contractData.seller_phone,
        seller_email: contractData.seller_email,
        seller_residence: contractData.seller_residence,
        seller_passport: contractData.seller_passport,
        buyer_name: contractData.full_name,
        buyer_phone: contractData.buyer_phone,
        buyer_email: contractData.buyer_email,
        buyer_residence: contractData.buyer_residence,
        buyer_passport: contractData.buyer_passport,
        farm_location: contractData.location,
        farm_size: parseFloat(contractData.size),
        farm_quality: contractData.quality,
        farm_type: contractData.farm_type,
        farm_description: contractData.description || "",
        purchase_price: parseFloat(contractData.price),
        agreement_date: contractData.created_at,
      };

      const response = await fetch(CREATE_PURCHASE_AGREEMENT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agreementPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create agreement. Status: ${
            response.status
          }. Response: ${errorText.substring(0, 200)}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Backend reported failure");
      }

      setAgreementCreated(true);
      setAgreementId(result.agreement_id);
      setSuccessMessage("Mkataba wa ununuzi umejumuishwa kikamilifu!");
      setShowSuccessSnackbar(true);
    } catch (err) {
      console.error("Error creating purchase agreement:", err);
      setModalMessage("Imeshindwa kuunda mkataba wa ununuzi: " + err.message);
      setShowErrorModal(true);
    } finally {
      setCreatingAgreement(false);
    }
  };

  const downloadAgreementPdf = async (agreementIdToDownload = null) => {
    try {
      setDownloadingPdf(true);
      setError(null);

      const downloadId = agreementIdToDownload || agreementId;

      if (!downloadId) {
        throw new Error("No agreement ID available for download.");
      }

      const response = await fetch(
        `${DOWNLOAD_PURCHASE_AGREEMENT_API_ENDPOINT}${downloadId}/`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to download agreement PDF. Status: ${
            response.status
          }. Response: ${errorText.substring(0, 100)}...`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Mkataba_wa_Ununuzi_Shamba_${downloadId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage("Mkataba wa ununuzi umepakuwa kikamilifu!");
      setShowSuccessSnackbar(true);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setModalMessage("Imeshindwa kupakua mkataba wa ununuzi: " + err.message);
      setShowErrorModal(true);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const createAndDownloadAgreement = async () => {
    try {
      await createPurchaseAgreement();

      setTimeout(async () => {
        if (agreementId) {
          await downloadAgreementPdf(agreementId);
        }
      }, 1000);
    } catch (err) {
      console.error("Error in create and download flow:", err);
      setModalMessage("Imeshindwa kuunda na kupakua mkataba wa ununuzi: " + err.message);
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

  const handleCloseSuccessSnackbar = () => {
    setShowSuccessSnackbar(false);
    setSuccessMessage("");
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
          <Typography variant="h6" color="success">
            Inapakia maelezo ya mkataba wa ununuzi...
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
          Hakuna data ya mkataba wa ununuzi
        </Typography>
      </Box>
    );
  }

  const defaultPassportImage = "https://via.placeholder.com/100x120?text=Picha";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 2 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, pt: 2, pb: 2, overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 2, position: "relative" }}>
            <IconButton
              onClick={handleGoBack}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                color: "text.secondary",
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
              MKATABA WA UNUNUZI WA SHAMBA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              (Farm Purchase Agreement)
            </Typography>
            <Chip
              label={`Namba ya Shamba: ${
                contractData.farm_number || `MKS-${contractData.farm_id}`
              }`}
              color="success"
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Tarehe: {formatDate(contractData.created_at)}
            </Typography>

            {agreementCreated && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`Mkataba Umejumuishwa: ${agreementId}`}
                  color="success"
                  variant="filled"
                  size="small"
                  icon={<CheckCircle />}
                />
              </Box>
            )}
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
                  MUUZAJI (SELLER):
                </Typography>
                <List dense disablePadding>
                  <ListItem
                    disableGutters
                    sx={{ py: 0, justifyContent: "center" }}
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 120,
                        border: "1px solid #ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={
                          contractData.seller_passport || defaultPassportImage
                        }
                        alt="Picha ya Muuzaji"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultPassportImage;
                        }}
                      />
                    </Box>
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Person fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.seller_name} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Phone fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.seller_phone} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Email fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.seller_email} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Home fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.seller_residence} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  MNUNUZI (BUYER):
                </Typography>
                <List dense disablePadding>
                  <ListItem
                    disableGutters
                    sx={{ py: 0, justifyContent: "center" }}
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 120,
                        border: "1px solid #ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={
                          contractData.buyer_passport || defaultPassportImage
                        }
                        alt="Picha ya Mnunuzi"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultPassportImage;
                        }}
                      />
                    </Box>
                  </ListItem>
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
                    <ListItemText primary={contractData.buyer_phone} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Email fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.buyer_email} />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Home fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={contractData.buyer_residence} />
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
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Bei ya Ununuzi:</strong>
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCurrency(contractData.price)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Njia ya Malipo:</strong>
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {contractData.payment_method || "Haijabainishwa"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Terms and Conditions */}
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
                <ListItemText primary="Mnunuzi atalipa bei kamili ya shamba kabla ya mkataba kusainiwa." />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary="Haki miliki ya shamba itahamishiwa kwa mnunuzi baada ya malipo kamili." />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary="Muuzaji atahakikisha hakuna mzozo wowote kuhusu shamba kabla ya mauzo." />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary="Mkataba huu hautaweza kufutwa au kubadilishwa bila idhini ya pande zote mbili." />
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

          {/* Signatures */}
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
                    MUUZAJI:
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
                    MNUNUZI:
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: _________________________
                  </Typography>
                  <Typography variant="caption">
                    Tarehe: __________________
                  </Typography>
                </Box>
              </Grid>

              {/* Witness 1 */}
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
                    SHAHIDI WA KWANZA: (Jina na Sahihi)
                  </Typography>
                  <Typography variant="caption">
                    Jina: _________________________
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: _________________________
                  </Typography>
                </Box>
              </Grid>

              {/* Witness 2 */}
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
                    SHAHIDI WA PILI: (Jina na Sahihi)
                  </Typography>
                  <Typography variant="caption">
                    Jina: _________________________
                  </Typography>
                  <Typography variant="caption">
                    Sahihi: _________________________
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Footer & Action Buttons */}
          <Box
            sx={{
              textAlign: "center",
              pt: 2,
              borderTop: 1,
              borderColor: "grey.300",
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              {!agreementCreated ? (
                <>
                  <Grid item>
                    <Button
                      color="primary"
                      variant="outlined"
                      size="medium"
                      startIcon={<Save />}
                      onClick={createPurchaseAgreement}
                      disabled={!contractData || loading || creatingAgreement}
                      sx={{ mb: 1 }}
                    >
                      {creatingAgreement ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Inaunda Mkataba...
                        </>
                      ) : (
                        "Unda Mkataba"
                      )}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color="success"
                      variant="contained"
                      size="medium"
                      startIcon={<Download />}
                      onClick={createAndDownloadAgreement}
                      disabled={!contractData || loading || creatingAgreement}
                      sx={{ mb: 1 }}
                    >
                      {creatingAgreement ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Inaunda na Kupakua...
                        </>
                      ) : (
                        "Unda na Pakua Mkataba"
                      )}
                    </Button>
                  </Grid>
                </>
              ) : (
                <Grid item>
                  <Button
                    color="success"
                    variant="contained"
                    size="medium"
                    startIcon={<Download />}
                    onClick={() => downloadAgreementPdf()}
                    disabled={!agreementId || downloadingPdf}
                    sx={{ mb: 1 }}
                  >
                    {downloadingPdf ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Inapakua...
                      </>
                    ) : (
                      "Pakua Mkataba (PDF)"
                    )}
                  </Button>
                </Grid>
              )}
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              Mkataba huu umejumuishwa chini ya sheria za Tanzania. Kwa maswali,
              wasiliana na msimamizi wa mfumo.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Error Modal */}
      <Dialog
        open={showErrorModal}
        onClose={handleCloseErrorModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">Kosa Limetokea</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorModal} color="primary">
            Sawa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseAgreement;