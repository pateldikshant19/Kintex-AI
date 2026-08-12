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
   * Get Live Matches (with 120-second caching to prevent overscraping)
   */
  async getLiveMatches() {
    if (this.liveMatchesCache && this.lastLiveMatchesFetchTime && (Date.now() - this.lastLiveMatchesFetchTime < 120000)) {
       console.log(`[CricketDataProvider] Returning cached Live Matches (Cache age: ${Math.round((Date.now() - this.lastLiveMatchesFetchTime)/1000)}s)`);
       return this.liveMatchesCache;
    }

    let matches = [];
    const cheerio = require('cheerio');
    console.log(`[CricketDataProvider] Scraping Live Matches from Cricbuzz...`);
    
    const axiosGetWithRetry = async (url, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await axios.get(url, {
             headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
          });
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
      }
    };

    try {
        const { data } = await axiosGetWithRetry('https://www.cricbuzz.com/cricket-match/live-scores', 3);
        const $ = cheerio.load(data);
        
        $('a[href^="/live-cricket-scores/"]').each((i, el) => {
            const link = $(el);
            const titleAttr = link.attr('title') || '';
            const href = link.attr('href') || '';
            const matchIdMatch = href.match(/\/live-cricket-scores\/(\d+)\//);
            const matchId = matchIdMatch ? matchIdMatch[1] : `scraped-${Math.random()}`;
            
            const parseScoreStr = (str) => {
                if (!str) return { runs: 0, wickets: 0, overs: 0 };
                let runs = 0, wickets = 0, overs = 0;
                const match = str.match(/(\d+)-?(\d*)\s*\(?(\d+\.?\d*)/);
                if (match) {
                    runs = parseInt(match[1]) || 0;
                    wickets = match[2] ? parseInt(match[2]) : 10;
                    overs = parseFloat(match[3]) || 0;
                } else if (str.includes('/')) {
                    const parts = str.split(' ')[0].split('/');
                    runs = parseInt(parts[0]) || 0;
                    wickets = parseInt(parts[1]) || 0;
                } else if (!isNaN(parseInt(str))) {
                    runs = parseInt(str);
                    wickets = 10;
                }
                return { runs, wickets, overs };
            };

            let team1Name = '', team1ScoreStr = '', team2Name = '', team2ScoreStr = '', status = 'Upcoming';
            
            const teamElements = link.find('.flex.items-center.gap-4.justify-between');
            if (teamElements.length >= 2) {
                const team1Block = $(teamElements[0]);
                const team2Block = $(teamElements[1]);
                team1Name = team1Block.find('span.hidden.wb\\:block').text().trim() || team1Block.text().trim();
                team1ScoreStr = team1Block.find('span.w-1\\/2').text().trim();
                team2Name = team2Block.find('span.hidden.wb\\:block').text().trim() || team2Block.text().trim();
                team2ScoreStr = team2Block.find('span.w-1\\/2').text().trim();
                const spans = link.find('span');
                status = spans.last().text().trim();
            } else {
                const simpleName = link.find('.text-white').first().text().trim();
                if (simpleName && simpleName.includes(' vs ')) {
                    const parts = simpleName.split(' vs ');
                    team1Name = parts[0].trim();
                    team2Name = parts[1].trim();
                    if (titleAttr.includes(' - ')) {
                        status = titleAttr.split(' - ').pop().trim();
                    }
                }
            }

            if (team1Name && team2Name) {
                const uniqueId = `${team1Name} vs ${team2Name}`;
                const s1 = parseScoreStr(team1ScoreStr);
                const s2 = parseScoreStr(team2ScoreStr);
                
                const existingIndex = matches.findIndex(m => m.name === uniqueId);
                const matchObj = {
                    id: matchId,
                    matchId: matchId,
                    name: uniqueId,
                    status: status,
                    venue: 'TBA',
                    date: new Date().toISOString(),
                    score: [{
                        team1Score: { inngs1: { runs: s1.runs, wickets: s1.wickets, overs: s1.overs } },
                        team2Score: { inngs1: { runs: s2.runs, wickets: s2.wickets, overs: s2.overs } }
                    }]
                };
                
                if (existingIndex !== -1) {
                   if (team1ScoreStr || team2ScoreStr) {
                       matches[existingIndex] = matchObj;
                   }
                } else {
                   matches.push(matchObj);
                }
            }
        });

    } catch (err) {
        console.error('[CricketDataProvider] Scraper Error:', err.message);
    }
    
    // Sort matches: Live first
    matches.sort((a, b) => {
        const isLive = (m) => {
            if (!m.score || m.score.length === 0) return false;
            const s1 = m.score[0].team1Score?.inngs1?.runs > 0;
            const s2 = m.score[0].team2Score?.inngs1?.runs > 0;
            // Also consider active if status is not 'Complete', 'Won', 'Preview', 'Upcoming'
            const activeStatus = !['Complete', 'Preview', 'Upcoming Match'].includes(m.status) && !m.status.includes('Won');
            return s1 || s2 || activeStatus;
        };
        const liveA = isLive(a);
        const liveB = isLive(b);
        if (liveA && !liveB) return -1;
        if (!liveA && liveB) return 1;
        return 0;
    });

    this.liveMatchesCache = matches;
    this.lastLiveMatchesFetchTime = Date.now();

    return matches;
  }
}

module.exports = new CricketDataProvider();
