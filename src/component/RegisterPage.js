import React, { useState } from "react";

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
        const {name, value} = e.target;
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
        if (!formData.password !== formData.confirmPassword) {
            formErrors.confirmPassword = "Password donot match";
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
        <div>
            <h2>Registration Form</h2>
            <form onSubmit = {handleSubmit}>
                <div>
                    <label>Names:</label>
                    <input type="text" name="names" value={formData.names} onChange={handleChange} />
                    {errors.names && <p>{errors.names}</p>}
                </div>
                <div>
                    <label>Username:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    {errors.username && <p>{errors.username}</p>}
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <p>{errors.email}</p>}
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input type="telephone" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                    {errors.phone_number && <p>{errors.phone_number}</p>}
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    {errors.password && <p>{errors.password}</p>}
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                    {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegistrationForm;
