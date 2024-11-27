import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure to use this for styling
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    const [user, setUser] = useState(null);  // Store logged-in user
    const [showLogin, setShowLogin] = useState(true);  // Toggle between login and employee page

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser)); // Restore user state
        }
    }, []);

    const handleSetUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Save user data to localStorage
    };


    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Remove user data from localStorage
    };

    return (
        <BrowserRouter>
            <div>
               
                {user ? 
                 (
                    <>
                    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1%', background:'white'}}>
                        <h4>HR Management System</h4>
                        <button onClick={handleLogout} style={{width:'fit-content'}}>Logout</button>
                    </nav>
                    <Dashboard />
                    </>
                    
                ) : (
                    <div className='container'>
                         <h2>HR Management System</h2>
                        {showLogin && (
                            <Login setUser={handleSetUser} />
                        )}
                    </div>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;