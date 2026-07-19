const PlayerMedicalProfile = require('../models/PlayerMedicalProfile');
const PlayerHealthEvent = require('../models/PlayerHealthEvent');

class MedicalProfileBuilder {
  /**
   * Translates NLP severity into a comparable weight
   */
  getSeverityWeight(severity) {
    const s = (severity || '').toLowerCase();
    const weights = {
      'minor': 1, 'mild': 1, 'suspected': 2,
      'major': 3, 'severe': 4, 'season-ending': 5
    };
    return weights[s] || 0;
  }

  /**
   * Translates recovery status to progress percentage
   */
  getRecoveryProgress(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('cleared') || s.includes('fit')) return 100;
    if (s.includes('full training')) return 90;
    if (s.includes('light training')) return 70;
    if (s.includes('recovering') || s.includes('rehab')) return 40;
    if (s.includes('ruled out') || s.includes('missed')) return 10;
    return 50;
  }

  /**
   * Build or update the medical profile based on the latest events
   */
  async buildOrUpdateProfile(playerId, newEvents = []) {
    let profile = await PlayerMedicalProfile.findOne({ playerId });
    
    if (!profile) {
      profile = new PlayerMedicalProfile({ playerId });
    }

    // Sort new events oldest to newest to replay them
    const sortedEvents = newEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    for (const event of sortedEvents) {
      // Add source to articles if not present
      if (event.sourceUrl && !profile.sourceArticles.includes(event.sourceUrl)) {
        profile.sourceArticles.push(event.sourceUrl);
        // keep only last 10 sources
        if (profile.sourceArticles.length > 10) profile.sourceArticles.shift();
      }

      if (event.eventType === 'Injury') {
        // If it's a new injury or worse severity, update the main profile
        const currentSeverityWeight = this.getSeverityWeight(profile.severity);
        const newSeverityWeight = this.getSeverityWeight(event.severity);
        
        // Is it the same injury being reported again?
        const isSameInjury = (profile.bodyPart === event.bodyPart) && 
           (new Date(event.eventDate) - new Date(profile.injuryDate) < 1000 * 60 * 60 * 24 * 30); // within 30 days

        if (!profile.latestInjury || !isSameInjury || newSeverityWeight >= currentSeverityWeight) {
          // If it's a completely new injury, move current to historical
          if (profile.latestInjury && !isSameInjury && profile.recoveryProgress >= 80) {
            profile.historicalInjuries.push({
              injury: profile.latestInjury,
              bodyPart: profile.bodyPart,
              severity: profile.severity,
              date: profile.injuryDate,
              recoveryDays: Math.floor((new Date(event.eventDate) - new Date(profile.injuryDate)) / (1000 * 60 * 60 * 24)),
              status: 'Recovered'
            });
          }

          profile.latestInjury = event.injuryType || 'Unknown Injury';
          if (event.bodyPart) profile.bodyPart = event.bodyPart;
          if (event.severity) profile.severity = event.severity;
          if (!isSameInjury || !profile.injuryDate) profile.injuryDate = event.eventDate;
          
          profile.medicalStatus = 'Injured';
          profile.recoveryProgress = 10; // Reset progress
          profile.confidence = event.confidence || 60;
        } else {
          // It's the same injury but just another report. We increase confidence.
          profile.confidence = Math.min(100, profile.confidence + 10);
        }
      } 
      else if (event.eventType === 'Recovery') {
        profile.medicalStatus = 'Recovering';
        profile.recoveryProgress = Math.max(profile.recoveryProgress, this.getRecoveryProgress(event.recoveryMention ? 'recovering' : 'fit'));
        profile.confidence = Math.min(100, profile.confidence + 15);
      }
      else if (event.eventType === 'Match Availability') {
        if (event.matchStatus === 'fit' || event.matchStatus === 'available') {
          profile.medicalStatus = 'Cleared';
          profile.recoveryProgress = 100;
        } else if (event.matchStatus === 'ruled out' || event.matchStatus === 'unavailable') {
          profile.medicalStatus = 'Injured';
          profile.recoveryProgress = Math.min(profile.recoveryProgress, 20);
        }
        profile.confidence = Math.min(100, profile.confidence + 10);
      }
      else if (event.eventType === 'Training') {
        profile.trainingStatus = event.trainingStatus || 'Unknown';
        profile.recoveryProgress = Math.max(profile.recoveryProgress, this.getRecoveryProgress(event.trainingStatus));
        if (event.trainingStatus === 'full training' || event.trainingStatus === 'training normally') {
            profile.medicalStatus = 'Cleared';
        }
        profile.confidence = Math.min(100, profile.confidence + 10);
      }
    }

    // Auto-heal logic: if injury date is very old and no recent news, assume recovered (e.g. > 6 months)
    if (profile.medicalStatus === 'Injured' && profile.injuryDate) {
      const daysSinceInjury = (new Date() - new Date(profile.injuryDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceInjury > 180) {
        profile.medicalStatus = 'Cleared';
        profile.recoveryProgress = 100;
        profile.trainingStatus = 'training normally';
      }
    }

    await profile.save();
    return profile;
  }
}

module.exports = new MedicalProfileBuilder();
