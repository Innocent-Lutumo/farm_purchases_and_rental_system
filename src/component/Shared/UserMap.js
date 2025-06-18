import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  NearMe as NearMeIcon,
  DirectionsCar as DirectionsCarIcon,
  Schedule as ScheduleIcon,
  StraightenOutlined as DistanceIcon,
  GpsFixed as GpsFixedIcon,
  Warning as WarningIcon
} from "@mui/icons-material";

const GoogleMapsFarmDirections = ({ 
  farm = { name: "Demo Farm", lat: -6.169, lng: 39.189, location: "Dar es Salaam" },
  isModal = false 
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const userMarkerRef = useRef(null);
  const scriptRef = useRef(null);

  const farmCoordinates = React.useMemo(() => ({
    lat: parseFloat(farm.lat) || -6.169,
    lng: parseFloat(farm.lng) || 39.189
  }), [farm.lat, farm.lng]);

  // Check if Google Maps is already loaded
  const isGoogleMapsLoaded = () => {
    return window.google && 
           window.google.maps && 
           window.google.maps.Map &&
           window.google.maps.geometry &&
           window.google.maps.geometry.spherical;
  };

  // Load Google Maps API with better error handling
  useEffect(() => {
    if (isGoogleMapsLoaded()) {
      setMapLoaded(true);
      setScriptLoaded(true);
      return;
    }

    // Prevent multiple script loading
    if (scriptRef.current || document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const script = document.createElement('script');
    scriptRef.current = script;
    
    // Use callback method for more reliable loading
    window.initGoogleMaps = () => {
      if (isGoogleMapsLoaded()) {
        setMapLoaded(true);
        setScriptLoaded(true);
        delete window.initGoogleMaps; // Clean up
      } else {
        setError("Google Maps API failed to initialize properly");
      }
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCMQnDNSQieALKBMCT6w59osi8dGwBLh-Q&libraries=geometry,places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    script.onerror = (e) => {
      console.error('Google Maps script failed to load:', e);
      setError("Failed to load Google Maps. Please check your internet connection and API key.");
      setScriptLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  // Initialize map with better error handling
  useEffect(() => {
    if (!mapLoaded || !scriptLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions = {
        center: farmCoordinates,
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: !isModal, // Disable fullscreen in modal
        zoomControl: true,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add farm marker with custom icon
      const farmMarker = new window.google.maps.Marker({
        position: farmCoordinates,
        map: map,
        title: farm.name || "Farm Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3
        }
      });

      // Add info window for farm
      const farmInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #4CAF50;">${farm.name}</h3>
            <p style="margin: 0; color: #666;">${farm.location || 'Farm Location'}</p>
          </div>
        `
      });

      farmMarker.addListener('click', () => {
        farmInfoWindow.open(map, farmMarker);
      });

      // Initialize directions service and renderer
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#1976D2",
          strokeWeight: 6,
          strokeOpacity: 0.8
        },
        markerOptions: {
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#1976D2",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2
          }
        }
      });
      directionsRendererRef.current.setMap(map);

      mapInstanceRef.current = map;

      // Ensure map renders properly
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
        map.setCenter(farmCoordinates);
      }, 100);

    } catch (error) {
      console.error('Error initializing map:', error);
      setError("Failed to initialize map. Please try refreshing the page.");
    }
  }, [mapLoaded, scriptLoaded, farmCoordinates, farm.name, farm.location, isModal]);

  // Get user location with enhanced error handling
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    if (!isGoogleMapsLoaded()) {
      setError("Google Maps is not loaded yet. Please wait and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setUserLocation(null);
    setRouteInfo(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased timeout
      maximumAge: 60000 // Allow cached location up to 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        console.log('Location detected:', location);
        setUserLocation(location);
        
        if (location.accuracy > 1000) {
          setError(`Location accuracy is poor (±${Math.round(location.accuracy/1000)}km). Results may be approximate.`);
        }

        calculateRoute(location, farmCoordinates);
      },
      (error) => {
        setLoading(false);
        let errorMessage = "Could not get your location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please check your GPS/location services.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred while getting your location.";
        }
        
        setError(errorMessage);
        console.error('Geolocation error:', error);
      },
      options
    );
  };

  // Calculate route with improved error handling
  const calculateRoute = (userLoc, farmLoc) => {
    if (!directionsServiceRef.current || !mapInstanceRef.current) {
      setError("Map services are not ready. Please try again.");
      setLoading(false);
      return;
    }

    const request = {
      origin: new window.google.maps.LatLng(userLoc.lat, userLoc.lng),
      destination: new window.google.maps.LatLng(farmLoc.lat, farmLoc.lng),
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        try {
          directionsRendererRef.current.setDirections(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            distanceValue: leg.distance.value,
            durationValue: leg.duration.value,
            startAddress: leg.start_address,
            endAddress: leg.end_address
          });

          // Add custom user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }

          userMarkerRef.current = new window.google.maps.Marker({
            position: { lat: userLoc.lat, lng: userLoc.lng },
            map: mapInstanceRef.current,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#2196F3",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 3
            }
          });

          setLoading(false);
        } catch (error) {
          console.error('Error processing directions result:', error);
          calculateStraightLineDistance(userLoc, farmLoc);
        }
      } else {
        console.error('Directions request failed:', status);
        calculateStraightLineDistance(userLoc, farmLoc);
      }
    });
  };

  // Fallback straight-line distance calculation
  const calculateStraightLineDistance = (userLoc, farmLoc) => {
    try {
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(userLoc.lat, userLoc.lng),
        new window.google.maps.LatLng(farmLoc.lat, farmLoc.lng)
      );

      const distanceKm = (distance / 1000).toFixed(1);
      const estimatedTime = Math.round(distance / 1000 / 40 * 60); 

      setRouteInfo({
        distance: `${distanceKm} km`,
        duration: `${estimatedTime} min`,
        distanceValue: distance,
        durationValue: estimatedTime * 60,
        isEstimate: true
      });

      setError("Could not calculate driving route. Showing straight-line distance.");
    } catch (error) {
      console.error('Error calculating straight-line distance:', error);
      setError("Unable to calculate distance. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <Paper
      elevation={isModal ? 0 : 4}
      sx={{
        maxWidth: isModal ? '100%' : 400,
        margin: isModal ? 0 : '20px auto',
        borderRadius: isModal ? 0 : 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        height: isModal ? '100%' : 'auto'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #1976D2, #4CAF50)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant={isModal ? "h5" : "h6"} component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
          <DirectionsCarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Get Directions
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          {farm.name} - {farm.location}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity={error.includes('poor') || error.includes('approximate') ? 'warning' : 'error'}
          sx={{ m: 2, mb: 1 }}
        >
          <AlertTitle>
            {error.includes('poor') || error.includes('approximate') ? 'Location Notice' : 'Error'}
          </AlertTitle>
          {error}
        </Alert>
      )}

      {/* User Location Display */}
      {userLocation && (
        <Card variant="outlined" sx={{ m: 2, mb: 1 }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <GpsFixedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  Location Detected
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accuracy: ±{userLocation.accuracy > 1000 
                    ? `${(userLocation.accuracy/1000).toFixed(1)}km` 
                    : `${Math.round(userLocation.accuracy)}m`}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                size="small"
                label={userLocation.accuracy <= 100 ? "High" : userLocation.accuracy <= 1000 ? "Medium" : "Low"}
                color={userLocation.accuracy <= 100 ? "success" : userLocation.accuracy <= 1000 ? "warning" : "error"}
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Route Information */}
      {routeInfo && (
        <Card variant="outlined" sx={{ m: 2, mb: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
              <Box textAlign="center">
                <DistanceIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                  DISTANCE
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {routeInfo.distance}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box textAlign="center">
                <ScheduleIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                  EST. TIME
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {routeInfo.duration}
                </Typography>
              </Box>
            </Stack>
            
            {routeInfo.isEstimate && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip
                  icon={<WarningIcon />}
                  label="Estimated based on straight-line distance"
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <Box sx={{ 
        position: 'relative', 
        height: isModal ? 'calc(100vh - 400px)' : 300,
        minHeight: 250
      }}>
        <Box ref={mapRef} sx={{ height: '100%', width: '100%' }} />

        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.9)',
              zIndex: 1000
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Getting your location...
              </Typography>
            </Stack>
          </Box>
        )}

        {(!mapLoaded || !scriptLoaded) && !error && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.9)',
              zIndex: 1000
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Loading Google Maps...
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Action Button */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={getUserLocation}
          disabled={loading || !mapLoaded || !scriptLoaded}
          startIcon={loading ? <CircularProgress size={20} /> : <NearMeIcon />}
          sx={{
            py: 1.5,
            fontWeight: 'bold',
            borderRadius: 2,
            background: 'linear-gradient(45deg, #1976D2, #4CAF50)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565C0, #388E3C)',
            }
          }}
        >
          {loading ? 'Getting Location...' : 'GET DIRECTIONS'}
        </Button>
      </Box>
    </Paper>
  );
};

export default GoogleMapsFarmDirections;