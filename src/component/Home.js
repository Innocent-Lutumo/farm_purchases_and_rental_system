import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardMedia, Box, IconButton } from '@mui/material';
import Num2 from '../images/Num2.jpg';
import Num1 from '../images/num1.jpg';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import '../styles/slider.css';

const Home = () => {
    const farms = [
        { image: Num2, location: 'Kibaha', size: '10 hectares', price: '$10,000' },
        { image: Num1, location: 'Ruvu', size: '15 hectares', price: '$12,000' },
        { image: Num2, location: 'Katavi', size: '20 hectares', price: '$15,000' }
    ];

    return (
        <Box>
            {/* Navbar */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        S/N 19
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Container sx={{ textAlign: 'center', my: 4, animation: 'fadeIn 1s ease-out' }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Find a Perfect Farm</Typography>
                <Typography variant="body1" sx={{ maxWidth: '1000px', margin: 'auto', color: '#333' }}>
                    Discover a wide selection of farms for purchase or rent. This system offers you a variety of options to select your desired farm to <strong>buy</strong> or <strong>rent</strong> with all your desired land qualities. 
                    You will find land details, prices, seller contacts, and precise Google Map locations for easier navigation.
                </Typography>
            </Container>

            {/* About Section */}
            <Container sx={{ my: 4, animation: 'slideUp 1s ease-out' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>About Our Platform</Typography>
                <Typography sx={{ maxWidth: '1000px', margin: 'auto', color: '#666' }}>
                    Our platform is dedicated to connecting farmers and buyers efficiently. We aim to enhance agricultural transactions by providing a user-friendly system that helps users make informed decisions.
                </Typography>
            </Container>

            {/* Featured Farms with Enhanced Design */}
            <Container sx={{ my: 4, overflow: 'hidden' }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
                    Featured Farms
                </Typography>
                <div className="farm-slider">
                    {farms.map((farm, index) => (
                        <div key={index} className="farm-card">
                            <Card sx={{ display: 'flex', flexDirection: 'row', borderRadius: 2, boxShadow: 3, transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }}>
                                <CardMedia
                                    component="img"
                                    image={farm.image}
                                    alt={`farm${index + 1}`}
                                    sx={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 1 }}
                                />
                                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Beautiful Farmland</Typography>
                                    <Typography variant="body2" sx={{ marginBottom: 1 }}>Location: {farm.location}</Typography>
                                    <Typography variant="body2" sx={{ marginBottom: 1 }}>Size: {farm.size}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Price: {farm.price}</Typography>
                                </Box>
                            </Card>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Blog Section */}
            <Container sx={{ my: 4, animation: 'fadeIn 1s ease-out' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Latest Agricultural Insights</Typography>
                <Typography sx={{ maxWidth: '1000px', margin: 'auto', color: '#666' }}>
                    Stay updated with the latest trends in farming, soil management, and agricultural business. Our blog provides expert tips and strategies for enhancing farm productivity and profitability.
                </Typography>
            </Container>

            {/* Actions Section */}
            <Container sx={{ textAlign: 'center', my: 4, animation: 'slideUp 1s ease-out' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>You are welcome as one of our clients.</Typography>
                <Typography sx={{ marginBottom: 2 }}>Press any of the buttons below to register for the category you want to be:</Typography>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" color="success" sx={{ m: 1, '&:hover': { backgroundColor: '#388e3c' } }}>Buy Farm</Button>
                    <Button variant="contained" color="warning" sx={{ m: 1, '&:hover': { backgroundColor: '#f57c00' } }}>Rent Farm</Button>
                    <Button variant="contained" color="error" sx={{ m: 1, '&:hover': { backgroundColor: '#d32f2f' } }}>Sell Farm</Button>
                </Box>
            </Container>

            {/* Footer with Social Media Icons */}
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.200', mt: 4 }}>
                
                {/* Social Media Icons (Displayed First) */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <IconButton href="https://www.instagram.com" target="_blank" sx={{ color: '#E4405F', mx: 1 }}>
                        <InstagramIcon />
                    </IconButton>
                    <IconButton href="https://www.twitter.com" target="_blank" sx={{ color: '#1DA1F2', mx: 1 }}>
                        <TwitterIcon />
                    </IconButton>
                    <IconButton href="https://www.facebook.com" target="_blank" sx={{ color: '#1877F2', mx: 1 }}>
                        <FacebookIcon />
                    </IconButton>
                    <IconButton href="https://www.linkedin.com" target="_blank" sx={{ color: '#0077B5', mx: 1 }}>
                        <LinkedInIcon />
                    </IconButton>
                </Box>

                <Typography>Created by <span>S/N 19</span></Typography>
                <Typography>Contacts: 2557 475 700 004 <br /> Email: serialnumber19@gmail.com</Typography>

            </Box>
        </Box>
    );
};

export default Home;
