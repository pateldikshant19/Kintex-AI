const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const checkData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check specific team
        const teamName = 'ROYAL CHALLENGERS';
        const players = await Player.find({ teamName: teamName });
        console.log(`Found ${players.length} players for '${teamName}'`);

        if (players.length === 0) {
            // Check flexible regex
            const regexPlayers = await Player.find({ teamName: { $regex: new RegExp(teamName, 'i') } });
            console.log(`Found ${regexPlayers.length} players for '${teamName}' (case insensitive)`);

            if (regexPlayers.length === 0) {
                // List all unique team names
                const allPlayers = await Player.find({}, 'teamName');
                const uniqueTeams = [...new Set(allPlayers.map(p => p.teamName))];
                console.log('Available Teams in DB:', uniqueTeams);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
