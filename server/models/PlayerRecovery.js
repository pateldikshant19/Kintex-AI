const mongoose = require('mongoose');

const playerRecoverySchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  
  estimatedReturnDays: { type: Number },
  recoveryWindow: { type: String },
  progressStatus: { type: String, enum: ['Not Started', 'In Rehab', 'Light Training', 'Near Return', 'Fully Recovered', 'Unknown'] },
  
  confidence: { type: Number, min: 0, max: 100 },
  
  reasons: [{ type: String }],
  
  assessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.PlayerRecovery || mongoose.model('PlayerRecovery', playerRecoverySchema);
