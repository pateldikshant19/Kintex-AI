const mongoose = require('mongoose');
const Player = require('../models/Player');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const debugData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected');

        const dikshant = await User.findOne({ name: { $regex: /Dikshant/i } });
        if (dikshant) {
            console.log(`User Found: '${dikshant.name}'`);
            console.log(`User Team: '${dikshant.teamName}'`);
            console.log(`User Team Length: ${dikshant.teamName.length}`);

            // Heuristic check for whitespace
            if (dikshant.teamName.trim() !== dikshant.teamName) {
                console.log('WARNING: User team name has leading/trailing whitespace!');
            }
        } else {
            console.log('User Dikshant not found.');
        }

        const samplePlayer = await Player.findOne({ teamName: { $regex: /ROYAL/i } });
        if (samplePlayer) {
            console.log(`Player Found: '${samplePlayer.name}'`);
            console.log(`Player Team: '${samplePlayer.teamName}'`);
            console.log(`Player Team Length: ${samplePlayer.teamName.length}`);
        } else {
            console.log('No players found for ROYAL team.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugData();
