const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const diagnose = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get all Users
        const users = await User.find({});
        console.log('\n--- SYSTEM USERS ---');
        users.forEach(u => {
            console.log(`User: "${u.name}" | Role: ${u.role} | Team: "${u.teamName}" | Email: ${u.email}`);
        });

        // 2. Get all Teams from Players
        const teams = await Player.distinct('teamName');
        console.log('\n--- AVAILABLE TEAMS (Player Collection) ---');
        console.log(teams.sort());

        // 3. Simulated Match Check
        console.log('\n--- MATCH DIAGNOSIS ---');
        for (const u of users) {
            if (u.role === 'manager' || u.role === 'analyst') {
                const userTeam = u.teamName || '';
                // Simulating the actual backend regex logic
                const regex = new RegExp(`^${userTeam}$`, 'i');
                const count = await Player.countDocuments({ teamName: { $regex: regex } });

                console.log(`User "${u.name}" (Team: "${userTeam}") -> Matches ${count} players in DB.`);

                if (count === 0) {
                    console.log(`   [ALERT] User "${u.name}" sees 0 players! Mis-match detected.`);
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

diagnose();
