const express = require('express');
const Visit = require('../models/Visit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin (using a simple check for now)
const isAdmin = (req, res, next) => {
    // In a real app, you'd check req.user.role === 'admin'
    // For now, we allow analysts or the first user created
    if (req.user.role === 'analyst' || req.user.role === 'manager') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Administrative privileges required.' });
    }
};

// Tracking endpoint (Accessible by all)
router.post('/track', async (req, res) => {
    try {
        const { path, userAgent } = req.body;
        // Optional: verify token if present but don't fail if missing
        let userId = null;
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
                userId = decoded.userId;
            } catch (e) { }
        }

        const visit = new Visit({
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: userAgent || req.headers['user-agent'],
            path: path || '/',
            userId: userId
        });
        await visit.save();
        res.status(200).send('ok');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.use(auth);
router.use(isAdmin);

// Get visitor stats
router.get('/visits', async (req, res) => {
    try {
        const visits = await Visit.find()
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('userId', 'name email role');

        const totalVisits = await Visit.countDocuments();
        const uniqueIps = await Visit.distinct('ip');

        res.json({
            totalVisits,
            uniqueVisitors: uniqueIps.length,
            recentVisits: visits
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user growth
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
