const mongoose = require('mongoose');
const Player = require('../models/Player');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const checkData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const players = await Player.find({ teamName: 'ROYAL CHALLENGERS' });
        console.log(`Found ${players.length} players for ROYAL CHALLENGERS`);

        if (players.length > 0) {
            console.log('Sample player:', JSON.stringify(players[0], null, 2));
        } else {
            const allPlayers = await Player.find({});
            console.log(`Total players in DB: ${allPlayers.length}`);
            if (allPlayers.length > 0) {
                console.log('First 5 teams in DB:', allPlayers.slice(0, 5).map(p => p.teamName));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
