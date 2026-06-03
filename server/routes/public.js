const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const MatchAnalytics = require('../models/MatchAnalytics');
const Performance = require('../models/Performance');

// PUBLIC-SAFE currated data - No auth required for these
router.get('/matches', async (req, res) => {
    try {
        // Only return matches that are "publicly surfaced"
        // For now, returning all matches but with filtered fields
        const matches = await MatchAnalytics.find({}).sort({ timestamp: -1 }).limit(20);
        const filteredMatches = matches.map(m => ({
            id: m._id,
            sport: m.sport,
            matchId: m.matchId,
            status: m.minuteOrPhase > 0 ? 'Live' : 'Upcoming',
            phase: m.minuteOrPhase,
            momentum: m.aiPredictedWinProbability, // Use win probability as momentum signal
            predictedEvent: 'Next Boundary' // Placeholder for crowd intel
        }));
        res.json(filteredMatches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/players', async (req, res) => {
    try {
        const players = await Player.find({}, 'name sport teamName position jerseyNumber debutSeason playingStyle records internationalTeam');
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/player/:id', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id, 'name sport teamName position jerseyNumber debutSeason playingStyle records internationalTeam physicalStats injuryHistory bio');
        if (!player) return res.status(404).json({ msg: 'Player not found' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/match-canvas/:id', async (req, res) => {
    try {
        const match = await MatchAnalytics.findById(req.params.id);
        if (!match) return res.status(404).json({ msg: 'Match not found' });
        
        // Transform match data into "Match Canvas" timeline data
        // This is a mockup of the "Match Reconstruct" data
        const timeline = [];
        const totalPhases = match.minuteOrPhase || 90;
        for(let i=0; i <= totalPhases; i+= (match.sport === 'Cricket' ? 1 : 10)) {
            timeline.push({
                tick: i,
                score: `${Math.floor(i/5)}-${Math.floor(i/8)}`,
                momentum: 0.5 + Math.sin(i/10) * 0.3,
                events: i % 15 === 0 ? [{ type: 'Goal/Boundary', detail: 'Spectacular point scored' }] : []
            });
        }
        
        res.json({
            matchInfo: match,
            timeline: timeline
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
