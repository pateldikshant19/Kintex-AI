const mongoose = require('mongoose');

const playerHealthEventSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  articleId: { type: String }, // To link back to specific article hash
  sourceUrl: { type: String },
  sourceName: { type: String },
  sourceReliability: { type: Number, min: 0, max: 100 }, // 0 to 100 score
  
  eventType: { 
    type: String, 
    enum: [
      'Injury', 'Recovery', 'Training', 'Match Availability', 
      'Rest', 'Medical Update', 'Fatigue', 'Fitness Update', 'Unknown'
    ],
    default: 'Unknown'
  },
  
  bodyPart: { type: String },
  injuryType: { type: String },
  severity: { type: String },
  
  matchStatus: { type: String },
  trainingStatus: { type: String },
  availabilityStatus: { type: String },
  recoveryMention: { type: Boolean, default: false },
  
  confidence: { type: Number, min: 0, max: 100 }, // Extraction confidence score
  
  eventDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.models.PlayerHealthEvent || mongoose.model('PlayerHealthEvent', playerHealthEventSchema);
