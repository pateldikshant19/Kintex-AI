const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Player = require('../models/Player');
const MatchAnalytics = require('../models/MatchAnalytics');
const Performance = require('../models/Performance');
const axios = require('axios');
const cricketDataProvider = require('../services/cricketDataProvider');

const DEFAULT_LEAGUES = [
    { leagueId: '2024', name: "ICC Women's T20 World Cup 2026", startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '10532', name: 'India tour of England 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '11876', name: 'England tour of Australia 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '7572', name: 'ICC Cricket World Cup League 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '11902', name: 'West Indies tour of India 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' }
];

const DEFAULT_TEAMS = [
    { teamId: 'IND', name: 'India', leagueIds: ['2024', '10532', '11902'] },
    { teamId: 'ENG', name: 'England', leagueIds: ['2024', '10532', '11876'] },
    { teamId: 'AUS', name: 'Australia', leagueIds: ['2024', '11876'] },
    { teamId: 'WI', name: 'West Indies', leagueIds: ['2024', '11902'] },
    { teamId: 'NZ', name: 'New Zealand', leagueIds: ['2024'] },
    { teamId: 'SA', name: 'South Africa', leagueIds: ['2024'] },
    { teamId: 'PAK', name: 'Pakistan', leagueIds: ['2024'] }
];

// PUBLIC-SAFE curated data - No auth required for these
router.get('/matches', async (req, res) => {
    try {
        const filteredMatches = await cricketDataProvider.getLiveMatches();
        res.json(filteredMatches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/players', async (req, res) => {
    try {
        let players = [];
        if (mongoose.connection.readyState === 1) {
            try {
                players = await Player.find({}, 'playerId name sport teamName role battingStyle bowlingStyle country imageId bio records').maxTimeMS(2000);
            } catch (dbErr) {
                console.warn('Public players query warning:', dbErr.message);
            }
        }
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/player/:id', async (req, res) => {
    try {
        let player = null;
        if (mongoose.connection.readyState === 1) {
            try {
                player = await Player.findById(req.params.id, 'playerId name sport teamName role battingStyle bowlingStyle country imageId bio records').maxTimeMS(2000);
            } catch (dbErr) {
                console.warn('Public player by ID query warning:', dbErr.message);
            }
        }
        if (!player) return res.status(404).json({ msg: 'Player not found' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/teams', async (req, res) => {
    try {
        let teams = [];
        if (mongoose.connection.readyState === 1) {
            try {
                const Team = require('../models/Team');
                teams = await Team.find({}, 'teamId name shortName imageId country leagueIds').maxTimeMS(2000);
            } catch (dbErr) {
                console.warn('Public teams query warning:', dbErr.message);
            }
        }
        res.json(teams.length > 0 ? teams : DEFAULT_TEAMS);
    } catch (error) {
        res.json(DEFAULT_TEAMS);
    }
});

router.get('/leagues', async (req, res) => {
    try {
        let leagues = [];
        if (mongoose.connection.readyState === 1) {
            try {
                const League = require('../models/League');
                leagues = await League.find({}, 'leagueId name startDate endDate seriesType status').maxTimeMS(2000);
            } catch (dbErr) {
                console.warn('Public leagues query warning:', dbErr.message);
            }
        }
        res.json(leagues.length > 0 ? leagues : DEFAULT_LEAGUES);
    } catch (error) {
        res.json(DEFAULT_LEAGUES);
    }
});

// LIVE PROXY SEARCH ENDPOINT
router.get('/players/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        let cachedPlayers = [];
        if (mongoose.connection.readyState === 1) {
            try {
                cachedPlayers = await Player.find({ name: { $regex: new RegExp(query, 'i') } }, 'playerId name sport teamName role battingStyle bowlingStyle country imageId bio records').limit(5).maxTimeMS(2000);
            } catch (dbErr) {
                console.warn('Search query warning:', dbErr.message);
            }
        }

        if (cachedPlayers.length > 0) {
            return res.json(cachedPlayers);
        }

        const players = await cricketDataProvider.searchPlayers(query);
        if (players.length === 0) return res.json([]);

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

        if (mongoose.connection.readyState === 1) {
            await Player.findOneAndUpdate({ playerId: playerId.toString() }, { $set: playerDoc }, { upsert: true }).maxTimeMS(2000).catch(() => {});
        }

        res.json([playerDoc]);

    } catch (error) {
        console.error("Proxy search error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
