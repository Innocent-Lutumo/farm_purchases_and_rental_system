import React,{useState} from "react";
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                <div className="input-group">
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email" required />
                </div>

                <div className="input-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password" required />
                </div>

                <button type="submit">Login</button>
                <p className="signup-link">Don't have Account? <a href="Register_page.js">Register</a></p>
            </form>
        </div>
    );
    
};

export default Login;