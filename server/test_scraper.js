const axios = require('axios');
const cheerio = require('cheerio');

async function testPlayerScrape() {
  try {
    const url = 'https://www.cricbuzz.com/profiles/1413/virat-kohli';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    const name = $('h1').text().trim();
    console.log('Player Name:', name);

    // Parse tables
    $('table.table').each((i, table) => {
      console.log(`Table ${i}:`, $(table).text().replace(/\s+/g, ' ').substring(0, 300));
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPlayerScrape();
