const PlayerHealthEvent = require('../models/PlayerHealthEvent');

class TimelineService {
  /**
   * Generates a timeline sorted by Event Date (Chronological)
   * Groups events by date to support multiple events on the same day.
   * Reads only from the PlayerHealthEvent Collection.
   */
  async getTimelineByPlayer(playerId) {
    // Read directly from PlayerHealthEvent collection
    const events = await PlayerHealthEvent.find({ playerId }).sort({ eventDate: 1 }); // 1 = Ascending (Oldest to Newest)
    
    // Group events by Date
    const groupedTimeline = {};
    
    for (const event of events) {
      // Create a clean date string key (YYYY-MM-DD)
      const dateKey = event.eventDate.toISOString().split('T')[0];
      
      if (!groupedTimeline[dateKey]) {
        groupedTimeline[dateKey] = [];
      }
      
      groupedTimeline[dateKey].push(event);
    }
    
    return groupedTimeline;
  }

  /**
   * Retrieves the raw list of events in chronological order (flat array)
   */
  async generateTimeline(playerId) {
    let events = await PlayerHealthEvent.find({ playerId }).sort({ eventDate: 1 });
    
    // Generate generic mock wellness events if no history exists and in mock mode
    if (events.length === 0 && process.env.ENABLE_MOCK_MEDICAL_DATA === 'true') {
      const today = new Date();
      events = [
        {
          eventType: 'Medical Update',
          eventDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          description: 'Routine pre-season fitness assessment',
          isMockData: true
        },
        {
          eventType: 'Training',
          eventDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          description: 'High intensity workload monitoring',
          isMockData: true
        },
        {
          eventType: 'Recovery',
          eventDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          description: 'Scheduled post-match recovery and cryotherapy session',
          isMockData: true
        }
      ];
    }
    
    return events;
  }

  /**
   * Gets the most recent health event for a player
   */
  async getLatestHealthEvent(playerId) {
    return await PlayerHealthEvent.findOne({ playerId }).sort({ eventDate: -1 }); // -1 = Descending (Newest first)
  }

  /**
   * Retrieves the current active injury if one exists
   * Returns the most recent 'Injury' event if no subsequent 'Recovery' event has occurred
   */
  async getActiveInjury(playerId) {
    // Fetch all events sorted by newest first
    const recentEvents = await PlayerHealthEvent.find({ playerId }).sort({ eventDate: -1 });
    
    for (const event of recentEvents) {
      if (event.eventType === 'Recovery' || event.eventType === 'Match Availability' && event.matchStatus === 'fit') {
        // Player has recovered since their last injury
        return null;
      }
      if (event.eventType === 'Injury') {
        // We found the most recent injury without a subsequent recovery
        return event;
      }
    }
    
    return null;
  }

  /**
   * Gets the history of all recovery events for a player
   */
  async getRecoveryHistory(playerId) {
    return await PlayerHealthEvent.find({ 
      playerId, 
      eventType: { $in: ['Recovery', 'Medical Update'] },
      recoveryMention: true
    }).sort({ eventDate: 1 });
  }
}

module.exports = new TimelineService();
