const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  shortName: { type: String },
  imageId: { type: Number },
  country: { type: String },
  leagueIds: [{ type: Number }], // Associated leagues
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);
