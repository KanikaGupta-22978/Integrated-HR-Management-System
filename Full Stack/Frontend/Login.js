import React, { useState } from 'react';
import axios from 'axios';

function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // const handleLogin = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post('http://localhost:3000/login', { email, password });
    //         console.log(response);
    //         setUser(response.data.user);
    //         setError('');
    //     } catch (err) {
    //         setError('Invalid credentials');
    //     }
    // };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loader
        setError(''); // Clear previous errors
        try {
            const response = await axios.post('http://localhost:3000/login', { email, password });
            const { user, token } = response.data;

            // Save user and token
            setUser(user);
            localStorage.setItem('token', token); // Save token to localStorage for persistence
            setError('');
        } catch (err) {
            // Display error message
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false); // Stop loader
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',rowGap:'10px'}}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default Login;
