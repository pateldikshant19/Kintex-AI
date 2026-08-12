import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const pingAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');

                const API_URL = process.env.REACT_APP_API_URL || '/api';
                await fetch(`${API_URL}/admin/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        path: location.pathname,
                        referrer: document.referrer,
                        userAgent: navigator.userAgent
                    })
                }).catch(() => {
                    // Silently fail if server is offline
                });
            } catch (err) {
                // Silently fail to not interrupt user experience
            }
        };

        pingAnalytics();
    }, [location]);

    return null; // This component doesn't render anything
};

export default AnalyticsTracker;
