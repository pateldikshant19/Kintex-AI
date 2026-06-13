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
    score: [{
        r: Number,
        w: Number,
        o: Number,
        inning: String
    }],
    updatedAt: { type: Date, default: Date.now }
}, { 
    collection: 'live_matches',
    timestamps: false
});

module.exports = mongoose.model('LiveMatch', liveMatchSchema);
