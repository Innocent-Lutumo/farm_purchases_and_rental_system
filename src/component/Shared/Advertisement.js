import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  CardMedia,
  Fade,
  Button,
} from "@mui/material";
import img5 from "../../images/img5.jpg";
import img6 from "../../images/img6.jpg";
import img7 from "../../images/img7.jpg";
import img8 from "../../images/img8.jpg";
import img9 from "../../images/img9.jpg";
import { Link } from "react-router-dom";

// Static advertisement data (can be replaced with props if needed)
const defaultAds = [
  {
    image: img7,
    title: "Green Acres",
    description: "Lush farmlands for eco-friendly farming.",
  },
  {
    image: img9,
    title: "Golden Harvest",
    description: "Experience farming like never before!",
  },
  {
    image: img8,
    title: "Valley Farms",
    description: "Ideal for organic and sustainable produce.",
  },
  {
    image: img5,
    title: "Sunset Meadows",
    description: "Beautiful farmlands with amazing sunsets.",
  },
  {
    image: img6,
    title: "Riverside Pastures",
    description: "Farms along the river for serene agriculture.",
  },
];

const AdvertisementSection = () => {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % defaultAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container sx={{ my: 5, px: { xs: 2, sm: 4 } }}>
      <Grid
        container
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left Side — Auto-Scrolling Ads */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: "relative",
              height: "295px",
              overflow: "hidden",
              borderRadius: 4,
              boxShadow: 6,
              animation: "fadeInUp 1s ease-in-out",
              "@keyframes fadeInUp": {
                "0%": { opacity: 0, transform: "translateY(50px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {defaultAds.map((ad, index) => (
              <Fade
                in={index === currentAd}
                timeout={800}
                key={index}
                unmountOnExit
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.9,
                    transition: "transform 0.3s ease, opacity 0.3s ease",
                    "&:hover": {
                      opacity: 1,
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "350px",
                      boxShadow: 4,
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "#f1f8e9",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={ad.image}
                      alt={ad.title}
                      sx={{
                        width: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                    />
                    <Box sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        color="green"
                        fontWeight="bold"
                        sx={{
                          mb: 1,
                          fontSize: "1.2rem",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            color: "#388e3c",
                          },
                        }}
                      >
                        {ad.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        {ad.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            ))}
          </Box>
        </Grid>

        {/* Middle Side — Call to Action */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #e0ffe0, #b2fab4)",
              borderRadius: 4,
              boxShadow: 6,
              textAlign: "center",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.05)" },
                "100%": { transform: "scale(1)" },
              },
              "&:hover": {
                transform: "scale(1.05)",
                transition: "transform 0.3s ease",
                boxShadow: 10,
              },
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color="green"
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem" },
                mb: 1,
                animation: "fadeIn 1s ease-out",
              }}
            >
              See the Farm for Yourself!
            </Typography>
            <Typography
              sx={{
                fontStyle: "italic",
                color: "text.secondary",
                mb: 2,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
              }}
            >
              Experience peace, nature, and potential—book a visit today.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/visit"
              sx={{
                bgcolor: "green",
                fontWeight: "bold",
                borderRadius: 20,
                px: 4,
                py: 1.5,
                transition: "background-color 0.3s ease",
                "&:hover": {
                  bgcolor: "#2e7d32",
                  transform: "scale(1.05)",
                },
              }}
            >
              Visit Now
            </Button>
          </Box>
        </Grid>

        {/* Right Side — System Information */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #d7f5e3, #c1f1d1)",
              borderRadius: 4,
              boxShadow: 6,
              textAlign: "center",
              animation: "fadeInLeft 1s ease-out",
              "@keyframes fadeInLeft": {
                "0%": { opacity: 0, transform: "translateX(-100px)" },
                "100%": { opacity: 1, transform: "translateX(0)" },
              },
              "&:hover": {
                transform: "scale(1.05)",
                transition: "transform 0.3s ease",
                boxShadow: 10,
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="green"
              gutterBottom
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                mb: 1,
              }}
            >
              How Our System Works
            </Typography>
            <Typography
              sx={{
                fontSize: "0.9rem",
                color: "text.secondary",
                mb: 2,
                fontStyle: "italic",
              }}
            >
              Our system utilizes eco-friendly farming techniques to ensure
              sustainable growth. We combine traditional farming with modern
              technology to maximize yields while protecting the environment.
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              to="/about"
              sx={{
                borderColor: "green",
                color: "green",
                fontWeight: "bold",
                borderRadius: 20,
                px: 4,
                py: 1.5,
                transition: "transform 0.3s ease",
                "&:hover": {
                  bgcolor: "#2e7d32",
                  color: "white",
                  transform: "scale(1.05)",
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdvertisementSection;
