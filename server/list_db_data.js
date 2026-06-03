const mongoose = require('mongoose');
const User = require('./models/User');
const Player = require('./models/Player');
const Performance = require('./models/Performance');
const Injury = require('./models/Injury');
require('dotenv').config();

const listData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('\n--- USERS ---');
        console.log(JSON.stringify(users, null, 2));

        const players = await Player.find({});
        console.log('\n--- PLAYERS ---');
        console.log(JSON.stringify(players, null, 2));

        const performance = await Performance.find({});
        console.log('\n--- PERFORMANCE RECORDS ---');
        console.log(JSON.stringify(performance, null, 2));

        const injuries = await Injury.find({});
        console.log('\n--- INJURY RECORDS ---');
        console.log(JSON.stringify(injuries, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        console.log('\nConnection closed');
    }
};

listData();
