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

// IMPORTANT: Replace "YOUR_ACTUAL_Maps_API_KEY" with your real key.
// Ensure this key has the Maps JavaScript API, Geolocation API, and Directions API enabled,
// and that billing is enabled for your Google Cloud Project.
const Maps_API_KEY = "YOUR_ACTUAL_Maps_API_KEY"; // <--- REPLACE THIS PLACEHOLDER!

const SimpleFarmDirections = ({
  farm = { name: "Demo Farm", lat: -6.169, lng: 39.189 }, // Default to Dar es Salaam farm
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false); // State to signify full Google Maps API readiness

  const mapRef = useRef(null); // Ref for the map div element
  const mapInstanceRef = useRef(null); // Ref for the google.maps.Map instance
  const directionsServiceRef = useRef(null); // Ref for DirectionsService instance
  const directionsRendererRef = useRef(null); // Ref for DirectionsRenderer instance

  // Memoize farm coordinates to prevent unnecessary re-calculations
  const farmCoordinates = useMemo(
    () => ({
      lat: parseFloat(farm.lat) || -6.169,
      lng: parseFloat(farm.lng) || 39.189,
    }),
    [farm.lat, farm.lng]
  );

  // Callback to dynamically load Google Maps API script
  const loadGoogleMapsScript = useCallback(() => {
    // If the API is already loaded and ready (globally available), no need to reload
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log("Google Maps API already loaded.");
      setMapReady(true);
      return;
    }

    // Prevent duplicate script loading
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );
    if (existingScript) {
      console.log(
        "Google Maps API script already in DOM. Waiting for it to load."
      );
      // If script exists, but mapReady is false, it means it's still loading.
      // We set a polling mechanism to check for google.maps readiness.
      const checkLoadedInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          setMapReady(true);
          clearInterval(checkLoadedInterval);
          console.log("Google Maps API script found and now ready.");
        }
      }, 200); // Check every 200ms
      // Add a timeout to clear interval in case of load failure
      setTimeout(() => {
        clearInterval(checkLoadedInterval);
        if (!mapReady) {
          setError(
            "Google Maps API script failed to load or initialize within timeout."
          );
          setLoading(false);
        }
      }, 100000); // 20 seconds timeout for script loading
      return;
    }

    // Create and append the script element
    const script = document.createElement("script");
    const callbackName = `initMapCallback_${Date.now()}`; // Unique callback name for this load

    // Define the global callback function
    window[callbackName] = () => {
      console.log("Google Maps API callback triggered.");
      // Small delay to ensure all internal Google Maps objects are truly ready
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          setMapReady(true); // Mark map as fully ready
          setLoading(false); // Stop overall loading when map is ready
          console.log("Google Maps API fully initialized and ready.");
        } else {
          console.error(
            "Google Maps objects not available after callback (race condition?)."
          );
          setError(
            "Google Maps failed to initialize properly after script load."
          );
          setLoading(false);
        }
        // Clean up the global callback after it's been used
        try {
          delete window[callbackName];
        } catch (e) {
          console.warn("Could not delete global callback:", e);
        }
      }, 100); // Small delay
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.id = "google-maps-script"; // Add an ID for easier lookup

    script.onerror = () => {
      console.error(
        "Failed to load Google Maps API script. Check network and API key."
      );
      setError(
        "Failed to load Google Maps API. Please check your internet connection."
      );
      setLoading(false);
      // Clean up the global callback on error
      try {
        delete window[callbackName];
      } catch (e) {
        console.warn("Could not delete global callback on error:", e);
      }
    };

    document.head.appendChild(script);

    // Cleanup function for when component unmounts
    return () => {
      // Remove the script and the global callback to prevent memory leaks/conflicts
      // Only remove if it was truly added by this instance and not already loaded/used
      if (script.parentNode && !mapReady) {
        // Only remove if it's still pending and not fully ready
        try {
          document.head.removeChild(script);
          console.log("Google Maps API script removed during cleanup.");
        } catch (e) {
          console.warn("Script cleanup error during unmount:", e);
        }
      }
      if (window[callbackName]) {
        try {
          delete window[callbackName];
          console.log(
            "Google Maps API global callback deleted during cleanup."
          );
        } catch (e) {
          console.warn("Callback cleanup error during unmount:", e);
        }
      }
    };
  }, [mapReady]); // Dependency on mapReady ensures the effect doesn't re-run if mapReady changes from false to true within this hook's context.

  // Effect to initiate loading the Google Maps API script
  useEffect(() => {
    // Only load if the map isn't ready and there's no error preventing it
    if (!mapReady && !error) {
      console.log("Initiating Google Maps API script load...");
      loadGoogleMapsScript();
    }
  }, [loadGoogleMapsScript, mapReady, error]); // Rerun if loadGoogleMapsScript changes (unlikely) or mapReady/error status changes

  // Effect to initialize map and get user location ONLY when mapReady is true
  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      console.log(
        "Map not ready or mapRef not available. Skipping map initialization."
      );
      return;
    }

    // Defensive check to ensure google.maps is fully available after mapReady becomes true
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.error(
        "Google Maps API objects not fully available despite mapReady being true."
      );
      setError("Google Maps initialization failed: core objects missing.");
      setLoading(false);
      return;
    }

    console.log(
      "Map is ready. Initializing map instance and getting location..."
    );
    let map; // Declare map in this scope
    try {
      // Initialize map
      map = new window.google.maps.Map(mapRef.current, {
        center: farmCoordinates,
        zoom: 13,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false, // You might want some default UI controls
      });

      // Store the map instance in a ref
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

      // Initialize directions service and renderer
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          map: map, // Attach renderer to the map
          polylineOptions: {
            strokeColor: "#1976D2",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
          suppressMarkers: false, // Allow default A/B markers if desired
        }
      );

      // Automatically get user location and show directions
      if (navigator.geolocation) {
        setLoading(true); // Re-engage loading state specifically for geolocation/directions
        console.log("Attempting to get user's current location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            console.log("User location obtained:", userLocation);

            // Add user marker
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

            // Calculate and display route
            const request = {
              origin: userLocation,
              destination: farmCoordinates,
              travelMode: window.google.maps.TravelMode.DRIVING,
            };

            console.log("Requesting directions:", request);
            directionsServiceRef.current.route(request, (result, status) => {
              console.log("Directions Service response - Status:", status);
              if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRendererRef.current.setDirections(result);
                setLoading(false); // Done loading after successful directions
              } else {
                console.error(
                  "Directions request failed with status:",
                  status,
                  "Result:",
                  result
                );
                setError(`Failed to get directions. Status: ${status}`);
                setLoading(false); // Done loading on directions failure
              }
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            let errorMessage =
              "Could not get your location. Please enable location services.";
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage =
                "Location access denied. Please allow location access for directions.";
            } else if (error.code === error.TIMEOUT) {
              errorMessage =
                "Getting your location timed out. Please try again.";
            }
            setError(errorMessage);
            setLoading(false); // Done loading on geolocation error
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds timeout for geolocation
            maximumAge: 60000,
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
        setLoading(false); // Done loading if geolocation not supported
      }
    } catch (err) {
      console.error("Map initialization or marker placement error:", err);
      setError("Failed to initialize map display or place markers.");
      setLoading(false);
    }

    // Cleanup: Clear directions and map instance when component unmounts or dependencies change
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null); // Detach renderer from map
        directionsRendererRef.current = null;
      }
      if (mapInstanceRef.current) {
        // No explicit destroy method for map, but setting to null allows garbage collection
        mapInstanceRef.current = null;
      }
      console.log("Map and directions instances cleaned up.");
    };
  }, [mapReady, farmCoordinates, farm.name]); // Re-run if mapReady, farm coordinates, or farm name changes

  // Render logic based on loading and error states
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
        <Alert severity="error">{error}</Alert>
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
        boxShadow: 3, // Added some shadow for better appearance
      }}
    >
      {/* Header */}
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

      {/* Map */}
      <Box sx={{ position: "relative", height: 350 }}>
        {" "}
        {/* Increased height slightly */}
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        {/* Loading overlay */}
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
              zIndex: 1, // Ensure it's above the map
            }}
          >
            <CircularProgress size={30} />
            <Typography variant="body2">
              {mapReady
                ? "Getting your location and directions..."
                : "Loading map API..."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SimpleFarmDirections;
