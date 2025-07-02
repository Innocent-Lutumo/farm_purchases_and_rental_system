import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  IconButton,
  Chip,
  Card,
  CardContent,
  Divider,
  Paper,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Agriculture as AgricultureIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  SquareFoot as SquareFootIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  CloudUpload as CloudUploadIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { Eye, Trash2, Edit } from "lucide-react";

const ViewFarmDialog = ({
  open,
  onClose,
  selectedFarm,
  imageIndexes,
  handlePrevImage,
  handleNextImage,
  handleEditClick,
  handleDeleteClick,
  BASE_URL,
  getValidationStatusInfo,
}) => {
  if (!selectedFarm) return null;

  const farmDetails = [
    { icon: LocationOnIcon, label: "Location", value: selectedFarm.location },
    { icon: AgricultureIcon, label: "Farm Type", value: selectedFarm.farm_type },
    { icon: AttachMoneyIcon, label: "Price", value: selectedFarm.price },
    { icon: StarIcon, label: "Quality", value: selectedFarm.quality },
    { icon: SquareFootIcon, label: "Size", value: `${selectedFarm.size} acres` },
    { icon: PhoneIcon, label: "Phone", value: selectedFarm.phone },
    { icon: EmailIcon, label: "Email", value: selectedFarm.email },
  ];

  const documents = [
    {
      label: "Passport",
      file: selectedFarm.passport,
      available: !!selectedFarm.passport,
    },
    {
      label: "Ownership Certificate",
      file: selectedFarm.ownership_certificate,
      available: !!selectedFarm.ownership_certificate,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Eye size={24} />
        <Typography variant="h6" component="span">
          Farm Details
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {selectedFarm.farm_type === "Sale" ? "Farm for Sale" : "Farm for Rent"}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={getValidationStatusInfo(selectedFarm).icon}
                  label={getValidationStatusInfo(selectedFarm).label}
                  color={getValidationStatusInfo(selectedFarm).chipColor}
                  size="medium"
                />
                {selectedFarm.admin_feedback && (
                  <Typography variant="body2" color="text.secondary">
                    Reason: {selectedFarm.admin_feedback}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <Box sx={{ 
                position: 'relative',
                height: 350,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100'
              }}>
                {selectedFarm.images?.length > 0 ? (
                  <>
                    <Box
                      component="img"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      src={`${BASE_URL}${selectedFarm.images[imageIndexes[selectedFarm.uniqueId] || 0]?.image}`}
                      alt={`${selectedFarm.location} farm`}
                    />
                    
                    {/* Navigation Controls */}
                    {selectedFarm.images?.length > 1 && (
                      <>
                        <IconButton
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handlePrevImage(selectedFarm.uniqueId); 
                          }}
                          sx={{ 
                            position: "absolute", 
                            left: 8, 
                            top: "50%", 
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "white",
                            '&:hover': { backgroundColor: "rgba(0,0,0,0.8)" }
                          }}
                        >
                          <NavigateBeforeIcon />
                        </IconButton>
                        
                        <IconButton
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleNextImage(selectedFarm.uniqueId); 
                          }}
                          sx={{ 
                            position: "absolute", 
                            right: 8, 
                            top: "50%", 
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "white",
                            '&:hover': { backgroundColor: "rgba(0,0,0,0.8)" }
                          }}
                        >
                          <NavigateNextIcon />
                        </IconButton>
                        
                        <Paper
                          sx={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: "white",
                          }}
                        >
                          <Typography variant="caption">
                            {(imageIndexes[selectedFarm.uniqueId] || 0) + 1} / {selectedFarm.images.length}
                          </Typography>
                        </Paper>
                      </>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No Image Available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Farm Details Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  Farm Information
                </Typography>
                <Grid container spacing={2}>
                  {farmDetails.map((detail, index) => {
                    const IconComponent = detail.icon;
                    return (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          py: 0.5
                        }}>
                          <IconComponent 
                            sx={{ 
                              color: 'primary.main', 
                              fontSize: 20,
                              minWidth: 20
                            }} 
                          />
                          <Typography variant="body2" component="span" fontWeight="600">
                            {detail.label}:
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 'auto', textAlign: 'right' }}>
                            {detail.value}
                          </Typography>
                        </Box>
                        {index < farmDetails.length - 1 && <Divider sx={{ my: 0.5 }} />}
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Description Section */}
          {selectedFarm.description && (
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <DescriptionIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {selectedFarm.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Documents Section */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  Documents
                </Typography>
                <Grid container spacing={2}>
                  {documents.map((doc, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          bgcolor: doc.available ? 'success.light' : 'grey.50',
                          borderColor: doc.available ? 'success.main' : 'grey.300'
                        }}
                      >
                        <CloudUploadIcon 
                          sx={{ 
                            color: doc.available ? 'success.main' : 'grey.400',
                            fontSize: 24
                          }} 
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600">
                            {doc.label}
                          </Typography>
                          {doc.available ? (
                            <Button
                              href={`${BASE_URL}${doc.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              variant="text"
                              sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                            >
                              View Document
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Not uploaded
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button 
          onClick={() => {
            handleEditClick(selectedFarm);
            onClose();
          }}
          startIcon={<Edit size={18} />}
          variant="contained"
          color="primary"
        >
          Edit Farm
        </Button>
        <Button 
          onClick={() => {
            handleDeleteClick(selectedFarm);
            onClose();
          }}
          startIcon={<Trash2 size={18} />}
          variant="outlined"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewFarmDialog;