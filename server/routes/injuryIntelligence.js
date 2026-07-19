const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Player = require('../models/Player');
const newsManager = require('../services/news');
const nlpProcessor = require('../services/nlp/nlpProcessor');
const timelineService = require('../services/timelineService');
const ruleEngine = require('../services/ruleEngine'); // kept for fallback
const predictionEngine = require('../services/predictionEngine');
const exerciseEngine = require('../services/exerciseEngine');
const recommendationEngine = require('../services/recommendationEngine');
const recoveryEngine = require('../services/recoveryEngine');
const liveMatchEngine = require('../services/liveMatchEngine');
const PlayerMedicalProfile = require('../models/PlayerMedicalProfile');

// Route: GET /api/injury-intelligence/search
// Desc: Search players by name (partial match, case-insensitive)
// Access: Manager, Analyst
router.get('/search', auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'manager' && role !== 'analyst') {
      return res.status(403).json({ msg: 'Access denied: Requires Manager or Analyst role' });
    }

    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ msg: 'Please provide a name to search' });
    }

    const regex = new RegExp(name, 'i');
    const players = await Player.find({ name: regex });

    res.json(players);
  } catch (err) {
    console.error('[InjuryIntelligence] Search error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route: GET /api/injury-intelligence/profile
// Desc: Get integrated player profile with injury intelligence placeholders and news
// Access: Private (All roles)
router.get('/profile', auth, async (req, res) => {
  try {
    const { role, name: userName } = req.user;
    let targetPlayerName = userName;

    if (role === 'manager' || role === 'analyst') {
      if (!req.query.playerId) {
        return res.status(400).json({ msg: 'playerId query parameter is required for managers and analysts' });
      }
      
      const playerLookup = await Player.findById(req.query.playerId);
      if (!playerLookup) {
        return res.status(404).json({ msg: 'Player not found' });
      }
      targetPlayerName = playerLookup.name;
    }

    const player = await Player.findOne({ name: targetPlayerName });
    
    if (!player) {
      return res.status(404).json({ msg: 'Player record not found in the database.' });
    }

    // 1. Fetch news from News Provider Manager
    let recentNews = [];
    try {
      // Specifically query for injury/fitness news so we don't pull general lifestyle or match reports
      recentNews = await newsManager.getNews(`"${player.name}" AND (injury OR fitness OR surgery OR scan OR rehab)`, player);
      
      // 2. Pass newly fetched articles through the NLP Processor
      // This handles extraction, player matching, duplicate checking, and database insertion
      if (recentNews.length > 0) {
        await nlpProcessor.processArticlesBatch(recentNews, player.name);
      }
    } catch (newsError) {
      console.error('[InjuryIntelligence] Failed to fetch or process news:', newsError.message);
      recentNews = [];
    }

    // 3. Fetch chronological timeline using Timeline Service
    const chronologicalTimeline = await timelineService.generateTimeline(player._id);

    // Fetch Medical Profile
    let medicalProfile = await PlayerMedicalProfile.findOne({ playerId: player._id });

    // 4. Run Prediction Engine (Replaces Rule Engine counting)
    const { assessment, details } = await predictionEngine.generatePrediction(player._id, medicalProfile);
    
    // 5. Run Recovery Engine Estimation
    const recovery = await recoveryEngine.estimateRecovery(player._id);

    // 6. Generate Exercise Recommendations
    const exerciseRecommendations = medicalProfile ? 
      exerciseEngine.getRecommendations(medicalProfile.bodyPart, medicalProfile.severity, medicalProfile.recoveryProgress) :
      exerciseEngine.getRecommendations(null, null, 100);

    // 7. Generate Workload Recommendation
    const playingRecommendation = recommendationEngine.getRecommendation(details.chanceOfReinjury);

    let responsePayload = {
      playerInfo: player,
      injuryIntelligence: {
        riskAssessment: assessment,
        timeline: chronologicalTimeline, 
        supportingArticles: recentNews, 
        availability: assessment.availabilityStatus, 
        estimatedReturn: recovery,
        medicalProfile,
        exerciseRecommendations,
        playingRecommendation,
        aiSummary: assessment.explanations,
        historicalInjuries: medicalProfile ? medicalProfile.historicalInjuries : [],
        predictionDetails: details
      }
    };

    // Apply Strict RBAC for Players (They can only see their own limited intelligence)
    if (role === 'player') {
      responsePayload = {
        currentStatus: assessment.availabilityStatus,
        risk: assessment.riskLevel,
        availability: assessment.availabilityStatus,
        estimatedReturn: recovery.estimatedReturnDays !== null ? `${recovery.estimatedReturnDays} Days` : 'Unknown',
        timeline: chronologicalTimeline.map(e => ({ date: e.eventDate, type: e.eventType, description: e.bodyPart || e.injuryType })),
        recoveryProgress: recovery.progressStatus,
        supportingReasons: recovery.reasons,
        exerciseRecommendations
      };
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('[InjuryIntelligence] Profile error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route: GET /api/injury-intelligence/timeline/:playerId/grouped
// Desc: Get a player's health timeline grouped by date
// Access: Private
router.get('/timeline/:playerId/grouped', auth, async (req, res) => {
  try {
    const timeline = await timelineService.getTimelineByPlayer(req.params.playerId);
    res.json(timeline);
  } catch (err) {
    console.error('[InjuryIntelligence] Grouped Timeline Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route: GET /api/injury-intelligence/timeline/:playerId/active-injury
// Desc: Get the current active injury for a player, if any
// Access: Private
router.get('/timeline/:playerId/active-injury', auth, async (req, res) => {
  try {
    const activeInjury = await timelineService.getActiveInjury(req.params.playerId);
    res.json({ activeInjury });
  } catch (err) {
    console.error('[InjuryIntelligence] Active Injury Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route: GET /api/injury-intelligence/timeline/:playerId/recovery
// Desc: Get the recovery history for a player
// Access: Private
router.get('/timeline/:playerId/recovery', auth, async (req, res) => {
  try {
    const recoveryHistory = await timelineService.getRecoveryHistory(req.params.playerId);
    res.json(recoveryHistory);
  } catch (err) {
    console.error('[InjuryIntelligence] Recovery History Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route: GET /api/injury-intelligence/assessment/:playerId
// Desc: Force run the rule engine and return the newest player assessment
// Access: Private
router.get('/assessment/:playerId', auth, async (req, res) => {
  try {
    const assessment = await ruleEngine.assessPlayer(req.params.playerId);
    res.json(assessment);
  } catch (err) {
    console.error('[InjuryIntelligence] Assessment Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route: GET /api/injury-intelligence/recovery-estimation/:playerId
// Desc: Force run the recovery engine and return the estimation
// Access: Private
router.get('/recovery-estimation/:playerId', auth, async (req, res) => {
  try {
    const recovery = await recoveryEngine.estimateRecovery(req.params.playerId);
    res.json(recovery);
  } catch (err) {
    console.error('[InjuryIntelligence] Recovery Estimation Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// LIVE MATCH ENGINE CONTROLS
// ==========================================

// Route: POST /api/injury-intelligence/live-match/start
// Desc: Start periodic monitoring of live matches
// Access: Manager/Admin only
router.post('/live-match/start', auth, (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
  const result = liveMatchEngine.startMonitoring();
  res.json(result);
});

// Route: POST /api/injury-intelligence/live-match/stop
// Desc: Stop periodic monitoring of live matches
// Access: Manager/Admin only
router.post('/live-match/stop', auth, (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
  const result = liveMatchEngine.stopMonitoring();
  res.json(result);
});

// Route: GET /api/injury-intelligence/live-match/status
// Desc: Get current status of the live match engine
// Access: Private
router.get('/live-match/status', auth, (req, res) => {
  res.json(liveMatchEngine.getStatus());
});

// Route: POST /api/injury-intelligence/live-match/trigger
// Desc: Manually trigger one cycle of the live match pipeline immediately
// Access: Manager/Admin only
router.post('/live-match/trigger', auth, async (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
  
  // Do not await if we want a fast response, but for API feedback we can await
  try {
    await liveMatchEngine.monitorActiveMatches();
    res.json({ msg: 'Manual cycle triggered successfully' });
  } catch (err) {
    console.error('[InjuryIntelligence] Live Match Trigger Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
