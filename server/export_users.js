const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
require('dotenv').config();

const listData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics');
        const users = await User.find({});
        fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
        console.log('Done writing users_dump.json');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

listData();
