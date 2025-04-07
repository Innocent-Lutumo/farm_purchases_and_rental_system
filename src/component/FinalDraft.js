import React from "react";
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
  Tooltip,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import img7 from "../images/img7.jpg";
import img8 from "../images/img8.jpg";
import img9 from "../images/img9.jpg";
import img10 from "../images/img10.jpg";

const farms = [
  {
    id: 1,
    name: "Green Acres",
    price: "$10,000",
    size: "5 acres",
    location: "Nairobi, Kenya",
    quality: "High",
    description: "Lush farmlands for eco-friendly farming.",
    image: img9,
    clickCount: 25,
  },
  {
    id: 2,
    name: "Golden Harvest",
    price: "$15,000",
    size: "10 acres",
    location: "Kampala, Uganda",
    quality: "Medium",
    description: "Experience farming like never before!",
    image: img7,
    clickCount: 40,
  },
  {
    id: 3,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
  {
    id: 4,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
  {
    id: 5,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
  {
    id: 6,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img10,
    clickCount: 18,
  },
  {
    id: 7,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
  {
    id: 8,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img10,
    clickCount: 18,
  },
  {
    id: 9,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
  {
    id: 10,
    name: "Valley Farms",
    price: "$8,000",
    size: "3 acres",
    location: "DSM, Tanzania",
    quality: "Low",
    description: "Ideal for organic and sustainable produce.",
    image: img8,
    clickCount: 18,
  },
];

const FinalDraft = () => {
  const { id } = useParams();
  const farm = farms.find((farm) => farm.id === Number(id));

  if (!farm) {
    return (
      <Typography variant="h5" textAlign="center">
        Farm not found.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Farm Finder
          </Typography>
          <Button color="inherit" component={Link} to="/trial">
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ my: 4, flex: 1 }}>
        <Typography
          variant="h5"
          color="green"
          textAlign="center"
          fontWeight={600}
          gutterBottom
        >
          {farm.name}
        </Typography>
        <Box display="flex" justifyContent="center">
          <Card
            key={farm.id}
            sx={{
              maxWidth: "1500px",
              minWidth: "800px",
              boxShadow: 5,
              borderRadius: 3,
              textDecoration: "none",
              overflow: "hidden",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <Box sx={{ display: "flex" }}>
              <CardMedia
                component="img"
                image={farm.image}
                alt={farm.name}
                sx={{
                  width: "40%",
                  height: "335px",
                  objectFit: "cover",
                  borderRadius: 2,
                  marginTop: 2,
                  marginBottom: 3,
                  marginLeft: 2,
                }}
              />
              <CardContent sx={{ width: "60%", padding: 2, fontSize: "14px" }}>
                <Typography variant="h6" fontWeight="bold">
                  {farm.name}
                </Typography>
                <Typography>
                  <strong>Price:</strong> {farm.price}
                </Typography>
                <Typography>
                  <strong>Size:</strong> {farm.size}
                </Typography>
                <Typography>
                  <strong>Quality:</strong> {farm.quality}
                </Typography>
                <Typography fontSize="12px">
                  <strong style={{ fontSize: "18px" }}>Location:</strong>{" "}
                  {farm.location}
                  <Link
                    to="/location"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Tooltip title="Click to view location">
                      <LocationOnIcon
                        sx={{
                          transition: "color 0.3s",
                          "&:hover": {
                            color: "green",
                          },
                        }}
                      />
                    </Tooltip>
                  </Link>
                </Typography>
                <Box sx={{ marginTop: 2 }}>
                  <Typography
                    sx={{
                      color: "green",
                      textDecoration: "underline",
                    }}
                  >
                    <strong>SELLER'S CONTACTS</strong>
                  </Typography>

                  <Typography
                    sx={{ marginBottom: 2, marginTop: 2, marginLeft: 1 }}
                  >
                    <strong>Email:</strong>
                  </Typography>

                  <Typography
                    sx={{ marginBottom: 3, marginTop: 2, marginLeft: 1 }}
                  >
                    <strong>Phone Number:</strong>
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  component={Link}
                  to="/trial"
                  sx={{ marginTop: 2, fontSize: 14 }}
                >
                  click to purchase
                </Button>
              </CardContent>
            </Box>
            <Typography
              sx={{
                padding: 2,
                backgroundColor: "#d8f9d8",
                borderRadius: 2,
                marginTop: "5px",
              }}
            >
              {farm.description}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: "bold",
                color: "#333",
                textAlign: "left",
                marginLeft: 2,
                mt: 1,
              }}
            >
              {farm.clickCount} Orders
            </Typography>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default FinalDraft;
