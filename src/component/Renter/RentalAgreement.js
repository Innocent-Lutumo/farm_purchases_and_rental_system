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
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Download,
  Description,
  Phone,
  Email,
  AttachMoney,
  CalendarToday,
  Agriculture,
  ContactPage,
  Gavel,
  Security,
  Receipt,
  CheckCircle
} from '@mui/icons-material';

const RentalAgreement = () => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Replace with your actual API endpoint
  const API_ENDPOINT = 'http://127.0.0.1:8000/api/farmsrent/validated/';

  useEffect(() => {
    fetchContractData();
  }, []);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error('Failed to fetch contract data');
      }
      const data = await response.json();
      setContractData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadContract = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/download-contract/${contractData.id}/`);
      if (!response.ok) {
        throw new Error('Failed to download contract');
      }
     
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mkataba_wa_Kukodisha_Shamba_${contractData.farm_number || contractData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download contract: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
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
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
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
          minHeight: '100vh',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Hakuna data ya mkataba
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={3} sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <Description fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  MKATABA WA KUKODISHA SHAMBA
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Namba ya Mkataba: {contractData.farm_number || `MKS-${contractData.id}`}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Download />}
              onClick={downloadContract}
              sx={{ minWidth: 160 }}
            >
              Pakua Mkataba
            </Button>
          </Box>
        </Paper>

        {/* Main Contract Content */}
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Official Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              JAMHURI YA MUUNGANO WA TANZANIA
            </Typography>
            <Typography variant="h5" gutterBottom>
              MKATABA WA KUKODISHA SHAMBA
            </Typography>
            <Typography variant="h6" color="text.secondary">
              (Farm Rental Agreement)
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="body1">
                Mkataba huu umeingia katika nguvu tarehe {formatDate(contractData.created_at)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Parties Section */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactPage color="primary" />
                WAHUSIKA WA MKATABA (CONTRACTING PARTIES)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      MKODISHAJI (LANDLORD)
                    </Typography>
                  </Box>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Namba ya Simu"
                        secondary={contractData.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Barua Pepe"
                        secondary={contractData.email}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      MKODISHWA (TENANT)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Maelezo ya mkodishwa yatajazwa wakati wa kusaini mkataba
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Property Description */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Agriculture color="primary" />
                MAELEZO YA SHAMBA (PROPERTY DESCRIPTION)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.50' }}>
                      <TableCell><strong>Kipengele</strong></TableCell>
                      <TableCell><strong>Maelezo</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Eneo la Shamba</TableCell>
                      <TableCell>{contractData.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ukubwa wa Shamba</TableCell>
                      <TableCell>{contractData.size} Ekari</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ubora wa Udongo</TableCell>
                      <TableCell>{contractData.quality}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Aina ya Shamba</TableCell>
                      <TableCell>{contractData.farm_type}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {contractData.description && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Maelezo ya Ziada:</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">
                      {contractData.description}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color="success" />
                MASHARTI YA KIFEDHA (FINANCIAL TERMS)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h6" gutterBottom>
                      KODI YA MWEZI (MONTHLY RENT)
                    </Typography>
                    <Typography variant="h3" color="success.main" fontWeight="bold">
                      {formatCurrency(contractData.price)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Receipt color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Dhamana (Security Deposit)"
                        secondary={formatCurrency(contractData.price * 2)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Malipo ya awali (Advance Payment)"
                        secondary={formatCurrency(contractData.price)}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gavel color="primary" />
                MASHARTI NA HALI (TERMS AND CONDITIONS)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>1. MUDA WA MKATABA (CONTRACT DURATION)</Typography>
                <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
                  Mkataba huu utaanza kutumika tarehe {formatDate(contractData.created_at)} na utadumu kwa muda wa mwaka mmoja (12 miezi).
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>2. MALIPO (PAYMENT TERMS)</Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText primary="Kodi italipiwa mwanzoni mwa kila mwezi" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Malipo yatafanywa kupitia njia rasmi za benki" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Kuchelewa kwa malipo kutazabia faini ya 5% kila siku" />
                  </ListItem>
                </List>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>3. MAJUKUMU YA MKODISHWA (TENANT RESPONSIBILITIES)</Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText primary="Kutunza shamba vizuri na kuzuia uharibifu" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Kutumia shamba kwa madhumuni ya kilimo pekee" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Kutii sheria zote za mazingira na kilimo" />
                  </ListItem>
                </List>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>4. MAJUKUMU YA MKODISHAJI (LANDLORD RESPONSIBILITIES)</Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText primary="Kuhakikisha mkodishwa ana haki ya matumizi ya shamba" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Kutoa msaada wa kiufundi inapohitajika" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>

          {/* Contract Status */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                HALI YA MKATABA (CONTRACT STATUS)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>Hali ya Kukodisha</Typography>
                    <Chip
                      label={contractData.is_rented ? 'Kimekodishwa' : 'Kinapatikana'}
                      color={contractData.is_rented ? 'error' : 'success'}
                      variant="filled"
                      size="large"
                      icon={<CheckCircle />}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>Hali ya Uthibitisho</Typography>
                    <Chip
                      label={contractData.is_validated ? 'Umethibitishwa' : 'Unasubiri Kuthibitishwa'}
                      color={contractData.is_validated ? 'success' : 'warning'}
                      variant="filled"
                      size="large"
                      icon={<CheckCircle />}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>Idadi ya Maoni</Typography>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {contractData.click_count}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {contractData.admin_feedback && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Maoni ya Msimamizi:</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
                    <Typography variant="body1">
                      {contractData.admin_feedback}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Signatures Section */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                SAHIHI ZA WAHUSIKA (SIGNATURES)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: 1, borderColor: 'grey.300', p: 3, minHeight: 120 }}>
                    <Typography variant="h6" gutterBottom>MKODISHAJI (LANDLORD)</Typography>
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="body2">Sahihi: _________________________</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>Tarehe: {formatDate(new Date())}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: 1, borderColor: 'grey.300', p: 3, minHeight: 120 }}>
                    <Typography variant="h6" gutterBottom>MKODISHWA (TENANT)</Typography>
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="body2">Sahihi: _________________________</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>Tarehe: _____________________</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Witness Section */}
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                MASHAHIDI (WITNESSES)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: 1, borderColor: 'grey.300', p: 3, minHeight: 120 }}>
                    <Typography variant="h6" gutterBottom>SHAHIDI WA KWANZA</Typography>
                    <Typography variant="body2">Jina: _________________________</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Sahihi: _______________________</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Tarehe: _______________________</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: 1, borderColor: 'grey.300', p: 3, minHeight: 120 }}>
                    <Typography variant="h6" gutterBottom>SHAHIDI WA PILI</Typography>
                    <Typography variant="body2">Jina: _________________________</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Sahihi: _______________________</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Tarehe: _______________________</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', pt: 3, borderTop: 2, borderColor: 'primary.main' }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              MKATABA UMEKAMILIKA - CONTRACT COMPLETED
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tarehe ya Kutengenezwa: {formatDate(new Date())} • 
              Namba ya Mkataba: {contractData.farm_number || `MKS-${contractData.id}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mkataba huu umesajiliwa chini ya sheria za Tanzania za kukodisha mali
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RentalAgreement;