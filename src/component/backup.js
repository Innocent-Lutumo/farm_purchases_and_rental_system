import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardMedia, CardContent, Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import Num2 from '../images/Num2.jpg';
import Num1 from '../images/num1.jpg';
import '../styles/slider.css';

const Home = () => {
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;
        let scrollAmount = 0;
        const slideInterval = setInterval(() => {
            if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
                scrollAmount = 0;
            } else {
                scrollAmount += 1;
            }
            slider.scrollLeft = scrollAmount;
        }, 50); // Slower scrolling for better readability

        return () => clearInterval(slideInterval);
    }, []);

    return (
        <Box>
            {/* Navbar */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Farm Finder
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Container sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h3" gutterBottom>Find a Perfect Farm</Typography>
                <Typography variant="body1">
                    Discover a wide selection of farms for purchase or rent. This system offers you a variety of options to select your desired farm to <strong>buy</strong> or <strong>rent</strong> with all your desired land qualities. 
                    You will find land details, prices, seller contacts, and precise Google Map locations for easier navigation.
                </Typography>
            </Container>

            {/* About Section */}
            <Container sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom>About Our Platform</Typography>
                <Typography>
                    Our platform is dedicated to connecting farmers and buyers efficiently. We aim to enhance agricultural transactions by providing a user-friendly system that helps users make informed decisions.
                </Typography>
            </Container>

            {/* Featured Farms with Sliding Animation */}
            <Container sx={{ my: 4, overflow: 'hidden' }}>
                <Typography variant="h4" gutterBottom>Featured Farms</Typography>
                <div className="farm-slider" ref={sliderRef}>
                    {[{
                        image: Num2,
                        location: 'Kibaha',
                        size: '10 hectares',
                        price: '$10,000'
                    }, {
                        image: Num1,
                        location: 'Ruvu',
                        size: '15 hectares',
                        price: '$12,000'
                    }, {
                        image: Num2,
                        location: 'Katavi',
                        size: '20 hectares',
                        price: '$15,000'
                    }].map((farm, index) => (
                        <Card key={index} sx={{ minWidth: 100, mx: 2 }}> {/* Reduced card width */}
                            <CardMedia component="img" height="100" image={farm.image} alt={`farm${index + 1}`} /> {/* Smaller image */}
                            <CardContent>
                                <Typography variant="h6">Beautiful Farmland</Typography>
                                <Typography>Location: {farm.location}</Typography>
                                <Typography>Size: {farm.size}</Typography>
                                <Typography>Price: {farm.price}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>

            {/* Blog Section */}
            <Container sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom>Latest Agricultural Insights</Typography>
                <Typography>
                    Stay updated with the latest trends in farming, soil management, and agricultural business. Our blog provides expert tips and strategies for enhancing farm productivity and profitability.
                </Typography>
            </Container>

            {/* Actions Section */}
            <Container sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h5" gutterBottom>You are welcome as one of our clients.</Typography>
                <Typography>Press any of the buttons below to register for the category you want to be:</Typography>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" color="success" sx={{ m: 1 }}>Buy Farm</Button>
                    <Button variant="contained" color="warning" sx={{ m: 1 }}>Rent Farm</Button>
                    <Button variant="contained" color="error" sx={{ m: 1 }}>Sell Farm</Button>
                </Box>
            </Container>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.200', mt: 4 }}>
                <Typography>Created by <span>S/N 19</span></Typography>
                <Typography>Copyright, all rights reserved</Typography>
            </Box>
        </Box>
    );
};

export default Home;
