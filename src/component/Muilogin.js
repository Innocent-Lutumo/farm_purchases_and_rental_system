import React, { useState } from "react";
import {TextField, Button, Box, Typography, Container } from '@mui/material';

const LoginPage = () => {
    const [email, setemail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError ('Please fill in both fields');
            return;
        }

        console.log('Logging in with:', {email, password});
    };

    return (
        <Container maxwidth='xs'>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 5}}>
                <Typography variant="h5">Login</Typography>

                {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}

            <Box
                component='form'
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    marginTop: 2,
                    padding: 2,
                    borderRadius: 1,
                    boxShadow: 3,
                }}
                onSubmit={handleSubmit}
                >
                
                <TextField
                    label="Email"
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setemail(e.target.value)}
                    sx={{ marginBottom : 2}}
                    required
                />

                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ marginBottom: 2 }}
                    required
                />

                <Button variant="contained" color="primary" type="submit">
                    Login
                </Button>
            </Box>
             <Typography sx={{ marginTop: 2 }}>
                Don't have an Account? <a href="/register">Sign up</a>
             </Typography>
            </Box>
        </Container>
    );
};

export default LoginPage;
