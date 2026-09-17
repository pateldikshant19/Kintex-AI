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
        
        // 3b. Broadcast real-time Injury Risk & Biometric Telemetry for active players
        const liveInjuryTelemetry = await this.generateLivePlayerInjuryTelemetry();
        this.io.emit('liveInjuryRiskUpdate', liveInjuryTelemetry);

        // Check if any player crossed HIGH risk or ACWR threshold and emit alert
        const highRiskAlerts = liveInjuryTelemetry.filter(p => p.riskLevel === 'HIGH' || p.acwr > 1.5);
        if (highRiskAlerts.length > 0) {
          this.io.emit('liveInjuryAlert', {
            alerts: highRiskAlerts,
            timestamp: new Date().toISOString()
          });
        }
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
   * Generates live biometric & injury prediction model telemetry for active players
   */
  async generateLivePlayerInjuryTelemetry() {
    const pythonBridge = require('./pythonBridge');
    const baseSquad = [
      { id: 'ind-1', name: 'Virat Kohli', role: 'Batter', baseWorkload: 0.65, baseRest: 3, baseHistory: 0.2, age: 35 },
      { id: 'ind-2', name: 'Rohit Sharma', role: 'Captain / Batter', baseWorkload: 0.70, baseRest: 2, baseHistory: 0.3, age: 36 },
      { id: 'ind-3', name: 'Jasprit Bumrah', role: 'Fast Bowler', baseWorkload: 0.88, baseRest: 1, baseHistory: 0.65, age: 30 },
      { id: 'ind-4', name: 'Hardik Pandya', role: 'All Rounder', baseWorkload: 0.82, baseRest: 2, baseHistory: 0.55, age: 30 },
      { id: 'ind-5', name: 'Suryakumar Yadav', role: 'T20 Captain / Batter', baseWorkload: 0.60, baseRest: 4, baseHistory: 0.15, age: 33 },
      { id: 'ind-6', name: 'Rishabh Pant', role: 'Wicket-Keeper Batter', baseWorkload: 0.75, baseRest: 3, baseHistory: 0.40, age: 26 },
      { id: 'ind-7', name: 'Shubman Gill', role: 'Opener / Batter', baseWorkload: 0.55, baseRest: 4, baseHistory: 0.10, age: 24 },
      { id: 'ind-12', name: 'Mohammed Siraj', role: 'Fast Bowler', baseWorkload: 0.85, baseRest: 2, baseHistory: 0.35, age: 29 }
    ];

    const telemetry = [];
    for (const player of baseSquad) {
      // Dynamic live variation to simulate real-time match fluctuations
      const liveHeartRate = Math.floor(125 + Math.random() * 45); // 125 - 170 bpm
      const liveSpeed = parseFloat((16.0 + Math.random() * 12.0).toFixed(1)); // 16 - 28 km/h
      const liveFatigue = parseFloat(Math.min(0.95, Math.max(0.15, (liveHeartRate / 175) * 0.7 + (Math.random() * 0.2))).toFixed(2));
      const liveACWR = parseFloat(Math.min(1.75, Math.max(0.85, player.baseWorkload * 1.35 + (liveFatigue * 0.3))).toFixed(2));

      // Calculate injury prediction via Python / node fallback engine
      const predResult = pythonBridge.fallbackInjuryPrediction(
        player.baseWorkload,
        liveACWR,
        player.baseRest,
        player.baseHistory,
        liveFatigue
      );

      telemetry.push({
        playerId: player.id,
        playerName: player.name,
        role: player.role,
        team: 'India',
        heartRate: liveHeartRate,
        speedKmH: liveSpeed,
        fatigueIndex: liveFatigue,
        acwr: liveACWR,
        workloadIndex: player.baseWorkload,
        restDays: player.baseRest,
        historyIndex: player.baseHistory,
        riskScore: predResult.risk_score,
        riskLevel: predResult.risk_level,
        availabilityStatus: predResult.availability_status,
        contributingFactors: predResult.contributing_factors,
        modelType: predResult.model_type,
        confidenceScore: predResult.confidence_score,
        lastUpdated: new Date().toISOString()
      });
    }

    return telemetry;
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

