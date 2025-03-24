import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardMedia, CardContent, Box, IconButton } from '@mui/material';
import img1 from '../images/img1.jpg';
import img2 from '../images/img2.jpg';
import img3 from '../images/img3.jpg';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';  
import '../styles/hey.css';

const Home = () => {
    const farmDetails = [
        { image: img1, description: 'Learn how to sell your farmland efficiently and profitably.' },
        { image: img3, description: 'Explore rental options for profitable land utilization.' },
        { image: img2, description: 'Find the perfect farmland to buy with ease and confidence.' }
    ];

    return (
        <Box>
            {/* Navbar */}
            <AppBar position="static" sx={{background: 'green'}}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        S/N 19
                    </Typography>
                    <Button color="inherit" component={Link} to="/RegisterPage">Register</Button>
                    <Button color="inherit" component={Link} to="/LoginPage">Login</Button>
                </Toolbar>
            </AppBar>

            {/* Description Section */}
            <Container sx={{ textAlign: 'center', my: 4, animation: 'fadeIn 1s ease-out' }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#05a305' }}>Find a Perfect Farm</Typography>
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

            {/* Featured Farms segment */}
            <Container sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
                    Featured Farms
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {farmDetails.map((farm, index) => (
                        <Card key={index} sx={{ width: 350, borderRadius: 3, boxShadow: 5, overflow: 'hidden', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }}>
                            <CardMedia
                                component="img"
                                image={farm.image}
                                alt={`Farm ${index + 1}`}
                                sx={{ height: 200, objectFit: 'cover' }}
                            />
                            <CardContent sx={{ textAlign: 'center', bgcolor: '#f0f4f8', padding: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                    {farm.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
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
                    <Link to="/ExamplePage">
                        <Button variant="contained" color="success" sx={{ m: 1, '&:hover': { backgroundColor: '#388e3c' }, borderRadius: 20 }}>
                            Buy Farm
                        </Button>
                    </Link>
                    <Link to="/ExamplePage">
                        <Button variant="contained" color="warning" sx={{ m: 1, '&:hover': { backgroundColor: '#f57c00' }, borderRadius: 20 }}>
                            Rent Farm
                        </Button>
                    </Link>
                    <Link to="/registerPage">
                        <Button variant="contained" color="error" sx={{ m: 1, '&:hover': { backgroundColor: '#d32f2f' }, borderRadius: 20 }}>
                            Sell Farm
                        </Button>
                    </Link>
                </Box>
            </Container>

            {/* Footer with Social Media Icons */}
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#d8f9d8', mt: 4 }}>
                {/* Social Media Icons */}
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
                    {/*footer contact information*/}
                <Typography>Created by <strong>S/N 19</strong></Typography>
                <Typography>Contacts: 2557 475 700 004 <br /> Email: serialnumber19@gmail.com</Typography>
            </Box>
        </Box>
    );
};

export default Home;
