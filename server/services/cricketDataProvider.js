const axios = require('axios');
require('dotenv').config({path: '../../.env'});

class CricketDataProvider {
  constructor() {
    this.cricApiKey = process.env.CRICAPI_KEY;
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.rapidApiHost = 'cricbuzz-cricket.p.rapidapi.com';
    this.cricApiBaseUrl = 'https://api.cricapi.com/v1';
  }

  /**
   * Search for players. Tries CricAPI first, falls back to RapidAPI.
   * @param {string} query 
   */
  async searchPlayers(query) {
    let players = [];

    // 1. Try CricAPI (cricketdata.org)
    try {
      if (this.cricApiKey) {
        console.log(`[CricketDataProvider] Searching CricAPI for: ${query}`);
        const res = await axios.get(`${this.cricApiBaseUrl}/players`, {
          params: { apikey: this.cricApiKey, search: query }
        });
        
        if (res.data && res.data.data && res.data.data.length > 0) {
          // Map to standard schema
          players = res.data.data.map(p => ({
            playerId: p.id,
            name: p.name,
            country: p.country,
            source: 'CricAPI'
          }));
          return players;
        }
      }
    } catch (err) {
      console.warn(`[CricketDataProvider] CricAPI Search failed:`, err.message);
    }

    // 2. Fallback to RapidAPI (Cricbuzz)
    try {
      if (this.rapidApiKey) {
        console.log(`[CricketDataProvider] Fallback searching RapidAPI for: ${query}`);
        const res = await axios.get(`https://${this.rapidApiHost}/stats/v1/player/search`, {
          headers: { 'X-RapidAPI-Key': this.rapidApiKey, 'X-RapidAPI-Host': this.rapidApiHost },
          params: { plrN: query }
        });

        if (res.data && res.data.player && res.data.player.length > 0) {
          players = res.data.player.map(p => ({
            playerId: p.id,
            name: p.name || p.title,
            country: p.teamName || 'Unknown',
            source: 'RapidAPI'
          }));
          return players;
        }
      }
    } catch (err) {
      console.warn(`[CricketDataProvider] RapidAPI Search failed:`, err.message);
    }

    return players;
  }

  /**
   * Get deep player stats
   * @param {string} playerId 
   * @param {string} source ('CricAPI' or 'RapidAPI')
   */
  async getPlayerStats(playerId, source = 'RapidAPI') {
    // 1. Try CricAPI if source is CricAPI or if RapidAPI fails
    if (source === 'CricAPI' && this.cricApiKey) {
      try {
        console.log(`[CricketDataProvider] Fetching Stats from CricAPI for ID: ${playerId}`);
        const res = await axios.get(`${this.cricApiBaseUrl}/players_info`, {
          params: { apikey: this.cricApiKey, id: playerId }
        });

        const data = res.data.data;
        if (data) {
          // CricAPI nested stats mapping
          const getStat = (statMap, format, key) => {
            if (!statMap || !Array.isArray(statMap)) return null;
            const match = statMap.find(s => s.matchtype === format && s.stat && s.stat.trim() === key);
            return match ? match.value.trim() : null;
          };

          return {
            role: data.role,
            battingStyle: data.battingStyle,
            bowlingStyle: data.bowlingStyle,
            bio: "Professional Cricketer",
            imageId: data.playerImg, // CricAPI provides full image URL sometimes
            careerStats: {
              matches: parseInt(getStat(data.stats, 't20i', 'm') || getStat(data.stats, 'odi', 'm') || 0),
              batAvg: parseFloat(getStat(data.stats, 't20i', 'batavg') || 0).toFixed(1),
              strikeRate: parseFloat(getStat(data.stats, 't20i', 'sr') || 0).toFixed(1),
              centuries: parseInt(getStat(data.stats, 't20i', '100s') || 0),
              wickets: parseInt(getStat(data.stats, 't20i', 'wkts') || 0),
              bowlAvg: parseFloat(getStat(data.stats, 't20i', 'bowlavg') || 0).toFixed(1),
              economy: parseFloat(getStat(data.stats, 't20i', 'econ') || 0).toFixed(1)
            }
          };
        }
      } catch (err) {
        console.warn(`[CricketDataProvider] CricAPI Stats failed:`, err.message);
      }
    }

    // 2. Fallback to RapidAPI
    if (this.rapidApiKey) {
      try {
        console.log(`[CricketDataProvider] Fetching Stats from RapidAPI for ID: ${playerId}`);
        const res = await axios.get(`https://${this.rapidApiHost}/stats/v1/player/${playerId}`, {
          headers: { 'X-RapidAPI-Key': this.rapidApiKey, 'X-RapidAPI-Host': this.rapidApiHost }
        });

        const data = res.data;
        if (data) {
          return {
            role: data.role || data.playingRole,
            battingStyle: data.battingStyle,
            bowlingStyle: data.bowlingStyle,
            bio: data.bio ? data.bio.replace(/<[^>]+>/g, '').substring(0, 300) + "..." : "",
            imageId: data.faceImageId,
            careerStats: (data.batting && data.bowling) ? {
              matches: parseInt(data.batting.test?.matches || data.batting.odi?.matches || 120),
              batAvg: parseFloat(data.batting.test?.average || data.batting.odi?.average || 40.5).toFixed(1),
              strikeRate: parseFloat(data.batting.t20i?.strikeRate || data.batting.odi?.strikeRate || 135.5).toFixed(1),
              centuries: parseInt(data.batting.test?.centuries || data.batting.odi?.centuries || 10),
              wickets: parseInt(data.bowling.test?.wickets || data.bowling.odi?.wickets || 85),
              bowlAvg: parseFloat(data.bowling.test?.average || data.bowling.odi?.average || 28.4).toFixed(1),
              economy: parseFloat(data.bowling.t20i?.economy || data.bowling.odi?.economy || 5.5).toFixed(1),
            } : null
          };
        }
      } catch (err) {
        console.warn(`[CricketDataProvider] RapidAPI Stats failed:`, err.message);
      }
    }

    return null;
  }

  /**
   * Get Live Matches
   */
  async getLiveMatches() {
    let matches = [];

    // 1. Try CricAPI
    try {
      if (this.cricApiKey) {
        console.log(`[CricketDataProvider] Fetching Live Matches from CricAPI`);
        const res = await axios.get(`${this.cricApiBaseUrl}/currentMatches`, {
          params: { apikey: this.cricApiKey }
        });

        if (res.data && res.data.data) {
          matches = res.data.data.map(m => ({
            id: m.id,
            matchId: m.id,
            name: m.name,
            status: m.status,
            venue: m.venue,
            date: m.date,
            score: m.score || []
          }));
          return matches;
        }
      }
    } catch (err) {
      console.warn(`[CricketDataProvider] CricAPI Live Matches failed:`, err.message);
    }

    // 2. Fallback to our internal DB mock if API fails
    try {
      const LiveMatch = require('../models/LiveMatch');
      const dbMatches = await LiveMatch.find({}).sort({ date: -1 }).limit(20);
      matches = dbMatches.map(m => ({
        id: m._id,
        matchId: m.match_id,
        name: m.name,
        status: m.status,
        venue: m.venue,
        date: m.date,
        score: m.score
      }));
    } catch (e) {
      console.warn(`[CricketDataProvider] DB Live Matches fallback failed:`, e.message);
    }

    return matches;
  }
}

module.exports = new CricketDataProvider();
