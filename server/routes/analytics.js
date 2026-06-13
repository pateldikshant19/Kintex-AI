const express = require('express');
const Player = require('../models/Player');
const Performance = require('../models/Performance');
const MatchAnalytics = require('../models/MatchAnalytics');
const auth = require('../middleware/auth');
const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Helper for Role-Based Sport Filtering
const getSportFilter = (req) => {
  const user = req.user;
  let filter = { active: true, retired: false };
  
  if (user.role === 'analyst' || user.role === 'manager') {
      if (req.query.teamId) filter.currentTeamId = Number(req.query.teamId);
      if (req.query.leagueId) filter.activeLeagueIds = Number(req.query.leagueId);
      
      if (!req.query.teamId && !req.query.leagueId && user.teamName) {
         filter.teamName = { $regex: new RegExp(`^${user.teamName}$`, 'i') };
      }
  } else if (user.role === 'player' || user.role === 'athlete') {
      filter.email = user.email;
  }
  return filter;
};

// GET / - Aggregated Analytics (Legacy + New)
router.get('/', async (req, res) => {
  try {
    const filter = getSportFilter(req);
    const players = await Player.find(filter);

    // Legacy aggregations for dashboard
    const getGoals = p => p.performanceHistory?.reduce((hSum, h) => hSum + (h.metrics?.goals || h.metrics?.football?.goals || 0), 0) || 0;
    const getAssists = p => p.performanceHistory?.reduce((hSum, h) => hSum + (h.metrics?.assists || h.metrics?.football?.assists || 0), 0) || 0;

    const analytics = {
      totalGoals: players.reduce((sum, p) => sum + getGoals(p), 0),
      totalAssists: players.reduce((sum, p) => sum + getAssists(p), 0),
      avgGoalsPerPlayer: players.length ? players.reduce((sum, p) => sum + getGoals(p), 0) / players.length : 0,
      topScorer: players.sort((a, b) => getGoals(b) - getGoals(a))[0]
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /performance - Detailed Performance Records (New AI Data)
router.get('/performance', async (req, res) => {
  try {
    const filter = getSportFilter(req);
    const { limit = 50, page = 1 } = req.query;

    let perfFilter = {};
    if (filter.currentTeamId || filter.activeLeagueIds || filter.email || filter.teamName) {
        const players = await Player.find(filter).select('_id');
        perfFilter.playerId = { $in: players.map(p => p._id) };
    }

    const performances = await Performance.find(perfFilter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('playerId', 'name position'); // Populate player details

    const total = await Performance.countDocuments(perfFilter);

    res.json({
      data: performances,
      meta: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /matches - Match Predictions & Analytics (New CSV Data)
router.get('/matches', async (req, res) => {
  try {
    const filter = getSportFilter(req);
    const { limit = 50, page = 1 } = req.query;

    let matchFilter = {};
    // MatchAnalytics doesn't have playerId, but it might have teamId. 
    // Wait, MatchAnalytics model doesn't have teamId either, it only has sport, minuteOrPhase, etc.
    // We'll leave matchFilter empty for now or map if we add teamId to MatchAnalytics later.
    // For now, managers and analysts can just see all matches or filter by sport if we add it to the filter object.
    if (req.user.sport) {
       matchFilter.sport = req.user.sport;
    }

    const matches = await MatchAnalytics.find(matchFilter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MatchAnalytics.countDocuments(matchFilter);

    res.json({
      data: matches,
      meta: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/player/:id', async (req, res) => {
  try {
    // Ensure user has access to this player
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ msg: 'Player not found' });

    if (req.user.role !== 'analyst' && player.sport !== req.user.sport) {
      return res.status(403).json({ msg: 'Access denied to this player' });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;