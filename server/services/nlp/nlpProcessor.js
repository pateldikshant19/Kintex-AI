const PlayerHealthEvent = require('../../models/PlayerHealthEvent');
const Player = require('../../models/Player');
const crypto = require('crypto');
const medicalProfileBuilder = require('../medicalProfileBuilder');

class NLPProcessor {
  constructor() {
    this.dictionaries = {
      bodyParts: ['hamstring', 'knee', 'ankle', 'groin', 'calf', 'shoulder', 'back', 'thigh', 'quadricep', 'concussion'],
      injuryTypes: ['tear', 'strain', 'sprain', 'fracture', 'niggle', 'knock', 'discomfort', 'tightness', 'cramp', 'limping', 'physio called', 'retired hurt', 'holding', 'pain'],
      severities: ['minor', 'major', 'severe', 'mild', 'suspected', 'season-ending'],
      matchStatus: ['ruled out', 'doubtful', 'fit', 'available', 'unavailable', 'missed', 'rested', 'did not play', 'returned to field', 'returned to bat', 'bowling resumed'],
      trainingStatus: ['missed practice', 'returned training', 'light training', 'full training', 'training normally'],
      recovery: ['recovering', 'rehab', 'cleared', 'declared match fit', 'healing'],
      eventTypes: {
        'Injury': ['tear', 'strain', 'fracture', 'knock', 'tightness', 'limping', 'retired hurt', 'physio called', 'holding', 'pain'],
        'Recovery': ['recovering', 'cleared', 'rehab', 'declared match fit', 'returned to field', 'returned to bat', 'bowling resumed'],
        'Training': ['training', 'practice', 'training normally'],
        'Match Availability': ['ruled out', 'doubtful', 'fit', 'did not play'],
        'Rest': ['rested'],
        'Fatigue': ['tired', 'fatigue', 'exhausted', 'cramp']
      }
    };
  }

  /**
   * Generates a hash for the article to use as articleId
   */
  generateArticleHash(article) {
    const rawString = `${article.title}-${article.publishedDate}-${article.source}`;
    return crypto.createHash('md5').update(rawString).digest('hex');
  }

  /**
   * Assign reliability score based on the source
   */
  calculateSourceReliability(sourceName) {
    const src = (sourceName || '').toLowerCase();
    if (src.includes('official') || src.includes('club website') || src.includes('medical')) return 95;
    if (src.includes('espn') || src.includes('bbc') || src.includes('skysports')) return 90;
    if (src.includes('cricbuzz') || src.includes('cricinfo')) return 85;
    if (src.includes('sportskeeda') || src.includes('goal')) return 70;
    return 40; // Default for unknown blogs
  }

  /**
   * Core heuristic NLP logic
   */
  extractEntities(text) {
    const content = (text || '').toLowerCase();
    const entities = {
      bodyPart: null,
      injuryType: null,
      severity: null,
      matchStatus: null,
      trainingStatus: null,
      recoveryMention: false,
      eventType: 'Unknown',
      confidence: 0
    };

    let matchedKeywords = 0;

    // Helper to find matches
    const findMatch = (dictionary) => dictionary.find(word => content.includes(word));

    entities.bodyPart = findMatch(this.dictionaries.bodyParts);
    if (entities.bodyPart) matchedKeywords++;

    entities.injuryType = findMatch(this.dictionaries.injuryTypes);
    if (entities.injuryType) matchedKeywords++;

    entities.severity = findMatch(this.dictionaries.severities);
    if (entities.severity) matchedKeywords++;

    entities.matchStatus = findMatch(this.dictionaries.matchStatus);
    if (entities.matchStatus) matchedKeywords++;

    entities.trainingStatus = findMatch(this.dictionaries.trainingStatus);
    if (entities.trainingStatus) matchedKeywords++;

    const recoveryMatch = findMatch(this.dictionaries.recovery);
    if (recoveryMatch) {
      entities.recoveryMention = true;
      matchedKeywords++;
    }

    // Determine Event Type based on rules
    for (const [type, keywords] of Object.entries(this.dictionaries.eventTypes)) {
      if (keywords.some(k => content.includes(k))) {
        entities.eventType = type;
        matchedKeywords++;
        break; // Take the first matched category
      }
    }

    // Default to Medical Update if a body part is mentioned but no clear event type
    if (entities.eventType === 'Unknown' && entities.bodyPart) {
      entities.eventType = 'Medical Update';
    }

    // Calculate Confidence
    entities.confidence = this.calculateConfidence(matchedKeywords);

    return entities;
  }

