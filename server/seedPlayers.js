const mongoose = require('mongoose');
const Player = require('./models/Player');
const Performance = require('./models/Performance');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';

const TEAMS = [
    // Football Teams
    { name: 'LIGASPORT', sport: 'Football' },
    { name: 'TECHRUN', sport: 'Football' },
    { name: 'DATA FC', sport: 'Football' },
    { name: 'REAL MADRID', sport: 'Football' },
    { name: 'MAN CITY', sport: 'Football' },
    { name: 'BAYERN MUNICH', sport: 'Football' },
    { name: 'PSG', sport: 'Football' },

    // Cricket Teams
    { name: 'OLYMPICA', sport: 'Cricket' },
    { name: 'ROYAL CHALLENGERS', sport: 'Cricket' },
    { name: 'MUMBAI INDIANS', sport: 'Cricket' },
    { name: 'CHENNAI SUPER KINGS', sport: 'Cricket' },
    { name: 'GUJARAT TITANS', sport: 'Cricket' },

    // Track & Field Contingents
    { name: 'USA Athletics', sport: 'Track & Field' },
    { name: 'Jamaica Sprint Elite', sport: 'Track & Field' },
    { name: 'Kenya Distance Pro', sport: 'Track & Field' },
    { name: 'Team Great Britain', sport: 'Track & Field' },
    { name: 'Australia Athletics', sport: 'Track & Field' },
    { name: 'India Athletics', sport: 'Track & Field' },
    { name: 'China Gold Track', sport: 'Track & Field' }
];

const FIRST_NAMES = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
    "Christopher", "Daniel", "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth",
    "Joshua", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
    "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
    "Benjamin", "Samuel", "Frank", "Gregory", "Raymond", "Alexander", "Patrick", "Jack", "Dennis", "Jerry",
    "Virat", "Rohit", "Sachin", "Jasprit", "Ravindra", "Hardik", "Manish", "Shikhar", "Deepak", "Ishan",
    "Shreyas", "Rishabh", "Mohammed", "Yuvraj", "Mahendra", "Suryakumar", "Lokesh", "Cheteshwar"
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Kohli", "Sharma", "Tendulkar", "Bumrah", "Jadeja", "Pandya", "Pandey", "Dhawan", "Chahar", "Kishan",
    "Iyer", "Pant", "Siraj", "Singh", "Dhoni", "Yadav", "Rahul", "Pujara"
];

const getUniqueName = (usedNames) => {
    let name;
    let attempts = 0;
    do {
        const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        name = `${fn} ${ln}`;
        attempts++;
        if (attempts > 100) name = `${fn} ${ln} ${Math.floor(Math.random() * 1000)}`; // Fallback for uniqueness
    } while (usedNames.has(name));
    return name;
};

const getRoles = (sport) => {
    if (sport === 'Cricket') return [
        { role: 'Captain', count: 1 }, // Often a Batter or All-rounder, but listed for hierarchy
        { role: 'Batter', count: 4 }, // Total Batters: ~5 (including Captain)
        { role: 'All-rounder', count: 3 },
        { role: 'Wicket Keeper', count: 2 },
        { role: 'Fast Bowler', count: 3 },
        { role: 'Spin Bowler', count: 2 }
        // Total: 1+4+3+2+3+2 = 15
    ];
    if (sport === 'Football') return [
        { role: 'Goalkeeper', count: 2 },
        { role: 'Defender', count: 5 },
        { role: 'Midfielder', count: 5 },
        { role: 'Striker', count: 3 }
        // Total: 2+5+5+3 = 15
    ];
    return [ // Track & Field
        { role: 'Sprinter', count: 4 },
        { role: 'Long Distance', count: 3 },
        { role: 'Jumper', count: 3 },
        { role: 'Thrower', count: 3 },
        { role: 'Hurdler', count: 2 }
        // Total: 4+3+3+3+2 = 15
    ];
};

