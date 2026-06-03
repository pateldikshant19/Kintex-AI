const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    path: String,
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

module.exports = mongoose.model('Visit', visitSchema);
