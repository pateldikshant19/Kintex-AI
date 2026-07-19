const fs = require('fs');
const path = require('path');
const timelineService = require('./timelineService');
const ruleEngine = require('./ruleEngine');
const PlayerRecovery = require('../models/PlayerRecovery');
const PlayerMedicalProfile = require('../models/PlayerMedicalProfile');

class RecoveryEngine {
  constructor() {
    this.loadMapping();
  }

  loadMapping() {
    try {
      const mappingPath = path.join(__dirname, '../config/recoveryMapping.json');
      const rawData = fs.readFileSync(mappingPath, 'utf8');
      this.mapping = JSON.parse(rawData);
    } catch (err) {
      console.error('[RecoveryEngine] Failed to load recovery mapping:', err.message);
      this.mapping = {};
    }
  }

  /**
   * Run the recovery estimation engine for a player
   */
  async estimateRecovery(playerId) {
    this.loadMapping(); // Reload mapping to allow hot-edits without restart
    
    // 1. Consume Timeline Service & Medical Profile
    const activeInjury = await timelineService.getActiveInjury(playerId);
    const profile = await PlayerMedicalProfile.findOne({ playerId });
    const recoveryHistory = await timelineService.getRecoveryHistory(playerId);

    const reasons = [];
    let estimatedReturnDays = null;
    let recoveryWindow = "Unknown";
    let progressStatus = "Unknown";
    let confidence = 0;

    // If there's no active injury, they are either fully recovered or never injured.
    if (!activeInjury) {
      if (recoveryHistory && recoveryHistory.length > 0) {
        progressStatus = "Fully Recovered";
        reasons.push("Player has recent recovery events indicating fitness.");
      } else {
        progressStatus = "Unknown";
        reasons.push("No active injuries found on record.");
      }
      
      const recoveryResult = new PlayerRecovery({
        playerId,
        estimatedReturnDays: 0,
        recoveryWindow: "0 Days",
        progressStatus,
        confidence: 100,
        reasons
      });
      await recoveryResult.save();
      return recoveryResult;
    }

    // Determine Base Mapping from Active Injury
    let mapData = null;
    const bodyPart = (activeInjury.bodyPart || "").toLowerCase();
    const injuryType = (activeInjury.injuryType || "").toLowerCase();
    const severity = (activeInjury.severity || "default").toLowerCase();

    // 2. Resolve mapping logic
    // First try a specific body part mapping (like acl, hamstring, calf)
    if (this.mapping[bodyPart]) {
      if (this.mapping[bodyPart][severity]) {
        mapData = this.mapping[bodyPart][severity];
        reasons.push(`Latest article reported ${severity} ${bodyPart} issue.`);
      } else if (this.mapping[bodyPart]["default"]) {
        mapData = this.mapping[bodyPart]["default"];
        reasons.push(`Latest article reported ${bodyPart} issue.`);
      }
    }
    
    // If no body part match, try injury type mapping (strain, tear, knock)
    if (!mapData && this.mapping[injuryType]) {
      if (this.mapping[injuryType][bodyPart]) {
         mapData = this.mapping[injuryType][bodyPart];
         reasons.push(`Latest article reported ${bodyPart} ${injuryType}.`);
      } else if (this.mapping[injuryType]["default"]) {
         mapData = this.mapping[injuryType]["default"];
         reasons.push(`Latest article reported ${injuryType}.`);
      } else if (this.mapping[injuryType].minDays) {
         mapData = this.mapping[injuryType];
         reasons.push(`Latest article reported ${injuryType}.`);
      }
    }

    // Fallbacks
    if (!mapData) {
      if (severity === 'minor') mapData = this.mapping['minor'];
      else if (severity === 'major') mapData = this.mapping['tear'];
    }

    if (mapData) {
      recoveryWindow = mapData.label;
      // Average the days for a single point estimate
      estimatedReturnDays = Math.ceil((mapData.minDays + mapData.maxDays) / 2);
      
      // Calculate how many days have passed since the injury event
      const daysSinceInjury = Math.floor((new Date() - new Date(activeInjury.eventDate)) / (1000 * 60 * 60 * 24));
      
      // Adjust estimation
      estimatedReturnDays = Math.max(0, estimatedReturnDays - daysSinceInjury);
      
      confidence = activeInjury.confidence > 0 ? activeInjury.confidence : 80;
    } else {
      reasons.push(`Could not map a specific recovery window for: ${bodyPart} ${injuryType}`);
      confidence = 40;
    }

    // 3. Determine Progress Status
    // Look at Medical Profile
    if (profile) {
      if (profile.recoveryProgress < 50) {
        progressStatus = "In Rehab";
        reasons.push("Player has not yet returned to full training.");
      } else if (profile.recoveryProgress < 90) {
        progressStatus = "Light Training";
        reasons.push("Player has resumed light training activities.");
        confidence = Math.min(100, confidence + 10); 
      } else if (profile.recoveryProgress < 100) {
        progressStatus = "Near Return";
        reasons.push("Player is being monitored and is near full fitness.");
      } else {
        progressStatus = "Fully Recovered";
      }
    } else {
      progressStatus = "In Rehab"; // Default assumption if injured
      reasons.push("Player has not yet returned to training.");
    }

    // 4. Store Assessment in MongoDB
    const recoveryResult = new PlayerRecovery({
      playerId,
      estimatedReturnDays,
      recoveryWindow,
      progressStatus,
      confidence,
      reasons
    });

    await recoveryResult.save();

    return recoveryResult;
  }
}

module.exports = new RecoveryEngine();
