const fs = require('fs');
const path = require('path');
const file = '../../temp_data/football_players.json';
const filePath = path.join(__dirname, file);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (data.length > 0) {
        console.log('Object Keys:', Object.keys(data[0]));
    }
} catch (err) { console.error(err); }
