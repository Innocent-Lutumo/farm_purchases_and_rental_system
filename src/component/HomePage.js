import React from "react";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import img1 from "../images/img1.jpg";
import img2 from "../images/img2.jpg";
import img3 from "../images/img3.jpg";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

const Home = () => {
  const farmDetails = [
    {
      image: img1,
      description:
        "Learn how to sell your farmland efficiently and profitably.",
    },
    {
      image: img3,
      description: "Explore rental options for profitable land utilization.",
    },
    {
      image: img2,
      description: "Find the perfect farmland to buy with ease and confidence.",
    },
  ];

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ background: "green" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            S/N 19
          </Typography>
        </Toolbar>
      </AppBar>

      <Button
            variant="contained"
            color="warning"
            sx={{
              m: 1,
              "&:hover": { backgroundColor: "#f57c00" },
              borderRadius: 20,
            }}
            component={Link}
            to="/lee"
          >
           Farm
          </Button>

      {/* Description Section */}
      <Container
        sx={{ textAlign: "center", my: 4, animation: "fadeIn 1s ease-out" }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#05a305" }}
        >
          Find a Perfect Farm
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: "1000px", margin: "auto", color: "#333" }}
        >
          Discover a wide selection of farms for purchase or rent. This system
          offers you a variety of options to select your desired farm to{" "}
          <strong>buy</strong> or <strong>rent</strong> with all your desired
          land qualities. You will find land details, prices, seller contacts,
          and precise Google Map locations for easier navigation.
        </Typography>
      </Container>

      {/* Featured Farms Section */}
      <Container sx={{ my: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", mb: 3 }}
        >
          Featured Farms
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {farmDetails.map((farm, index) => (
            <Card
              key={index}
              sx={{
                width: 350,
                borderRadius: 3,
                boxShadow: 5,
                overflow: "hidden",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)", cursor: "pointer" },
              }}
            >
              <CardMedia
                component="img"
                image={farm.image}
                alt={`Farm ${index + 1}`}
                sx={{ height: 200, objectFit: "cover" }}
              />
              <CardContent
                sx={{ textAlign: "center", bgcolor: "#f0f4f8", padding: 2 }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: "green" }}
                >
                  {farm.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Actions Section */}
      <Container
        sx={{ textAlign: "center", my: 4, animation: "slideUp 1s ease-out" }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          You are welcome as one of our clients.
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
          Press any of the buttons below to jump into the category you want:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="success"
            sx={{
              m: 1,
              "&:hover": { backgroundColor: "#388e3c" },
              borderRadius: 20,
            }}
            component={Link}
            to="/trial"
          >
            Buy Farm
          </Button>
          <Button
            variant="contained"
            color="warning"
            sx={{
              m: 1,
              "&:hover": { backgroundColor: "#f57c00" },
              borderRadius: 20,
            }}
            component={Link}
            to="/RentPage"
          >
            Rent Farm
          </Button>
          <Link to="/RegisterPage">
            <Button
              variant="contained"
              color="error"
              sx={{
                m: 1,
                "&:hover": { backgroundColor: "#d32f2f" },
                borderRadius: 20,
              }}
            >
              Sell Farm
            </Button>
          </Link>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: "center", p: 2, bgcolor: "#d8f9d8", mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <IconButton
            href="https://www.instagram.com"
            target="_blank"
            sx={{ color: "#E4405F", mx: 1 }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://www.twitter.com"
            target="_blank"
            sx={{ color: "#1DA1F2", mx: 1 }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.facebook.com"
            target="_blank"
            sx={{ color: "#1877F2", mx: 1 }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.linkedin.com"
            target="_blank"
            sx={{ color: "#0077B5", mx: 1 }}
          >
            <LinkedInIcon />
          </IconButton>
        </Box>
        <Typography fontSize={14}>
          Created by <strong>S/N 19</strong>
        </Typography>
        <Typography fontSize={14}>
          Contacts: 2557 475 700 004 <br /> Email: serialnumber19@gmail.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
