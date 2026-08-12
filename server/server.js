const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP Server for Socket.io support
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Socket.io Connections
io.on('connection', (socket) => {
  console.log('  ⚡ Client connected to Socket.io');
  
  socket.on('joinMatch', (matchId) => {
    socket.join(matchId);
    console.log(`  📡 Socket client joined room: ${matchId}`);
  });

  socket.on('leaveMatch', (matchId) => {
    socket.leave(matchId);
    console.log(`  📡 Socket client left room: ${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log('  ⚡ Client disconnected from Socket.io');
  });
});

// Middleware to share Socket.io instance with Express routers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Private Network Access (PNA) & CORS configuration for Chrome/Edge restrictions
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Private-Network');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Analytics Tracker
const trackVisit = require('./middleware/tracker');
app.use(trackVisit);

// ─── Mount All API Routes ────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', require('./routes/public'));
app.use('/api/cricket', require('./routes/cricket'));
app.use('/api/injury-intelligence', require('./routes/injuryIntelligence'));

// ─── MongoDB Connection ─────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('  ✅ MongoDB connected successfully');
    console.log(`     └─ URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  })
  .catch((err) => {
    console.error('  ❌ MongoDB connection FAILED:', err.message);
    console.error('     └─ The server will continue running but database operations will fail.');
    console.error('     └─ Make sure MongoDB is running: mongod --dbpath <your-data-path>');
  });

// Handle MongoDB disconnection after initial connect
mongoose.connection.on('disconnected', () => {
  console.warn('  ⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('  ✅ MongoDB reconnected successfully');
});

// ─── Start Server / Export App ───────────────────────────────────────
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════════╗');
    console.log('  ║          KINETIX AI — Backend Server                ║');
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log(`  ║  🌐 Express API     : http://localhost:${PORT}          ║`);
    console.log(`  ║  📡 Socket.IO       : ws://localhost:${PORT}            ║`);
    console.log('  ║  🗄️  MongoDB         : Connecting...                 ║');
    console.log('  ║  🐍 Python ML/CV    : On-demand (child_process)     ║');
    console.log('  ║  📧 Email Service   : Standby (nodemailer)          ║');
    console.log('  ║  📊 Visit Tracker   : Active                        ║');
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log('  ║  API Routes Loaded:                                 ║');
    console.log('  ║    /api/auth      — Login & Signup (JWT)            ║');
    console.log('  ║    /api/players   — Player CRUD                     ║');
    console.log('  ║    /api/analytics — Performance Analytics           ║');
    console.log('  ║    /api/dashboard — Role-Based Dashboard            ║');
    console.log('  ║    /api/admin     — Admin & Visit Analytics         ║');
    console.log('  ║    /api/public    — Public Hub (No Auth)            ║');
    console.log('  ║    /api/cricket   — Cricket AI/ML/CV Engine         ║');
    console.log('  ╚══════════════════════════════════════════════════════╝');
    console.log('');
  });
}

module.exports = app;