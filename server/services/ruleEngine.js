const fs = require('fs');
const path = require('path');
const timelineService = require('./timelineService');
const PlayerAssessment = require('../models/PlayerAssessment');

class RuleEngine {
  constructor() {
    this.loadRules();
  }

  loadRules() {
    try {
      const rulesPath = path.join(__dirname, '../config/injuryRules.json');
      const rawData = fs.readFileSync(rulesPath, 'utf8');
      this.rules = JSON.parse(rawData);
    } catch (err) {
      console.error('[RuleEngine] Failed to load rules configuration:', err.message);
      this.rules = {};
    }
  }

  /**
   * Run the rule engine on a player's timeline and store the assessment
   */
  async assessPlayer(playerId) {
    // Reload rules so they are editable without restarting the server
    this.loadRules();
    
    // 1. Consume Timeline Service (Do not process articles/NLP)
    const timeline = await timelineService.generateTimeline(playerId);
    
    let totalScore = 0;
    const explanations = [];
    
    // Count occurrences for better explainable AI
    const bodyPartCounts = {};
    let missedMatchCount = 0;
    let missedTrainingCount = 0;
    let returnToTrainingCount = 0;

    // Time decay logic can be added later. For now, we sum up recent history.
    // We only process the last 30 days of events to ensure relevance.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEvents = timeline.filter(e => e.eventDate >= thirtyDaysAgo);

    for (const event of recentEvents) {
      // Body Part Rules
      if (event.bodyPart && this.rules.bodyPart[event.bodyPart]) {
        totalScore += this.rules.bodyPart[event.bodyPart];
        bodyPartCounts[event.bodyPart] = (bodyPartCounts[event.bodyPart] || 0) + 1;
      }
      
      // Match Status Rules
      if (event.matchStatus && this.rules.matchStatus[event.matchStatus]) {
        totalScore += this.rules.matchStatus[event.matchStatus];
        if (event.matchStatus === 'missed' || event.matchStatus === 'ruled out') {
          missedMatchCount++;
        }
      }
      
      // Training Status Rules
      if (event.trainingStatus && this.rules.trainingStatus[event.trainingStatus]) {
        totalScore += this.rules.trainingStatus[event.trainingStatus];
        if (event.trainingStatus === 'missed practice') missedTrainingCount++;
        if (event.trainingStatus === 'returned training') returnToTrainingCount++;
      }
      
      // Event Type Rules
      if (event.eventType && this.rules.eventType[event.eventType]) {
        totalScore += this.rules.eventType[event.eventType];
      }
      
      // Severity Rules
      if (event.severity && this.rules.severity[event.severity]) {
        totalScore += this.rules.severity[event.severity];
      }
    }

    // 2. Generate Explainable AI Reasons
    for (const [part, count] of Object.entries(bodyPartCounts)) {
      if (count > 0) explanations.push(`${part.charAt(0).toUpperCase() + part.slice(1)} mentioned ${count} time(s) in the last 30 days`);
    }
    
    if (missedMatchCount > 0) explanations.push(`Missed ${missedMatchCount} match(es) recently`);
    if (missedTrainingCount > 0) explanations.push(`Missed ${missedTrainingCount} training session(s) recently`);
    if (returnToTrainingCount === 0 && missedMatchCount > 0) explanations.push(`No return-to-training reports since missing matches`);
    
    if (totalScore === 0 && recentEvents.length === 0) {
      explanations.push('No recent health events recorded');
    }

    // Ensure score doesn't drop below 0 for display logic
    if (totalScore < 0) totalScore = 0;

    // 3. Determine Risk Level
    let riskLevel = 'Low';
    if (totalScore >= this.rules.thresholds.risk.High) riskLevel = 'High';
    else if (totalScore >= this.rules.thresholds.risk.Medium) riskLevel = 'Medium';

    // 4. Determine Availability Status
    let availabilityStatus = 'Ready';
    if (totalScore >= this.rules.thresholds.availability.Unavailable) availabilityStatus = 'Unavailable';
    else if (totalScore >= this.rules.thresholds.availability['Limited Training']) availabilityStatus = 'Limited Training';
    else if (totalScore >= this.rules.thresholds.availability.Monitor) availabilityStatus = 'Monitor';

    // 5. Store Assessment in MongoDB
    const assessment = new PlayerAssessment({
      playerId,
      riskScore: totalScore,
      riskLevel,
      availabilityStatus,
      explanations
    });

    await assessment.save();

    return assessment;
  }
  
  /**
   * Get the latest assessment for a player without recalculating
   */
  async getLatestAssessment(playerId) {
    return await PlayerAssessment.findOne({ playerId }).sort({ assessedAt: -1 });
  }
}

module.exports = new RuleEngine();
