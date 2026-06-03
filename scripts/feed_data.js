const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Player = require('../server/models/Player');
const Performance = require('../server/models/Performance');
const MatchAnalytics = require('../server/models/MatchAnalytics');
// We need User to assign managerId if we create players, but it's optional in schema. 
// We will try to find one or skip.

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const JSON_FILE = path.join(__dirname, '../ai_ml_graph_predictable_sports_data.json');
const CSV_FILE = path.join(__dirname, '../ai_real_time_sports_prediction_dataset.csv');

const SPORTS = ['football', 'cricket', 'track_and_field', 'basketball', 'tennis'];

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
    console.log('Processing JSON data...');
    const rawData = fs.readFileSync(JSON_FILE);
    const events = JSON.parse(rawData);

    // Group by sport
    const eventsBySport = {};
    for (const event of events) {
        if (!eventsBySport[event.sport]) eventsBySport[event.sport] = [];
        eventsBySport[event.sport].push(event);
    }

    let totalInserted = 0;

    for (const sport of Object.keys(eventsBySport)) {
        const players = await getOrCreatePlayers(sport);
        const sportEvents = eventsBySport[sport];

        const performanceDocs = sportEvents.map((event, index) => {
            const player = players[index % players.length];
            return {
                playerId: player._id,
                sport: event.sport,
                date: event.timestamp,
                situation: event.situation,
                eventId: event.event_id,
                metrics: {}, // Legacy object empty
                physical_metrics: event.physical_metrics,
                detailed_performance_metrics: event.performance_metrics, // map to new field
                environmental_factors: event.environmental_factors,
                risk_scores: event.risk_scores,
                ai_targets: event.ai_targets,
                overallScore: event.performance_metrics?.recent_form_index || 0
            };
        });

        // Batch insert
        await Performance.insertMany(performanceDocs);
        console.log(`Inserted ${performanceDocs.length} performance records for ${sport}`);
        totalInserted += performanceDocs.length;
    }
    console.log(`Total JSON Performance records inserted: ${totalInserted}`);
}

async function processCSV() {
    console.log('Processing CSV data...');
    const results = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => {
                // Map CSV fields to schema (camelCase)
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
                    // Use bulkWrite for upsert to avoid duplicates if run multiple times
                    const ops = results.map(doc => ({
                        updateOne: {
                            filter: { matchId: doc.matchId },
                            update: { $set: doc },
                            upsert: true
                        }
                    }));

                    if (ops.length > 0) {
                        const res = await MatchAnalytics.bulkWrite(ops);
                        console.log(`Upserted ${res.upsertedCount + res.modifiedCount} match analytics records.`);
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

    // Check if we already have data to avoid double seeding (simple check)
    // Actually, upsert is handled in CSV, but JSON is append-only here.
    // Let's clear relevant Performance data if it looks like a seed run? 
    // Or just append. User said "feed the data". I'll assume append is okay or I should check uniqueness.
    // The JSON has 'event_id'. I added 'eventId' to schema. I should use upsert for JSON too.

    // Re-doing processJSON with upsert logic for safety
    await processJSON_Safe();
    await processCSV();

    console.log('Data feed complete.');
    process.exit(0);
}

async function processJSON_Safe() {
    console.log('Processing JSON data (Safe Upsert)...');
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
            // MongoDB bulkWrite has limit of 100k ops, we have 70k total, might be fine per sport.
            // But splitting into chunks of 1000 is safer.
            const CHUNK_SIZE = 1000;
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

main();
