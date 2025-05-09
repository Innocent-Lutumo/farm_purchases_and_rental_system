import React, { useState } from "react";
import ProtectedRoute from './ProtectedRoute'; 
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { green, red, yellow } from "@mui/material/colors";
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
  TrendingUp,
} from "lucide-react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const navItems = [
  {
    label: "Purchases",
    path: "/purchases",
    icon: <ShoppingBag size={48} color={green[700]} />,
  },
  {
    label: "Rents",
    path: "/rents",
    icon: <Home size={48} color={green[700]} />,
  },
  {
    label: "Uploaded farms",
    path: "/UploadedFarms",
    icon: <UploadCloud size={48} color={green[700]} />,
  },
  {
    label: "Accepted List",
    path: "/accepted",
    icon: <CheckCircle2 size={48} color={green[700]} />,
  },
  {
    label: "Soldouts",
    path: "/soldouts",
    icon: <XCircle size={48} color={red[700]} />,
  },
  {
    label: "Upload new farm",
    path: "/uploadFarmForm",
    icon: <PlusCircle size={48} color={yellow[700]} />,
  },
];

const SellerPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/login");
  };

  return (
    <ProtectedRoute>
      <Box sx={{ flexGrow: 1, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
        <AppBar position="static" sx={{ bgcolor: green[700], py: 2 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Farm Seller Dashboard
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Manage listings, track sales, and grow your network.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={handleMenuOpen} color="inherit">
                <AccountCircleIcon sx={{ fontSize: 40 }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleMenuClose}
                  sx={{ color: "black" }}
                >
                  My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    handleMenuClose();
                  }}
                  sx={{ color: "red" }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#e8f5e9",
              textAlign: "center",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <TrendingUp size={32} color={green[700]} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: green[800], ml: 1 }}
              >
                Total Farms Sold: 42
              </Typography>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {navItems.map(({ label, path, icon }, index) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardActionArea component={Link} to={path}>
                      <CardContent
                        sx={{
                          py: 4,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {icon}
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ color: green[800], fontWeight: "bold", mt: 2 }}
                        >
                          {label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 6, mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 4,
                  p: 4,
                  bgcolor: "#f1f8e9",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", mb: 2, color: green[800] }}
                >
                  🌾 Grow With Us!
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Selling your land has never been easier. List your farm with
                  just a few clicks, and connect with potential buyers across the
                  country. Our platform is designed to help you sell faster and at
                  the best price.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", color: "gray" }}
                >
                  "Selling land is not about transactions; it's about building
                  connections." — S/N19
                </Typography>
              </Paper>
            </motion.div>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: green[800], mb: 2 }}
              >
                💡 Tips for Sellers
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    tip: "Use high-quality images",
                    icon: <ImageIcon size={18} color={green[700]} />,
                  },
                  {
                    tip: "Update availability often",
                    icon: <RefreshCw size={18} color={yellow[700]} />,
                  },
                  {
                    tip: "Respond quickly to offers",
                    icon: <ThumbsUp size={18} color={green[700]} />,
                  },
                  {
                    tip: "Promote your best farms",
                    icon: <Lightbulb size={18} color={yellow[700]} />,
                  },
                ].map(({ tip, icon }, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        transition: "0.3s",
                        "&:hover": {
                          bgcolor: "#d8f9d8",
                        },
                      }}
                    >
                      {icon}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tip}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Container>

        <Box
          component="footer"
          sx={{
            bgcolor: "#d8f9d8",
            color: "black",
            mt: 6,
            py: 3,
            px: 2,
            textAlign: "left",
          }}
        >
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} FarmSeller. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Need help?{" "}
            <Link
              to="/support"
              style={{ color: "black", textDecoration: "underline" }}
            >
              Contact Support
            </Link>
          </Typography>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default SellerPage;
