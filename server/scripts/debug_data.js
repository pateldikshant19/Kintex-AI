const mongoose = require('mongoose');
const Player = require('../models/Player');
const User = require('../models/User'); // Assuming User model exists
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const debugData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Check distinct team names in Players
        const teams = await Player.distinct('teamName');
        console.log('\n--- Teams in Player Collection ---');
        console.log(teams);

        // 2. Check Users and their teamNames
        const users = await User.find({});
        console.log('\n--- Users and their Team Names ---');
        users.forEach(u => {
            console.log(`User: ${u.name}, Role: ${u.role}, Team: '${u.teamName}', Sport: '${u.sport}'`);
        });

        // 3. Test the regex matching for "Royal Challengers" (simulating the issue)
        const testTeamName = "Royal Challengers";
        // Note: I'll try to find a user with this name to be precise, but hardcoding for a quick check

        const strictFilter = { teamName: testTeamName }; // What it was before
        const regexFilter = { teamName: { $regex: new RegExp(`^${testTeamName}$`, 'i') } }; // What I changed it to

        const strictCount = await Player.countDocuments(strictFilter);
        const regexCount = await Player.countDocuments(regexFilter);

        console.log('\n--- Query Test for "Royal Challengers" ---');
        console.log(`Strict Match Count: ${strictCount}`);
        console.log(`Regex Match Count: ${regexCount}`);

        // 4. Test with trimming (hypothesis: maybe whitespace?)
        const regexTrimFilter = { teamName: { $regex: new RegExp(`^${testTeamName.trim()}$`, 'i') } };
        const regexTrimCount = await Player.countDocuments(regexTrimFilter);
        console.log(`Regex (Trimmed) Match Count: ${regexTrimCount}`);


    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

debugData();
