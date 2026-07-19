const mongoose = require('mongoose');

const playerMedicalProfileSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, unique: true },
  
  latestInjury: { type: String, default: null },
  bodyPart: { type: String, default: null },
  severity: { type: String, default: null },
  injuryDate: { type: Date, default: null },
  
  trainingStatus: { type: String, default: 'training normally' },
  medicalStatus: { type: String, default: 'fit' },
  expectedReturn: { type: String, default: 'Ready' },
  recoveryProgress: { type: Number, default: 100 }, // Percentage
  confidence: { type: Number, default: 100 },
  
  historicalInjuries: [{
    injury: String,
    bodyPart: String,
    severity: String,
    date: Date,
    recoveryDays: Number,
    matchesMissed: Number,
    status: String
  }],
  
  riskFactors: [{ type: String }],
  
  sourceArticles: [{ type: String }] // Array of source URLs
}, { timestamps: true });

module.exports = mongoose.models.PlayerMedicalProfile || mongoose.model('PlayerMedicalProfile', playerMedicalProfileSchema);
