import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';
import '../styles/hey.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in both fields');
            return;
        }

        console.log('Logging in with:', { email, password });
        setError('');
    };

    return (
        <Container maxWidth="xs" className="login-page-body">
            <Paper className="login-container" elevation={4}>
                <Typography variant="h4" className="title">Welcome</Typography>

                {error && <Typography className="error-message">{error}</Typography>}

                <Box
                    component="form"
                    className="form-container"
                    onSubmit={handleSubmit}
                >
                    <TextField
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        className="login-button"
                        type="submit"
                    >
                        Login
                    </Button>
                </Box>

                <Typography className="signup-link">
                    Don't have an account? <Link to="/registerPage">Sign up here</Link>
                </Typography>
            </Paper>
        </Container>
    );
};

export default LoginPage;