  calculateConfidence(matchedKeywords) {
    // Hybrid scoring simulation: 
    // If we match 4+ keywords, highly confident (95%)
    // If 2-3 keywords, moderately confident (80-85%)
    // If 1 keyword, lower confidence (60%)
    if (matchedKeywords >= 4) return 95;
    if (matchedKeywords === 3) return 85;
    if (matchedKeywords === 2) return 80;
    if (matchedKeywords === 1) return 60;
    return 0; // No relevant entities found
  }

  async duplicateEventChecker(playerId, entities, date, sourceName) {
    const existing = await PlayerHealthEvent.findOne({
      playerId,
      eventType: entities.eventType,
      injuryType: entities.injuryType,
      bodyPart: entities.bodyPart,
      sourceName: sourceName,
      eventDate: date
    });
    return !!existing;
  }

  /**
   * Process a batch of articles and store extracted events
   */
  async processArticlesBatch(articles, searchPlayerName = null) {
    const processedEvents = [];

    for (const article of articles) {
      // Create a combined text block from title and content
      const fullText = `${article.title} ${article.content}`;
      
      const entities = this.extractEntities(fullText);
      
      // If we didn't find any relevant sports health entities, skip
      if (entities.confidence === 0) continue;

      // Extract Player Name (Using the provided context search name if available, else skip)
      // Advanced NER would extract the name from the text itself.
      // For this implementation, since we fetch news based on a player's name query, 
      // we assume the article is about them if their name appears in the text.
      const assumedPlayerName = searchPlayerName;
      if (!assumedPlayerName || !fullText.toLowerCase().includes(assumedPlayerName.toLowerCase())) {
        continue; // Ignore if the requested player is not actually mentioned
      }

      // Find player in DB
      const regex = new RegExp(`^${assumedPlayerName}$`, 'i');
      const player = await Player.findOne({ name: regex });
      
      if (!player) continue; // Ignore if no matching player exists

      const articleId = this.generateArticleHash(article);
      const eventDate = new Date(article.publishedDate);
      const sourceRel = this.calculateSourceReliability(article.source);

      // Check Duplicates
      const isDuplicate = await this.duplicateEventChecker(player._id, entities, eventDate, article.source);
      if (isDuplicate) continue;

      // Create new Event
      const newEvent = new PlayerHealthEvent({
        playerId: player._id,
        articleId,
        sourceUrl: article.url,
        sourceName: article.source,
        sourceReliability: sourceRel,
        
        eventType: entities.eventType,
        bodyPart: entities.bodyPart,
        injuryType: entities.injuryType,
        severity: entities.severity,
        matchStatus: entities.matchStatus,
        trainingStatus: entities.trainingStatus,
        availabilityStatus: entities.matchStatus || 'Unknown',
        recoveryMention: entities.recoveryMention,
        confidence: entities.confidence,
        
        eventDate
      });

      await newEvent.save();
      processedEvents.push(newEvent);
    }
    
    if (processedEvents.length > 0 && processedEvents[0].playerId) {
      await medicalProfileBuilder.buildOrUpdateProfile(processedEvents[0].playerId, processedEvents);
    }

    return processedEvents;
  }

  /**
   * Retrieve all events for a specific player
   */
  async getPlayerEvents(playerId) {
    return await PlayerHealthEvent.find({ playerId }).sort({ eventDate: -1 }); // Newest first
  }
}

module.exports = new NLPProcessor();
