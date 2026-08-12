const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

async function seedUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // deletes existing test users if they exist to avoid unique constraint error
        await User.deleteMany({ email: { $in: ['manager@test.com', 'analyst@test.com', 'admin@test.com'] } });
        console.log('Cleaned up old test users.');

        const users = [
            {
                name: 'Manager of India Cricket',
                email: 'manager@test.com',
                password: 'password123',
                role: 'manager',
                teamName: 'India',
                sport: 'Cricket',
                isActive: true
            },
            {
                name: 'Test Analyst',
                email: 'analyst@test.com',
                password: 'password123',
                role: 'analyst',
                teamName: 'India',
                sport: 'Cricket',
                isActive: true
            },
            {
                name: 'System Admin',
                email: 'admin@test.com',
                password: 'password123',
                role: 'admin',
                teamName: 'System',
                sport: 'All',
                isActive: true
            }
        ];

        for (const u of users) {
            const user = new User(u);
            await user.save();
            console.log(`Created user: ${u.email} (${u.role})`);
        }

        console.log('User seeding complete.');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedUsers();
