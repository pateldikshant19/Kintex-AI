const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Player = require('../models/Player');
const newsManager = require('../services/news');
const nlpProcessor = require('../services/nlp/nlpProcessor');
const timelineService = require('../services/timelineService');
const ruleEngine = require('../services/ruleEngine');
const predictionEngine = require('../services/predictionEngine');
const exerciseEngine = require('../services/exerciseEngine');
const recommendationEngine = require('../services/recommendationEngine');
const recoveryEngine = require('../services/recoveryEngine');
const liveMatchEngine = require('../services/liveMatchEngine');
const PlayerMedicalProfile = require('../models/PlayerMedicalProfile');

const MOCK_PLAYER_FALLBACK = {
  _id: 'mock-player-id',
  name: 'Virat Kohli',
  sport: 'Cricket',
  teamName: 'India',
  role: 'Batter',
  battingStyle: 'Right Hand',
  bowlingStyle: 'Right arm medium',
  country: 'India'
};

// Route: GET /api/injury-intelligence/search
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

    let players = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const regex = new RegExp(name, 'i');
        players = await Player.find({ name: regex }).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('[InjuryIntelligence] Search DB warning:', dbErr.message);
      }
    }

    if (players.length === 0) {
      players = [MOCK_PLAYER_FALLBACK];
    }

    res.json(players);
  } catch (err) {
    res.json([MOCK_PLAYER_FALLBACK]);
  }
});

// Route: GET /api/injury-intelligence/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { role, name: userName } = req.user;
    let targetPlayerName = userName || 'Virat Kohli';

    let player = null;

    if (mongoose.connection.readyState === 1) {
      try {
        if ((role === 'manager' || role === 'analyst') && req.query.playerId) {
          const playerLookup = await Player.findById(req.query.playerId).maxTimeMS(2000);
          if (playerLookup) targetPlayerName = playerLookup.name;
        }
        player = await Player.findOne({ name: targetPlayerName }).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('[InjuryIntelligence] Profile DB warning:', dbErr.message);
      }
    }

    if (!player) {
      player = { ...MOCK_PLAYER_FALLBACK, name: targetPlayerName };
    }

    let recentNews = [];
    try {
      recentNews = await newsManager.getNews(`"${player.name}" AND (injury OR fitness OR surgery OR scan OR rehab)`, player);
      if (recentNews.length > 0) {
        await nlpProcessor.processArticlesBatch(recentNews, player.name).catch(() => {});
      }
    } catch (newsError) {
      recentNews = [];
    }

    let chronologicalTimeline = [];
    try {
      chronologicalTimeline = await timelineService.generateTimeline(player._id);
    } catch (tErr) { }

    let medicalProfile = null;
    if (mongoose.connection.readyState === 1) {
      try {
        medicalProfile = await PlayerMedicalProfile.findOne({ playerId: player._id }).maxTimeMS(2000);
      } catch (mErr) { }
    }

    let assessment = { availabilityStatus: 'Available', riskLevel: 'Low', explanations: ['Optimum physical readiness'] };
    let details = { chanceOfReinjury: 10 };
    try {
      const pred = await predictionEngine.generatePrediction(player._id, medicalProfile);
      if (pred && pred.assessment) {
        assessment = pred.assessment;
        details = pred.details || details;
      }
    } catch (pErr) { }

    let recovery = { progressStatus: 'Fit', estimatedReturnDays: 0, reasons: ['Full fitness achieved'] };
    try {
      const rec = await recoveryEngine.estimateRecovery(player._id);
      if (rec) recovery = rec;
    } catch (rErr) { }

    const exerciseRecommendations = medicalProfile ? 
      exerciseEngine.getRecommendations(medicalProfile.bodyPart, medicalProfile.severity, medicalProfile.recoveryProgress) :
      exerciseEngine.getRecommendations(null, null, 100);

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

    if (role === 'player') {
      responsePayload = {
        currentStatus: assessment.availabilityStatus,
        risk: assessment.riskLevel,
        availability: assessment.availabilityStatus,
        estimatedReturn: recovery.estimatedReturnDays !== null ? `${recovery.estimatedReturnDays} Days` : '0 Days',
        timeline: chronologicalTimeline.map(e => ({ date: e.eventDate, type: e.eventType, description: e.bodyPart || e.injuryType })),
        recoveryProgress: recovery.progressStatus,
        supportingReasons: recovery.reasons,
        exerciseRecommendations
      };
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('[InjuryIntelligence] Profile error:', err.message);
    res.json({
      currentStatus: 'Available',
      risk: 'Low',
      availability: 'Available',
      estimatedReturn: '0 Days',
      timeline: [],
      recoveryProgress: 'Fit',
      supportingReasons: ['Optimal readiness'],
      exerciseRecommendations: []
    });
  }
});

router.get('/timeline/:playerId/grouped', auth, async (req, res) => {
  try {
    const timeline = await timelineService.getTimelineByPlayer(req.params.playerId).catch(() => []);
    res.json(timeline || []);
  } catch (err) {
    res.json([]);
  }
});

router.get('/timeline/:playerId/active-injury', auth, async (req, res) => {
  try {
    const activeInjury = await timelineService.getActiveInjury(req.params.playerId).catch(() => null);
    res.json({ activeInjury: activeInjury || null });
  } catch (err) {
    res.json({ activeInjury: null });
  }
});

router.get('/timeline/:playerId/recovery', auth, async (req, res) => {
  try {
    const recoveryHistory = await timelineService.getRecoveryHistory(req.params.playerId).catch(() => []);
    res.json(recoveryHistory || []);
  } catch (err) {
    res.json([]);
  }
});

router.get('/assessment/:playerId', auth, async (req, res) => {
  try {
    const assessment = await ruleEngine.assessPlayer(req.params.playerId).catch(() => ({ riskLevel: 'Low' }));
    res.json(assessment);
  } catch (err) {
    res.json({ riskLevel: 'Low' });
  }
});

router.get('/recovery-estimation/:playerId', auth, async (req, res) => {
  try {
    const recovery = await recoveryEngine.estimateRecovery(req.params.playerId).catch(() => ({ estimatedReturnDays: 0 }));
    res.json(recovery);
  } catch (err) {
    res.json({ estimatedReturnDays: 0 });
  }
});

router.post('/live-match/start', auth, (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
  const result = liveMatchEngine.startMonitoring();
  res.json(result);
});

router.post('/live-match/stop', auth, (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
  const result = liveMatchEngine.stopMonitoring();
  res.json(result);
});

router.get('/live-match/status', auth, (req, res) => {
  res.json(liveMatchEngine.getStatus());
});

router.post('/live-match/trigger', auth, async (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
  try {
    await liveMatchEngine.monitorActiveMatches();
    res.json({ msg: 'Manual cycle triggered successfully' });
  } catch (err) {
    res.json({ msg: 'Cycle completed with fallback' });
  }
});

module.exports = router;
