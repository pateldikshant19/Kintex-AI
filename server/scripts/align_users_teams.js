const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

// The canonical list of teams we just seeded
const VALID_TEAMS = {
    'Cricket': ['OLYMPICA', 'ROYAL CHALLENGERS', 'MUMBAI INDIANS', 'CHENNAI SUPER KINGS', 'GUJARAT TITANS'],
    'Football': ['LIGASPORT', 'TECHRUN', 'DATA FC', 'REAL MADRID', 'MAN CITY', 'BAYERN MUNICH', 'PSG'],
    'Track & Field': ['USA Athletics', 'Jamaica Sprint Elite', 'Kenya Distance Pro', 'Team Great Britain', 'Australia Athletics', 'India Athletics', 'China Gold Track']
};

const fixUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: { $in: ['manager', 'analyst'] } });

        for (const user of users) {
            let sport = user.sport || 'Football'; // Default if missing
            let validTeams = VALID_TEAMS[sport] || VALID_TEAMS['Football'];

            // Check if current team is valid (case-insensitive)
            const currentTeam = user.teamName || '';
            const isValid = validTeams.some(vt => vt.toLowerCase() === currentTeam.toLowerCase());

            if (!isValid) {
                // Assign a random valid team for their sport
                const newTeam = validTeams[Math.floor(Math.random() * validTeams.length)];

                console.log(`[FIXING] User: ${user.name}`);
                console.log(`   - Invalid Team: "${currentTeam}"`);
                console.log(`   - Assigned New Team: "${newTeam}"`);

                user.teamName = newTeam;
                user.sport = sport; // Ensure sport matches
                await user.save();
            } else {
                console.log(`[OK] User: ${user.name} is managed "${currentTeam}" (Valid).`);
            }
        }

    } catch (error) {
        console.error('Error fixing users:', error);
    } finally {
        mongoose.connection.close();
    }
};

fixUsers();
