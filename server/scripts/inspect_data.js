const fs = require('fs');
const path = require('path');

const files = [
    '../../temp_data/cricket_players.json',
    '../../temp_data/football_players.json',
    '../../temp_data/track_and_field_players.json'
];

files.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            console.log(`\n--- Structure of ${file} ---`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(JSON.stringify(data[0], null, 2));
            } else {
                console.log('Not an array or empty');
            }
        } else {
            console.log(`File not found: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
