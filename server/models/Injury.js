const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ['minor', 'moderate', 'severe'], required: true },
    bodyPart: { type: String, required: true },
    dateOccurred: { type: Date, required: true },
    expectedRecovery: Date,
    actualRecovery: Date,
    treatment: String,
    status: { type: String, enum: ['active', 'recovering', 'recovered'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.models.Injury || mongoose.model('Injury', injurySchema);
