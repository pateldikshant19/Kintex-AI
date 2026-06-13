const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust if needed

const Player = require('../models/Player');
const Team = require('../models/Team');

async function migratePlayers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/sport-analytics', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB for migration.");

        const players = await Player.find({});
        console.log(`Found ${players.length} players to migrate.`);

        const teams = await Team.find({});
        const teamMap = {};
        teams.forEach(t => {
            teamMap[t.name.toLowerCase()] = t;
            if (t.shortName) {
                teamMap[t.shortName.toLowerCase()] = t;
            }
        });

        let updatedCount = 0;

        for (let player of players) {
            let changesMade = false;

            // Set defaults if not set
            if (player.active === undefined) {
                player.active = true;
                changesMade = true;
            }
            if (player.retired === undefined) {
                player.retired = false;
                changesMade = true;
            }

            // Map teamName to currentTeamId and activeLeagueIds
            if (player.teamName && !player.currentTeamId) {
                const team = teamMap[player.teamName.toLowerCase()];
                if (team) {
                    player.currentTeamId = team.teamId;
                    player.activeLeagueIds = team.leagueIds || [];
                    changesMade = true;
                } else {
                    console.log(`Warning: Could not find team ID for player ${player.name} with teamName: ${player.teamName}`);
                    // Fallback to assign dummy ID or just leave blank
                }
            }

            if (changesMade) {
                await player.save();
                updatedCount++;
            }
        }

        console.log(`Migration completed. Updated ${updatedCount} players.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migratePlayers();
