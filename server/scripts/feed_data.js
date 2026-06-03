const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
// Adjust path to .env (server/scripts -> server -> root)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Detailed debugging for paths
console.log('Current directory:', __dirname);
console.log('Looking for .env at:', path.join(__dirname, '../../.env'));

const Player = require('../models/Player');
const Performance = require('../models/Performance');
const MatchAnalytics = require('../models/MatchAnalytics');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';
console.log('Mongo URI:', MONGO_URI);

const JSON_FILE = path.join(__dirname, '../../ai_ml_graph_predictable_sports_data.json');
const CSV_FILE = path.join(__dirname, '../../ai_real_time_sports_prediction_dataset.csv');

console.log('JSON File Path:', JSON_FILE);

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

async function getOrCreatePlayers(sport, count = 5) {
    let players = await Player.find({ sport });
    if (players.length < count) {
        const needed = count - players.length;
        console.log(`Creating ${needed} dummy players for ${sport}...`);
        const newPlayers = [];
        for (let i = 0; i < needed; i++) {
            newPlayers.push({
                name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Player ${players.length + i + 1}`,
                sport,
                position: 'Unknown',
                physicalStats: { height: 180, weight: 75 },
                createdAt: new Date()
            });
        }
        const created = await Player.insertMany(newPlayers);
        players = players.concat(created);
    }
    return players;
}

async function processJSON() {
    console.log('Processing JSON data (Safe Upsert)...');
    if (!fs.existsSync(JSON_FILE)) {
        console.error('JSON file not found!');
        return;
    }
    const rawData = fs.readFileSync(JSON_FILE);
    const events = JSON.parse(rawData);

    // Group by sport
    const eventsBySport = {};
    for (const event of events) {
        if (!eventsBySport[event.sport]) eventsBySport[event.sport] = [];
        eventsBySport[event.sport].push(event);
    }

    let totalOps = 0;

    for (const sport of Object.keys(eventsBySport)) {
        const players = await getOrCreatePlayers(sport);
        const sportEvents = eventsBySport[sport];

        const ops = sportEvents.map((event, index) => {
            const player = players[index % players.length];
            return {
                updateOne: {
                    filter: { eventId: event.event_id },
                    update: {
                        $set: {
                            playerId: player._id,
                            sport: event.sport,
                            date: event.timestamp,
                            situation: event.situation,
                            metrics: {},
                            physical_metrics: event.physical_metrics,
                            detailed_performance_metrics: event.performance_metrics,
                            environmental_factors: event.environmental_factors,
                            risk_scores: event.risk_scores,
                            ai_targets: event.ai_targets,
                            overallScore: event.performance_metrics?.recent_form_index || 0
                        }
                    },
                    upsert: true
                }
            };
        });

        if (ops.length > 0) {
            const CHUNK_SIZE = 500;
            for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
                const chunk = ops.slice(i, i + CHUNK_SIZE);
                await Performance.bulkWrite(chunk);
                process.stdout.write('.');
            }
        }
        console.log(` Processed ${ops.length} records for ${sport}`);
        totalOps += ops.length;
    }
    console.log(`\nTotal JSON operations completed: ${totalOps}`);
}

async function processCSV() {
    console.log('Processing CSV data...');
    if (!fs.existsSync(CSV_FILE)) {
        console.error('CSV file not found!');
        return;
    }
    const results = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    matchId: data.match_id,
                    sport: data.sport,
                    situation: data.situation,
                    minuteOrPhase: parseFloat(data.minute_or_phase),
                    playerFatigueLevel: parseFloat(data.player_fatigue_level),
                    teamMorale: parseFloat(data.team_morale),
                    weatherIndex: parseFloat(data.weather_index),
                    injuryRiskScore: parseFloat(data.injury_risk_score),
                    historicalWinRate: parseFloat(data.historical_win_rate),
                    realTimePerformanceScore: parseFloat(data.real_time_performance_score),
                    aiPredictedWinProbability: parseFloat(data.ai_predicted_win_probability),
                    timestamp: new Date()
                });
            })
            .on('end', async () => {
                try {
                    const ops = results.map(doc => ({
                        updateOne: {
                            filter: { matchId: doc.matchId },
                            update: { $set: doc },
                            upsert: true
                        }
                    }));

                    if (ops.length > 0) {
                        const CHUNK_SIZE = 500;
                        for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
                            const chunk = ops.slice(i, i + CHUNK_SIZE);
                            await MatchAnalytics.bulkWrite(chunk);
                        }
                        console.log(`Upserted ${ops.length} match analytics records.`);
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', reject);
    });
}

async function main() {
    await connectDB();
    await processJSON();
    await processCSV();
    console.log('Data feed complete.');
    process.exit(0);
}

main();
