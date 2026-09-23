const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

async function resetPasswords() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { email: { $in: ['manager@kinetix.ai', 'analyst@kinetix.ai'] } },
            { $set: { password: 'password123' } }
        );
        
        // Note: updateMany doesn't trigger pre-save hooks so we need to hash it manually or save each
        const users = await User.find({ email: { $in: ['manager@kinetix.ai', 'analyst@kinetix.ai'] } });
        for (const user of users) {
           user.password = 'password123';
           await user.save();
           console.log(`Updated password for ${user.email}`);
        }

        console.log('Password reset complete.');
    } catch (err) {
        console.error('Error resetting passwords:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

resetPasswords();
