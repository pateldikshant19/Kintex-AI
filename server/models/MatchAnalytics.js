const mongoose = require('mongoose');

const MatchAnalyticsSchema = new mongoose.Schema({
    matchId: { type: String, required: true, unique: true },
    sport: { type: String, required: true },
    situation: String,
    minuteOrPhase: Number,
    playerFatigueLevel: Number,
    teamMorale: Number,
    weatherIndex: Number,
    injuryRiskScore: Number,
    historicalWinRate: Number,
    realTimePerformanceScore: Number,
    aiPredictedWinProbability: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchAnalytics', MatchAnalyticsSchema);
