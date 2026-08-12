const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Visit = require('../models/Visit');
const Player = require('../models/Player');
const Team = require('../models/Team');
const League = require('../models/League');
const Performance = require('../models/Performance');
const Injury = require('../models/Injury');
const LiveMatch = require('../models/LiveMatch');
const PlayerAssessment = require('../models/PlayerAssessment');
const PlayerHealthEvent = require('../models/PlayerHealthEvent');
const PlayerMedicalProfile = require('../models/PlayerMedicalProfile');
const PlayerRecovery = require('../models/PlayerRecovery');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-analytics';

async function seedAdminPanelData() {
    try {
        console.log('Connecting to MongoDB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        // 1. Seed Users
        console.log('--- Seeding Users ---');
        const defaultPassword = 'password123';
        const sampleUsers = [
            { name: 'System Admin', email: 'admin@test.com', password: defaultPassword, role: 'admin', sport: 'All', teamName: 'Kinetix Global' },
            { name: 'Senior System Admin', email: 'superadmin@kinetix.ai', password: defaultPassword, role: 'admin', sport: 'All', teamName: 'Kinetix Ops' },
            { name: 'India Cricket Manager', email: 'manager@test.com', password: defaultPassword, role: 'manager', sport: 'Cricket', teamName: 'India' },
            { name: 'RCB Team Manager', email: 'rcb.manager@ipl.com', password: defaultPassword, role: 'manager', sport: 'Cricket', teamName: 'Royal Challengers Bengaluru' },
            { name: 'Real Madrid Manager', email: 'manager.realmadrid@football.org', password: defaultPassword, role: 'manager', sport: 'Football', teamName: 'Real Madrid' },
            { name: 'Lakers Head Coach', email: 'coach@lakers.nba', password: defaultPassword, role: 'manager', sport: 'Basketball', teamName: 'LA Lakers' },
            { name: 'Lead Sports Analyst', email: 'analyst@test.com', password: defaultPassword, role: 'analyst', sport: 'Cricket', teamName: 'Kinetix Analytics' },
            { name: 'Biometrics Specialist', email: 'bio.analyst@kinetix.ai', password: defaultPassword, role: 'analyst', sport: 'Football', teamName: 'Kinetix BioLab' },
            { name: 'Performance Analyst', email: 'perf.analyst@kinetix.ai', password: defaultPassword, role: 'analyst', sport: 'Basketball', teamName: 'Kinetix BioLab' },
            { name: 'Virat Kohli', email: 'virat.kohli@cricket.in', password: defaultPassword, role: 'player', sport: 'Cricket', teamName: 'India' },
            { name: 'Rohit Sharma', email: 'rohit.sharma@cricket.in', password: defaultPassword, role: 'player', sport: 'Cricket', teamName: 'India' },
            { name: 'Kylian Mbappe', email: 'mbappe@realmadrid.es', password: defaultPassword, role: 'athlete', sport: 'Football', teamName: 'Real Madrid' },
            { name: 'LeBron James', email: 'lebron@lakers.nba', password: defaultPassword, role: 'athlete', sport: 'Basketball', teamName: 'LA Lakers' },
            { name: 'Carlos Alcaraz', email: 'alcaraz@tennis.org', password: defaultPassword, role: 'athlete', sport: 'Tennis', teamName: 'ATP Tour' },
            { name: 'Aaron Judge', email: 'judge@yankees.mlb', password: defaultPassword, role: 'player', sport: 'Baseball', teamName: 'NY Yankees' }
        ];

        for (const userData of sampleUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                const newUser = new User({ ...userData, isActive: true });
                await newUser.save();
                console.log(`  Created user: ${userData.email} (${userData.role})`);
            } else {
                console.log(`  User already exists: ${userData.email}`);
            }
        }

        // 2. Seed Visits / App Activity Logs
        console.log('--- Seeding Visits / Activity Logs ---');
        const currentVisitCount = await Visit.countDocuments();
        if (currentVisitCount < 50) {
            const routes = [
                '/admin', '/system-admin', '/dashboard', '/analytics',
                '/cricket/pulse', '/injury-intelligence', '/live-match',
                '/players', '/public', '/profile', '/saved'
            ];
            const ips = ['192.168.1.10', '192.168.1.42', '10.0.0.15', '172.16.0.8', '127.0.0.1', '198.51.100.24'];
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
                'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
                'KinetixMobile/2.4 (iPhone; iOS 17.5.1)'
            ];

            const allUsers = await User.find().limit(10);
            const now = Date.now();
            const newVisits = [];

            for (let i = 0; i < 150; i++) {
                const randomTime = new Date(now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
                const randomRoute = routes[Math.floor(Math.random() * routes.length)];
                const randomIp = ips[Math.floor(Math.random() * ips.length)];
                const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
                const randomUser = Math.random() > 0.3 ? allUsers[Math.floor(Math.random() * allUsers.length)] : null;

                newVisits.push({
                    path: randomRoute,
                    ip: randomIp,
                    userAgent: randomAgent,
                    userId: randomUser ? randomUser._id : null,
                    timestamp: randomTime
                });
            }

            await Visit.insertMany(newVisits);
            console.log(`  Seeded ${newVisits.length} fresh visit activity records.`);
        } else {
            console.log(`  Visits collection already contains ${currentVisitCount} records.`);
        }

        // 3. Seed Performance Records if empty
        console.log('--- Checking Performance & Injury Records ---');
        const perfCount = await Performance.countDocuments();
        if (perfCount === 0) {
            const players = await Player.find().limit(10);
            if (players.length > 0) {
                const perfDocs = [];
                for (let i = 0; i < 25; i++) {
                    const player = players[i % players.length];
                    perfDocs.push({
                        eventId: `EVENT_${Date.now()}_${i}`,
                        playerId: player._id,
                        sport: player.sport || 'Cricket',
                        date: new Date(Date.now() - i * 86400000),
                        situation: i % 2 === 0 ? 'Tournament Finals' : 'League Match',
                        metrics: { runs: 40 + (i * 3) % 60, wickets: i % 3, stamina: 85 - (i % 15) },
                        physical_metrics: { heart_rate_avg: 145 + (i % 20), body_temp_c: 37.1 },
                        detailed_performance_metrics: { recent_form_index: 8.2 + (i % 1.5) },
                        overallScore: 80 + (i % 18)
                    });
                }
                await Performance.insertMany(perfDocs);
                console.log(`  Seeded ${perfDocs.length} performance records.`);
            }
        } else {
            console.log(`  Performance records count: ${perfCount}`);
        }

        // 4. Summary Output
        const finalCounts = {
            users: await User.countDocuments(),
            visits: await Visit.countDocuments(),
            players: await Player.countDocuments(),
            teams: await Team.countDocuments(),
            leagues: await League.countDocuments(),
            performances: await Performance.countDocuments(),
            liveMatches: await LiveMatch.countDocuments(),
            assessments: await PlayerAssessment.countDocuments(),
            recoveries: await PlayerRecovery.countDocuments()
        };

        console.log('\n=========================================');
        console.log('  ADMIN PANEL SEEDING COMPLETE');
        console.log('=========================================');
        console.log(JSON.stringify(finalCounts, null, 2));

    } catch (err) {
        console.error('Error seeding admin panel data:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedAdminPanelData();
