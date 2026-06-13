const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  leagueId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  seriesType: { type: String },
  status: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.League || mongoose.model('League', leagueSchema);
