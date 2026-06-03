const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Player = require('../models/Player');
const Performance = require('../models/Performance');
const Injury = require('../models/Injury');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

async function checkData() {
    try {
        await mongoose.connect(MONGO_URI);
        const playerCount = await Player.countDocuments();
        const perfCount = await Performance.countDocuments();
        const injCount = await Injury.countDocuments();

        console.log(`Players: ${playerCount}`);
        console.log(`Performances: ${perfCount}`);
        console.log(`Injuries: ${injCount}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkData();
