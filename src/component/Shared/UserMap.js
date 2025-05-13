import React, { useState, useEffect, useRef } from "react";
import { Box, Card, Paper, Button, Divider, CircularProgress, Typography } from "@mui/material";
import DirectionsIcon from "@mui/icons-material/Directions";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import RouteIcon from "@mui/icons-material/Route";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import TerrainIcon from "@mui/icons-material/Terrain";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// We need to explicitly set the marker icon due to a known issue with webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the default icon issue in Leaflet with webpack
const fixLeafletDefaultIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
  });
};

// Create custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MAPTILER_API_KEY = "d6Ks8KzmAbP2XbBsTuSu"; 

  const MAP_STYLES = [
    // If no MapTiler API key is provided, use OpenStreetMap as fallback
    MAPTILER_API_KEY === "d6Ks8KzmAbP2XbBsTuSu" ? 
    { 
      name: "Streets", 
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    } : 
    { 
      name: "Streets", 
      url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    
    MAPTILER_API_KEY === "d6Ks8KzmAbP2XbBsTuSu" ?
    { 
      name: "Satellite", 
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    } :
    { 
      name: "Satellite", 
      url: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    
    MAPTILER_API_KEY === "d6Ks8KzmAbP2XbBsTuSu" ?
    { 
      name: "Outdoor", 
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    } :
    { 
      name: "Outdoor", 
      url: `https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    
    MAPTILER_API_KEY === "d6Ks8KzmAbP2XbBsTuSu" ?
    { 
      name: "Topo", 
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    } :
    { 
      name: "Topo", 
      url: `https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ];

// User position marker with automatic detection and watchPosition
const UserPositionMarker = ({ userLocation, setUserLocation }) => {
  const map = useMap();
  const watchIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    // Initial position detection
    if (navigator.geolocation) {
      // First try to get a quick position fix
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          
          // Center map on user location
          map.setView([newLocation.lat, newLocation.lng], 14);
        },
        (error) => {
          console.error("Error getting initial position:", error);
          // Fallback to a default position if needed
          // This is just for demo purposes - in production you'd handle this differently
          if (!userLocation.lat) {
            const defaultLocation = { lat: -6.169, lng: 39.189 }; // Default to Ifakara area
            setUserLocation(defaultLocation);
            map.setView([defaultLocation.lat, defaultLocation.lng], 14);
          }
        },
        {
          enableHighAccuracy: false, // First try with less accuracy for faster response
          maximumAge: 60000,
          timeout: 5000,
        }
      );
      
      // Then set up continuous position tracking with high accuracy
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (!isMounted) return;
          
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
        },
        (error) => {
          console.error("Watch position error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
    } else {
      // Geolocation not supported - use fallback
      const defaultLocation = { lat: -6.169, lng: 39.189 }; // Default to Ifakara area
      setUserLocation(defaultLocation);
      map.setView([defaultLocation.lat, defaultLocation.lng], 14);
    }
    
    // Cleanup function to clear the watch when component unmounts
    return () => {
      isMounted = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [map, setUserLocation, userLocation.lat]);

  if (!userLocation.lat) return null;

  return (
    <Marker
      position={[userLocation.lat, userLocation.lng]}
      icon={createCustomIcon("#2196F3")} // Blue for user
    >
      <Popup>
        <Typography variant="body2" fontWeight="medium">
          Your Current Location
        </Typography>
      </Popup>
    </Marker>
  );
};

// Create a path line between user location and farm with OSRM route
const RouteLine = ({ userLocation, farmLocation, setRouteInfo }) => {
  const map = useMap();
  const routeLineRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!userLocation.lat || !farmLocation.lat) return;
    
    // Remove previous line if exists
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    
    const fetchRoute = async () => {
      setIsLoading(true);
      
      try {
        // Create points for straight line as fallback
        const points = [
          [userLocation.lat, userLocation.lng],
          [farmLocation.lat, farmLocation.lng]
        ];
        
        // Try to get a real route using OSRM public API
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${farmLocation.lng},${farmLocation.lat}?overview=full&geometries=geojson`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.routes && data.routes.length > 0) {
            // Get the route geometry
            const route = data.routes[0];
            const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Create a polyline with the route
            const routeLine = L.polyline(routeCoordinates, {
              color: '#1976D2',
              weight: 6,
              opacity: 0.7,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            routeLineRef.current = routeLine;
            
            // Calculate distance and time from OSRM response
            const distanceInMeters = route.distance;
            const durationInSeconds = route.duration;
            
            // Format distance
            let distanceText;
            if (distanceInMeters < 1000) {
              distanceText = `${Math.round(distanceInMeters)} m`;
            } else {
              distanceText = `${(distanceInMeters / 1000).toFixed(1)} km`;
            }
            
            // Format time
            const hours = Math.floor(durationInSeconds / 3600);
            const minutes = Math.floor((durationInSeconds % 3600) / 60);
            
            let timeText;
            if (hours === 0 && minutes === 0) {
              timeText = "Less than 1 min";
            } else if (hours === 0) {
              timeText = `${minutes} min`;
            } else {
              timeText = `${hours} hr ${minutes} min`;
            }
            
            setRouteInfo({
              distance: distanceText,
              time: timeText
            });
            
            // Fit the map to show the route
            map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
            return;
          }
        }
        
        // Fallback to straight line if API fails
        console.warn("Falling back to straight line route");
        const routeLine = L.polyline(points, {
          color: '#1976D2',
          weight: 6,
          opacity: 0.7,
          dashArray: '10, 10', // Dashed line to indicate straight-line estimate
        }).addTo(map);
        
        routeLineRef.current = routeLine;
        
        // Calculate straight-line distance and time
        const distance = map.distance(
          [userLocation.lat, userLocation.lng],
          [farmLocation.lat, farmLocation.lng]
        );
        
        // Format distance
        let distanceText;
        if (distance < 1000) {
          distanceText = `${Math.round(distance)} m`;
        } else {
          distanceText = `${(distance / 1000).toFixed(1)} km`;
        }
        
        // Estimate time (assuming average speed of 50 km/h)
        const timeInHours = distance / 1000 / 40; // Slower speed estimate for rural areas
        const hours = Math.floor(timeInHours);
        const minutes = Math.floor((timeInHours - hours) * 60);
        
        let timeText;
        if (hours === 0 && minutes === 0) {
          timeText = "Less than 1 min";
        } else if (hours === 0) {
          timeText = `${minutes} min`;
        } else {
          timeText = `${hours} hr ${minutes} min`;
        }
        
        setRouteInfo({
          distance: distanceText,
          time: timeText,
          isEstimate: true
        });
        
        // Fit the map to show both markers
        map.fitBounds(points, { padding: [50, 50] });
        
      } catch (error) {
        console.error("Error fetching route:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoute();
    
    return () => {
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
      }
    };
  }, [map, userLocation, farmLocation, setRouteInfo]);
  
  return isLoading ? (
    <div style={{ 
      position: 'absolute', 
      bottom: '60px', 
      left: '50%', 
      transform: 'translateX(-50%)',
      zIndex: 1000,
      backgroundColor: 'rgba(255,255,255,0.8)',
      padding: '5px 10px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <CircularProgress size={20} style={{ marginRight: '8px' }} />
      <Typography variant="caption" component="span">
        Calculating route...
      </Typography>
    </div>
  ) : null;
};

// Main Farm Map Component with MapTiler
const MapTilerFarmMap = ({ farm, onClose }) => {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMapStyle, setActiveMapStyle] = useState(0); // Default to first style (Streets)
  
  // Fix Leaflet default icon issue when component mounts
  useEffect(() => {
    fixLeafletDefaultIcon();
  }, []);

  const farmCoordinates = farm
    ? {
        lat: parseFloat(farm.lat || 0),
        lng: parseFloat(farm.lng || 0),
      }
    : { lat: 0, lng: 0 };

  // Function to get directions
  const getDirections = () => {
    setLoading(true);
    setRouteInfo(null);
    
    // If we already have a location, use it immediately
    if (userLocation.lat) {
      setLoading(false);
      return;
    }
    
    // Otherwise, try to get a new position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting position:", error);
          // Fallback to a default position if needed (Ifakara area)
          setUserLocation({ lat: -6.169, lng: 39.189 });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else {
      // If geolocation is not available
      setUserLocation({ lat: -6.169, lng: 39.189 }); // Default to Ifakara area
      setLoading(false);
    }
  };

  // Function to cycle through map styles
  const cycleMapStyle = () => {
    setActiveMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  return (
    <Card
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: 4,
        position: "sticky",
        top: 20,
        flex: { xs: "1 1 100%", md: "1 1 40%" },
        maxWidth: { xs: "100%", md: "40%" },
        minWidth: { xs: "100%", md: "380px" },
        maxHeight: { md: "600px" },
      }}
    >
      {/* Route Information Panel */}
      {routeInfo && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "primary.light",
            backgroundImage: "linear-gradient(135deg, #E3F2FD, #E8F5E9)",
            borderBottom: "1px solid",
            borderColor: "primary.light",
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
            {/* Distance */}
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                <RouteIcon style={{ color: "#4CAF50" }} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                DISTANCE
              </Typography>
              <Typography variant="h6" style={{ color: "#2E7D32" }} fontWeight="bold">
                {routeInfo.distance}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Time */}
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                <AccessTimeIcon style={{ color: "#1976D2" }} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                EST. TIME
              </Typography>
              <Typography variant="h6" style={{ color: "#0D47A1" }} fontWeight="bold">
                {routeInfo.time}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" align="center" display="block" mt={1} color="text.secondary">
            {routeInfo.isEstimate 
              ? "*Estimated based on straight-line distance (network route unavailable)"
              : "*Drive time estimates may vary based on traffic conditions"}
          </Typography>
        </Paper>
      )}

      {/* Map Container */}
      <Box position="relative" sx={{ height: "450px", width: "100%" }}>
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress />
            <Typography ml={2}>Finding your location...</Typography>
          </Box>
        ) : (
          <MapContainer
            center={[farmCoordinates.lat, farmCoordinates.lng]}
            zoom={13}
            style={{ height: "450px", width: "100%" }}
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              attribution={MAP_STYLES[activeMapStyle].attribution}
              url={MAP_STYLES[activeMapStyle].url}
            />

            {/* Farm Location Marker */}
            <Marker
              position={[farmCoordinates.lat, farmCoordinates.lng]}
              icon={createCustomIcon("#4CAF50")} // Green for farm
            >
              <Popup>
                <Typography variant="subtitle2">
                  {farm?.name || "Farm Location"}
                </Typography>
                <Typography variant="body2">
                  {farm?.location || "Destination"}
                </Typography>
              </Popup>
            </Marker>

            {/* User Location Marker */}
            <UserPositionMarker
              userLocation={userLocation}
              setUserLocation={setUserLocation}
            />

            {/* Simple Route Line */}
            {userLocation.lat && (
              <RouteLine
                userLocation={userLocation}
                farmLocation={farmCoordinates}
                setRouteInfo={setRouteInfo}
              />
            )}
          </MapContainer>
        )}

        {/* Farm Location Display */}
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            p: 1.5,
            bgcolor: "background.paper",
            borderRadius: 2,
            zIndex: 1000,
            maxWidth: "60%",
            borderLeft: "4px solid",
            borderColor: "#4CAF50",
          }}
        >
          <Box display="flex" alignItems="center">
            <LocationOnIcon style={{ color: "#4CAF50", marginRight: "8px" }} />
            <Typography fontSize="14px">
              <strong style={{ fontSize: "16px" }}>{farm?.name || "Farm"}</strong>
              <br />
              {farm?.location || "Unknown location"}
            </Typography>
          </Box>
        </Paper>

        {userLocation.lat && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "20px",
              left: "20px",
              p: 1.5,
              bgcolor: "background.paper",
              borderRadius: 2,
              zIndex: 1000,
              maxWidth: "60%",
              borderLeft: "4px solid",
              borderColor: "#2196F3",
            }}
          >
            <Box display="flex" alignItems="center">
              <MyLocationIcon style={{ color: "#2196F3", marginRight: "8px" }} />
              <Typography fontSize="14px">
                <strong style={{ fontSize: "16px" }}>Your Location</strong>
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Map Style Selector */}
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            p: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            zIndex: 1000,
            cursor: "pointer",
          }}
          onClick={cycleMapStyle}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <TerrainIcon color="primary" />
            <Typography fontSize="12px" fontWeight="medium">
              {MAP_STYLES[activeMapStyle].name}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ p: 2, bgcolor: "grey.50", display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          style={{ backgroundColor: "#1976D2" }}
          startIcon={<DirectionsIcon />}
          onClick={getDirections}
          disabled={loading}
          fullWidth
        >
          {loading ? "Detecting..." : "GET DIRECTIONS"}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<CloseIcon />}
          onClick={onClose}
          fullWidth
        >
          CLOSE MAP
        </Button>
      </Box>
    </Card>
  );
};

export { MapTilerFarmMap, createCustomIcon };