const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Player = require('../models/Player');
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

// Cricket Players Data - 15 players per team
const cricketPlayers = [
  // Batters (3 players)
  { name: 'Virat Kohli', position: 'Batter', jersey: 18 },
  { name: 'Rohit Sharma', position: 'Batter', jersey: 45 },
  { name: 'Shubman Gill', position: 'Batter', jersey: 77 },
  
  // All-rounders (2-3 players)
  { name: 'Hardik Pandya', position: 'All-rounder', jersey: 31 },
  { name: 'Ravindra Jadeja', position: 'All-rounder', jersey: 8 },
  { name: 'Axar Patel', position: 'All-rounder', jersey: 48 },
  
  // Wicket Keepers (1-2 players)
  { name: 'Rishabh Pant', position: 'Wicket-Keeper', jersey: 17 },
  { name: 'KL Rahul', position: 'Wicket-Keeper', jersey: 1 },
  
  // Fast Bowlers (2 players)
  { name: 'Jasprit Bumrah', position: 'Fast Bowler', jersey: 93 },
  { name: 'Mohammed Shami', position: 'Fast Bowler', jersey: 11 },
  { name: 'Siraj Khan', position: 'Fast Bowler', jersey: 25 },
  
  // Spin Bowlers (2 players)
  { name: 'Yuzvendra Chahal', position: 'Spin Bowler', jersey: 52 },
  { name: 'Kuldeep Yadav', position: 'Spin Bowler', jersey: 74 },
  
  // Extra all-rounder
  { name: 'Suryakumar Yadav', position: 'All-rounder', jersey: 63 },
  { name: 'Manish Pandey', position: 'Batter', jersey: 39 }
];

// Football Players Data - 15 players per team
const footballPlayers = [
  // Goalkeepers (2 players)
  { name: 'Marc André ter Stegen', position: 'Goalkeeper', jersey: 1 },
  { name: 'Kepa Arrizabalaga', position: 'Goalkeeper', jersey: 13 },
  
  // Defenders (3 players)
  { name: 'Gerard Piqué', position: 'Defender', jersey: 3 },
  { name: 'Jordi Alba', position: 'Defender', jersey: 18 },
  { name: 'Sergi Roberto', position: 'Defender', jersey: 20 },
  
  // Midfielders (4 players)
  { name: 'Sergio Busquets', position: 'Midfielder', jersey: 5 },
  { name: 'Pedri González', position: 'Midfielder', jersey: 26 },
  { name: 'Gavi Páez', position: 'Midfielder', jersey: 6 },
  { name: 'Frankie de Jong', position: 'Midfielder', jersey: 21 },
  
  // Strikers (3 players)
  { name: 'Robert Lewandowski', position: 'Striker', jersey: 9 },
  { name: 'Ansu Fati', position: 'Striker', jersey: 10 },
  { name: 'Ferran Torres', position: 'Striker', jersey: 11 },
  
  // Extra defender
  { name: 'Alejandro Balde', position: 'Defender', jersey: 3 },
  { name: 'Andreas Christensen', position: 'Defender', jersey: 15 }
];

