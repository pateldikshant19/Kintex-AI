const mongoose = require('mongoose');

const liveMatchSchema = new mongoose.Schema({
    match_id: { type: String, required: true, unique: true },
    name: String,
    status: String,
    venue: String,
    matchType: String,
    leagueId: { type: Number },
    seriesName: String,
    date: String,
    dateTimeGMT: String,
    teams: [String],
    teamA: String,
    teamB: String,
    team1Score: {
        runs: Number,
        wickets: Number,
        overs: Number,
        inngs: String
    },
    team2Score: {
        runs: Number,
        wickets: Number,
        overs: Number,
        inngs: String
    },
    score: [{
        r: Number,
        w: Number,
        o: Number,
        inning: String
    }],
    winProbability: {
        teamA: Number,
        teamB: Number
    },
    updatedAt: { type: Date, default: Date.now }
}, { 
    collection: 'live_matches',
    timestamps: true
});

module.exports = mongoose.models.LiveMatch || mongoose.model('LiveMatch', liveMatchSchema);

