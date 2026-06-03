const fs = require('fs');
const path = require('path');

const file = '../../temp_data/football_players.json';
const filePath = path.join(__dirname, file);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (Array.isArray(data) && data.length > 0) {
        const sample = data[0];
        console.log('Keys:', Object.keys(sample));
        console.log('Sample Item:', JSON.stringify(sample, null, 2));
    }
} catch (err) {
    console.error(err);
}
