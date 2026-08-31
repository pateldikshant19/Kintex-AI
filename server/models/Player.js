const mongoose = require('mongoose');

const formatStatSchema = new mongoose.Schema({
  matches: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  avg: { type: Number, default: 0 },
  sr: { type: Number, default: 0 },
  centuries: { type: Number, default: 0 },
  fifties: { type: Number, default: 0 },
  highScore: { type: String, default: '0' },
  wickets: { type: Number, default: 0 },
  bowlAvg: { type: Number, default: 0 },
  economy: { type: Number, default: 0 },
  bestBowling: { type: String, default: '0/0' },
  catches: { type: Number, default: 0 },
  stumpings: { type: Number, default: 0 }
}, { _id: false });

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
  imageId: { type: String }, // Cricbuzz image ID or URL
  bio: String,
  records: [{ type: String }], // Real achievements/rankings
  active: { type: Boolean, default: true },
  retired: { type: Boolean, default: false },
  currentTeamId: { type: Number },
  activeLeagueIds: [{ type: Number }], // Supports multiple leagues simultaneously
  updatedAt: { type: Date, default: Date.now },

  // Detailed Format Statistics
  stats: {
    test: formatStatSchema,
    odi: formatStatSchema,
    t20i: formatStatSchema,
    ipl: formatStatSchema
  },

  // Career Summary Stats
  careerStats: {
    matches: Number,
    batAvg: Number,
    strikeRate: Number,
    centuries: Number,
    fifties: Number,
    wickets: Number,
    bowlAvg: Number,
    economy: Number
  },

  // Spatial Radar Attributes
  radarMetrics: {
    power: { type: Number, default: 85 },
    speed: { type: Number, default: 80 },
    precision: { type: Number, default: 90 },
    timing: { type: Number, default: 88 },
    endurance: { type: Number, default: 85 },
    technique: { type: Number, default: 92 }
  },

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