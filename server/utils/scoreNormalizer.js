/**
 * Unified Cricket Score & Match Data Normalizer
 * Standardizes match objects from CricAPI, RapidAPI (Cricbuzz), HTML Scraping, or Local Data
 */

function parseScoreString(scoreStr) {
  if (!scoreStr || typeof scoreStr !== 'string') {
    return { runs: 0, wickets: 0, overs: 0 };
  }
  const cleanStr = scoreStr.trim();
  
  // Format: "185-4 (18.2)" or "185/4 (18.2)" or "185/4" or "185"
  const matchWithOvers = cleanStr.match(/(\d+)[-/](\d+)\s*\(([\d.]+)\s*ov(?:s)?\)/i) || 
                         cleanStr.match(/(\d+)[-/](\d+)\s*\(([\d.]+)\)/i);
  if (matchWithOvers) {
    return {
      runs: parseInt(matchWithOvers[1], 10) || 0,
      wickets: parseInt(matchWithOvers[2], 10) || 0,
      overs: parseFloat(matchWithOvers[3]) || 0
    };
  }

  const simpleSlash = cleanStr.match(/(\d+)[-/](\d+)/);
  if (simpleSlash) {
    return {
      runs: parseInt(simpleSlash[1], 10) || 0,
      wickets: parseInt(simpleSlash[2], 10) || 0,
      overs: 0
    };
  }

  const justRuns = cleanStr.match(/^(\d+)$/);
  if (justRuns) {
    return {
      runs: parseInt(justRuns[1], 10) || 0,
      wickets: 10,
      overs: 0
    };
  }

  return { runs: 0, wickets: 0, overs: 0 };
}

function calculateWinProbability(teamA_Runs, teamB_Runs, status) {
  const isLive = status && !['complete', 'finished', 'result', 'upcoming', 'preview'].some(s => status.toLowerCase().includes(s));
  if (!isLive) {
    if (status && status.toLowerCase().includes('won')) {
      const firstTeamWon = status.toLowerCase().includes('won') && !status.toLowerCase().includes('lost');
      return firstTeamWon ? { teamA: 100, teamB: 0 } : { teamA: 0, teamB: 100 };
    }
    return { teamA: 50, teamB: 50 };
  }

  if (teamA_Runs === 0 && teamB_Runs === 0) return { teamA: 50, teamB: 50 };
  
  const total = teamA_Runs + teamB_Runs || 1;
  let probA = Math.round((teamA_Runs / total) * 100);
  probA = Math.max(10, Math.min(90, probA));
  return { teamA: probA, teamB: 100 - probA };
}

