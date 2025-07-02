import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  AppBar,
  Toolbar,
  Chip,
  Divider,
} from "@mui/material";

// IMPORTANT: Replace with your actual API key from environment variables
const Maps_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

const SimpleFarmDirections = ({
  farm, // Now expects the full farm object from Trial component
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [apiLoadAttempted, setApiLoadAttempted] = useState(false);
  const [farmCoordinates, setFarmCoordinates] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const geocoderRef = useRef(null);

  // Function to geocode farm location
  const geocodeFarmLocation = useCallback(async (locationName) => {
    if (!window.google || !window.google.maps.Geocoder) {
      throw new Error("Google Maps Geocoder not available");
    }

    return new Promise((resolve, reject) => {
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      geocoderRef.current.geocode(
        { 
          address: locationName,
          region: 'TZ', 
          componentRestrictions: { country: 'TZ' }
        },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
              formatted_address: results[0].formatted_address
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }, []);

  // Check if all required APIs are loaded
  const checkAPIsReady = useCallback(() => {
    return (
      window.google &&
      window.google.maps &&
      window.google.maps.Map &&
      window.google.maps.DirectionsService &&
      window.google.maps.DirectionsRenderer &&
      window.google.maps.DirectionsStatus &&
      window.google.maps.Geocoder
    );
  }, []);

  // Load Google Maps API script
  const loadGoogleMapsScript = useCallback(() => {
    if (!Maps_API_KEY) {
      setError("Google Maps API key is missing. Please configure it properly.");
      setLoading(false);
      return;
    }

    // If APIs are already loaded and ready
    if (checkAPIsReady()) {
      setMapReady(true);
      return;
    }

    // Prevent duplicate loading attempts
    if (apiLoadAttempted) return;
    setApiLoadAttempted(true);

    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );
    if (existingScript) {
      const checkLoadedInterval = setInterval(() => {
        if (checkAPIsReady()) {
          setMapReady(true);
          clearInterval(checkLoadedInterval);
        }
      }, 200);
      
      setTimeout(() => {
        clearInterval(checkLoadedInterval);
        if (!mapReady) {
          setError("Google Maps API failed to load within timeout.");
          setLoading(false);
        }
      }, 20000);
      return;
    }

    const script = document.createElement("script");
    const callbackName = `initMapCallback_${Date.now()}`;

    window[callbackName] = () => {
      setTimeout(() => {
        if (checkAPIsReady()) {
          setMapReady(true);
        } else {
          setError("Google Maps API loaded but required services are missing.");
          setLoading(false);
        }
        try {
          delete window[callbackName];
        } catch (e) {
          console.warn("Could not delete global callback:", e);
        }
      }, 100);
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.id = "google-maps-script";

    script.onerror = () => {
      setError("Failed to load Google Maps API. Check your API key and network.");
      setLoading(false);
      try {
        delete window[callbackName];
      } catch (e) {
        console.warn("Could not delete global callback on error:", e);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode && !mapReady) {
        try {
          document.head.removeChild(script);
        } catch (e) {
          console.warn("Script cleanup error:", e);
        }
      }
      if (window[callbackName]) {
        try {
          delete window[callbackName];
        } catch (e) {
          console.warn("Callback cleanup error:", e);
        }
      }
    };
  }, [mapReady, apiLoadAttempted, checkAPIsReady]);

  // Geocode farm location when map is ready
  useEffect(() => {
    if (!mapReady || !farm?.location) {
      if (!farm?.location) {
        setError("No farm location provided");
        setLoading(false);
      }
      return;
    }

    const getFarmCoordinates = async () => {
      try {
        setLoading(true);
        const coordinates = await geocodeFarmLocation(farm.location);
        setFarmCoordinates(coordinates);
      } catch (error) {
        console.error("Geocoding error:", error);
        setError(`Could not find location: ${farm.location}. Please check the farm address.`);
        setLoading(false);
      }
    };

    getFarmCoordinates();
  }, [mapReady, farm?.location, geocodeFarmLocation]);

  // Initiate API loading
  useEffect(() => {
    if (!mapReady && !error && !apiLoadAttempted) {
      loadGoogleMapsScript();
    }
  }, [loadGoogleMapsScript, mapReady, error, apiLoadAttempted]);

  // Initialize map and get directions when coordinates are ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || !farmCoordinates) return;

    try {
      // Initialize map centered between user and farm (will adjust when user location is found)
      const map = new window.google.maps.Map(mapRef.current, {
        center: farmCoordinates,
        zoom: 10,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });

      mapInstanceRef.current = map;

      // Add farm marker with custom icon
      const farmMarker = new window.google.maps.Marker({
        position: farmCoordinates,
        map: map,
        title: `${farm.name} - ${farm.location}`,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeColor: "#2E7D32",
          strokeWeight: 2,
        },
      });

      // Add info window for farm
      const farmInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #2E7D32;">${farm.name}</h3>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${farm.location}</p>
            <p style="margin: 4px 0;"><strong>Size:</strong> ${farm.size}</p>
            <p style="margin: 4px 0;"><strong>Price:</strong> ${farm.price}/= Tshs</p>
            ${farm.seller ? `<p style="margin: 4px 0;"><strong>Seller:</strong> ${farm.seller}</p>` : ''}
          </div>
        `
      });

      farmMarker.addListener('click', () => {
        farmInfoWindow.open(map, farmMarker);
      });

      // Initialize directions services
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: map,
        polylineOptions: {
          strokeColor: "#1976D2",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
        markerOptions: {
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#2196F3",
            fillOpacity: 1,
            strokeColor: "#1565C0",
            strokeWeight: 2,
          }
        }
      });

      // Get user location and show directions
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Calculate and display directions
            const request = {
              origin: userLocation,
              destination: farmCoordinates,
              travelMode: window.google.maps.TravelMode.DRIVING,
              provideRouteAlternatives: true,
              unitSystem: window.google.maps.UnitSystem.METRIC,
            };

            directionsServiceRef.current.route(request, (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRendererRef.current.setDirections(result);
                
                // Extract route information
                const route = result.routes[0];
                if (route && route.legs && route.legs.length > 0) {
                  const leg = route.legs[0];
                  setRouteInfo({
                    distance: leg.distance.text,
                    duration: leg.duration.text,
                    startAddress: leg.start_address,
                    endAddress: leg.end_address
                  });
                }
              } else {
                console.error("Directions error:", status, result);
                setError(`Unable to calculate route: ${status}. Please check if the location is accessible by road.`);
              }
              setLoading(false);
            });
          },
          (error) => {
            let errorMessage = "Could not get your location.";
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = "Location access denied. Please enable location permissions and refresh.";
            } else if (error.code === error.TIMEOUT) {
              errorMessage = "Location request timed out. Please try again.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMessage = "Location information unavailable.";
            }
            setError(errorMessage);
            setLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 150000,
            maximumAge: 300000, 
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map. Please try again.");
      setLoading(false);
    }

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [mapReady, farmCoordinates, farm]);

  if (!farm) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Alert severity="warning">
          No farm selected for navigation.
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          border: "1px solid #ccc",
          borderRadius: 2,
          maxWidth: 500,
          mx: "auto",
          mt: 2,
        }}
      >
        <Alert severity="error">
          {error}
          {error.includes("Directions service failed") && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                This usually means:
              </Typography>
              <ul style={{ textAlign: "left", paddingLeft: 20, margin: 8 }}>
                <li>Directions API is not enabled for your API key</li>
                <li>Your API key has restrictions</li>
                <li>Billing is not enabled for your Google Cloud project</li>
              </ul>
            </Box>
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        border: "1px solid #ccc",
        borderRadius: 2,
        overflow: "hidden",
        mt: 2,
        boxShadow: 3,
      }}
    >
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(135deg, #1976D2, #4CAF50)" }}
      >
        <Toolbar variant="dense">
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ color: "white", fontSize: "1.1rem" }}
            >
              Navigation to {farm.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
              {farm.location}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Route Information */}
      {routeInfo && (
        <Box sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Chip 
              label={`Distance: ${routeInfo.distance}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Duration: ${routeInfo.duration}`} 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          </Box>
        </Box>
      )}

      <Divider />

      <Box sx={{ position: "relative", height: 400 }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
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
              backgroundColor: "rgba(255,255,255,0.9)",
              fontSize: 14,
              color: "#666",
              flexDirection: "column",
              gap: 1,
              zIndex: 1,
            }}
          >
            <CircularProgress size={30} />
            <Typography variant="body2">
              {!mapReady
                ? "Loading map services..."
                : !farmCoordinates
                ? `Finding location: ${farm.location}...`
                : "Getting your location and calculating route..."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SimpleFarmDirections;