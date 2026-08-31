const express = require('express');
const mongoose = require('mongoose');
const cricketDataProvider = require('../services/cricketDataProvider');
const Player = require('../models/Player');
const auth = require('../middleware/auth');
const router = express.Router();

const BENCHMARK_PLAYER_STATS = {
  'Virat Kohli': {
    careerStats: { matches: 535, batAvg: 53.2, strikeRate: 138.4, centuries: 80, fifties: 140, wickets: 8, bowlAvg: 64.5, economy: 5.8 },
    stats: {
      test: { matches: 113, runs: 8848, avg: 49.15, sr: 55.56, centuries: 29, fifties: 30, highScore: '254*', wickets: 0, bowlAvg: 0, economy: 0, bestBowling: '0/0', catches: 115, stumpings: 0 },
      odi:  { matches: 292, runs: 13848, avg: 58.67, sr: 93.58, centuries: 50, fifties: 72, highScore: '183', wickets: 5, bowlAvg: 166.2, economy: 5.2, bestBowling: '1/15', catches: 152, stumpings: 0 },
      t20i: { matches: 125, runs: 4188, avg: 48.69, sr: 137.04, centuries: 1, fifties: 37, highScore: '122*', wickets: 4, bowlAvg: 51.0, economy: 8.1, bestBowling: '1/13', catches: 54, stumpings: 0 },
      ipl:  { matches: 252, runs: 8004, avg: 38.67, sr: 131.97, centuries: 8, fifties: 55, highScore: '113', wickets: 4, bowlAvg: 92.0, economy: 8.8, bestBowling: '2/25', catches: 114, stumpings: 0 }
    },
    radarMetrics: { power: 92, speed: 90, precision: 98, timing: 96, endurance: 98, technique: 99 }
  },
  'Rohit Sharma': {
    careerStats: { matches: 485, batAvg: 48.8, strikeRate: 140.2, centuries: 48, fifties: 104, wickets: 12, bowlAvg: 58.0, economy: 5.5 },
    stats: {
      test: { matches: 59, runs: 4137, avg: 45.46, sr: 56.40, centuries: 12, fifties: 17, highScore: '212', wickets: 2, bowlAvg: 112.0, economy: 3.3, bestBowling: '1/26', catches: 62, stumpings: 0 },
      odi:  { matches: 265, runs: 10709, avg: 49.12, sr: 92.44, centuries: 31, fifties: 57, highScore: '264', wickets: 9, bowlAvg: 64.3, economy: 5.2, bestBowling: '2/27', catches: 93, stumpings: 0 },
      t20i: { matches: 159, runs: 4231, avg: 32.05, sr: 140.89, centuries: 5, fifties: 32, highScore: '121*', wickets: 1, bowlAvg: 113.0, economy: 8.9, bestBowling: '1/12', catches: 65, stumpings: 0 },
      ipl:  { matches: 257, runs: 6628, avg: 29.72, sr: 131.14, centuries: 2, fifties: 43, highScore: '109*', wickets: 15, bowlAvg: 30.2, economy: 7.9, bestBowling: '4/6', catches: 101, stumpings: 0 }
    },
    radarMetrics: { power: 96, speed: 82, precision: 94, timing: 99, endurance: 88, technique: 95 }
  },
  'Jasprit Bumrah': {
    careerStats: { matches: 220, batAvg: 8.5, strikeRate: 65.0, centuries: 0, fifties: 0, wickets: 395, bowlAvg: 21.4, economy: 4.1 },
    stats: {
      test: { matches: 36, runs: 262, avg: 7.48, sr: 42.10, centuries: 0, fifties: 0, highScore: '34*', wickets: 159, bowlAvg: 20.69, economy: 2.74, bestBowling: '6/27', catches: 14, stumpings: 0 },
      odi:  { matches: 89, runs: 95, avg: 7.91, sr: 58.20, centuries: 0, fifties: 0, highScore: '14*', wickets: 149, bowlAvg: 23.55, economy: 4.59, bestBowling: '6/19', catches: 27, stumpings: 0 },
      t20i: { matches: 70, runs: 28, avg: 4.00, sr: 60.80, centuries: 0, fifties: 0, highScore: '7', wickets: 89, bowlAvg: 17.74, economy: 6.27, bestBowling: '3/7', catches: 13, stumpings: 0 },
      ipl:  { matches: 133, runs: 67, avg: 6.09, sr: 64.40, centuries: 0, fifties: 0, highScore: '10*', wickets: 165, bowlAvg: 22.51, economy: 7.30, bestBowling: '5/10', catches: 22, stumpings: 0 }
    },
    radarMetrics: { power: 88, speed: 98, precision: 99, timing: 85, endurance: 95, technique: 97 }
  },
  'Pat Cummins': {
    careerStats: { matches: 210, batAvg: 18.5, strikeRate: 85.0, centuries: 0, fifties: 3, wickets: 450, bowlAvg: 22.1, economy: 4.2 },
    stats: {
      test: { matches: 62, runs: 1285, avg: 17.13, sr: 44.50, centuries: 0, fifties: 2, highScore: '63', wickets: 269, bowlAvg: 22.53, economy: 2.86, bestBowling: '6/23', catches: 38, stumpings: 0 },
      odi:  { matches: 88, runs: 420, avg: 14.48, sr: 82.35, centuries: 0, fifties: 1, highScore: '37', wickets: 141, bowlAvg: 28.32, economy: 5.24, bestBowling: '5/70', catches: 29, stumpings: 0 },
      t20i: { matches: 57, runs: 180, avg: 12.00, sr: 138.46, centuries: 0, fifties: 0, highScore: '28*', wickets: 66, bowlAvg: 23.89, economy: 7.42, bestBowling: '3/15', catches: 18, stumpings: 0 },
      ipl:  { matches: 56, runs: 515, avg: 18.39, sr: 152.36, centuries: 0, fifties: 3, highScore: '56*', wickets: 63, bowlAvg: 30.14, economy: 8.85, bestBowling: '4/34', catches: 19, stumpings: 0 }
    },
    radarMetrics: { power: 94, speed: 96, precision: 95, timing: 82, endurance: 97, technique: 91 }
  },
  'Ben Stokes': {
    careerStats: { matches: 260, batAvg: 38.5, strikeRate: 120.0, centuries: 18, fifties: 45, wickets: 290, bowlAvg: 31.2, economy: 4.5 },
    stats: {
      test: { matches: 105, runs: 6508, avg: 35.75, sr: 59.20, centuries: 13, fifties: 34, highScore: '258', wickets: 203, bowlAvg: 32.07, economy: 3.32, bestBowling: '6/22', catches: 108, stumpings: 0 },
      odi:  { matches: 114, runs: 3159, avg: 38.98, sr: 95.26, centuries: 5, fifties: 22, highScore: '182', wickets: 74, bowlAvg: 42.39, economy: 6.05, bestBowling: '5/61', catches: 53, stumpings: 0 },
      t20i: { matches: 43, runs: 585, avg: 21.66, sr: 128.00, centuries: 0, fifties: 1, highScore: '52*', wickets: 26, bowlAvg: 32.92, economy: 8.39, bestBowling: '3/26', catches: 22, stumpings: 0 },
      ipl:  { matches: 45, runs: 935, avg: 25.27, sr: 133.95, centuries: 2, fifties: 2, highScore: '107*', wickets: 28, bowlAvg: 34.78, economy: 8.56, bestBowling: '3/30', catches: 18, stumpings: 0 }
    },
    radarMetrics: { power: 97, speed: 86, precision: 88, timing: 92, endurance: 96, technique: 90 }
  },
  'Hardik Pandya': {
    careerStats: { matches: 210, batAvg: 33.5, strikeRate: 142.0, centuries: 1, fifties: 16, wickets: 175, bowlAvg: 30.5, economy: 6.8 },
    stats: {
      test: { matches: 11, runs: 532, avg: 31.29, sr: 73.88, centuries: 1, fifties: 4, highScore: '108', wickets: 17, bowlAvg: 31.05, economy: 3.38, bestBowling: '5/28', catches: 7, stumpings: 0 },
      odi:  { matches: 86, runs: 1769, avg: 34.01, sr: 110.35, centuries: 0, fifties: 11, highScore: '92*', wickets: 84, bowlAvg: 35.65, economy: 5.56, bestBowling: '4/24', catches: 32, stumpings: 0 },
      t20i: { matches: 102, runs: 1524, avg: 26.73, sr: 140.85, centuries: 0, fifties: 4, highScore: '71*', wickets: 86, bowlAvg: 25.43, economy: 8.12, bestBowling: '4/16', catches: 45, stumpings: 0 },
      ipl:  { matches: 137, runs: 2525, avg: 28.69, sr: 145.45, centuries: 0, fifties: 10, highScore: '91', wickets: 64, bowlAvg: 33.26, economy: 8.95, bestBowling: '3/17', catches: 68, stumpings: 0 }
    },
    radarMetrics: { power: 95, speed: 88, precision: 87, timing: 91, endurance: 90, technique: 86 }
  },
  'Suryakumar Yadav': {
    careerStats: { matches: 160, batAvg: 41.5, strikeRate: 168.0, centuries: 5, fifties: 24, wickets: 0, bowlAvg: 0, economy: 0 },
    stats: {
      test: { matches: 1, runs: 8, avg: 8.00, sr: 40.00, centuries: 0, fifties: 0, highScore: '8', wickets: 0, bowlAvg: 0, economy: 0, bestBowling: '0/0', catches: 1, stumpings: 0 },
      odi:  { matches: 37, runs: 773, avg: 25.76, sr: 105.02, centuries: 0, fifties: 4, highScore: '72*', wickets: 0, bowlAvg: 0, economy: 0, bestBowling: '0/0', catches: 18, stumpings: 0 },
      t20i: { matches: 71, runs: 2432, avg: 42.66, sr: 167.72, centuries: 4, fifties: 20, highScore: '117', wickets: 1, bowlAvg: 35.0, economy: 7.0, bestBowling: '1/5', catches: 43, stumpings: 0 },
      ipl:  { matches: 150, runs: 3594, avg: 32.08, sr: 145.32, centuries: 2, fifties: 24, highScore: '103*', wickets: 0, bowlAvg: 0, economy: 0, bestBowling: '0/0', catches: 62, stumpings: 0 }
    },
    radarMetrics: { power: 94, speed: 90, precision: 96, timing: 98, endurance: 88, technique: 94 }
  }
};

