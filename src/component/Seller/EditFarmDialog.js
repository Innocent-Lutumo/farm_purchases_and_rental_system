import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { Edit } from "lucide-react";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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

const EditFarmDialog = ({
  open,
  onClose,
  editedFarm,
  handleEditChange,
  handleSaveEdit,
  BASE_URL,
  error,
  selectedFiles,
  previewImages,
  handleFileChange,
}) => {

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Edit size={20} /> Edit Farm
      </DialogTitle>
      <DialogContent dividers>
        {editedFarm && (
          <Grid container spacing={2}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Location"
                fullWidth
                variant="outlined"
                name="location"
                value={editedFarm.location || ""}
                onChange={handleEditChange}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Type</InputLabel>
                <Select
                  name="farm_type"
                  value={editedFarm.farm_type || ""}
                  onChange={handleEditChange}
                  label="Type"
                >
                  <MenuItem value="Sale">Sale</MenuItem>
                  <MenuItem value="Rent">Rent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                variant="outlined"
                name="price"
                value={editedFarm.price || ""}
                onChange={handleEditChange}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Size (Acres)"
                type="number"
                fullWidth
                variant="outlined"
                name="size"
                value={editedFarm.size || ""}
                onChange={handleEditChange}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Phone"
                fullWidth
                variant="outlined"
                name="phone"
                value={editedFarm.phone || ""}
                onChange={handleEditChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                name="description"
                value={editedFarm.description || ""}
                onChange={handleEditChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                size="small"
                fullWidth
              >
                Upload Images
                <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} accept="image/*" />
              </Button>
              
              {previewImages.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {previewImages.map((src, index) => (
                    <img 
                      key={index} 
                      src={src} 
                      alt={`Preview ${index}`} 
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                    />
                  ))}
                </Box>
              )}
              
              {selectedFiles.length === 0 && editedFarm.images?.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {editedFarm.images.slice(0, 3).map((img, index) => (
                    <img 
                      key={`existing-${index}`} 
                      src={`${BASE_URL}${img.image}`} 
                      alt={`Current ${index}`} 
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                    />
                  ))}
                  {editedFarm.images.length > 3 && (
                    <Typography variant="caption" sx={{ alignSelf: 'center', ml: 1 }}>
                      +{editedFarm.images.length - 3} more
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveEdit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFarmDialog;