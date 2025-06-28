import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
  } from "react";
  import {
    Box,
    CircularProgress,
    Typography,
    Alert,
    AppBar,
    Toolbar,
  } from "@mui/material";
  
  // IMPORTANT: Replace with your actual API key from environment variables
  const Maps_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  
  const SimpleFarmDirections = ({
    farm = { name: "Demo Farm", lat: -6.169, lng: 39.189 }, // Default to Dar es Salaam farm
  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [apiLoadAttempted, setApiLoadAttempted] = useState(false);
  
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
  
    // Memoize farm coordinates
    const farmCoordinates = useMemo(
      () => ({
        lat: parseFloat(farm.lat) || -6.169,
        lng: parseFloat(farm.lng) || 39.189,
      }),
      [farm.lat, farm.lng]
    );
  
    // Check if all required APIs are loaded
    const checkAPIsReady = useCallback(() => {
      return (
        window.google &&
        window.google.maps &&
        window.google.maps.Map &&
        window.google.maps.DirectionsService &&
        window.google.maps.DirectionsRenderer &&
        window.google.maps.DirectionsStatus
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
            setLoading(false);
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
  
    // Initiate API loading
    useEffect(() => {
      if (!mapReady && !error && !apiLoadAttempted) {
        loadGoogleMapsScript();
      }
    }, [loadGoogleMapsScript, mapReady, error, apiLoadAttempted]);
  
    // Initialize map and get directions when ready
    useEffect(() => {
      if (!mapReady || !mapRef.current) return;
  
      try {
        // Initialize map
        const map = new window.google.maps.Map(mapRef.current, {
          center: farmCoordinates,
          zoom: 13,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        });
  
        mapInstanceRef.current = map;
  
        // Add farm marker
        new window.google.maps.Marker({
          position: farmCoordinates,
          map: map,
          title: farm.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#4CAF50",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          },
        });
  
        // Initialize directions services
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: map,
          polylineOptions: {
            strokeColor: "#1976D2",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });
  
        // Get user location and show directions
        if (navigator.geolocation) {
          setLoading(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
  
              new window.google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#2196F3",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                },
              });
  
              const request = {
                origin: userLocation,
                destination: farmCoordinates,
                travelMode: window.google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
              };
  
              directionsServiceRef.current.route(request, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  directionsRendererRef.current.setDirections(result);
                } else {
                  console.error("Directions error:", status, result);
                  setError(`Directions service failed: ${status}. Please check your API key has Directions API enabled.`);
                }
                setLoading(false);
              });
            },
            (error) => {
              let errorMessage = "Could not get your location.";
              if (error.code === error.PERMISSION_DENIED) {
                errorMessage = "Location access denied. Please enable permissions.";
              } else if (error.code === error.TIMEOUT) {
                errorMessage = "Location request timed out. Please try again.";
              }
              setError(errorMessage);
              setLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 60000,
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
    }, [mapReady, farmCoordinates, farm.name]);
  
    if (error) {
      return (
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: 2,
            maxWidth: 400,
            mx: "auto",
            mt: 4,
          }}
        >
          <Alert severity="error">
            {error}
            {error.includes("Directions service failed") && (
              <div style={{ marginTop: 8 }}>
                <Typography variant="body2">
                  This usually means:
                </Typography>
                <ul style={{ textAlign: "left", paddingLeft: 20 }}>
                  <li>Directions API is not enabled for your API key</li>
                  <li>Your API key has restrictions</li>
                  <li>Billing is not enabled for your Google Cloud project</li>
                </ul>
              </div>
            )}
          </Alert>
        </Box>
      );
    }
  
    return (
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          border: "1px solid #ccc",
          borderRadius: 2,
          overflow: "hidden",
          mt: 4,
          boxShadow: 3,
        }}
      >
        <AppBar
          position="static"
          sx={{ background: "linear-gradient(135deg, #1976D2, #4CAF50)" }}
        >
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, textAlign: "center", color: "white" }}
            >
              Navigation to {farm.name}
            </Typography>
          </Toolbar>
        </AppBar>
  
        <Box sx={{ position: "relative", height: 350 }}>
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
                {mapReady
                  ? "Getting your location and directions..."
                  : "Loading map services..."}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };
  
  export default SimpleFarmDirections;