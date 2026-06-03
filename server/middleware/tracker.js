const Visit = require('../models/Visit');

const trackVisit = async (req, res, next) => {
    try {
        // Skip tracking for static files or API internal calls if needed
        if (req.path.startsWith('/api')) {
            const visit = new Visit({
                ip: req.ip || req.headers['x-forwarded-for'],
                userAgent: req.headers['user-agent'],
                path: req.path,
                userId: req.user ? req.user.id : null // req.user comes from auth middleware if applied
            });
            await visit.save();
        }
    } catch (error) {
        console.error('Analytics error:', error);
    }
    next();
};

module.exports = trackVisit;