const getBioInfo = (sport, role, name, teamName) => {
    const data = {
        'Cricket': {
            styles: ['Aggressive Top-order', 'Classical Anchor', 'Power Finisher', 'Swing Specialist', 'Express Pace', 'Mystery Spin', 'Tactical All-rounder'],
            records: ['Most centuries in a season', 'Fastest 50 in league history', 'Top wicket-taker 2024', 'Highest strike rate', 'Best economy in death overs'],
            weaknesses: ['Susceptible to short-pitch bowling', 'Struggles against left-arm spin', 'High dot-ball percentage', 'Injury prone hamstrings'],
            internationalTeams: ['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'West Indies']
        },
        'Football': {
            styles: ['Clinical Finisher', 'Box-to-box engine', 'Creative Playmaker', 'Wing Wizard', 'Defensive Rock', 'Ball-playing Centerback', 'Sweeper Keeper'],
            records: ['Golden Boot Winner', 'Most clean sheets in a row', 'Top distance covered', '95% passing accuracy', 'Most interceptions in league'],
            weaknesses: ['Poor aerial presence', 'Limited weak foot usage', 'Aggressive card history', 'Fades in final quarter'],
            internationalTeams: ['Brazil', 'France', 'Germany', 'Argentina', 'Spain', 'Portugal', 'England']
        },
        'Track & Field': {
            styles: ['Explosive Sprinter', 'Endurance Master', 'Technical Jumper', 'Power Thrower', 'Rhythmic Hurdler', 'Split-second finisher'],
            records: ['Olympic Qualifier B-Standard', 'National Record Holder', 'Season Personal Best: Elite', 'Most consistent top-3 finishes'],
            weaknesses: ['Slow starting blocks', 'Poor cornering velocity', 'Vertical lift inconsistency', 'Mental pressure in finals'],
            internationalTeams: ['USA', 'Jamaica', 'Kenya', 'Great Britain', 'Canada', 'Germany', 'Australia']
        }
    };

    const sportData = data[sport] || data['Football'];
    const intlTeam = teamName.includes('India') || teamName.includes('MUMBAI') || teamName.includes('CHENNAI') ? 'India' :
        teamName.includes('USA') ? 'USA' :
            teamName.includes('Jamaica') ? 'Jamaica' :
                sportData.internationalTeams[Math.floor(Math.random() * sportData.internationalTeams.length)];

    return {
        bio: `${name} is a dedicated ${role} known for their exceptional commitment to ${sport}. A key asset to the team.`,
        playingStyle: sportData.styles[Math.floor(Math.random() * sportData.styles.length)],
        records: [
            sportData.records[Math.floor(Math.random() * sportData.records.length)],
            sportData.records[(Math.floor(Math.random() * sportData.records.length) + 1) % sportData.records.length]
        ],
        internationalTeam: intlTeam,
        debutSeason: `${2016 + Math.floor(Math.random() * 8)}`,
        weaknesses: [sportData.weaknesses[Math.floor(Math.random() * sportData.weaknesses.length)]]
    };
};

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        await Player.deleteMany({});
        await Performance.deleteMany({});
        console.log('Cleared Player and Performance collections');

        const usedNames = new Set();

        for (const team of TEAMS) {
            console.log(`Seeding team: ${team.name} (${team.sport})`);
            const roles = getRoles(team.sport);
            const usedJerseyNumbers = new Set();
            let playerCount = 0;

            for (const roleDef of roles) {
                for (let i = 0; i < roleDef.count; i++) {
                    let playerName = getUniqueName(usedNames);
                    usedNames.add(playerName);

                    let jerseyNumber;
                    do {
                        jerseyNumber = Math.floor(Math.random() * 99) + 1;
                    } while (usedJerseyNumbers.has(jerseyNumber));
                    usedJerseyNumbers.add(jerseyNumber);

                    const bioData = getBioInfo(team.sport, roleDef.role, playerName, team.name);

                    // If it's the specific "Captain" role, make sure position is Captain
                    // Otherwise role is position.
                    // For cricket, if role is Captain, we set that.

                    const player = new Player({
                        name: playerName,
                        email: `${playerName.toLowerCase().replace(/ /g, '.')}@${team.name.toLowerCase().replace(/ /g, '')}.com`,
                        sport: team.sport,
                        teamName: team.name,
                        position: roleDef.role,
                        jerseyNumber: jerseyNumber,
                        ...bioData,
                        injuryHistory: [
                            {
                                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * (2 + Math.random() * 10)),
                                type: 'Muscle Fatigue',
                                severity: 'Low',
                                recoveryTime: 3
                            }
                        ],
                        physicalStats: {
                            height: 165 + Math.floor(Math.random() * 35),
                            weight: 60 + Math.floor(Math.random() * 40),
                            bodyFatPercentage: 6 + Math.floor(Math.random() * 12)
                        }
                    });

                    try {
                        const savedPlayer = await player.save();
                        playerCount++;

                        // Seed performance history
                        for (let j = 0; j < 3; j++) {
                            const date = new Date();
                            date.setDate(date.getDate() - (j * 7));

                            const perf = new Performance({
                                playerId: savedPlayer._id,
                                sport: team.sport,
                                date: date,
                                physical_metrics: {
                                    fatigue_level: Math.random() * 0.4,
                                    heart_rate: 60 + Math.floor(Math.random() * 40),
                                    speed: 20 + Math.random() * 15,
                                    reaction_time_ms: 150 + Math.floor(Math.random() * 100)
                                },
                                ai_targets: {
                                    win_probability: 0.6 + Math.random() * 0.35,
                                    performance_drop_next_5min: Math.random() * 0.1
                                },
                                overallScore: 70 + Math.floor(Math.random() * 30)
                            });
                            await perf.save();
                        }

                    } catch (e) {
                        console.error(`Failed to seed ${playerName}:`, e.message);
                    }
                }
            }
            console.log(`   -> Seeded ${playerCount} players for ${team.name}`);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
