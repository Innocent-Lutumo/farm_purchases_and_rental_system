import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Container, Paper, Grid } from "@mui/material";
import { styled } from "@mui/system";
import "../styles/hey.css";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 600,
    margin: "auto",
    marginTop: theme.spacing(6),
    borderRadius: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    animation: "fadeIn 1s ease-in-out"
}));

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        names: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        let formErrors = {};
        if (!formData.names) formErrors.names = "Full Names are required";
        if (!formData.username) formErrors.username = "Username is required";
        if (!formData.email) formErrors.email = "Email is required";
        if (!formData.phone_number) formErrors.phone_number = "Phone number is required";
        if (!formData.password) formErrors.password = "Password is required";
        if (formData.password !== formData.confirmPassword) {
            formErrors.confirmPassword = "Passwords do not match";
        }
        return formErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length === 0) {
            console.log("Form submitted successfully", formData);
        } else {
            setErrors(formErrors);
        }
    };

    return (
        <Container>
            <StyledPaper elevation={3}>
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Create an Account
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField label="Full Names" name="names" value={formData.names} onChange={handleChange} error={!!errors.names} helperText={errors.names} fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Username" name="username" value={formData.username} onChange={handleChange} error={!!errors.username} helperText={errors.username} fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} error={!!errors.phone_number} helperText={errors.phone_number} fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} fullWidth/>
                        </Grid>
                    </Grid>

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{
                        mt: 3,
                        borderRadius: "25px",
                        padding: "10px 0",
                        textTransform: "uppercase",
                        fontWeight: "bold"
                    }}>
                        Register
                    </Button>
                </Box>
                <Typography sx={{ marginTop: 2, textAlign: 'center' }}>
                    Already have an account? <Link to="/LoginPage">Login here</Link>
                </Typography>
            </StyledPaper>
        </Container>
    );
};

export default RegistrationForm;