// Track & Field Contingents with 15 players per country
const trackAndFieldContingents = [
  {
    country: 'USA Athletics',
    players: [
      { name: 'Noah Lyles', position: 'Sprinter', jersey: 1 },
      { name: 'Sha\'Carri Richardson', position: 'Sprinter', jersey: 2 },
      { name: 'Grant Holloway', position: 'Hurdler', jersey: 3 },
      { name: 'Sydney McLaughlin-Levrone', position: 'Hurdler', jersey: 4 },
      { name: 'Rai Benjamin', position: 'Hurdler', jersey: 5 },
      { name: 'Athing Mu', position: 'Middle Distance', jersey: 6 },
      { name: 'Cole Hocker', position: 'Middle Distance', jersey: 7 },
      { name: 'Ricky Petrowski', position: 'Long Distance', jersey: 8 },
      { name: 'Nikki Hiltz', position: 'Long Distance', jersey: 9 },
      { name: 'Daniel Wertheim', position: 'Long Distance', jersey: 10 },
      { name: 'Christopher Nilsen', position: 'Jumper', jersey: 11 },
      { name: 'Quanera Hayes', position: 'Jumper', jersey: 12 },
      { name: 'Joe Kovacs', position: 'Thrower', jersey: 13 },
      { name: 'Brooke Andersen', position: 'Thrower', jersey: 14 },
      { name: 'Ryan Crouser', position: 'Thrower', jersey: 15 }
    ]
  },
  {
    country: 'Jamaica Sprint Elite',
    players: [
      { name: 'Elaine Thompson-Herah', position: 'Sprinter', jersey: 1 },
      { name: 'Shelly-Ann Fraser-Pryce', position: 'Sprinter', jersey: 2 },
      { name: 'Natasha Morrison', position: 'Sprinter', jersey: 3 },
      { name: 'Rusheen McDonald', position: 'Sprinter', jersey: 4 },
      { name: 'Kerron Stewart', position: 'Sprinter', jersey: 5 },
      { name: 'Tia Clayton', position: 'Hurdler', jersey: 6 },
      { name: 'Tyson Walker', position: 'Hurdler', jersey: 7 },
      { name: 'Lerone Clarke', position: 'Sprinter', jersey: 8 },
      { name: 'Demish Gaye', position: 'Sprinter', jersey: 9 },
      { name: 'Hansle Parchment', position: 'Hurdler', jersey: 10 },
      { name: 'Lamia Walker-Gaines', position: 'Middle Distance', jersey: 11 },
      { name: 'Junelle Skeete', position: 'Middle Distance', jersey: 12 },
      { name: 'Carey McLeod', position: 'Jumper', jersey: 13 },
      { name: 'Tajay Gayle', position: 'Jumper', jersey: 14 },
      { name: 'Wanya McCoy', position: 'Thrower', jersey: 15 }
    ]
  },
  {
    country: 'Kenya Distance Pro',
    players: [
      { name: 'Eliud Kipchoge', position: 'Long Distance', jersey: 1 },
      { name: 'Faith Kipyegon', position: 'Long Distance', jersey: 2 },
      { name: 'Beatrice Cheptoo', position: 'Long Distance', jersey: 3 },
      { name: 'Timothy Cheruiyot', position: 'Middle Distance', jersey: 4 },
      { name: 'George Nkomo', position: 'Middle Distance', jersey: 5 },
      { name: 'Agnes Tirop', position: 'Long Distance', jersey: 6 },
      { name: 'Henry Rono', position: 'Long Distance', jersey: 7 },
      { name: 'Celliphine Chespol', position: 'Long Distance', jersey: 8 },
      { name: 'Yomif Kejelcha', position: 'Middle Distance', jersey: 9 },
      { name: 'Sylvia Kiprotich', position: 'Long Distance', jersey: 10 },
      { name: 'David Rudisha', position: 'Middle Distance', jersey: 11 },
      { name: 'Hellen Kimaiyo', position: 'Long Distance', jersey: 12 },
      { name: 'Julius Kosgei', position: 'Middle Distance', jersey: 13 },
      { name: 'Deborah Acquah', position: 'Long Distance', jersey: 14 },
      { name: 'Vincent Kipchoge', position: 'Long Distance', jersey: 15 }
    ]
  },
  {
    country: 'Team Great Britain',
    players: [
      { name: 'Josh Kerr', position: 'Middle Distance', jersey: 1 },
      { name: 'Dina Asher-Smith', position: 'Sprinter', jersey: 2 },
      { name: 'Katarina Johnson-Thompson', position: 'Jumper', jersey: 3 },
      { name: 'Laura Muir', position: 'Middle Distance', jersey: 4 },
      { name: 'Jemma Reeves', position: 'Middle Distance', jersey: 5 },
      { name: 'Zharnel Hughes', position: 'Sprinter', jersey: 6 },
      { name: 'Andrew Butchart', position: 'Long Distance', jersey: 7 },
      { name: 'Eilish McColgan', position: 'Long Distance', jersey: 8 },
      { name: 'Chris O\'Hare', position: 'Middle Distance', jersey: 9 },
      { name: 'Jessica Turner', position: 'Long Distance', jersey: 10 },
      { name: 'Tom Bosworth', position: 'Walker', jersey: 11 },
      { name: 'Amber Titmuss', position: 'Sprinter', jersey: 12 },
      { name: 'Sam Murray', position: 'Jumper', jersey: 13 },
      { name: 'Sophie Smith', position: 'Thrower', jersey: 14 },
      { name: 'Oliver Dustin', position: 'Jumper', jersey: 15 }
    ]
  },
  {
    country: 'Australia Athletics',
    players: [
      { name: 'Jessica Fox', position: 'Sprinter', jersey: 1 },
      { name: 'Isaac Makwala', position: 'Middle Distance', jersey: 2 },
      { name: 'Katja Roose', position: 'Hurdler', jersey: 3 },
      { name: 'Cedric Van Niel', position: 'Sprinter', jersey: 4 },
      { name: 'Ruth Streiter', position: 'Long Distance', jersey: 5 },
      { name: 'Alex Ballard', position: 'Jumper', jersey: 6 },
      { name: 'Ellie Welman', position: 'Middle Distance', jersey: 7 },
      { name: 'Grace McCallum', position: 'Jumper', jersey: 8 },
      { name: 'Dominic Mason', position: 'Sprinter', jersey: 9 },
      { name: 'Natalie van Coevorden', position: 'Hurdler', jersey: 10 },
      { name: 'Noah Williams', position: 'Long Distance', jersey: 11 },
      { name: 'Genevieve LaCaze', position: 'Long Distance', jersey: 12 },
      { name: 'Aly Wagner', position: 'Jumper', jersey: 13 },
      { name: 'Jess Schierholt', position: 'Thrower', jersey: 14 },
      { name: 'Riley Day', position: 'Middle Distance', jersey: 15 }
    ]
  },
  {
    country: 'India Athletics',
    players: [
      { name: 'Neeraj Chopra', position: 'Thrower', jersey: 1 },
      { name: 'Hima Das', position: 'Sprinter', jersey: 2 },
      { name: 'Murali Sreeshankar', position: 'Jumper', jersey: 3 },
      { name: 'Javelin Queen', position: 'Thrower', jersey: 4 },
      { name: 'Avinash Sable', position: 'Middle Distance', jersey: 5 },
      { name: 'Dutee Chand', position: 'Sprinter', jersey: 6 },
      { name: 'Anima Tuladhar', position: 'Long Distance', jersey: 7 },
      { name: 'Jyothi Yarraji', position: 'Hurdler', jersey: 8 },
      { name: 'Sudhakar Yadav', position: 'Sprinter', jersey: 9 },
      { name: 'Aditi Ashok', position: 'Long Distance', jersey: 10 },
      { name: 'Rohit Yadav', position: 'Jumper', jersey: 11 },
      { name: 'Gurpreet Kaur', position: 'Middle Distance', jersey: 12 },
      { name: 'Anu Divya', position: 'Sprinter', jersey: 13 },
      { name: 'Vedavati Singh', position: 'Long Distance', jersey: 14 },
      { name: 'Aryan Kumar', position: 'Jumper', jersey: 15 }
    ]
  },
  {
    country: 'China Gold Track',
    players: [
      { name: 'Su Bingtian', position: 'Sprinter', jersey: 1 },
      { name: 'Wu Zhiqiang', position: 'Sprinter', jersey: 2 },
      { name: 'Liu Shiying', position: 'Sprinter', jersey: 3 },
      { name: 'Zheng Yingying', position: 'Middle Distance', jersey: 4 },
      { name: 'Wang Junxia', position: 'Long Distance', jersey: 5 },
      { name: 'Zhang Wenxiu', position: 'Long Distance', jersey: 6 },
      { name: 'Xie Wanjun', position: 'Jumper', jersey: 7 },
      { name: 'Li Yanmei', position: 'Jumper', jersey: 8 },
      { name: 'Chen Yanyan', position: 'Hurdler', jersey: 9 },
      { name: 'Zhao Jingkui', position: 'Hurdler', jersey: 10 },
      { name: 'Liu Hongyun', position: 'Thrower', jersey: 11 },
      { name: 'Gao Yanxia', position: 'Thrower', jersey: 12 },
      { name: 'Pan Fang', position: 'Long Distance', jersey: 13 },
      { name: 'Jiang Huilan', position: 'Middle Distance', jersey: 14 },
      { name: 'Deng Linlin', position: 'Jumper', jersey: 15 }
    ]
  }
];

