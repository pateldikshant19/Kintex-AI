const mongoose = require('mongoose');

const playerAssessmentSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  
  availabilityStatus: { 
    type: String, 
    enum: ['Ready', 'Monitor', 'Limited Training', 'Unavailable'], 
    required: true 
  },
  
  explanations: [{ type: String }], // Array of reasons
  
  assessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.PlayerAssessment || mongoose.model('PlayerAssessment', playerAssessmentSchema);
