const fs = require('fs');
const path = require('path');
const file = '../../temp_data/football_players.json';
const filePath = path.join(__dirname, file);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (data.length > 0) {
        const player = data[0];
        console.log('--- Injury History Item ---');
        if (player.injuryHistory && player.injuryHistory.length > 0) {
            console.log(JSON.stringify(player.injuryHistory[0], null, 2));
        } else { console.log('None'); }

        console.log('\n--- Performance History Item ---');
        if (player.performanceHistory && player.performanceHistory.length > 0) {
            console.log(JSON.stringify(player.performanceHistory[0], null, 2));
        } else { console.log('None'); }
    }
} catch (err) { console.error(err); }
