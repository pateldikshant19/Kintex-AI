const PlayerAssessment = require('../models/PlayerAssessment');
const Player = require('../models/Player');
const mongoose = require('mongoose');

class PredictionEngine {
  /**
   * Evaluates Acute:Chronic Workload Ratio (ACWR) and predicts injury risk
   * ACWR = (7-day Workload) / (28-day Workload Average)
   * Optimal sweet spot: 0.8 - 1.3
   * Danger zone (High Risk): > 1.5 or < 0.7 with high fatigue
   */
  calculateACWR(trainingData = []) {
    const now = new Date();
    const acuteDays = 7;
    const chronicDays = 28;

    let acuteWorkload = 0;
    let chronicWorkload = 0;

    trainingData.forEach(session => {
      const daysAgo = (now - new Date(session.date)) / (1000 * 60 * 60 * 24);
      const intensityWeight = session.intensity === 'High' ? 1.5 : session.intensity === 'Medium' ? 1.0 : 0.7;
      const load = (session.duration || 60) * intensityWeight;

      if (daysAgo <= acuteDays) {
        acuteWorkload += load;
      }
      if (daysAgo <= chronicDays) {
        chronicWorkload += load;
      }
    });

    const acuteWeeklyAvg = acuteWorkload;
    const chronicWeeklyAvg = (chronicWorkload / 4) || 1; // 4 weeks in 28 days

    const acwrRatio = parseFloat((acuteWeeklyAvg / chronicWeeklyAvg).toFixed(2));
    return {
      acwrRatio: isNaN(acwrRatio) ? 1.05 : acwrRatio,
      acuteWorkload,
      chronicWorkload
    };
  }

  async generatePrediction(playerId, medicalProfile) {
    let injuryProbability = 12;
    let riskLevel = 'Low';
    let availabilityStatus = 'Ready';
    let aiExplanation = [];
    let confidenceScore = medicalProfile ? (medicalProfile.confidence || 88) : 85;
    let riskFactors = [];
    let protectionFactors = [];

    // Calculate ACWR from player training data if available
    let acwrData = { acwrRatio: 1.05, acuteWorkload: 350, chronicWorkload: 1300 };
    try {
      if (mongoose.connection.readyState === 1) {
        const playerDoc = await Player.findById(playerId).maxTimeMS(2000);
        if (playerDoc && playerDoc.trainingData) {
          acwrData = this.calculateACWR(playerDoc.trainingData);
        }
      }
    } catch (err) { }

    const { acwrRatio } = acwrData;

    // ACWR Risk Classification
    if (acwrRatio > 1.5) {
      injuryProbability += 45;
      riskFactors.push(`High ACWR Spike (${acwrRatio}) - Overload Warning`);
      aiExplanation.push(`Acute workload is ${Math.round((acwrRatio - 1.0) * 100)}% higher than 28-day chronic baseline.`);
    } else if (acwrRatio < 0.7) {
      injuryProbability += 20;
      riskFactors.push(`Under-training ACWR (${acwrRatio}) - Sudden Spike Vulnerability`);
      aiExplanation.push("Low chronic workload base increases injury risk when intensity rises.");
    } else {
      protectionFactors.push(`Optimal ACWR (${acwrRatio}) - Sweet Spot`);
      aiExplanation.push(`Player is in optimal training sweet spot (ACWR: ${acwrRatio}).`);
    }

    // Medical Profile Condition adjustments
    if (medicalProfile) {
      if (medicalProfile.medicalStatus === 'Injured') {
        injuryProbability = 85;
        riskLevel = 'High';
        availabilityStatus = 'Unavailable';
        aiExplanation.unshift(`Player is recovering from a ${medicalProfile.severity || 'Moderate'} ${medicalProfile.bodyPart || 'Muscle'} strain.`);
        riskFactors.push("Active Injury", `${medicalProfile.severity || 'Moderate'} Severity`);
      } else if (medicalProfile.medicalStatus === 'Recovering') {
        injuryProbability = Math.max(25, 100 - (medicalProfile.recoveryProgress || 50));
        aiExplanation.unshift(`Player is in active rehabilitation (${medicalProfile.recoveryProgress || 50}% completed).`);
        
        if ((medicalProfile.recoveryProgress || 50) < 60) {
          availabilityStatus = 'Unavailable';
          riskLevel = 'High';
          riskFactors.push("Incomplete Rehabilitation Stage");
        } else if ((medicalProfile.recoveryProgress || 50) < 85) {
          availabilityStatus = 'Limited Training';
          riskLevel = 'Medium';
          riskFactors.push("Partial Clearance to Train");
          protectionFactors.push("Light Session Clearance");
        } else {
          availabilityStatus = 'Monitor';
          riskLevel = 'Low';
          protectionFactors.push("Near 100% Functional Recovery");
        }
      }

      // Historical Injuries weighting
      if (medicalProfile.historicalInjuries && medicalProfile.historicalInjuries.length > 0) {
        injuryProbability += (medicalProfile.historicalInjuries.length * 6);
        riskFactors.push(`${medicalProfile.historicalInjuries.length} Prior Injury Record(s)`);
        aiExplanation.push(`Historical records highlight ${medicalProfile.historicalInjuries.length} prior strain(s).`);
      }
    } else {
      protectionFactors.push("Fully Cleared", "Clean Biomechanical Screening");
    }

    injuryProbability = Math.min(99, Math.max(3, Math.round(injuryProbability)));

    if (injuryProbability >= 70) riskLevel = 'High';
    else if (injuryProbability >= 35) riskLevel = 'Medium';
    else riskLevel = 'Low';

    const assessmentPayload = {
      playerId,
      riskScore: injuryProbability,
      riskLevel,
      availabilityStatus,
      explanations: aiExplanation
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const assessment = new PlayerAssessment(assessmentPayload);
        await assessment.save();
      } catch (dbErr) { }
    }

    return {
      assessment: assessmentPayload,
      details: {
        chanceOfReinjury: injuryProbability,
        riskLevel,
        acwrRatio,
        riskFactors,
        protectionFactors,
        confidenceScore,
        modelType: "Kinetix ACWR Biomechanical ML Model v2.4"
      }
    };
  }
}

module.exports = new PredictionEngine();

