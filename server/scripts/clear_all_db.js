const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Player = require('../models/Player');
const Performance = require('../models/Performance');
const MatchAnalytics = require('../models/MatchAnalytics');
const Injury = require('../models/Injury');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

async function clearDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Clearing all data...');

        const users = await User.deleteMany({});
        console.log(`Deleted ${users.deletedCount} Users`);

        const players = await Player.deleteMany({});
        console.log(`Deleted ${players.deletedCount} Players`);

        const performances = await Performance.deleteMany({});
        console.log(`Deleted ${performances.deletedCount} Performance records`);

        const matchAnalytics = await MatchAnalytics.deleteMany({});
        console.log(`Deleted ${matchAnalytics.deletedCount} MatchAnalytics records`);

        const injuries = await Injury.deleteMany({});
        console.log(`Deleted ${injuries.deletedCount} Injury records`);

        console.log('Database cleared successfully.');
    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

clearDatabase();
