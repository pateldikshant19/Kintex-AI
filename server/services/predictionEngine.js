const PlayerAssessment = require('../models/PlayerAssessment');
const timelineService = require('./timelineService');

const Player = require('../models/Player');
const crypto = require('crypto');

class PredictionEngine {
  /**
   * Replaces Rule Engine's basic counting mechanism
   * Uses Medical Profile to predict injury risk and availability
   */
  async generatePrediction(playerId, medicalProfile) {
    let injuryProbability = 0;
    let riskLevel = 'Low';
    let availabilityStatus = 'Ready';
    let aiExplanation = [];
    let confidenceScore = medicalProfile ? medicalProfile.confidence : 50;
    let riskFactors = [];
    let protectionFactors = [];

    // If no profile, assume fit (or generate pseudo-random realistic data in mock mode)
    if (!medicalProfile || (medicalProfile.medicalStatus === 'Cleared' && medicalProfile.recoveryProgress === 100)) {
      if (process.env.ENABLE_MOCK_MEDICAL_DATA === 'true') {
        const player = await Player.findById(playerId);
        const playerStr = playerId.toString() + (player ? player.name + player.position : '');
        const hash = crypto.createHash('md5').update(playerStr).digest('hex');
        const hashNum = parseInt(hash.substring(0, 8), 16);
        
        injuryProbability = 3 + (hashNum % 33); // 3 to 35%
        
        if (injuryProbability > 25) {
          availabilityStatus = 'Monitor';
          aiExplanation.push("Workload indicators suggest minor accumulated fatigue.");
          riskFactors.push("High match workload", "Recent travel fatigue");
        } else if (injuryProbability > 15) {
          availabilityStatus = 'Limited Training';
          aiExplanation.push("Player is managing minor soreness but cleared to play.");
          riskFactors.push("Minor muscle soreness");
          protectionFactors.push("Optimal sleep recovery");
        } else {
          availabilityStatus = 'Ready';
          aiExplanation.push("Player exhibits optimal biomechanical parameters and is fully fit.");
          protectionFactors.push("Fully Cleared", "Excellent biomechanical screening");
        }
      } else {
        injuryProbability = 5;
        aiExplanation.push("Player has no active injuries and is fully cleared.");
        protectionFactors.push("Fully Cleared", "100% Recovery Progress");
      }
    } else {
      // Base probability from current status
      if (medicalProfile.medicalStatus === 'Injured') {
        injuryProbability = 85;
        riskLevel = 'High';
        availabilityStatus = 'Unavailable';
        aiExplanation.push(`Player is currently recovering from a ${medicalProfile.severity || ''} ${medicalProfile.bodyPart || ''} injury.`);
        riskFactors.push("Active Injury", `${medicalProfile.severity} Severity`);
      } else if (medicalProfile.medicalStatus === 'Recovering') {
        // Inverse of recovery progress
        injuryProbability = Math.max(20, 100 - medicalProfile.recoveryProgress);
        aiExplanation.push(`Player is in rehab with ${medicalProfile.recoveryProgress}% progress.`);
        
        if (medicalProfile.recoveryProgress < 50) {
          availabilityStatus = 'Unavailable';
          riskLevel = 'High';
          riskFactors.push("Low Recovery Progress");
        } else if (medicalProfile.recoveryProgress < 85) {
          availabilityStatus = 'Limited Training';
          riskLevel = 'Medium';
          riskFactors.push("Incomplete Rehab");
          protectionFactors.push("Returned to Light Training");
        } else {
          availabilityStatus = 'Monitor';
          riskLevel = 'Low';
          protectionFactors.push("Near Full Fitness");
        }
      }

      // Adjust based on historical injuries
      if (medicalProfile.historicalInjuries && medicalProfile.historicalInjuries.length > 0) {
        const recentHistory = medicalProfile.historicalInjuries.filter(h => 
          (new Date() - new Date(h.date)) / (1000 * 60 * 60 * 24) < 365
        );
        
        if (recentHistory.length > 0) {
          injuryProbability += (recentHistory.length * 5); // Add 5% per recent injury
          aiExplanation.push(`Player has a history of ${recentHistory.length} injuries in the past year.`);
          riskFactors.push("Recurring Injury History");
        }
      }
      
      // Training status adjustments
      if (medicalProfile.trainingStatus === 'missed practice') {
        injuryProbability += 15;
        aiExplanation.push("Recently missed practice, indicating possible setback.");
        riskFactors.push("Missed Practice");
      } else if (medicalProfile.trainingStatus === 'full training') {
        injuryProbability = Math.max(5, injuryProbability - 10);
        aiExplanation.push("Resumed full training, reducing re-injury risk.");
        protectionFactors.push("Full Training Resumed");
      }
    }

    // Cap probability
    injuryProbability = Math.min(100, Math.max(0, injuryProbability));

    if (injuryProbability >= 80) riskLevel = 'High';
    else if (injuryProbability >= 40) riskLevel = 'Medium';
    else riskLevel = 'Low';

    // Save assessment to maintain backward compatibility with PlayerAssessment collection
    const assessment = new PlayerAssessment({
      playerId,
      riskScore: injuryProbability,
      riskLevel,
      availabilityStatus,
      explanations: aiExplanation
    });
    
    await assessment.save();

    return {
      assessment,
      details: {
        chanceOfReinjury: injuryProbability,
        riskFactors,
        protectionFactors,
        confidenceScore,
        isMockData: !medicalProfile && process.env.ENABLE_MOCK_MEDICAL_DATA === 'true'
      }
    };
  }
}

module.exports = new PredictionEngine();
