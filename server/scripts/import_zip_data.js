const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Player = require('../models/Player');
const Performance = require('../models/Performance');
const Injury = require('../models/Injury');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

// Map of JSON filenames to sport string in DB
const FILES = {
    'football_players.json': 'football',
    'cricket_players.json': 'cricket',
    'track_and_field_players.json': 'track_and_field'
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const BODY_PARTS = ['Knee', 'Ankle', 'Hamstring', 'Back', 'Shoulder', 'Groin', 'Calf'];

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

async function importData() {
    await connectDB();

    for (const [filename, sport] of Object.entries(FILES)) {
        const filePath = path.join(__dirname, '../../temp_data', filename);
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${filename} (not found)`);
            continue;
        }

        console.log(`Processing ${filename} (${sport})...`);
        const rawData = fs.readFileSync(filePath, 'utf8');
        let playersData;
        try {
            playersData = JSON.parse(rawData);
        } catch (e) {
            console.error(`Failed to parse JSON for ${filename}:`, e.message);
            continue;
        }

        for (const pData of playersData) {
            try {
                // 1. Create/Save Player
                const playerPayload = {
                    name: pData.name,
                    sport: sport, // Ensure sport matches our constant
                    position: pData.position,
                    jerseyNumber: pData.jerseyNumber,
                    dateOfBirth: pData.dateOfBirth,
                    physicalStats: pData.physicalStats,
                    // We will populate these arrays too for backward compatibility/read ease, 
                    // but the MAIN data is in the separate collections.
                    injuryHistory: [],
                    performanceHistory: []
                };

                const createdPlayer = await Player.create(playerPayload);
                const playerId = createdPlayer._id;

                // 2. Process Injuries -> Injury Collection
                if (pData.injuryHistory && pData.injuryHistory.length > 0) {
                    for (const inj of pData.injuryHistory) {
                        try {
                            const injuryPayload = {
                                playerId: playerId,
                                type: inj.type,
                                severity: inj.severity,
                                bodyPart: getRandom(BODY_PARTS), // Missing in source, randomizing
                                dateOccurred: new Date(inj.date),
                                expectedRecovery: inj.recoveryTime ?
                                    new Date(new Date(inj.date).getTime() + (inj.recoveryTime * 24 * 60 * 60 * 1000)) :
                                    null,
                                status: 'recovered'
                            };

                            await Injury.create(injuryPayload);

                            createdPlayer.injuryHistory.push({
                                date: inj.date,
                                type: inj.type,
                                severity: inj.severity,
                                recoveryTime: inj.recoveryTime
                            });
                        } catch (injErr) {
                            console.error(`Failed to create injury for ${pData.name}: ${injErr.message}`);
                        }
                    }
                }

                // 3. Process Performance -> Performance Collection
                if (pData.performanceHistory && pData.performanceHistory.length > 0) {
                    for (const perf of pData.performanceHistory) {
                        try {
                            const metricsPayload = {};
                            if (sport === 'football') {
                                metricsPayload.football = {
                                    goals: perf.goals || 0,
                                    assists: perf.assists || 0,
                                    passAccuracy: perf.passAccuracy || 0,
                                    distanceCovered: perf.distanceCovered || 0
                                };
                            } else if (sport === 'cricket') {
                                metricsPayload.cricket = {
                                    runs: perf.runs || 0,
                                    wickets: perf.wickets || 0,
                                    strikeRate: perf.strikeRate || 0,
                                    average: perf.average || 0
                                };
                            } else if (sport === 'track_and_field') {
                                metricsPayload.trackField = {
                                    time: perf.time || 0,
                                    distance: perf.distance || 0,
                                    personalBest: perf.personalBest || false
                                };
                            }

                            const performancePayload = {
                                playerId: playerId,
                                sport: sport,
                                date: new Date(perf.date),
                                overallScore: perf.score,
                                metrics: metricsPayload,
                                physical_metrics: {
                                    fatigue_level: Math.floor(Math.random() * 10),
                                    heart_rate: 60 + Math.floor(Math.random() * 100),
                                    speed: Math.random() * 30,
                                    reaction_time_ms: 200 + Math.floor(Math.random() * 100)
                                },
                                situation: perf.context || 'General Play',
                                eventId: 'manual_import_' + Date.now()
                            };

                            await Performance.create(performancePayload);

                            createdPlayer.performanceHistory.push({
                                date: perf.date,
                                score: perf.score,
                                metrics: metricsPayload[sport === 'track_and_field' ? 'trackField' : sport]
                            });
                        } catch (perfErr) {
                            console.error(`Failed to create performance for ${pData.name}: ${perfErr.message}`);
                        }
                    }
                }

                await createdPlayer.save();
            } catch (innerErr) {
                console.error(`Error processing player ${pData.name}:`, innerErr.message);
            }
        }
        console.log(`Finished ${filename}.`);
    }

    console.log('All data imported successfully.');
    process.exit(0);
}

importData();
