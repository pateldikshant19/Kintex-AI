const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth Middleware — verifies JWT token on protected routes.
 *
 * Expects token in:
 *   - Header: Authorization: Bearer <token>
 *   - Header: x-auth-token: <token>
 *
 * Returns 401 if token is missing, invalid, or expired.
 * Role-based access control is enforced per-route (e.g. manager, analyst, player).
 */
module.exports = async (req, res, next) => {
  // ─── Extract token from headers ────────────────────────────────────────────
  const token =
    req.header('x-auth-token') ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'Access denied. No token provided.' });
  }

  // ─── Verify token ───────────────────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Demo token (prefixed with "demo-") — no DB lookup needed
    if (typeof userId === 'string' && userId.startsWith('demo-')) {
      const roleFromId = userId.replace('demo-', '');
      req.user = {
        _id: userId,
        name: `Demo ${roleFromId.charAt(0).toUpperCase() + roleFromId.slice(1)}`,
        email: `${roleFromId}@kinetix.ai`,
        role: roleFromId,
        sport: 'Cricket',
        teamName: 'India'
      };
      return next();
    }

    // Real user token — look up in MongoDB
    const user = await User.findById(userId).select('-password').maxTimeMS(3000);
    if (!user) {
      return res.status(401).json({ msg: 'Token valid but user not found.' });
    }

    req.user = user;
    return next();

  } catch (err) {
    // Token is expired, malformed, or signed with wrong secret
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ msg: 'Invalid token. Authorization denied.' });
  }
};
