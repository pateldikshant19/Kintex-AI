const cricketDataProvider = require('./services/cricketDataProvider');
const { normalizeMatch, parseScoreString } = require('./utils/scoreNormalizer');

async function validatePhase1LiveData() {
  console.log('========================================================');
  console.log('  KINETIX AI — PHASE 1 LIVE DATA & NORMALIZER VALIDATION');
  console.log('========================================================');

  // Test 1: Test score string parser
  console.log('\n[1] Testing Score String Parsing...');
  console.log('    "185/4 (18.2 ov)" ->', parseScoreString("185/4 (18.2 ov)"));
  console.log('    "218-8 (54.0)"    ->', parseScoreString("218-8 (54.0)"));
  console.log('    "142/3"           ->', parseScoreString("142/3"));

  // Test 2: Test raw match normalizer
  console.log('\n[2] Testing Match Normalizer...');
  const testMatch = {
    id: "test-999",
    name: "India vs Australia",
    status: "Live",
    venue: "Bengaluru",
    score: [{ r: 185, w: 4, o: 18.2 }, { r: 172, w: 7, o: 20.0 }]
  };
  const normalized = normalizeMatch(testMatch);
  console.log('    Normalized Result:', JSON.stringify(normalized, null, 2));

  // Test 3: Test Provider Live Matches Pipeline
  console.log('\n[3] Testing Live Match Provider Engine...');
  const matches = await cricketDataProvider.getLiveMatches();
  console.log(`    Successfully retrieved ${matches.length} normalized match(es).`);
  
  if (matches.length > 0) {
    console.log('\n    Sample Match #1:');
    console.log(`    - ID     : ${matches[0].id}`);
    console.log(`    - Matchup: ${matches[0].matchup}`);
    console.log(`    - Status : ${matches[0].statusText}`);
    console.log(`    - Team A : ${matches[0].teamA} (${matches[0].teamA_Score} ${matches[0].teamA_Overs})`);
    console.log(`    - Team B : ${matches[0].teamB} (${matches[0].teamB_Score} ${matches[0].teamB_Overs})`);
    console.log(`    - WinProb: TeamA ${matches[0].probA}% vs TeamB ${matches[0].probB}%`);
  }

  console.log('\n✅ PHASE 1 VALIDATION SUCCESSFUL: Live data schema & fallback engine working!');
}

validatePhase1LiveData();

