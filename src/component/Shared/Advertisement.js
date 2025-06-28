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
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
    title: "Green Acres",
    description: "Lush farmlands for eco-friendly farming.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop",
    title: "Golden Harvest",
    description: "Experience farming like never before!",
  },
  {
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
    title: "Valley Farms",
    description: "Ideal for organic and sustainable produce.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop",
    title: "Sunset Meadows",
    description: "Beautiful farmlands with amazing sunsets.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&h=600&fit=crop",
    title: "Riverside Pastures",
    description: "Farms along the river for serene agriculture.",
  },
];

const AdvertisementSection = () => {
  const [currentAd, setCurrentAd] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-scrolling ads effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % defaultAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Typing effect
  const fullText = "Don't Just Look at Pictures";

  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 1000 : 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (isDeleting && currentIndex > 0) {
        setDisplayText(fullText.substring(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (!isDeleting && currentIndex === fullText.length) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentIndex === 0) {
        setTimeout(() => setIsDeleting(false), pauseTime);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, fullText]);

  const cardStyles = {
    height: "200px",
    borderRadius: 3,
    boxShadow: "0 8px 32px rgba(34, 139, 87, 0.15)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-6px) scale(1.02)",
      boxShadow: "0 16px 48px rgba(34, 139, 87, 0.25)",
    },
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #bbf7d0 50%, #dcfce7 75%, #f0fdf4 100%)",
        minHeight: "230px",
        py: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse at top, rgba(34, 197, 94, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        },
        // Floating particles animation
        "&::after": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.08) 1px, transparent 1px),
            radial-gradient(circle at 40% 40%, rgba(34, 197, 94, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 60px 60px, 80px 80px",
          animation: "float 20s ease-in-out infinite",
          pointerEvents: "none",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
            "33%": { transform: "translateY(-10px) rotate(1deg)" },
            "66%": { transform: "translateY(5px) rotate(-1deg)" },
          },
        },
      }}
    >
      <Container
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
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
                border: "1px solid rgba(34, 139, 87, 0.15)",
                backdropFilter: "blur(8px)",
                background: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  "& .ad-card": {
                    transform: "scale(1.03)",
                  },
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
                    className="ad-card"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      borderRadius: 3,
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
                        filter: "brightness(0.9) saturate(1.15) contrast(1.05)",
                        transition: "filter 0.4s ease",
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        p: { xs: 1.5, sm: 2 },
                        background: "transparent",
                        color: "white",
                        textAlign: "center",
                        transition: "all 0.4s ease",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="700"
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          mb: 0.5,
                          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {ad.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.85rem" },
                          opacity: 0.95,
                          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                          lineHeight: 1.3,
                        }}
                      >
                        {ad.description}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}

              {/* Progress indicator */}
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  gap: 0.5,
                  zIndex: 2,
                }}
              >
                {defaultAds.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        index === currentAd
                          ? "rgba(255, 255, 255, 0.9)"
                          : "rgba(255, 255, 255, 0.4)",
                      transition: "all 0.3s ease",
                      boxShadow:
                        index === currentAd
                          ? "0 0 12px rgba(255, 255, 255, 0.6)"
                          : "none",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Message Card with Typing Effect */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                ...cardStyles,
                background:
                  "linear-gradient(135deg, #22c55e 0%, #16a34a 25%, #15803d 75%, #166534 100%)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background:
                    "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent)",
                  animation: "rotate 8s linear infinite",
                  "@keyframes rotate": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  pointerEvents: "none",
                },
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 25%, #166534 75%, #14532d 100%)",
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: "0 16px 48px rgba(34, 139, 87, 0.3)",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1, p: 2 }}>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  color="white"
                  sx={{
                    textShadow: "0 3px 12px rgba(0,0,0,0.4)",
                    mb: 2,
                    minHeight: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "0.5px",
                  }}
                >
                  {displayText}
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: "2px",
                      height: "1.2em",
                      background:
                        "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
                      marginLeft: "3px",
                      borderRadius: "1px",
                      animation: "blink 1.2s infinite",
                      boxShadow: "0 0 8px rgba(255,255,255,0.6)",
                      "@keyframes blink": {
                        "0%, 50%": { opacity: 1 },
                        "51%, 100%": { opacity: 0 },
                      },
                    }}
                  />
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(240, 253, 244, 0.95)"
                  sx={{
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    lineHeight: 1.5,
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Come see the farm for yourself and experience the real thing.
                  <br />
                  <Box
                    component="span"
                    sx={{
                      color: "#dcfce7",
                      fontWeight: "600",
                      textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      fontSize: "1.05em",
                    }}
                  >
                    Nothing compares to seeing it with your own eyes.
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdvertisementSection;
