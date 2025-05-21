import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import { green, red, yellow, blue, orange, grey } from "@mui/material/colors";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Image as ImageIcon,
  RefreshCw,
  ThumbsUp,
  ShoppingBag,
  Home,
  UploadCloud,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Users,
  BarChart2,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 150, 0, 0.2)",
  },
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const GradientBackground = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${green[800]} 0%, ${green[600]} 100%)`,
  color: "white",
  borderRadius: "16px",
  padding: theme.spacing(3),
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
      "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+') repeat",
    opacity: 0.15,
  },
}));

const navItems = [
  {
    label: "Purchases",
    path: "/Purchases",
    icon: <ShoppingBag size={32} />,
    color: "#43a012",
    description: "Track all farm purchase transactions",
  },
  {
    label: "Rents",
    path: "/Rents",
    icon: <Home size={32} />,
    color: "#43a047",
    description: "Manage your property rentals",
  },
  {
    label: "Uploaded Farms",
    path: "/UploadedFarms",
    icon: <UploadCloud size={32} />,
    color: "#7cb342",
    description: "View and edit your farm listings",
  },
  {
    label: "Accepted List",
    path: "/accepted",
    icon: <CheckCircle2 size={32} />,
    color: "#00897b",
    description: "Review approved farm transactions",
  },
  {
    label: "Soldouts",
    path: "/soldouts",
    icon: <XCircle size={32} />,
    color: "#e53935",
    description: "Archive of completed sales",
  },
  {
    label: "Upload New Farm",
    path: "/UploadFarmForm",
    icon: <PlusCircle size={32} />,
    color: "#fb8c00",
    description: "Create a new farm listing",
  },
];

const SellerPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/LoginPage");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f8faf8", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={isScrolled ? 4 : 0}
        sx={{
          background: isScrolled
            ? `linear-gradient(90deg, ${green[800]} 0%, ${green[600]} 100%)`
            : `linear-gradient(90deg, ${green[800]} 0%, ${green[600]} 100%)`,
          transition: "all 0.3s",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ textShadow: "0px 1px 2px rgba(0,0,0,0.2)" }}
              >
                Farm Seller
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Welcome back, John Farmer
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar
                src="/path-to-profile-pic.jpg"
                sx={{ width: 40, height: 40, border: "2px solid white" }}
              >
                JF
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2, minWidth: 180 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: green[50] }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  John Farmer
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Premium Seller
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleMenuClose}
                sx={{ py: 1.5, display: "flex", gap: 1.5 }}
              >
                <AccountCircleIcon fontSize="small" color="action" />
                <Typography variant="body2">My Profile</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleLogout();
                  handleMenuClose();
                }}
                sx={{ py: 1.5, display: "flex", gap: 1.5 }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={red[600]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <Typography variant="body2" color="error">
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GradientBackground sx={{ mb: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  Welcome back to your Farm Seller Dashboard
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  Your farm empire is growing! Here's what's happening with your
                  properties today.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ position: "relative", textAlign: "center" }}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Paper
                      elevation={8}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        display: "inline-block",
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                        maxWidth: 300,
                        mx: "auto",
                      }}
                    ></Paper>
                  </motion.div>
                </Box>
              </Grid>
            </Grid>
          </GradientBackground>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: "bold",
              color: green[800],
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <BarChart2 size={24} />
            Farm Management
          </Typography>

          <Grid container spacing={3}>
            {navItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item.label}>
                <motion.div variants={itemVariants}>
                  <StyledCard elevation={2}>
                    <CardActionArea
                      component={Link}
                      to={item.path}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          height: 8,
                          width: "100%",
                          bgcolor: item.color,
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: `${item.color}15`,
                              color: item.color,
                              width: 56,
                              height: 56,
                              mr: 2,
                            }}
                          >
                            {React.cloneElement(item.icon, {
                              color: item.color,
                            })}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                mb: 0.5,
                                color: grey[800],
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ mb: 1 }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            mt: 1,
                          }}
                        >
                          <ChevronRight size={20} color={grey[500]} />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

          <Grid item xs={12} md={4}></Grid>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  bgcolor: "#f9fff9",
                  height: "100%",
                  background: `linear-gradient(135deg, #f9fff9 0%, #e8f5e9 100%)`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                    color: green[800],
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Lightbulb size={20} />
                  Selling Tips
                </Typography>

                <Grid container spacing={2}>
                  {[
                    {
                      tip: "Use high-quality images that showcase your farm's best features",
                      icon: <ImageIcon size={20} color={blue[600]} />,
                    },
                    {
                      tip: "Update availability status weekly to keep listings fresh",
                      icon: <RefreshCw size={20} color={green[600]} />,
                    },
                    {
                      tip: "Respond to inquiries within 2 hours for higher conversion rates",
                      icon: <ThumbsUp size={20} color={orange[600]} />,
                    },
                    {
                      tip: "Highlight sustainable farming practices to attract premium buyers",
                      icon: <Lightbulb size={20} color={yellow[800]} />,
                    },
                  ].map((tip, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.7)",
                          backdropFilter: "blur(5px)",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateX(5px)",
                            bgcolor: "white",
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "white",
                            color: blue[600],
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        >
                          {tip.icon}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {tip.tip}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              mt: 4,
              bgcolor: "#ffffff",
              background: `linear-gradient(135deg, #ffffff 0%, #f5f9f5 100%)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05 }}
            >
              <svg
                width="200"
                height="200"
                viewBox="0 0 24 24"
                fill={green[800]}
              >
                <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm1 5v4h-2v-4h2zm-2 6h2v2h-2v-2z" />
              </svg>
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", mb: 2, color: green[800] }}
            >
              🌾 Grow Your Farm Empire!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 800 }}>
              Selling your land has never been easier or more profitable. Our
              platform connects you with qualified buyers looking for exactly
              what you have to offer. With advanced analytics, targeted
              marketing, and dedicated support, Farm Seller helps you
              maximize your profits while minimizing hassle.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    border: `1px solid ${green[100]}`,
                    borderRadius: 3,
                    p: 2,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: `0 4px 20px rgba(0,150,0,0.1)`,
                      bgcolor: "white",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      gap: 1,
                      color: green[700],
                    }}
                  >
                    <Users size={20} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Wide Buyer Network
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Access our network of over 50,000 qualified land buyers
                    actively seeking agricultural properties like yours.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    border: `1px solid ${green[100]}`,
                    borderRadius: 3,
                    p: 2,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: `0 4px 20px rgba(0,150,0,0.1)`,
                      bgcolor: "white",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      gap: 1,
                      color: green[500],
                    }}
                  >
                    <BarChart2 size={20} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Smart Analytics
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Make data-driven decisions with our market insights,
                    property comparison tools, and performance tracking.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    border: `1px solid ${green[100]}`,
                    borderRadius: 3,
                    p: 2,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: `0 4px 20px rgba(0,150,0,0.1)`,
                      bgcolor: "white",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      gap: 1,
                      color: orange[700],
                    }}
                  >
                    <MessageSquare size={20} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      24/7 Support
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Our dedicated team of farm-savvy agents is always available
                    to assist with any questions or issues.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/UploadFarmForm" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlusCircle size={18} />}
                    sx={{
                      marginTop: 2,
                      borderRadius: 3,
                      py: 1.5,
                      px: 4,
                      fontWeight: "bold",
                      background: `linear-gradient(45deg, ${green[800]} 0%, ${green[600]} 100%)`,
                      boxShadow: `0 4px 20px ${green[500]}40`,
                      color: "white",
                      "&:hover": {
                        background: `linear-gradient(45deg, ${green[700]} 0%, ${green[500]} 100%)`,
                      },
                    }}
                  >
                    Upload a New Farm
                  </Button>
                </Link>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SellerPage;