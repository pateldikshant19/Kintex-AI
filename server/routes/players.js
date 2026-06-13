const express = require('express');
const Player = require('../models/Player');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    // Enforce active=true and retired=false globally for this route
    let filter = { active: true, retired: false };

    if (req.user.role === 'player' || req.user.role === 'athlete') {
      // Players can only see their own data
      filter.email = req.user.email;
    } else if (req.user.role === 'manager' || req.user.role === 'analyst') {
      // Apply team / league filtering if provided via query params (SessionContext)
      if (req.query.teamId) {
        filter.currentTeamId = Number(req.query.teamId);
      }
      if (req.query.leagueId) {
        // Find players whose activeLeagueIds array contains the selected league
        filter.activeLeagueIds = Number(req.query.leagueId);
      }
      
      // Fallback to user object if query params aren't passed (legacy compat)
      if (!req.query.teamId && !req.query.leagueId) {
          if (req.user.teamName) {
            filter.teamName = { $regex: new RegExp(`^${req.user.teamName}$`, 'i') };
          } else {
            filter.sport = req.user.sport;
          }
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