// Cricket Teams
const cricketTeams = [
  'OLYMPICA',
  'ROYAL CHALLENGERS',
  'MUMBAI INDIANS',
  'CHENNAI SUPER KINGS',
  'GUJARAT TITANS'
];

// Football Teams
const footballTeams = [
  'LIGASPORT',
  'TECHRUN',
  'DATA FC',
  'REAL MADRID',
  'MAN CITY',
  'BAYERN MUNICH',
  'PSG'
];

const seedTeamPlayers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing players
    await Player.deleteMany({});
    console.log('✓ Cleared Player collection');

    let totalPlayers = 0;

    // Seed Cricket Teams
    console.log('\n--- Seeding Cricket Teams ---');
    for (const team of cricketTeams) {
      const players = cricketPlayers.map(player => {
        const weaknessOptions = ['Short-pitch bowling', 'Left-arm spinners', 'Pressure situations'];
        const trainingTypeOptions = ['Batting', 'Bowling', 'Fielding', 'Fitness'];
        const intensityOptions = ['Low', 'Medium', 'High'];
        const playingStyleOptions = ['Aggressive', 'Defensive', 'Tactical', 'Balanced'];
        const intlTeamOptions = ['India', 'Australia', 'England', 'South Africa', 'New Zealand'];
        
        return {
          name: player.name,
          position: player.position,
          jerseyNumber: player.jersey,
          sport: 'Cricket',
          teamName: team,
          dateOfBirth: new Date(1995 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
          bio: `Professional cricket player for ${team}. Known for consistent performance and team leadership.`,
          playingStyle: playingStyleOptions[Math.floor(Math.random() * playingStyleOptions.length)],
          debutSeason: `${2015 + Math.floor(Math.random() * 8)}`,
          internationalTeam: intlTeamOptions[Math.floor(Math.random() * intlTeamOptions.length)],
          weaknesses: [weaknessOptions[Math.floor(Math.random() * weaknessOptions.length)]],
          records: [`${Math.floor(Math.random() * 50)} centuries`, `${Math.floor(Math.random() * 100)} wickets`],
          physicalStats: {
            height: 175 + Math.floor(Math.random() * 15),
            weight: 70 + Math.floor(Math.random() * 15),
            bodyFatPercentage: 8 + Math.floor(Math.random() * 6)
          },
          injuryHistory: [
            {
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
              type: 'Muscle Strain',
              severity: 'Low',
              recoveryTime: 2
            }
          ],
          trainingData: [
            {
              date: new Date(),
              duration: 120 + Math.floor(Math.random() * 60),
              intensity: intensityOptions[Math.floor(Math.random() * intensityOptions.length)],
              type: trainingTypeOptions[Math.floor(Math.random() * trainingTypeOptions.length)]
            }
          ],
          performanceHistory: [
            {
              date: new Date(),
              metrics: {
                runs: Math.floor(Math.random() * 150),
                wickets: Math.floor(Math.random() * 5),
                strikeRate: 100 + Math.floor(Math.random() * 80),
                average: 25 + Math.floor(Math.random() * 40)
              },
              score: 60 + Math.floor(Math.random() * 40)
            }
          ]
        };
      });

      const result = await Player.insertMany(players);
      console.log(`✓ Seeded ${team}: ${result.length} players`);
      totalPlayers += result.length;
    }

    // Seed Football Teams
    console.log('\n--- Seeding Football Teams ---');
    for (const team of footballTeams) {
      const players = footballPlayers.map(player => {
        const weaknessOptions = ['Heading', 'Left foot', 'Speed recovery', 'Physical strength'];
        const trainingTypeOptions = ['Passing', 'Shooting', 'Defensive', 'Agility'];
        const intensityOptions = ['Low', 'Medium', 'High'];
        const playingStyleOptions = ['Attacking', 'Defensive', 'Balanced', 'Technical'];
        const intlTeamOptions = ['Spain', 'Brazil', 'France', 'Germany', 'Argentina', 'England'];
        
        return {
          name: player.name,
          position: player.position,
          jerseyNumber: player.jersey,
          sport: 'Football',
          teamName: team,
          dateOfBirth: new Date(1995 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
          bio: `Professional footballer for ${team}. Renowned for skill and tactical awareness.`,
          playingStyle: playingStyleOptions[Math.floor(Math.random() * playingStyleOptions.length)],
          debutSeason: `${2015 + Math.floor(Math.random() * 8)}`,
          internationalTeam: intlTeamOptions[Math.floor(Math.random() * intlTeamOptions.length)],
          weaknesses: [weaknessOptions[Math.floor(Math.random() * weaknessOptions.length)]],
          records: [`${Math.floor(Math.random() * 50)} goals`, `${Math.floor(Math.random() * 100)} assists`],
          physicalStats: {
            height: 175 + Math.floor(Math.random() * 10),
            weight: 75 + Math.floor(Math.random() * 15),
            bodyFatPercentage: 8 + Math.floor(Math.random() * 6)
          },
          injuryHistory: [
            {
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
              type: 'Muscle Strain',
              severity: 'Low',
              recoveryTime: 2
            }
          ],
          trainingData: [
            {
              date: new Date(),
              duration: 90 + Math.floor(Math.random() * 60),
              intensity: intensityOptions[Math.floor(Math.random() * intensityOptions.length)],
              type: trainingTypeOptions[Math.floor(Math.random() * trainingTypeOptions.length)]
            }
          ],
          performanceHistory: [
            {
              date: new Date(),
              metrics: {
                goals: Math.floor(Math.random() * 5),
                assists: Math.floor(Math.random() * 5),
                passAccuracy: 75 + Math.floor(Math.random() * 20),
                distanceCovered: 8 + Math.random() * 4
              },
              score: 65 + Math.floor(Math.random() * 35)
            }
          ]
        };
      });

      const result = await Player.insertMany(players);
      console.log(`✓ Seeded ${team}: ${result.length} players`);
      totalPlayers += result.length;
    }

    // Seed Track & Field Contingents
    console.log('\n--- Seeding Track & Field Contingents ---');
    for (const contingent of trackAndFieldContingents) {
      const players = contingent.players.map(player => {
        const weaknessOptions = ['Starting blocks', 'Cornering', 'Finishing', 'Mental focus'];
        const trainingTypeOptions = ['Sprint', 'Endurance', 'Jump', 'Throw'];
        const intensityOptions = ['Low', 'Medium', 'High'];
        const playingStyleOptions = ['Explosive', 'Endurance', 'Technical', 'Balanced'];
        
        return {
          name: player.name,
          position: player.position,
          jerseyNumber: player.jersey,
          sport: 'Track & Field',
          teamName: contingent.country,
          dateOfBirth: new Date(1995 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
          bio: `Elite athlete from ${contingent.country} specializing in track and field events.`,
          playingStyle: playingStyleOptions[Math.floor(Math.random() * playingStyleOptions.length)],
          debutSeason: `${2015 + Math.floor(Math.random() * 8)}`,
          internationalTeam: contingent.country,
          weaknesses: [weaknessOptions[Math.floor(Math.random() * weaknessOptions.length)]],
          records: [`Personal Best: ${10 + Math.random() * 50}s`, 'National Record Holder'],
          physicalStats: {
            height: 170 + Math.floor(Math.random() * 15),
            weight: 65 + Math.floor(Math.random() * 20),
            bodyFatPercentage: 6 + Math.floor(Math.random() * 8)
          },
          injuryHistory: [
            {
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
              type: 'Muscle Fatigue',
              severity: 'Low',
              recoveryTime: 2
            }
          ],
          trainingData: [
            {
              date: new Date(),
              duration: 120 + Math.floor(Math.random() * 60),
              intensity: intensityOptions[Math.floor(Math.random() * intensityOptions.length)],
              type: trainingTypeOptions[Math.floor(Math.random() * trainingTypeOptions.length)]
            }
          ],
          performanceHistory: [
            {
              date: new Date(),
              metrics: {
                time: 10 + Math.random() * 600,
                distance: 50 + Math.random() * 200,
                personalBest: Math.random() > 0.5
              },
              score: 70 + Math.floor(Math.random() * 30)
            }
          ]
        };
      });

      const result = await Player.insertMany(players);
      console.log(`✓ Seeded ${contingent.country}: ${result.length} players`);
      totalPlayers += result.length;
    }

    console.log(`\n✅ Successfully seeded ${totalPlayers} players across all teams!`);
    console.log(`   - Cricket: ${cricketTeams.length} teams × ${cricketPlayers.length} players = ${cricketTeams.length * cricketPlayers.length}`);
    console.log(`   - Football: ${footballTeams.length} teams × ${footballPlayers.length} players = ${footballTeams.length * footballPlayers.length}`);
    console.log(`   - Track & Field: ${trackAndFieldContingents.length} contingents × ${trackAndFieldContingents[0].players.length} players = ${trackAndFieldContingents.length * trackAndFieldContingents[0].players.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding teams:', error.message);
    process.exit(1);
  }
};

seedTeamPlayers();
