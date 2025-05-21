import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Snackbar
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor to add access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');

      if (!refresh) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
        localStorage.setItem('access', response.data.access);

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentSeller, setCurrentSeller] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-sellers/');
      setSellers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sellers:", err);
      setError('Failed to fetch sellers: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handler for navigating back
  const handleBack = () => {
    window.history.back();
  };

  // Handler for edit seller
  const handleEdit = (seller) => {
    setCurrentSeller(seller);
    setOpenEditDialog(true);
  };

  // Handler for saving edited seller
  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin-sellers/${currentSeller.id}/`, currentSeller);
      setOpenEditDialog(false);
      fetchSellers(); // Refresh the list
      setSnackbar({
        open: true,
        message: 'Seller updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error("Error updating seller:", err);
      setSnackbar({
        open: true,
        message: 'Failed to update seller: ' + (err.response?.data?.detail || err.message),
        severity: 'error'
      });
    }
  };

  // Handler for delete seller dialog
  const handleDeleteClick = (seller) => {
    setCurrentSeller(seller);
    setOpenDeleteDialog(true);
  };

  // Handler for confirming delete
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin-sellers/${currentSeller.id}/`);
      setOpenDeleteDialog(false);
      fetchSellers(); // Refresh the list after successful deletion
      setSnackbar({
        open: true,
        message: 'Seller deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error("Error deleting seller:", err);
      setSnackbar({
        open: true,
        message: 'Failed to delete seller: ' + (err.response?.data?.detail || err.message),
        severity: 'error'
      });
    }
  };

  // Handler for closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Define the green color theme
  const themeColor = {
    primary: '#2e7d32',
    light: '#4caf50',   
    lighter: '#e8f5e9', 
    hover: '#c8e6c9'   
  };

  return (
    <>
      {/* Header with AppBar in green */}
      <AppBar position="static" sx={{ backgroundColor: themeColor.primary }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={handleBack}
            sx={{ marginRight: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <StorefrontIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Admin Dashboard for Sellers
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Page Title Section with enhanced styling */}
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: themeColor.primary,
              display: 'inline-block',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '60%',
                height: '4px',
                bottom: '-8px',
                left: '0',
                backgroundColor: themeColor.primary,
                borderRadius: '2px'
              }
            }}
          >
            Registered Sellers
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, color: '#555', fontWeight: 500 }}>
            View and manage all registered sellers in the system
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Loading and Error States with improved styling */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} thickness={4} sx={{ color: themeColor.primary }} />
          </Box>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: '1.5rem' } 
            }}
          >
            {error}
          </Alert>
        )}
        
        {!loading && sellers.length === 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: '1.5rem' } 
            }}
          >
            No sellers found.
          </Alert>
        )}

        {/* Table with enhanced styling and new action buttons */}
        {!loading && sellers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                overflowX: 'auto', 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: themeColor.primary }}>
                    <TableCell 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        padding: '16px 24px'
                      }}
                    >
                      Seller Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        padding: '16px 24px'
                      }}
                    >
                      Username
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        padding: '16px 24px'
                      }}
                    >
                      Seller Residence
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        padding: '16px 24px',
                        textAlign: 'center'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sellers.map((seller, index) => (
                    <TableRow
                      key={seller.id || index}
                      hover
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                        '&:hover': { backgroundColor: themeColor.hover },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <TableCell sx={{ padding: '16px 24px', fontWeight: 500 }}>
                        {seller.seller_name}
                      </TableCell>
                      <TableCell sx={{ padding: '16px 24px' }}>
                        {seller.username}
                      </TableCell>
                      <TableCell sx={{ padding: '16px 24px' }}>
                        {seller.seller_residence}
                      </TableCell>
                      <TableCell sx={{ padding: '16px 24px', textAlign: 'center' }}>
                        <Tooltip title="Edit Seller">
                          <IconButton 
                            onClick={() => handleEdit(seller)}
                            sx={{ 
                              color: themeColor.primary,
                              '&:hover': { backgroundColor: themeColor.hover }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Seller">
                          <IconButton 
                            onClick={() => handleDeleteClick(seller)}
                            sx={{ 
                              color: '#d32f2f',
                              '&:hover': { backgroundColor: '#ffebee' }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            
            {/* Additional statistics box with green theme */}
            <Box 
              sx={{ 
                mt: 4, 
                p: 3, 
                backgroundColor: themeColor.lighter, 
                borderRadius: 3,
                border: `1px solid ${themeColor.light}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: themeColor.primary }}>
                Summary
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Total registered sellers: <b>{sellers.length}</b>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                Last updated: {new Date().toLocaleString()}
              </Typography>
            </Box>
          </motion.div>
        )}

        {/* Edit Seller Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: themeColor.primary, color: 'white' }}>
            Edit Seller
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Seller Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentSeller.seller_name || ''}
              onChange={(e) => setCurrentSeller({...currentSeller, seller_name: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={currentSeller.username || ''}
              onChange={(e) => setCurrentSeller({...currentSeller, username: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Seller Residence"
              type="text"
              fullWidth
              variant="outlined"
              value={currentSeller.seller_residence || ''}
              onChange={(e) => setCurrentSeller({...currentSeller, seller_residence: e.target.value})}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenEditDialog(false)} 
              sx={{ 
                color: '#666',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained"
              sx={{ 
                backgroundColor: themeColor.primary,
                '&:hover': { backgroundColor: '#1b5e20' }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete seller "{currentSeller.seller_name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDeleteDialog(false)} 
              sx={{ color: '#666' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              sx={{ color: '#d32f2f' }} 
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default SellerList;