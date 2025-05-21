import React, { useState, useEffect } from "react";
import { Chip, CircularProgress } from "@mui/material";

const FarmStatusIndicator = ({ farmId, farmType = 'rent', initialStatus = false, size = 'medium' }) => {
  const [isRented, setIsRented] = useState(initialStatus);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setIsRented(initialStatus);
    
    const checkFarmStatus = async () => {
      try {
        setLoading(true);
        // Determine which API endpoint to call based on farm type
        const endpoint = farmType === 'rent' 
          ? `http://127.0.0.1:8000/api/transactions/farm/${farmId}`
          : `http://127.0.0.1:8000/api/transactionsale/farm/${farmId}`;
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to check farm status: ${response.status}`);
        }
        
        const data = await response.json();
        // If transactions exist for this farm, it's rented/sold
        // Only update the status if the farm is marked as taken
        // This ensures we don't remove the TAKEN status once it's set
        if (data.length > 0) {
          setIsRented(true);
        }
      } catch (err) {
        console.error(`Error checking farm status:`, err);
        // On error, fall back to initial status if it's true (taken),
        // but don't change from true to false
        if (initialStatus) {
          setIsRented(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkFarmStatus();
    
    // Consider adding a localStorage backup to ensure persistence
    const storedStatus = localStorage.getItem(`farm-status-${farmId}`);
    if (storedStatus === 'taken') {
      setIsRented(true);
    }
    
  }, [farmId, farmType, initialStatus]);
  
  // When the status changes to rented, save it to localStorage
  useEffect(() => {
    if (isRented) {
      localStorage.setItem(`farm-status-${farmId}`, 'taken');
    }
  }, [isRented, farmId]);

  // Position styles that will be applied to the Chip container
  const containerStyle = {
    position: 'absolute',
    top: size === 'small' ? 5 : 10,
    right: size === 'small' ? 5 : 10,
    zIndex: 10,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <Chip
          label="Checking..."
          size={size}
          color="default"
          icon={<CircularProgress size={size === 'small' ? 12 : 16} color="inherit" />}
        />
      </div>
    );
  }

  // Always show the TAKEN chip if isRented is true
  if (!isRented) return null;

  return (
    <div style={containerStyle}>
      <Chip
        label="TAKEN"
        size={size}
        color="error"
        sx={{ fontWeight: 'bold' }}
      />
    </div>
  );
};

export default FarmStatusIndicator;