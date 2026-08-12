import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.REACT_APP_API_URL || '/api';

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

    const fetchJson = async (url, options) => {
        let response;
        try {
            response = await fetch(url, options);
        } catch (err) {
            throw new Error("Cannot connect to server. Please check if the backend server on port 3001 is running.");
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Request failed');
            return data;
        } else {
            throw new Error(`Server returned unexpected response (${response.status}). Please check backend status.`);
        }
    };

    const signup = async (userData) => {
        try {
            const data = await fetchJson(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

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
            const data = await fetchJson(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

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
