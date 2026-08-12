import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const normalizeUser = (u) => {
    if (!u) return null;
    const email = (u.email || '').toLowerCase().trim();
    const name = (u.name || '').toLowerCase().trim();

    let role = (u.role || '').toLowerCase();
    if (email.includes('manag') || email.includes('mang') || name.includes('manger') || name.includes('manager')) {
        role = 'manager';
    } else if (email.includes('analyst') || name.includes('analyst')) {
        role = 'analyst';
    } else if (email.includes('admin') || name.includes('admin')) {
        role = 'admin';
    } else if (!role) {
        role = 'player';
    }

    return { ...u, role };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.REACT_APP_API_URL || '/api';

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('activeUser');
            if (token && storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    const normalized = normalizeUser(parsed);
                    setUser(normalized);
                } catch (e) {
                    console.warn("Failed to parse stored user:", e.message);
                }
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
            throw new Error("Cannot connect to server. Please check backend connection.");
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Request failed');
            return data;
        } else {
            throw new Error(`Server returned unexpected response (${response.status}).`);
        }
    };

    const signup = async (userData) => {
        try {
            const data = await fetchJson(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const normUser = normalizeUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('activeUser', JSON.stringify(normUser));
            setUser(normUser);
            return normUser;
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

            const normUser = normalizeUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('activeUser', JSON.stringify(normUser));
            setUser(normUser);
            return normUser;
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

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
