import React, { useState, useEffect } from "react";
import { Chip, CircularProgress } from "@mui/material";

const FarmStatusIndicator = ({
  farmId,
  farmType = "rent",
  initialStatus = false,
  size = "medium",
}) => {
  const [isRented, setIsRented] = useState(initialStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsRented(initialStatus);

    const checkFarmStatus = async () => {
      try {
        setLoading(true);
        const endpoint =
          farmType === "rent"
            ? `http://127.0.0.1:8000/api/farmsrent/validate/farm/${farmId}`
            : `http://127.0.0.1:8000/api/transactionsale/farm/${farmId}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to check farm status: ${response.status}`);
        }

        const data = await response.json();
        if (data.length > 0) {
          setIsRented(true);
        }
      } catch (err) {
        console.error(`Error checking farm status:`, err);
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
    if (storedStatus === "Rented") {
      setIsRented(true);
    }
  }, [farmId, farmType, initialStatus]);

  useEffect(() => {
    if (isRented) {
      localStorage.setItem(`farm-status-${farmId}`, "Rented");
    }
  }, [isRented, farmId]);

  const containerStyle = {
    position: "absolute",
    top: size === "small" ? 5 : 10,
    right: size === "small" ? 5 : 10,
    zIndex: 10,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <Chip
          label="Checking..."
          size={size}
          color="default"
          icon={
            <CircularProgress
              size={size === "small" ? 12 : 16}
              color="inherit"
            />
          }
        />
      </div>
    );
  }

  if (!isRented) return null;

  return (
    <div style={containerStyle}>
      <Chip
        label="Rented"
        size={size}
        color="error"
        sx={{ fontWeight: "bold" }}
      />
    </div>
  );
};

export default FarmStatusIndicator;
