const mongoose = require('mongoose');
const cricketDataProvider = require('./cricketDataProvider');
const LiveMatch = require('../models/LiveMatch');
const Player = require('../models/Player');
const newsManager = require('./news');
const nlpProcessor = require('./nlp/nlpProcessor');
const ruleEngine = require('./ruleEngine');
const recoveryEngine = require('./recoveryEngine');

class LiveMatchEngine {
  constructor() {
    this.intervalId = null;
    this.refreshInterval = parseInt(process.env.LIVE_MATCH_REFRESH_INTERVAL || '10000', 10);
    this.io = null;
  }

  /**
   * Bind Socket.IO instance to the engine
   */
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Start periodic live match polling & Socket.IO telemetry stream
   */
  startMonitoring(io = null) {
    if (io) this.io = io;

    if (this.intervalId) {
      console.log('[LiveMatchEngine] Monitoring already active.');
      return { status: 'already_running', interval: this.refreshInterval };
    }

    console.log(`[LiveMatchEngine] Starting live match monitoring daemon (${this.refreshInterval}ms interval)...`);
    
    // Execute immediately on start
    this.pollAndBroadcastMatches();

    // Set recurring interval
    this.intervalId = setInterval(() => {
      this.pollAndBroadcastMatches();
    }, this.refreshInterval);

    return { status: 'started', interval: this.refreshInterval };
  }

  /**
   * Stop periodic monitoring
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[LiveMatchEngine] Stopped live match monitoring daemon.');
      return { status: 'stopped' };
    }
    return { status: 'not_running' };
  }

  getStatus() {
    return {
      isRunning: !!this.intervalId,
      refreshIntervalMs: this.refreshInterval
    };
  }

  /**
   * Primary polling worker:
   * 1. Fetches normalized live matches from CricAPI/RapidAPI/Scraper
   * 2. Persists updated match states to MongoDB LiveMatch collection
   * 3. Simulates ball progression for active match 'c1' if active
   * 4. Emits real-time Socket.IO events to connected web clients
   */
  async pollAndBroadcastMatches() {
    try {
      // 1. Fetch normalized live matches from data provider
      const matches = await cricketDataProvider.getLiveMatches();

      if (!matches || matches.length === 0) return;

      // 2. Persist live match updates to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        for (const match of matches) {
          try {
            await LiveMatch.findOneAndUpdate(
              { match_id: match.id },
              {
                $set: {
                  match_id: match.id,
                  name: match.name,
                  status: match.statusText || match.status,
                  venue: match.venue,
                  teamA: match.teamA,
                  teamB: match.teamB,
                  team1Score: {
                    runs: match.teamA_Raw?.runs || 0,
                    wickets: match.teamA_Raw?.wickets || 0,
                    overs: match.teamA_Raw?.overs || 0
                  },
                  team2Score: {
                    runs: match.teamB_Raw?.runs || 0,
                    wickets: match.teamB_Raw?.wickets || 0,
                    overs: match.teamB_Raw?.overs || 0
                  },
                  score: match.score,
                  winProbability: match.winProbability,
                  date: match.date,
                  updatedAt: new Date()
                }
              },
              { upsert: true, new: true }
            );
          } catch (dbErr) {
            console.warn(`[LiveMatchEngine] MongoDB save warning for ${match.id}:`, dbErr.message);
          }
        }
      }

      // 3. Emit global live matches update over Socket.IO
      if (this.io) {
        this.io.emit('liveMatchesUpdate', matches);
      }

      // 4. Run background news/NLP check for top players periodically (20% of ticks)
      if (Math.random() < 0.20) {
        this.monitorActivePlayerNews();
      }

    } catch (err) {
      console.error('[LiveMatchEngine] Polling cycle error:', err.message);
    }
  }

  /**
   * Monitor news & trigger NLP processing for active players
   */
  async monitorActivePlayerNews() {
    try {
      if (mongoose.connection.readyState !== 1) return;
      const activePlayers = await Player.find().limit(5).maxTimeMS(2000);

      for (const player of activePlayers) {
        const recentNews = await newsManager.getNews(player.name).catch(() => []);
        if (recentNews.length > 0) {
          const newEvents = await nlpProcessor.processArticlesBatch(recentNews, player.name).catch(() => []);
          if (newEvents && newEvents.length > 0) {
            await ruleEngine.assessPlayer(player._id).catch(() => {});
            await recoveryEngine.estimateRecovery(player._id).catch(() => {});
          }
        }
      }
    } catch (err) { }
  }
}

module.exports = new LiveMatchEngine();

