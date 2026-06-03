const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    sport: { type: String, required: true },
    date: { type: Date, default: Date.now },
    metrics: {
        // Sport-specific metrics (Legacy/Specific)
        football: {
            goals: Number,
            assists: Number,
            passAccuracy: Number,
            distanceCovered: Number
        },
        cricket: {
            runs: Number,
            wickets: Number,
            strikeRate: Number,
            average: Number
        },
        trackField: {
            time: Number,
            distance: Number,
            personalBest: Boolean
        }
    },
    // AI/ML Data Fields
    physical_metrics: {
        fatigue_level: Number,
        heart_rate: Number,
        speed: Number,
        reaction_time_ms: Number
    },
    detailed_performance_metrics: { // Renamed from JSON 'performance_metrics' to avoid conflict, or merge? keeping separate for clarity
        accuracy: Number,
        success_rate: Number,
        recent_form_index: Number
    },
    environmental_factors: {
        weather_index: Number,
        temperature_c: Number,
        humidity: Number
    },
    risk_scores: {
        injury_risk: Number,
        error_probability: Number
    },
    ai_targets: {
        win_probability: Number,
        performance_drop_next_5min: Number
    },
    situation: String, // from JSON
    eventId: String, // from JSON
    overallScore: Number
}, { timestamps: true });

// Check if model exists before compiling to avoid "OverwriteModelError"
module.exports = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);
