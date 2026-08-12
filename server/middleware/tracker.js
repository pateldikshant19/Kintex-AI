const mongoose = require('mongoose');
const Visit = require('../models/Visit');

const trackVisit = (req, res, next) => {
    try {
        // Only track if MongoDB connection is active to avoid 10000ms buffering timeouts
        if (mongoose.connection.readyState === 1 && req.path.startsWith('/api')) {
            const visit = new Visit({
                ip: req.ip || req.headers['x-forwarded-for'],
                userAgent: req.headers['user-agent'],
                path: req.path,
                userId: req.user ? req.user.id : null
            });
            // Execute in background non-blocking
            visit.save({ maxTimeMS: 2000 }).catch(err => {
                console.warn('Analytics save skipped:', err.message);
            });
        }
    } catch (error) {
        console.warn('Analytics error skipped:', error.message);
    }
    next();
};

module.exports = trackVisit;
