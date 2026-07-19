const newsManager = require('./news');
const nlpProcessor = require('./nlp/nlpProcessor');
const ruleEngine = require('./ruleEngine');
const recoveryEngine = require('./recoveryEngine');
const Player = require('../models/Player');

class LiveMatchEngine {
  constructor() {
    this.intervalId = null;
    // Default to 60 seconds. Configurable via environment variable or config system.
    this.refreshInterval = process.env.LIVE_MATCH_REFRESH_INTERVAL || 60000; 
  }

  /**
   * Start periodic live match monitoring
   */
  startMonitoring() {
    if (this.intervalId) {
      console.log('[LiveMatchEngine] Already running.');
      return { status: 'already_running' };
    }
    
    console.log('[LiveMatchEngine] Starting live match monitoring...');
    
    // Execute immediately on start
    this.monitorActiveMatches();
    
    // Set the recurring interval
    this.intervalId = setInterval(() => {
      this.monitorActiveMatches();
    }, this.refreshInterval);
    
    return { status: 'started', interval: this.refreshInterval };
  }

  /**
   * Stop periodic live match monitoring
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[LiveMatchEngine] Stopped live match monitoring.');
      return { status: 'stopped' };
    }
    return { status: 'not_running' };
  }
  
  /**
   * Get the current status of the engine
   */
  getStatus() {
    return {
      isRunning: !!this.intervalId,
      refreshIntervalMs: this.refreshInterval
    };
  }

  /**
   * Orchestrates the entire pipeline for active players
   */
  async monitorActiveMatches() {
    try {
      console.log('[LiveMatchEngine] Polling for new match events...');
      
      // Fetch players to monitor. In a full system, you might filter by "isCurrentlyPlayingMatch: true"
      // For this implementation, we will poll a subset of active players.
      const activePlayers = await Player.find().limit(50); // Limit to prevent massive API flooding during dev
      
      let totalNewEvents = 0;

      for (const player of activePlayers) {
        // 1. Fetch live news, commentary, and match reports
        const recentNews = await newsManager.getNews(player.name);
        
        if (recentNews.length > 0) {
          // 2. NLP Processing & 3. Duplicate Detection & 4. Database Storage
          const newEvents = await nlpProcessor.processArticlesBatch(recentNews, player.name);
          
          if (newEvents.length > 0) {
            console.log(`[LiveMatchEngine] ${newEvents.length} new event(s) detected for ${player.name}. Triggering automated assessments...`);
            totalNewEvents += newEvents.length;
            
            // 5. Timeline generation is implicitly handled inside the engines below
            
            // 6. Run Rule Engine Assessment based on newly appended events
            await ruleEngine.assessPlayer(player._id);
            
            // 7. Run Recovery Engine Estimation based on the new rules assessment
            await recoveryEngine.estimateRecovery(player._id);
          }
        }
      }
      
      if (totalNewEvents > 0) {
        console.log(`[LiveMatchEngine] Polling cycle complete. Processed ${totalNewEvents} new events.`);
      }
      
    } catch (err) {
      console.error('[LiveMatchEngine] Error during monitoring cycle:', err.message);
    }
  }
}

module.exports = new LiveMatchEngine();
