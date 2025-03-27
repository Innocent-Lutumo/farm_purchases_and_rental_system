import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";
import axios from "axios";

const DetailedFarm = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get("/api/farms/"); // Fetch farms from the database
        setFarms(response.data);
      } catch (error) {
        console.error("Error fetching farm data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Farm to purchases
          </Typography>
          <Button color="inherit" component={Link} to="/HomePage">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Featured Farmlands */}
      <Container sx={{ my: 4 }}>
        <Typography variant="h5" color="green" textAlign="center" gutterBottom>
          Featured Farmlands
        </Typography>
        <Typography textAlign="center" sx={{ mb: 2 }}>
          Explore some of the best farmlands available for sale or rent.
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress color="success" />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 3,
            }}
          >
            {farms.map((farm, index) => (
              <Card
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.02)" },
                }}
                component={Link}
                to={`/purchase/${farm.id}`} // Link to another page
              >
                {/* "Click to Purchase" Label */}
                <Typography
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "rgba(0, 128, 0, 0.8)",
                    color: "#fff",
                    padding: "5px 10px",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                  }}
                >
                  Click to Purchase
                </Typography>

                {/* Farm Image */}
                <CardMedia
                  component="img"
                  image={farm.image || "/fallback.jpg"} // Fallback image if not available
                  alt={farm.name}
                  sx={{
                    width: "40%",
                    float: "left",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Farm Details */}
                <CardContent
                  sx={{
                    width: "60%",
                    float: "right",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {farm.name}
                  </Typography>
                  <Typography>Price: {farm.price}</Typography>
                  <Typography>Size: {farm.size}</Typography>
                  <Typography>
                    Location: {farm.location}{" "}
                    <IconButton
                      href={`https://www.google.com/maps/search/?api=1&query=${farm.location}`}
                      target="_blank"
                      sx={{ padding: 0, marginLeft: 1 }}
                    >
                      <MapIcon color="primary" />
                    </IconButton>
                  </Typography>
                  <Typography>Quality: {farm.quality}</Typography>
                </CardContent>

                {/* Farm Description */}
                <Box
                  sx={{
                    clear: "both",
                    padding: 2,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography>{farm.description}</Typography>
                </Box>

                {/* Click Count */}
                <Typography
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    padding: "5px 10px",
                    fontSize: "0.8rem",
                  }}
                >
                  Clicks: {farm.clickCount || 0}
                </Typography>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DetailedFarm;