const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Assuming User model has name, email, password, role, sport
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  sport: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/sport-analytics');
  console.log('Connected to DB');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  await User.deleteMany({ email: { $in: ['manager_india@kinetix.ai', 'analyst@kinetix.ai', 'player1@kinetix.ai'] } });

  await User.insertMany([
    { name: 'Team India Manager', email: 'manager_india@kinetix.ai', password: hash, role: 'manager', sport: 'Cricket' },
    { name: 'Data Analyst', email: 'analyst@kinetix.ai', password: hash, role: 'analyst', sport: 'Cricket' },
    { name: 'Virat Kohli', email: 'player1@kinetix.ai', password: hash, role: 'player', sport: 'Cricket' }
  ]);

  console.log('Users created successfully');
  process.exit(0);
}

seed().catch(console.error);
