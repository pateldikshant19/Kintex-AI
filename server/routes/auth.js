const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendGreetingEmail, sendVerificationEmail, sendLoginAlertEmail } = require('../utils/emailService');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, sport, teamName } = req.body;
    const user = new User({ name, email, password, role, sport, teamName });
    await user.save();

    // Send Emails
    // await sendGreetingEmail(user);
    // await sendVerificationEmail(user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name, email, role, sport, teamName } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Send Login Alert
    // await sendLoginAlertEmail(user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, sport: user.sport, teamName: user.teamName } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;