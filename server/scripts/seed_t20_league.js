require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const League = require('../models/League');
const Team = require('../models/Team');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kinetix-sports';

const runSeed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const leagueId = 2024;
        const leagueName = "ICC Women's T20 World Cup";

        // Upsert League
        await League.findOneAndUpdate(
            { leagueId },
            {
                leagueId,
                name: leagueName,
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // started 10 days ago
                endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // ends in 20 days
                seriesType: "International",
                status: "Live"
            },
            { upsert: true, new: true }
        );
        console.log(`Seeded League: ${leagueName}`);

        // Teams
        const teams = [
            { teamId: 101, name: 'India Women', shortName: 'IND-W', country: 'India', leagueIds: [leagueId] },
            { teamId: 102, name: 'Australia Women', shortName: 'AUS-W', country: 'Australia', leagueIds: [leagueId] },
            { teamId: 103, name: 'New Zealand Women', shortName: 'NZ-W', country: 'New Zealand', leagueIds: [leagueId] }
        ];

        for (const t of teams) {
            await Team.findOneAndUpdate(
                { teamId: t.teamId },
                t,
                { upsert: true, new: true }
            );
        }
        console.log('Seeded Teams: India, Australia, New Zealand');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding league:', err);
        process.exit(1);
    }
};

runSeed();
