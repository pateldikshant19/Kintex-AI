const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const MatchAnalytics = require('../models/MatchAnalytics');
const Performance = require('../models/Performance');

// PUBLIC-SAFE curated data - No auth required for these
router.get('/matches', async (req, res) => {
    try {
        // Return live matches
        const LiveMatch = require('../models/LiveMatch');
        const matches = await LiveMatch.find({}).sort({ date: -1 }).limit(20);
        
        // Strip sensitive/pro info
        const filteredMatches = matches.map(m => ({
            id: m._id,
            matchId: m.match_id,
            name: m.name,
            status: m.status,
            venue: m.venue,
            date: m.date,
            score: m.score
        }));
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

        // 2. If not found, fetch from RapidAPI proxy
        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
        const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

        if (!RAPIDAPI_KEY) return res.json([]);

        const searchRes = await axios.get(`https://${RAPIDAPI_HOST}/stats/v1/player/search`, {
            headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST },
            params: { plrN: query }
        });

        const players = searchRes.data.player || [];
        if (players.length === 0) return res.json([]);

        // 3. Take the first exact match and get deep profile
        const bestMatch = players[0];
        const playerId = bestMatch.id;

        const profRes = await axios.get(`https://${RAPIDAPI_HOST}/stats/v1/player/${playerId}`, {
            headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST }
        });

        const deep = profRes.data;
        const country = bestMatch.teamName || 'Unknown';
        
        let cleanBio = deep.bio ? deep.bio.replace(/<[^>]+>/g, '').substring(0, 300) + "..." : `Professional Cricketer for ${country}.`;
        
        let records = [];
        if (deep.rankings) {
            for (const [format, ranks] of Object.entries(deep.rankings)) {
                for (const [key, val] of Object.entries(ranks)) {
                    if (val && !isNaN(val) && parseInt(val) <= 100) {
                        records.push(`ICC ${format.toUpperCase()} ${key.replace('Rank', '').replace('Best', ' Best ')} Rank: #${val}`);
                    }
                }
            }
        }
        if (records.length === 0) records = ["International Professional", "National Team Cap"];

        const playerDoc = {
            playerId: playerId.toString(),
            name: bestMatch.name || bestMatch.title,
            sport: 'Cricket',
            teamName: country,
            role: bestMatch.playingRole || deep.role || 'Professional Cricketer',
            battingStyle: deep.battingStyle || '',
            bowlingStyle: deep.bowlingStyle || '',
            country: country,
            imageId: deep.faceImageId || bestMatch.faceImageId || bestMatch.imageId,
            bio: cleanBio,
            records: records.slice(0, 5)
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
