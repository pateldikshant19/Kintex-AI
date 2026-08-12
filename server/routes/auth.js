const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

const DEMO_USERS = {
  'manager_india@kinetix.ai': { name: 'Team India Manager', role: 'manager', sport: 'Cricket', teamName: 'India' },
  'analyst@kinetix.ai': { name: 'Data Analyst', role: 'analyst', sport: 'Cricket', teamName: 'India' },
  'player1@kinetix.ai': { name: 'Virat Kohli', role: 'player', sport: 'Cricket', teamName: 'India' },
  'admin@kinetix.ai': { name: 'System Administrator', role: 'admin', sport: 'Cricket', teamName: 'India' }
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, sport, teamName } = req.body;
    let userDoc;

    if (mongoose.connection.readyState === 1) {
      try {
        userDoc = new User({ name, email, password, role, sport, teamName });
        await userDoc.save();
      } catch (dbErr) {
        console.warn('DB save warning on signup:', dbErr.message);
      }
    }

    const userId = userDoc ? userDoc._id : `demo-${Date.now()}`;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: userId, name, email, role: role || 'player', sport: sport || 'Cricket', teamName: teamName || 'India' } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;

    // Try finding user in MongoDB if DB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email }).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('DB query timed out or failed, checking demo credentials fallback:', dbErr.message);
      }
    }

    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, sport: user.sport, teamName: user.teamName } });
    }

    // Fallback for Demo Accounts if DB is offline or user not in DB
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    if (DEMO_USERS[normalizedEmail]) {
      const demo = DEMO_USERS[normalizedEmail];
      const token = jwt.sign({ userId: `demo-${demo.role}` }, process.env.JWT_SECRET || 'secret');
      return res.json({ token, user: { id: `demo-${demo.role}`, name: demo.name, email: normalizedEmail, role: demo.role, sport: demo.sport, teamName: demo.teamName } });
    }

    // Allow generic demo access if password matches 'password123' or email is kinetix.ai
    if (password === 'password123' || normalizedEmail.endsWith('@kinetix.ai')) {
      let inferredRole = 'player';
      if (normalizedEmail.includes('manager')) inferredRole = 'manager';
      else if (normalizedEmail.includes('analyst')) inferredRole = 'analyst';
      else if (normalizedEmail.includes('admin')) inferredRole = 'admin';

      const token = jwt.sign({ userId: `demo-${inferredRole}` }, process.env.JWT_SECRET || 'secret');
      return res.json({
        token,
        user: {
          id: `demo-${inferredRole}`,
          name: normalizedEmail.split('@')[0].toUpperCase() || 'Demo User',
          email: normalizedEmail,
          role: inferredRole,
          sport: 'Cricket',
          teamName: 'India'
        }
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;