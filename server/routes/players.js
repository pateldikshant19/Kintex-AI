const express = require('express');
const Player = require('../models/Player');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'player' || req.user.role === 'athlete') {
      // Players can only see their own data
      filter = { email: req.user.email };
    } else if (req.user.role === 'manager' || req.user.role === 'analyst') {
      // Managers and Analysts see all players in their team
      if (req.user.teamName) {
        filter = { teamName: { $regex: new RegExp(`^${req.user.teamName}$`, 'i') } };
      } else {
        // Fallback to sport if no team is set
        filter = { sport: req.user.sport };
      }
    }

    console.log(`[GET /players] User: ${req.user.email} (${req.user.role}) | Team: ${req.user.teamName}`);
    console.log(`[GET /players] Filter:`, filter);
    const players = await Player.find(filter);
    console.log(`[GET /players] Found: ${players.length} players`);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;