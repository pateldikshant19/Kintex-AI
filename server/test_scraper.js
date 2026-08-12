const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    try {
        const axiosGetWithRetry = async (url, retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try { return await axios.get(url); } catch (err) {
              if (i === retries - 1) throw err;
              await new Promise(res => setTimeout(res, 1000 * (i + 1)));
            }
          }
        };
        const { data } = await axiosGetWithRetry('https://www.cricbuzz.com/cricket-match/live-scores', 5);
        const $ = cheerio.load(data);
        const matches = [];
        $('a[href^="/live-cricket-scores/"]').each((i, el) => {
            const link = $(el);
            const titleAttr = link.attr('title') || '';
            
            // Format 1: Full live card
            const teamElements = link.find('.flex.items-center.gap-4.justify-between');
            if (teamElements.length >= 2) {
                const team1Block = $(teamElements[0]);
                const team2Block = $(teamElements[1]);
                const team1Name = team1Block.find('span.hidden.wb\\:block').text().trim();
                const team1Score = team1Block.find('span.w-1\\/2').text().trim();
                const team2Name = team2Block.find('span.hidden.wb\\:block').text().trim();
                const team2Score = team2Block.find('span.w-1\\/2').text().trim();
                const spans = link.find('span');
                const status = spans.last().text().trim();
                matches.push({ title: titleAttr, team1Name, team1Score, team2Name, team2Score, status });
                return;
            }
            
            // Format 2: Simple text list
            const simpleName = link.find('.text-white').first().text().trim();
            const simpleDesc = link.find('.text-xs.text-\\[\\#d1d1d1\\]').first().text().trim();
            if (simpleName && simpleName.includes(' vs ')) {
                const parts = simpleName.split(' vs ');
                const team1Name = parts[0].trim();
                const team2Name = parts[1].trim();
                
                // Parse status from titleAttr: "Zimbabwe vs India, 2nd T20I - Preview "
                let status = 'Upcoming';
                if (titleAttr.includes(' - ')) {
                    status = titleAttr.split(' - ').pop().trim();
                }
                
                matches.push({ title: titleAttr, team1Name, team1Score: '0/0', team2Name, team2Score: '0/0', status });
            }
        });
        
        console.log("Parsed matches:", matches.length);
        console.log(matches);
    } catch (err) {
        console.error(err);
    }
}
testScrape();
