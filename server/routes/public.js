const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const MatchAnalytics = require('../models/MatchAnalytics');
const Performance = require('../models/Performance');

// PUBLIC-SAFE curated data - No auth required for these
router.get('/matches', async (req, res) => {
    try {
        // Fetch live matches via unified provider
        const filteredMatches = await cricketDataProvider.getLiveMatches();
        res.json(filteredMatches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/players', async (req, res) => {
    try {
        // Return only public fields
        const players = await Player.find({}, 'playerId name sport teamName role battingStyle bowlingStyle country imageId bio records');
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/player/:id', async (req, res) => {
    try {
        // Filter out injuryHistory, trainingData, physicalStats
        const player = await Player.findById(req.params.id, 'playerId name sport teamName role battingStyle bowlingStyle country imageId bio records');
        if (!player) return res.status(404).json({ msg: 'Player not found' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/teams', async (req, res) => {
    try {
        const Team = require('../models/Team');
        const teams = await Team.find({}, 'teamId name shortName imageId country leagueIds');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/leagues', async (req, res) => {
    try {
        const League = require('../models/League');
        const leagues = await League.find({}, 'leagueId name startDate endDate seriesType status');
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const axios = require('axios');
const cricketDataProvider = require('../services/cricketDataProvider');

// LIVE PROXY SEARCH ENDPOINT
router.get('/players/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        // 1. Try finding in our database first (regex match)
        const cachedPlayers = await Player.find({ name: { $regex: new RegExp(query, 'i') } }, 'playerId name sport teamName role battingStyle bowlingStyle country imageId bio records').limit(5);
        if (cachedPlayers.length > 0) {
            return res.json(cachedPlayers);
        }

        // 2. Fetch from Unified Provider (tries CricAPI, falls back to RapidAPI)
        const players = await cricketDataProvider.searchPlayers(query);
        if (players.length === 0) return res.json([]);

        // 3. Take the first exact match and get deep profile
        const bestMatch = players[0];
        const playerId = bestMatch.playerId;
        const source = bestMatch.source;
        
        const deepProfile = await cricketDataProvider.getPlayerStats(playerId, source);

        const country = bestMatch.country || 'Unknown';
        let cleanBio = deepProfile?.bio || `Professional Cricketer for ${country}.`;
        let records = ["International Professional", "National Team Cap"];

        const playerDoc = {
            playerId: playerId.toString(),
            name: bestMatch.name,
            sport: 'Cricket',
            teamName: country,
            role: deepProfile?.role || 'Professional Cricketer',
            battingStyle: deepProfile?.battingStyle || '',
            bowlingStyle: deepProfile?.bowlingStyle || '',
            country: country,
            imageId: deepProfile?.imageId || null,
            bio: cleanBio,
            records: records
        };

        // 4. Save to our database so future searches hit the cache
        await Player.findOneAndUpdate({ playerId: playerId.toString() }, { $set: playerDoc }, { upsert: true });

        // Return the newly fetched player as an array
        res.json([playerDoc]);

    } catch (error) {
        console.error("Proxy search error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
