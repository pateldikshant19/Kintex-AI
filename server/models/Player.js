const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Optional link to User account
  sport: { type: String, required: true },
  teamName: { type: String, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  position: { type: String, required: true },
  jerseyNumber: Number,
  dateOfBirth: Date,
  bio: String,
  playingStyle: String,
  records: [String],
  debutSeason: String,
  internationalTeam: String,
  weaknesses: [String],
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
    type: String,
    severity: String,
    recoveryTime: Number
  }],
  trainingData: [{
    date: Date,
    duration: Number,
    intensity: String,
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);