function normalizeMatch(rawMatch) {
  if (!rawMatch) return null;

  const id = (rawMatch.id || rawMatch.match_id || rawMatch.matchId || `match-${Date.now()}`).toString();
  const name = rawMatch.name || rawMatch.matchName || rawMatch.matchup || 'Cricket Match';
  const status = rawMatch.status || rawMatch.matchStatus || 'Live';
  const venue = rawMatch.venue || 'International Stadium';
  const date = rawMatch.date || new Date().toISOString();

  let teamA_Name = 'Team A';
  let teamB_Name = 'Team B';

  if (name.includes(' vs ')) {
    const parts = name.split(' vs ');
    teamA_Name = parts[0].trim();
    teamB_Name = parts[1].split(',')[0].trim();
  } else if (rawMatch.teams && Array.isArray(rawMatch.teams) && rawMatch.teams.length >= 2) {
    teamA_Name = rawMatch.teams[0];
    teamB_Name = rawMatch.teams[1];
  }

  let teamA_Runs = 0, teamA_Wickets = 0, teamA_Overs = 0;
  let teamB_Runs = 0, teamB_Wickets = 0, teamB_Overs = 0;

  // 1. Structure: score array [{ team1Score, team2Score }] (RapidAPI/Cricbuzz)
  if (rawMatch.score && Array.isArray(rawMatch.score) && rawMatch.score[0]?.team1Score) {
    const s1 = rawMatch.score[0].team1Score?.inngs1 || {};
    const s2 = rawMatch.score[0].team2Score?.inngs1 || {};
    teamA_Runs = s1.runs || 0;
    teamA_Wickets = s1.wickets || 0;
    teamA_Overs = s1.overs || 0;

    teamB_Runs = s2.runs || 0;
    teamB_Wickets = s2.wickets || 0;
    teamB_Overs = s2.overs || 0;
  } 
  // 2. Structure: score array [{ r, w, o }] (CricAPI / MongoDB)
  else if (rawMatch.score && Array.isArray(rawMatch.score) && rawMatch.score.length > 0) {
    const s1 = rawMatch.score[0] || {};
    teamA_Runs = s1.r || s1.runs || 0;
    teamA_Wickets = s1.w !== undefined ? s1.w : (s1.wickets || 0);
    teamA_Overs = s1.o || s1.overs || 0;

    if (rawMatch.score.length > 1) {
      const s2 = rawMatch.score[1] || {};
      teamB_Runs = s2.r || s2.runs || 0;
      teamB_Wickets = s2.w !== undefined ? s2.w : (s2.wickets || 0);
      teamB_Overs = s2.o || s2.overs || 0;
    }
  }
  // 3. Flat properties
  else if (rawMatch.team1Score || rawMatch.team2Score) {
    const parsed1 = typeof rawMatch.team1Score === 'string' ? parseScoreString(rawMatch.team1Score) : (rawMatch.team1Score || {});
    const parsed2 = typeof rawMatch.team2Score === 'string' ? parseScoreString(rawMatch.team2Score) : (rawMatch.team2Score || {});
    teamA_Runs = parsed1.runs || 0;
    teamA_Wickets = parsed1.wickets || 0;
    teamA_Overs = parsed1.overs || 0;

    teamB_Runs = parsed2.runs || 0;
    teamB_Wickets = parsed2.wickets || 0;
    teamB_Overs = parsed2.overs || 0;
  }

  const isLive = !['complete', 'finished', 'result', 'upcoming', 'preview'].some(s => status.toLowerCase().includes(s));

  const teamA_ScoreStr = (teamA_Runs === 0 && teamA_Wickets === 0 && !isLive) ? '-' : `${teamA_Runs}/${teamA_Wickets}`;
  const teamA_OversStr = teamA_Overs > 0 ? `(${teamA_Overs} ov)` : '';

  const teamB_ScoreStr = (teamB_Runs === 0 && teamB_Wickets === 0 && !isLive) ? '-' : `${teamB_Runs}/${teamB_Wickets}`;
  const teamB_OversStr = teamB_Overs > 0 ? `(${teamB_Overs} ov)` : '';

  const winProb = calculateWinProbability(teamA_Runs, teamB_Runs, status);

  return {
    id: id,
    matchId: id,
    name: name,
    matchup: name,
    sport: rawMatch.sport || 'Cricket',
    venue: venue,
    status: status,
    statusText: status,
    isLive: isLive,
    date: date,
    teamA: teamA_Name,
    teamA_Score: teamA_ScoreStr,
    teamA_Overs: teamA_OversStr,
    teamA_Raw: { runs: teamA_Runs, wickets: teamA_Wickets, overs: teamA_Overs },
    teamB: teamB_Name,
    teamB_Score: teamB_ScoreStr,
    teamB_Overs: teamB_OversStr,
    teamB_Raw: { runs: teamB_Runs, wickets: teamB_Wickets, overs: teamB_Overs },
    score: [
      { r: teamA_Runs, w: teamA_Wickets, o: teamA_Overs, inning: `${teamA_Name} Innings 1` },
      { r: teamB_Runs, w: teamB_Wickets, o: teamB_Overs, inning: `${teamB_Name} Innings 1` }
    ],
    winProbability: winProb,
    probA: winProb.teamA,
    probB: winProb.teamB
  };
}

function normalizeMatchList(matches) {
  if (!Array.isArray(matches)) return [];
  return matches.map(normalizeMatch).filter(Boolean);
}

module.exports = {
  parseScoreString,
  calculateWinProbability,
  normalizeMatch,
  normalizeMatchList
};
