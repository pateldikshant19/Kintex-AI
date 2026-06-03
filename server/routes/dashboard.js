const express = require('express');
const Player = require('../models/Player');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const filter = (req.user.role === 'analyst') ? {} : { sport: req.user.sport };
    const players = await Player.find(filter);
    const dashboard = {
      activePlayers: players.length,
      totalGoals: players.reduce((sum, p) => {
        const playerGoals = p.performanceHistory?.reduce((hSum, h) => hSum + (h.metrics?.goals || h.metrics?.football?.goals || 0), 0) || 0;
        return sum + playerGoals;
      }, 0),
      totalAssists: players.reduce((sum, p) => {
        const playerAssists = p.performanceHistory?.reduce((hSum, h) => hSum + (h.metrics?.assists || h.metrics?.football?.assists || 0), 0) || 0;
        return sum + playerAssists;
      }, 0),
      topPerformers: players.sort((a, b) => {
        const goalsA = a.performanceHistory?.reduce((hSum, h) => hSum + (h.metrics?.goals || h.metrics?.football?.goals || 0), 0) || 0;
        const goalsB = b.performanceHistory?.reduce((hSum, h) => hSum + (h.metrics?.goals || h.metrics?.football?.goals || 0), 0) || 0;
        return goalsB - goalsA;
      }).slice(0, 3)
    };
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;