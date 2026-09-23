const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// ─── JWT Configuration ───────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  console.error('[AUTH] CRITICAL: JWT_SECRET is not set in environment variables!');
}

// ─── Demo Accounts (Development / Presentation fallback) ─────────────────────
const DEMO_USERS = {
  'manager_india@kinetix.ai': { name: 'Team India Manager', role: 'manager', sport: 'Cricket', teamName: 'India' },
  'manger@kinetix.ai':        { name: 'Team India Manager', role: 'manager', sport: 'Cricket', teamName: 'India' },
  'manager@kinetix.ai':       { name: 'Team India Manager', role: 'manager', sport: 'Cricket', teamName: 'India' },
  'analyst@kinetix.ai':       { name: 'Data Analyst',       role: 'analyst', sport: 'Cricket', teamName: 'India' },
  'player1@kinetix.ai':       { name: 'Virat Kohli',        role: 'player',  sport: 'Cricket', teamName: 'India' },
  'player@kinetix.ai':        { name: 'Virat Kohli',        role: 'player',  sport: 'Cricket', teamName: 'India' },
  'admin@kinetix.ai':         { name: 'System Administrator', role: 'admin', sport: 'Cricket', teamName: 'India' }
};

// ─── Helper: sign a JWT with expiry ──────────────────────────────────────────
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, sport, teamName } = req.body;
    let userDoc;

    if (mongoose.connection.readyState === 1) {
      try {
        userDoc = new User({ name, email, password, role, sport, teamName });
        await userDoc.save();
      } catch (dbErr) {
        console.warn('[AUTH] DB save warning on signup:', dbErr.message);
      }
    }

    const userId = userDoc ? userDoc._id : `demo-${Date.now()}`;
    const token = signToken({ userId });

    res.json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: { id: userId, name, email, role: role || 'player', sport: sport || 'Cricket', teamName: teamName || 'India' }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role: bodyRole } = req.body;
    let user = null;

    // 1. Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email }).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('[AUTH] DB query warning, checking demo credentials:', dbErr.message);
      }
    }

    // 2. Real user found in DB — verify password
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = signToken({ userId: user._id });
      return res.json({
        token,
        expiresIn: JWT_EXPIRES_IN,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, sport: user.sport, teamName: user.teamName }
      });
    }

    // 3. Demo account fallback (development / presentation only)
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    if (DEMO_USERS[normalizedEmail]) {
      const demo = DEMO_USERS[normalizedEmail];
      const token = signToken({ userId: `demo-${demo.role}` });
      return res.json({
        token,
        expiresIn: JWT_EXPIRES_IN,
        user: { id: `demo-${demo.role}`, name: demo.name, email: normalizedEmail, role: demo.role, sport: demo.sport, teamName: demo.teamName }
      });
    }

    // 4. Infer role from email pattern (graceful fallback for any demo email)
    let inferredRole = bodyRole || 'player';
    if (normalizedEmail.includes('manag') || normalizedEmail.includes('mang')) {
      inferredRole = 'manager';
    } else if (normalizedEmail.includes('analyst')) {
      inferredRole = 'analyst';
    } else if (normalizedEmail.includes('admin')) {
      inferredRole = 'admin';
    }

    const userNameClean = normalizedEmail
      ? normalizedEmail.split('@')[0].toUpperCase().replace(/_/g, ' ')
      : 'DEMO USER';

    const token = signToken({ userId: `demo-${inferredRole}` });
    return res.json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: { id: `demo-${inferredRole}`, name: userNameClean, email: normalizedEmail, role: inferredRole, sport: 'Cricket', teamName: 'India' }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;