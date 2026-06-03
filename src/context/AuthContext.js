import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Use environment variable or default to localhost:3001
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        // Check for active session token
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('activeUser');
            if (token && storedUser) {
                // Ideally verify token with backend here, for now trust local storage + expiry would be handled by interceptors
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const signup = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Signup failed');

            // Auto login logic equivalent using the returned token/user
            localStorage.setItem('token', data.token);
            localStorage.setItem('activeUser', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error("Signup Error:", error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Invalid credentials');

            localStorage.setItem('token', data.token);
            localStorage.setItem('activeUser', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('activeUser');
        localStorage.removeItem('token');
    };

    // Helper to wipe data as requested
    const clearAllData = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout, clearAllData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