const COMPLETE_TEAM_ROSTERS = [
  // 🇮🇳 INDIA SQUAD
  { _id: 'ind-1', playerId: '101', name: 'Virat Kohli', role: 'Batter', teamName: 'India', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm medium', country: 'India', status: 'Optimal', readinessScore: 98, active: true, ...BENCHMARK_PLAYER_STATS['Virat Kohli'] },
  { _id: 'ind-2', playerId: '102', name: 'Rohit Sharma', role: 'Captain / Batter', teamName: 'India', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm offbreak', country: 'India', status: 'Optimal', readinessScore: 95, active: true, ...BENCHMARK_PLAYER_STATS['Rohit Sharma'] },
  { _id: 'ind-3', playerId: '103', name: 'Jasprit Bumrah', role: 'Fast Bowler', teamName: 'India', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm fast', country: 'India', status: 'Optimal', readinessScore: 99, active: true, ...BENCHMARK_PLAYER_STATS['Jasprit Bumrah'] },
  { _id: 'ind-4', playerId: '104', name: 'Hardik Pandya', role: 'All Rounder', teamName: 'India', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm fast-medium', country: 'India', status: 'Optimal', readinessScore: 94, active: true, ...BENCHMARK_PLAYER_STATS['Hardik Pandya'] },
  { _id: 'ind-5', playerId: '105', name: 'Suryakumar Yadav', role: 'T20 Captain / Batter', teamName: 'India', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm medium', country: 'India', status: 'Optimal', readinessScore: 96, active: true, ...BENCHMARK_PLAYER_STATS['Suryakumar Yadav'] },
  { _id: 'ind-6', playerId: '106', name: 'Rishabh Pant', role: 'Wicket-Keeper Batter', teamName: 'India', sport: 'Cricket', battingStyle: 'Left Hand', bowlingStyle: 'None', country: 'India', status: 'Optimal', readinessScore: 92, active: true },
  { _id: 'ind-7', playerId: '107', name: 'Shubman Gill', role: 'Opener / Batter', teamName: 'India', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm offbreak', country: 'India', status: 'Optimal', readinessScore: 91, active: true },
  { _id: 'ind-8', playerId: '108', name: 'Yashasvi Jaiswal', role: 'Opener / Batter', teamName: 'India', sport: 'Cricket', battingStyle: 'Left Hand', bowlingStyle: 'Right arm legbreak', country: 'India', status: 'Optimal', readinessScore: 93, active: true },
  { _id: 'ind-9', playerId: '109', name: 'Ravindra Jadeja', role: 'All Rounder', teamName: 'India', sport: 'Cricket', battingStyle: 'Left Hand', bowlingStyle: 'Slow left-arm orthodox', country: 'India', status: 'Optimal', readinessScore: 95, active: true },

  // 🇦🇺 AUSTRALIA SQUAD
  { _id: 'aus-1', playerId: '201', name: 'Pat Cummins', role: 'Captain / Bowler', teamName: 'Australia', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'Right arm fast', country: 'Australia', status: 'Optimal', readinessScore: 97, active: true, ...BENCHMARK_PLAYER_STATS['Pat Cummins'] },
  { _id: 'aus-2', playerId: '202', name: 'Travis Head', role: 'Batter', teamName: 'Australia', sport: 'Cricket', battingStyle: 'Left Hand', bowlingStyle: 'Right arm offbreak', country: 'Australia', status: 'Optimal', readinessScore: 96, active: true },
  { _id: 'aus-3', playerId: '203', name: 'Mitchell Starc', role: 'Fast Bowler', teamName: 'Australia', sport: 'Cricket', battingStyle: 'Left Hand', bowlingStyle: 'Left arm fast', country: 'Australia', status: 'Optimal', readinessScore: 95, active: true },

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENGLAND SQUAD
  { _id: 'eng-1', playerId: '301', name: 'Jos Buttler', role: 'Captain / Wicket-Keeper', teamName: 'England', sport: 'Cricket', battingStyle: 'Right Hand', bowlingStyle: 'None', country: 'England', status: 'Optimal', readinessScore: 96, active: true },
  { _id: 'eng-2', playerId: '302', name: 'Ben Stokes', role: 'All Rounder', teamName: 'England', sport: 'Cricket', battingStyle: 'Left Hand', bowlingStyle: 'Right arm fast-medium', country: 'England', status: 'Optimal', readinessScore: 95, active: true, ...BENCHMARK_PLAYER_STATS['Ben Stokes'] }
];

router.use(auth);

router.get('/', async (req, res) => {
  try {
    let players = [];
    const qTeamId = (req.query.teamId || '').toString().toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      try {
        let filter = { active: true };
        if (qTeamId && qTeamId !== 'undefined' && qTeamId !== 'null' && qTeamId !== 'all') {
          if (!isNaN(Number(qTeamId))) {
            filter.currentTeamId = Number(qTeamId);
          } else {
            filter.$or = [
              { teamName: { $regex: new RegExp(qTeamId, 'i') } },
              { country: { $regex: new RegExp(qTeamId, 'i') } }
            ];
          }
        }
        players = await Player.find(filter).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('[GET /players] DB query warning:', dbErr.message);
      }
    }

    if (!players || players.length === 0) {
      if (qTeamId && qTeamId !== 'undefined' && qTeamId !== 'null' && qTeamId !== 'all') {
        players = COMPLETE_TEAM_ROSTERS.filter(p => 
          (p.teamName || '').toLowerCase().includes(qTeamId) || 
          (p.country || '').toLowerCase().includes(qTeamId) ||
          (qTeamId === 'ind' || qTeamId === '10532' || qTeamId === '2024' ? p.teamName === 'India' : false) ||
          (qTeamId === 'eng' ? p.teamName === 'England' : false) ||
          (qTeamId === 'aus' ? p.teamName === 'Australia' : false)
        );
      }
      
      if (!players || players.length === 0) {
        players = COMPLETE_TEAM_ROSTERS;
      }
    }

    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let player = null;
    if (mongoose.connection.readyState === 1) {
      try {
        player = await Player.findById(req.params.id).maxTimeMS(2000).lean();
      } catch (dbErr) {
        console.warn('[GET /players/:id] DB query warning:', dbErr.message);
      }
    }

    if (!player) {
      player = COMPLETE_TEAM_ROSTERS.find(p => p._id === req.params.id || p.playerId === req.params.id) || COMPLETE_TEAM_ROSTERS[0];
    }

    // Attach benchmark stats if careerStats missing
    if (!player.careerStats) {
      const benchmark = BENCHMARK_PLAYER_STATS[player.name];
      if (benchmark) {
        player.careerStats = benchmark.careerStats;
        player.stats = benchmark.stats;
        player.radarMetrics = benchmark.radarMetrics;
      } else {
        const isBowler = (player.role || '').toLowerCase().includes('bowl');
        player.careerStats = {
          matches: 65,
          batAvg: isBowler ? 14.5 : 42.8,
          strikeRate: isBowler ? 85.0 : 132.5,
          centuries: isBowler ? 0 : 5,
          fifties: isBowler ? 1 : 18,
          wickets: isBowler ? 115 : 12,
          bowlAvg: isBowler ? 24.2 : 45.0,
          economy: isBowler ? 7.2 : 8.5
        };
        player.radarMetrics = { power: 80, speed: 82, precision: 85, timing: 84, endurance: 86, technique: 88 };
      }
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;