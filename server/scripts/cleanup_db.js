const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Player = require('../models/Player');
const Performance = require('../models/Performance');
const MatchAnalytics = require('../models/MatchAnalytics');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const ALLOWED_SPORTS = ['football', 'cricket', 'track_and_field'];

const POSITIONS = {
    football: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger', 'Full-back'],
    cricket: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'],
    track_and_field: ['Sprinter', 'Marathon Runner', 'Jumper', 'Thrower', 'Decathlete']
};

const REAL_NAMES = {
    first: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Paul', 'Mark', 'George', 'Steven', 'Edward', 'Brian', 'Ronald', 'Kevin', 'Jason', 'Jeff'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson']
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateName = () => `${getRandom(REAL_NAMES.first)} ${getRandom(REAL_NAMES.last)}`;

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

async function deleteUnwantedSports() {
    console.log('\n--- DELETING UNWANTED SPORTS DATA ---');

    // 1. Match Analytics
    const matchRes = await MatchAnalytics.deleteMany({ sport: { $nin: ALLOWED_SPORTS } });
    console.log(`Deleted ${matchRes.deletedCount} MatchAnalytics records (not in ${ALLOWED_SPORTS.join(', ')})`);

    // 2. Performance
    const perfRes = await Performance.deleteMany({ sport: { $nin: ALLOWED_SPORTS } });
    console.log(`Deleted ${perfRes.deletedCount} Performance records`);

    // 3. Players
    const playerRes = await Player.deleteMany({ sport: { $nin: ALLOWED_SPORTS } });
    console.log(`Deleted ${playerRes.deletedCount} Player records`);
}

async function populateMissingValues() {
    console.log('\n--- POPULATING MISSING VALUES AND UPDATING NAMES ---');

    const players = await Player.find({ sport: { $in: ALLOWED_SPORTS } });
    let updatedCount = 0;

    for (const player of players) {
        let isUpdated = false;

        // 1. Update Name if it looks generic
        if (player.name.includes('Player') || !player.name) {
            player.name = generateName();
            isUpdated = true;
        }

        // 2. Update Position if Unknown or missing
        if (!player.position || player.position === 'Unknown') {
            const validPositions = POSITIONS[player.sport] || ['Athlete'];
            player.position = getRandom(validPositions);
            isUpdated = true;
        }

        // 3. Update Physical Stats if generic (180/75 was default) or missing
        if (!player.physicalStats || (player.physicalStats.height === 180 && player.physicalStats.weight === 75)) {
            // Randomize slightly
            const baseHeight = 170 + Math.random() * 25; // 170-195cm
            const baseWeight = 65 + Math.random() * 30;  // 65-95kg
            const bodyFat = 5 + Math.random() * 10;      // 5-15%

            player.physicalStats = {
                height: Math.round(baseHeight),
                weight: Math.round(baseWeight),
                bodyFatPercentage: parseFloat(bodyFat.toFixed(1))
            };
            isUpdated = true;
        }

        if (isUpdated) {
            await player.save();
            updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} players with realistic names, positions, and physical stats.`);
}

async function main() {
    await connectDB();
    await deleteUnwantedSports();
    await populateMissingValues();

    console.log('\nDatabase cleanup and enrichment complete.');
    process.exit(0);
}

main();
