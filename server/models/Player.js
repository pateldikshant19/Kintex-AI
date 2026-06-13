const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  // Basic Public Data (Cricbuzz RapidAPI)
  playerId: { type: String, unique: true }, // From RapidAPI
  name: { type: String, required: true },
  sport: { type: String, default: 'Cricket' },
  teamId: { type: Number }, // Link to Team schema
  teamName: { type: String }, // Keep for fallback
  position: { type: String }, // Playing role
  role: { type: String }, // Playing role
  battingStyle: { type: String },
  bowlingStyle: { type: String },
  country: { type: String },
  imageId: { type: Number }, // Cricbuzz image ID
  bio: String,
  records: [{ type: String }], // Real achievements/rankings
  active: { type: Boolean, default: true },
  retired: { type: Boolean, default: false },
  currentTeamId: { type: Number },
  activeLeagueIds: [{ type: Number }], // Supports multiple leagues simultaneously
  updatedAt: { type: Date, default: Date.now },

  // Pro Features (Manager/Analyst Data)
  physicalStats: {
    height: Number,
    weight: Number,
    bodyFatPercentage: Number
  },
  performanceHistory: [{
    date: Date,
    metrics: Object,
    score: Number
  }],
  injuryHistory: [{
    date: Date,
    type: { type: String },
    severity: String,
    recoveryTime: Number
  }],
  trainingData: [{
    date: Date,
    duration: Number,
    intensity: String,
    type: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);