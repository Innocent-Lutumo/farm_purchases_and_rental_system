// MapTilerFarmMap.jsx - Improved Location Detection
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Fab,
  Alert,
  AlertTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NearMeIcon from "@mui/icons-material/NearMe";
import MapIcon from "@mui/icons-material/Map";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningIcon from "@mui/icons-material/Warning";

const MapTilerFarmMap = ({ farm, onClose }) => {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMapStyle, setActiveMapStyle] = useState(0);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const farmMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  // Map styles configuration
  const MAP_STYLES = React.useMemo(
    () => [
      {
        name: "Streets",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
      {
        name: "Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      },
      {
        name: "Outdoor",
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution:
          'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a>',
      },
    ],
    []
  );

  const farmCoordinates = farm
    ? {
        lat: parseFloat(farm.lat || -6.169),
        lng: parseFloat(farm.lng || 39.189),
      }
    : { lat: -6.169, lng: 39.189 };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!window.L) {
      setLoading(true);
      return;
    }

    const leafletMap = window.L.map(mapRef.current, {
      center: [farmCoordinates.lat, farmCoordinates.lng],
      zoom: 13,
      zoomControl: false,
    });

    window.L.control.zoom({ position: "bottomright" }).addTo(leafletMap);

    window.L.tileLayer(MAP_STYLES[0].url, {
      attribution: MAP_STYLES[0].attribution,
    }).addTo(leafletMap);

    const farmIcon = window.L.divIcon({
      className: "custom-farm-marker",
      html: `<div style="background-color: #4CAF50; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const farmMarker = window.L.marker(
      [farmCoordinates.lat, farmCoordinates.lng],
      {
        icon: farmIcon,
      }
    ).addTo(leafletMap);

    farmMarker.bindPopup(
      `<div style="font-family: Arial, sans-serif;">
         <h4 style="margin: 0 0 8px 0; color: #4CAF50;">${
           farm?.name || "Farm Location"
         }</h4>
         <p style="margin: 0; color: #666;">${farm?.location || "Destination"}</p>
       </div>`
    );

    setMap(leafletMap);
    farmMarkerRef.current = farmMarker;

    return () => {
      leafletMap.remove();
    };
  }, [farmCoordinates.lat, farmCoordinates.lng, MAP_STYLES, farm?.location, farm?.name]);

  // Load Leaflet library
  useEffect(() => {
    if (window.L) {
      setLoading(false);
      return;
    }

    const loadLeaflet = async () => {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setLoading(false);
        setMap(null);
      };
      script.onerror = () => {
        console.error("Failed to load Leaflet script.");
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  // Improved user location detection
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setLocationError(null);

    // Clear previous location data
    setUserLocation({ lat: null, lng: null });
    setLocationAccuracy(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 0, // Don't use cached location
    };

    // Try to get high accuracy location first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log('Location detected:', {
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          accuracy: accuracy,
          timestamp: new Date(position.timestamp).toLocaleString(),
        });

        setUserLocation(newLocation);
        setLocationAccuracy(accuracy);
        setLoading(false);

        // Check if accuracy is very poor (more than 5km)
        if (accuracy > 5000) {
          setLocationError(
            `Location accuracy is poor (±${Math.round(accuracy/1000)}km). This might not be your exact location.`
          );
        } else if (accuracy > 1000) {
          setLocationError(
            `Location accuracy is moderate (±${Math.round(accuracy)}m). Location might be approximate.`
          );
        }

        if (map) {
          updateUserMarker(newLocation, accuracy);
          calculateRoute(newLocation, farmCoordinates);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
        
        let errorMessage = "Could not get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access was denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Try moving to an area with better signal.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        
        setLocationError(errorMessage);
        
        // Try with lower accuracy as fallback
        tryLowAccuracyLocation();
      },
      options
    );
  };

  // Fallback location detection with lower accuracy
  const tryLowAccuracyLocation = () => {
    const lowAccuracyOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000, // Accept 5-minute old location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log('Fallback location detected:', {
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          accuracy: accuracy,
          timestamp: new Date(position.timestamp).toLocaleString(),
        });

        setUserLocation(newLocation);
        setLocationAccuracy(accuracy);
        setLocationError(
          `Using approximate location (±${Math.round(accuracy > 1000 ? accuracy/1000 : accuracy)}${accuracy > 1000 ? 'km' : 'm'}). For better accuracy, enable high-precision location.`
        );

        if (map) {
          updateUserMarker(newLocation, accuracy);
          calculateRoute(newLocation, farmCoordinates);
        }
      },
      (fallbackError) => {
        console.error("Fallback geolocation also failed:", fallbackError);
        setLocationError("Unable to determine your location. Please check your location settings and try again.");
      },
      lowAccuracyOptions
    );
  };

  // Update user marker with accuracy circle
  const updateUserMarker = (location, accuracy) => {
    if (!map) return;

    // Remove existing markers
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
    }

    // Add accuracy circle
    const accuracyCircle = window.L.circle([location.lat, location.lng], {
      radius: accuracy,
      color: '#2196F3',
      fillColor: '#2196F3',
      fillOpacity: 0.1,
      weight: 2,
      opacity: 0.3,
    }).addTo(map);

    accuracyCircleRef.current = accuracyCircle;

    // Add user marker
    const userIcon = window.L.divIcon({
      className: "custom-user-marker",
      html: `<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const userMarker = window.L.marker([location.lat, location.lng], {
      icon: userIcon,
    }).addTo(map);

    const accuracyText = accuracy > 1000 
      ? `±${(accuracy/1000).toFixed(1)}km` 
      : `±${Math.round(accuracy)}m`;

    userMarker.bindPopup(
      `<div style="font-family: Arial, sans-serif;">
         <h4 style="margin: 0 0 8px 0; color: #2196F3;">Your Location</h4>
         <p style="margin: 0; color: #666;">Accuracy: ${accuracyText}</p>
         <p style="margin: 4px 0 0 0; color: #999; font-size: 12px;">
           ${new Date().toLocaleTimeString()}
         </p>
       </div>`
    );

    userMarkerRef.current = userMarker;
  };

  // Calculate route between user and farm
  const calculateRoute = async (userLoc, farmLoc) => {
    if (!map) return;

    try {
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
      }

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${farmLoc.lng},${farmLoc.lat}?overview=full&geometries=geojson`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeCoordinates = route.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);

          const routeLine = window.L.polyline(routeCoordinates, {
            color: "#1976D2",
            weight: 5,
            opacity: 0.7,
          }).addTo(map);

          routeLineRef.current = routeLine;

          const distanceInMeters = route.distance;
          const durationInSeconds = route.duration;

          const distanceText =
            distanceInMeters < 1000
              ? `${Math.round(distanceInMeters)} m`
              : `${(distanceInMeters / 1000).toFixed(1)} km`;

          const hours = Math.floor(durationInSeconds / 3600);
          const minutes = Math.floor((durationInSeconds % 3600) / 60);

          let timeText;
          if (hours === 0 && minutes === 0) {
            timeText = "Less than 1 min";
          } else if (hours === 0) {
            timeText = `${minutes} min`;
          } else {
            timeText = `${hours}h ${minutes}m`;
          }

          setRouteInfo({
            distance: distanceText,
            time: timeText,
            isEstimate: false,
          });

          map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
          return;
        }
      }

      // Fallback to straight line
      const points = [
        [userLoc.lat, userLoc.lng],
        [farmLoc.lat, farmLoc.lng],
      ];

      const routeLine = window.L.polyline(points, {
        color: "#1976D2",
        weight: 5,
        opacity: 0.5,
        dashArray: "10, 10",
      }).addTo(map);

      routeLineRef.current = routeLine;

      const distance = map.distance(
        [userLoc.lat, userLoc.lng],
        [farmLoc.lat, farmLoc.lng]
      );
      const distanceText =
        distance < 1000
          ? `${Math.round(distance)} m`
          : `${(distance / 1000).toFixed(1)} km`;

      const timeInHours = distance / 1000 / 40;
      const hours = Math.floor(timeInHours);
      const minutes = Math.floor((timeInHours - hours) * 60);

      let timeText;
      if (hours === 0 && minutes === 0) {
        timeText = "Less than 1 min";
      } else if (hours === 0) {
        timeText = `${minutes} min`;
      } else {
        timeText = `${hours}h ${minutes}m`;
      }

      setRouteInfo({
        distance: distanceText,
        time: timeText,
        isEstimate: true,
      });

      map.fitBounds(points, { padding: [20, 20] });
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  // Change map style
  const cycleMapStyle = () => {
    if (!map) return;

    const nextStyle = (activeMapStyle + 1) % MAP_STYLES.length;
    setActiveMapStyle(nextStyle);

    map.eachLayer((layer) => {
      if (layer instanceof window.L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    window.L.tileLayer(MAP_STYLES[nextStyle].url, {
      attribution: MAP_STYLES[nextStyle].attribution,
    }).addTo(map);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: "sticky",
        top: "20px",
        borderRadius: "12px",
        overflow: "hidden",
        maxWidth: "100%",
        width: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Location Error Alert */}
      {locationError && (
        <Alert severity="warning" sx={{ m: 1, mb: 0 }}>
          <AlertTitle>Location Notice</AlertTitle>
          {locationError}
        </Alert>
      )}

      {/* Route Information Panel */}
      {routeInfo && (
        <Box
          sx={{
            padding: 2,
            background: "linear-gradient(135deg, #E3F2FD, #E8F5E9)",
            borderBottom: "1px solid #E0E0E0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
                🛣️
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "medium" }}>
                DISTANCE
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                {routeInfo.distance}
              </Typography>
            </Box>

            <Box
              sx={{ width: "1px", height: "40px", backgroundColor: "#ddd" }}
            ></Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
                ⏱️
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "medium" }}>
                EST. TIME
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {routeInfo.time}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              textAlign: "center",
              mt: 1,
              display: "block",
              color: "text.secondary",
            }}
          >
            {routeInfo.isEstimate
              ? "*Estimated based on straight-line distance"
              : "*Drive time may vary based on traffic"}
          </Typography>
        </Box>
      )}

      {/* Map Container */}
      <Box sx={{ position: "relative", height: "400px", width: "100%" }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>

        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.8)",
              zIndex: 1000,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress sx={{ mb: 1 }} />
              <Typography variant="body1">Detecting your location...</Typography>
            </Box>
          </Box>
        )}

        {/* Farm Location Display */}
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            p: 1.5,
            borderRadius: "8px",
            zIndex: 1000,
            borderLeft: "4px solid",
            borderColor: "success.main",
            maxWidth: "60%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <LocationOnIcon sx={{ color: "success.main", mr: 1 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {farm?.name || "Farm"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {farm?.location || "Unknown location"}
            </Typography>
          </Box>
        </Paper>

        {/* User Location Display */}
        {userLocation.lat && (
          <Paper
            elevation={2}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              p: 1.5,
              borderRadius: "8px",
              zIndex: 1000,
              borderLeft: "4px solid",
              borderColor: locationAccuracy > 1000 ? "warning.main" : "primary.main",
              maxWidth: "60%",
              display: "flex",
              alignItems: "center",
            }}
          >
            {locationAccuracy > 1000 ? (
              <WarningIcon sx={{ color: "warning.main", mr: 1 }} />
            ) : (
              <NearMeIcon sx={{ color: "primary.main", mr: 1 }} />
            )}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Your Location
              </Typography>
              {locationAccuracy && (
                <Typography variant="caption" color="text.secondary">
                  ±{locationAccuracy > 1000 
                    ? `${(locationAccuracy/1000).toFixed(1)}km` 
                    : `${Math.round(locationAccuracy)}m`}
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {/* Map Style Selector */}
        <Fab
          variant="extended"
          size="small"
          onClick={cycleMapStyle}
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            zIndex: 1000,
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "grey.100",
            },
          }}
        >
          <MapIcon sx={{ mr: 1 }} />
          {MAP_STYLES[activeMapStyle]?.name || "Streets"}
        </Fab>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "grey.50",
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          variant="contained"
          onClick={getUserLocation}
          disabled={loading}
          startIcon={<NearMeIcon />}
          sx={{ flexGrow: 1 }}
        >
          {loading ? "Detecting..." : "GET DIRECTIONS"}
        </Button>

        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ flexGrow: 1, color: "text.primary", borderColor: "grey.300" }}
        >
          CLOSE MAP
        </Button>
      </Box>
    </Paper>
  );
};

export default MapTilerFarmMap;