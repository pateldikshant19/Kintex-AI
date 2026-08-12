const express = require('express');
const Visit = require('../models/Visit');
const User = require('../models/User');
const Player = require('../models/Player');
const Team = require('../models/Team');
const League = require('../models/League');
const Performance = require('../models/Performance');
const Injury = require('../models/Injury');
const LiveMatch = require('../models/LiveMatch');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin, analyst, or manager
const isAdmin = (req, res, next) => {
    if (req.user && ['admin', 'analyst', 'manager'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Administrative privileges required.' });
    }
};

// Tracking endpoint (Accessible publicly for visitor analytics)
router.post('/track', async (req, res) => {
    try {
        const { path, userAgent } = req.body;
        let userId = null;
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
                userId = decoded.userId;
            } catch (e) { }
        }

        const visit = new Visit({
            ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: userAgent || req.headers['user-agent'] || 'Unknown Browser',
            path: path || '/',
            userId: userId
        });
        await visit.save();
        res.status(200).send('ok');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Require authentication and admin authorization for all endpoints below
router.use(auth);
router.use(isAdmin);

// Comprehensive Admin System Metrics & Collection Overview
router.get('/stats', async (req, res) => {
    try {
        const [
            userCount,
            visitCount,
            playerCount,
            teamCount,
            leagueCount,
            performanceCount,
            injuryCount,
            liveMatchCount,
            uniqueIps
        ] = await Promise.all([
            User.countDocuments(),
            Visit.countDocuments(),
            Player.countDocuments(),
            Team.countDocuments(),
            League.countDocuments(),
            Performance.countDocuments(),
            Injury.countDocuments(),
            LiveMatch.countDocuments(),
            Visit.distinct('ip')
        ]);

        // User role breakdown
        const roleAgg = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const roles = {};
        roleAgg.forEach(r => { roles[r._id] = r.count; });

        // Sport breakdown
        const sportAgg = await User.aggregate([
            { $group: { _id: '$sport', count: { $sum: 1 } } }
        ]);
        const sports = {};
        sportAgg.forEach(s => { sports[s._id || 'Unspecified'] = s.count; });

        // Top visited routes
        const topRoutes = await Visit.aggregate([
            { $group: { _id: '$path', hits: { $sum: 1 } } },
            { $sort: { hits: -1 } },
            { $limit: 5 }
        ]);

        const memoryUsage = process.memoryUsage();

        res.json({
            summary: {
                totalUsers: userCount,
                totalVisits: visitCount,
                uniqueVisitors: uniqueIps.length,
                totalPlayers: playerCount,
                totalTeams: teamCount,
                totalLeagues: leagueCount,
                totalPerformances: performanceCount,
                totalInjuries: injuryCount,
                activeLiveMatches: liveMatchCount
            },
            roleDistribution: roles,
            sportDistribution: sports,
            topRoutes,
            systemHealth: {
                status: 'Optimal',
                uptimeSeconds: Math.floor(process.uptime()),
                nodeVersion: process.version,
                heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Visitor Activity Stats
router.get('/visits', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const visits = await Visit.find()
            .sort({ timestamp: -1 })
            .limit(limit)
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

// Filterable & Searchable User Directory
router.get('/users', async (req, res) => {
    try {
        const { q, role, sport } = req.query;
        const filter = {};

        if (role && role !== 'all') {
            filter.role = role;
        }

        if (sport && sport !== 'all') {
            filter.sport = sport;
        }

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { teamName: { $regex: q, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user role / active status
router.patch('/users/:id', async (req, res) => {
    try {
        const { role, isActive, teamName, sport } = req.body;
        const updateData = {};
        if (role) updateData.role = role;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (teamName) updateData.teamName = teamName;
        if (sport) updateData.sport = sport;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger seed database feed on demand
router.post('/seed', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const scriptPath = require('path').join(__dirname, '../scripts/seed_admin_panel_data.js');
        
        exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
            if (err) {
                console.error('Seed execution error:', stderr);
                return res.status(500).json({ error: 'Failed to seed database data', details: stderr });
            }
            res.json({ message: 'Database seeded successfully', output: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
