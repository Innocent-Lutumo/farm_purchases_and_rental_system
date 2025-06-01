import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  CardMedia,
  Fade,
} from "@mui/material";

const defaultAds = [
  {
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
    title: "Green Acres",
    description: "Lush farmlands for eco-friendly farming.",
  },
  {
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop",
    title: "Golden Harvest",
    description: "Experience farming like never before!",
  },
  {
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
    title: "Valley Farms",
    description: "Ideal for organic and sustainable produce.",
  },
  {
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop",
    title: "Sunset Meadows",
    description: "Beautiful farmlands with amazing sunsets.",
  },
  {
    image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&h=600&fit=crop",
    title: "Riverside Pastures",
    description: "Farms along the river for serene agriculture.",
  },
];

const AdvertisementSection = () => {
  const [currentAd, setCurrentAd] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fullText = "Don't Just Look at Pictures";

  // Auto-scrolling ads effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % defaultAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 1000 : 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && currentIndex < fullText.length) {
        // Typing forward
        setDisplayText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (isDeleting && currentIndex > 0) {
        // Deleting backward
        setDisplayText(fullText.substring(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (!isDeleting && currentIndex === fullText.length) {
        // Finished typing, start deleting after pause
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentIndex === 0) {
        // Finished deleting, start typing again after pause
        setTimeout(() => setIsDeleting(false), pauseTime);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, fullText]);

  const cardStyles = {
    height: "300px",
    borderRadius: 4,
    boxShadow: "0 12px 24px rgba(34, 139, 87, 0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(34, 139, 87, 0.4)",
    },
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #e6fffa 50%, #f0fff4 100%)",
        height: "350px", // Fixed height: card height (300px) + 50px
        py: 2, // Reduced padding
      }}
    >
      <Container
        sx={{
          my: { xs: 1, md: 1 }, // Reduced margin
          px: { xs: 2, sm: 4, md: 6 },
          maxHeight: "500px",
          height: "100%",
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          alignItems="stretch"
          justifyContent="center"
          sx={{ height: "100%" }}
        >
          {/* Left Side — Auto-Scrolling Ads */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                ...cardStyles,
                overflow: "hidden",
                animation: "fadeInUp 1s ease-out",
                border: "2px solid rgba(34, 139, 87, 0.2)",
                "@keyframes fadeInUp": {
                  "0%": { opacity: 0, transform: "translateY(40px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
                "&:hover": {
                  "& .ad-card": {
                    transform: "scale(1.02)",
                    boxShadow: "0 16px 32px rgba(34, 139, 87, 0.4)",
                  },
                },
              }}
            >
              {defaultAds.map((ad, index) => (
                <Fade
                  in={index === currentAd}
                  timeout={1000}
                  key={index}
                  unmountOnExit
                >
                  <Box
                    className="ad-card"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition:
                        "transform 0.4s ease-out, box-shadow 0.4s ease-out",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={ad.image}
                      alt={ad.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.85) saturate(1.2) contrast(1.1)",
                        transition: "filter 0.3s ease",
                        "&:hover": {
                          filter: "brightness(1) saturate(1.3) contrast(1.2)",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        p: 2,
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                        color: "white",
                        textAlign: "center",
                        backdropFilter: "blur(8px)",
                        transform: "translateY(0)",
                        transition: "transform 0.3s ease-out, background 0.3s ease",
                        boxShadow: "0 -4px 20px rgba(34, 197, 94, 0.3)",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          background: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          fontSize: { xs: "1.1rem", sm: "1.4rem" },
                          mb: 0.5,
                          textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
                          color: "#ffffff",
                        }}
                      >
                        {ad.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: "italic",
                          opacity: 0.95,
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          color: "#f0fdf4",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        {ad.description}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Grid>

          {/* Right Side - Simple Message Card with Typing Effect */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                ...cardStyles,
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 30%, #15803d 70%, #166534 100%)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  pointerEvents: "none",
                },
                "&:hover": {
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 30%, #166534 70%, #14532d 100%)",
                  transform: "translateY(-8px) scale(1.02)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="white"
                gutterBottom
                sx={{
                  textShadow: "3px 3px 6px rgba(0,0,0,0.4)",
                  mb: 3,
                  minHeight: "3rem",
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {displayText}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: "3px",
                    height: "1.2em",
                    background: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)",
                    marginLeft: "2px",
                    borderRadius: "2px",
                    animation: "blink 1s infinite",
                    boxShadow: "0 0 8px rgba(255,255,255,0.5)",
                    "@keyframes blink": {
                      "0%, 50%": { opacity: 1 },
                      "51%, 100%": { opacity: 0 },
                    },
                  }}
                />
              </Typography>
              <Typography
                variant="h6"
                color="#f0fdf4"
                sx={{
                  mb: 2,
                  fontStyle: "PlayFair",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  lineHeight: 1.6,
                  position: "relative",
                  zIndex: 1,
                  fontWeight: 500,
                }}
              >
                Come see the farm for yourself and experience the real thing.
                <br />
                <Box
                  component="span"
                  sx={{
                    color: "#dcfce7",
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                  }}
                >
                  Nothing compares to seeing it with your own eyes.
                </Box>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdvertisementSection;