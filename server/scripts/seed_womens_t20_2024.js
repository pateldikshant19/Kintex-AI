require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');

// Ensure MongoDB URI is available
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kinetix-sports';

const runSeed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing demo users for these emails
        await User.deleteMany({ email: { $in: ['manager@india.com', 'analyst@india.com', 'harmanpreet@india.com', 'smriti@india.com'] } });
        console.log('Cleared old demo users.');

        // Delete players from India Women and Australia Women to avoid duplicates
        await Player.deleteMany({ teamName: { $in: ['India Women', 'Australia Women', 'New Zealand Women'] } });
        console.log('Cleared old player data for target teams.');

        // 1. Create Demo Users
        const passwordHash = await bcrypt.hash('demo123', 10);

        const users = [
            {
                name: 'Amol Muzumdar (Manager)',
                email: 'manager@india.com',
                password: passwordHash,
                role: 'manager',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            },
            {
                name: 'Data Analyst (India)',
                email: 'analyst@india.com',
                password: passwordHash,
                role: 'analyst',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            },
            {
                name: 'Harmanpreet Kaur',
                email: 'harmanpreet@india.com',
                password: passwordHash,
                role: 'player',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            },
            {
                name: 'Smriti Mandhana',
                email: 'smriti@india.com',
                password: passwordHash,
                role: 'player',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            }
        ];

        // We insert users using User.collection.insertMany or by creating individually to bypass pre('save') hook if it hashes again
        // Wait, since we are doing create(), the pre('save') hook will run. So we should pass plaintext password!
        const usersToCreate = [
            {
                name: 'Amol Muzumdar (Manager)',
                email: 'manager@india.com',
                password: 'password123',
                role: 'manager',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            },
            {
                name: 'Data Analyst (India)',
                email: 'analyst@india.com',
                password: 'password123',
                role: 'analyst',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            },
            {
                name: 'Harmanpreet Kaur',
                email: 'harmanpreet@india.com',
                password: 'password123',
                role: 'player',
                sport: 'Cricket',
                teamName: 'India Women',
                isActive: true
            }
        ];
        
        for (const u of usersToCreate) {
            const user = new User(u);
            await user.save();
        }
        console.log('Created Demo Users (password: password123)');

        // 2. Create Real Player Data (Women's T20 World Cup 2024 Squads)
        const indiaSquad = [
            { name: 'Harmanpreet Kaur', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'India' },
            { name: 'Smriti Mandhana', role: 'Opening Batter', battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'India' },
            { name: 'Shafali Verma', role: 'Opening Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'India' },
            { name: 'Deepti Sharma', role: 'Allrounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'India' },
            { name: 'Jemimah Rodrigues', role: 'Batter', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'India' },
            { name: 'Richa Ghosh', role: 'Wicketkeeper Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', country: 'India' },
            { name: 'Pooja Vastrakar', role: 'Bowling Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', country: 'India' },
            { name: 'Renuka Singh', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', country: 'India' },
            { name: 'Radha Yadav', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Slow left-arm orthodox', country: 'India' },
            { name: 'Shreyanka Patil', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'India' }
        ];

        const ausSquad = [
            { name: 'Alyssa Healy', role: 'Wicketkeeper Batter', battingStyle: 'Right-hand bat', bowlingStyle: '', country: 'Australia' },
            { name: 'Ellyse Perry', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', country: 'Australia' },
            { name: 'Beth Mooney', role: 'Wicketkeeper Batter', battingStyle: 'Left-hand bat', bowlingStyle: '', country: 'Australia' },
            { name: 'Ashleigh Gardner', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm offbreak', country: 'Australia' },
            { name: 'Megan Schutt', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', country: 'Australia' },
            { name: 'Tahlia McGrath', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium-fast', country: 'Australia' },
            { name: 'Annabel Sutherland', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', country: 'Australia' },
            { name: 'Sophie Molineux', role: 'Bowler', battingStyle: 'Left-hand bat', bowlingStyle: 'Slow left-arm orthodox', country: 'Australia' }
        ];

        const nzSquad = [
            { name: 'Sophie Devine', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', country: 'New Zealand' },
            { name: 'Suzie Bates', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', country: 'New Zealand' },
            { name: 'Amelia Kerr', role: 'Allrounder', battingStyle: 'Right-hand bat', bowlingStyle: 'Legbreak', country: 'New Zealand' },
            { name: 'Lea Tahuhu', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium', country: 'New Zealand' },
            { name: 'Rosemary Mair', role: 'Bowler', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium', country: 'New Zealand' }
        ];

        const mapSquad = (squad, teamName) => squad.map(p => ({
            playerId: p.name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now().toString().slice(-4),
            name: p.name,
            sport: 'Cricket',
            teamName: teamName,
            position: p.role,
            role: p.role,
            battingStyle: p.battingStyle,
            bowlingStyle: p.bowlingStyle,
            country: p.country,
            active: true,
            records: ['T20 World Cup Participant'],
            // Add some mock stats to make it look realistic for analysts
            physicalStats: {
                height: 160 + Math.floor(Math.random() * 15),
                weight: 55 + Math.floor(Math.random() * 15)
            },
            performanceHistory: [
                { date: new Date(), metrics: { runs: Math.floor(Math.random() * 80), wickets: Math.floor(Math.random() * 3) }, score: Math.floor(Math.random() * 100) }
            ]
        }));

        await Player.insertMany([
            ...mapSquad(indiaSquad, 'India Women'),
            ...mapSquad(ausSquad, 'Australia Women'),
            ...mapSquad(nzSquad, 'New Zealand Women')
        ]);
        
        console.log('Successfully seeded players from India, Australia, and New Zealand Women squads!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

runSeed();
