import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardMedia, CardContent, Box, IconButton, TextField, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import axios from 'axios';

const Pome = () => {
    const [farms, setFarms] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await axios.get('/api/farms/');
                setFarms(response.data);
            } catch (error) {
                console.error('Error fetching farm data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFarms();
    }, []);

    const filteredFarms = farms.filter(farm => 
        farm.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <AppBar position="static" sx={{ background: 'green' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Farm Finder</Typography>
                    <Button color="inherit" component={Link} to="/LoginPage">Login</Button>
                </Toolbar>
            </AppBar>

            {/* Search Bar (Only filters featured farms) */}
            <Container sx={{ my: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search Farms by Location"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 4 }}
                />
            </Container>

            {/* Advertisement Carousel (Auto-scrolling) - Not affected by search */}
            <Container sx={{ overflow: 'hidden', my: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, animation: 'scroll 20s linear infinite', height: '250px' }}>
                    {farms.map((farm, index) => (
                        <Box key={index} sx={{ display: 'flex', minWidth: '350px', boxShadow: 3, borderRadius: 2 }}>
                            <CardMedia
                                component="img"
                                height="150"
                                image={farm.image}
                                alt={`farm${index + 1}`}
                                sx={{ width: '40%' }}
                            />
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6">{farm.name}</Typography>
                                <Typography>Location: {farm.location}</Typography>
                                <Typography>Size: {farm.size}</Typography>
                                <Typography>Price: {farm.price}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Container>

            {/* Heading for "Purchase the Farm of Your Choice" */}
            <Container sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom align="center">Purchase the Farm of Your Choice</Typography>
                <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                    Browse through a selection of farms and choose the one that suits your needs. You can either purchase or rent it.
                </Typography>
            </Container>

            {/* Featured Farms (Filtered by Search Bar) */}
            <Container sx={{ my: 4 }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress color="success" />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {filteredFarms.length > 0 ? filteredFarms.map((farm, index) => (
                            <Card 
                                key={index} 
                                sx={{ width: 300, boxShadow: 3, borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                            >
                                <CardMedia component="img" height="200" image={farm.image} alt={`farm${index + 1}`} />
                                <CardContent>
                                    <Typography variant="h6">{farm.name}</Typography>
                                    <Typography>Location: {farm.location}</Typography>
                                    <Typography>Size: {farm.size}</Typography>
                                    <Typography>Price: {farm.price}</Typography>
                                    <Typography>Quality: {farm.quality}</Typography>
                                    
                                    {/* Purchase and Rent Buttons */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Button variant="contained" color="primary" sx={{ width: '45%' }}>
                                            Purchase
                                        </Button>
                                        <Button variant="outlined" color="secondary" sx={{ width: '45%' }}>
                                            Rent
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )) : (
                            <Typography>No farms found for "{search}"</Typography>
                        )}
                    </Box>
                )}
            </Container>

            {/* Footer with Social Media Icons */}
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#d8f9d8', mt: 4 }}>
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
                <Typography>Created by <strong>S/N 19</strong></Typography>
                <Typography>Contacts: 2557 475 700 004 <br /> Email: serialnumber19@gmail.com</Typography>
            </Box>
        </Box>
    );
};

export default Pome;
