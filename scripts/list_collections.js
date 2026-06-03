const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

async function listCollections() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';
    await mongoose.connect(uri);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('--- Current Collections ---');
    collections.forEach(c => console.log(`- ${c.name}`));
    console.log('---------------------------');
    await mongoose.connection.close();
}

listCollections().catch(err => {
    console.error(err);
    process.exit(1);
});
