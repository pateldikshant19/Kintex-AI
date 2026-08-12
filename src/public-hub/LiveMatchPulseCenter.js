import React, { useState, useEffect } from 'react';
import { Bell, Star, Grid, List, ChevronDown, ChevronRight, Activity, Users } from 'lucide-react';
import apiService from '../utils/apiService';

const LiveMatchPulseCenter = ({ onSelectMatch }) => {
    const [matches, setMatches] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All Matches');

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await apiService.getLiveMatches();
                const realData = res.data || [];
                
                if (realData.length > 0) {
                    const mappedMatches = realData.map((m, idx) => {
                        // Attempt to parse names like "Team A vs Team B"
                        let tA = "Team A", tB = "Team B";
                        if (m.name && m.name.includes(' vs ')) {
                            const parts = m.name.split(' vs ');
                            tA = parts[0];
                            tB = parts[1].split(',')[0]; // remove "1st Test" etc
                        } else if (m.name) {
                            tA = m.name.substring(0, 10);
                            tB = "Opponent";
                        }
                        
                        // Default values
                        let sA = '-', sB = '-', oA = '', oB = '';
                        if (m.score && m.score.length > 0) {
                            const scoreObj = m.score[0];
                            
                            // RapidAPI/Cricbuzz format
                            if (scoreObj.team1Score && scoreObj.team1Score.inngs1) {
                                const s1 = scoreObj.team1Score.inngs1;
                                sA = `${s1.runs || 0}/${s1.wickets || 0}`;
                                oA = `(${s1.overs || 0} ov)`;
                            }
                            if (scoreObj.team2Score && scoreObj.team2Score.inngs1) {
                                const s2 = scoreObj.team2Score.inngs1;
                                sB = `${s2.runs || 0}/${s2.wickets || 0}`;
                                oB = `(${s2.overs || 0} ov)`;
                            }
                            
                            // CricAPI format fallback
                            if (scoreObj.r !== undefined) {
                                sA = `${m.score[0].r}/${m.score[0].w || 0}`;
                                oA = `(${m.score[0].o || 0} ov)`;
                                if (m.score.length > 1) {
                                    sB = `${m.score[1].r}/${m.score[1].w || 0}`;
                                    oB = `(${m.score[1].o || 0} ov)`;
                                }
                            }
                        }

                        // Generate a pseudo-random win probability based on the match ID for demo purposes
                        const hash = (m.id || m.matchId || idx).toString().split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
                        const probA = Math.abs(hash) % 80 + 10; 
                        
                        // Empty score if 0/0 and not started
                        if (sA === '0/0' && sB === '0/0') {
                            sA = '-'; sB = '-';
                        }
                        
                        return {
                            id: m.id || `real-${idx}`,
                            sport: 'Cricket',
                            matchup: m.name,
                            phase: m.status || 'Upcoming',
                            isLive: sA !== '-' || (m.status && m.status.toLowerCase().includes('live')),
                            teamA: tA,
                            teamA_Score: sA,
                            teamA_Overs: oA !== '(0 ov)' ? oA : '',
                            teamB: tB,
                            teamB_Score: sB,
                            teamB_Overs: oB !== '(0 ov)' ? oB : '',
                            statusText: m.status || 'Live',
                            date: m.date,
                            probA: probA,
                            probB: 100 - probA,
                            probA_color: 'bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600',
                            probB_color: 'bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600'
                        };
                    });
                    
                    // Backend already sorts them correctly, so no need to re-sort
                    setMatches(mappedMatches);
                } else {
                    setMatches([]); // no live matches
                }
            } catch (err) {
                console.error("Failed to fetch matches", err);
            }
        };

        fetchMatches();
    }, []);

    const filters = ['All Matches', 'International', 'Leagues', 'Domestic', 'A-Team'];

    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-screen-2xl mx-auto pb-20">
            
            {/* MAIN CONTENT COLUMN */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-[28px] font-black text-slate-900 dark:text-white tracking-tight mb-2">Live Match Center <span className="text-emerald-500 inline-block align-middle ml-1"><Activity size={24}/></span></h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">The world's sports momentum, redefined through AI.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-[#13131a] border border-emerald-100 dark:border-[#1e1e2a] rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">15 Live Events</span>
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                    activeFilter === f 
                                        ? 'bg-emerald-500 text-white shadow-sm' 
                                        : 'bg-white dark:bg-[#13131a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e1e2a] hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">View:</span>
                            <div className="flex bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-lg p-0.5">
                                <button className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm"><Grid size={14} /></button>
                                <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><List size={14} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] text-[11px] font-bold text-slate-700 dark:text-slate-200 rounded-lg hover:border-slate-300 dark:hover:border-slate-700">
                                Live First <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Match Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {matches.map((m, idx) => (
                        <div key={m.id} onClick={() => onSelectMatch(m.id)} className="bg-white dark:bg-[#13131a] rounded-[20px] border border-slate-200 dark:border-[#1e1e2a] overflow-hidden flex flex-col hover:shadow-lg dark:hover:border-slate-700 transition-all cursor-pointer group">
                            
                            {/* Card Header */}
                            <div className="p-4 pb-2 border-b border-slate-100 dark:border-[#1e1e2a]/50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {m.isLive && !m.statusText.toLowerCase().includes('upcoming') ? (
                                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                            LIVE
                                        </span>
                                    ) : m.statusText.toLowerCase().includes('upcoming') ? (
                                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                            UPCOMING
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                            RESULT
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
                                        {m.phase}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Bell size={14} className="hover:text-slate-700 dark:hover:text-white transition-colors" />
                                    <Star size={14} className="hover:text-amber-400 transition-colors" />
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-grow flex flex-col justify-between">
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{m.sport} · {m.matchup}</p>
                                    
                                    {/* Team A */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.teamA}&backgroundColor=10b981`} alt={m.teamA} className="w-full h-full" />
                                            </div>
                                            <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{m.teamA}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[15px] font-black text-slate-900 dark:text-white">{m.teamA_Score}</div>
                                            {m.teamA_Overs && <div className="text-[10px] font-medium text-slate-400">{m.teamA_Overs}</div>}
                                        </div>
                                    </div>
                                    
                                    {/* Team B */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.teamB}&backgroundColor=3b82f6`} alt={m.teamB} className="w-full h-full" />
                                            </div>
                                            <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{m.teamB}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[15px] font-black text-slate-900 dark:text-white">{m.teamB_Score}</div>
                                            {m.teamB_Overs && <div className="text-[10px] font-medium text-slate-400">{m.teamB_Overs}</div>}
                                        </div>
                                    </div>

                                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 mb-2">{m.statusText}</div>
                                </div>

                                {/* Win Probability */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Win Probability</p>
                                    <div className="flex justify-between items-end mb-1 text-[11px] font-bold">
                                        <span className="text-slate-900 dark:text-white uppercase">{(m.teamA.substring(0,3))} {m.probA}%</span>
                                        <span className="text-slate-400 uppercase">{m.probB}% {(m.teamB.substring(0,3))}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div className={`h-full ${m.probA_color}`} style={{ width: `${m.probA}%` }}></div>
                                        <div className={`h-full ${m.probB_color}`} style={{ width: `${m.probB}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-3 bg-slate-50 dark:bg-[#0a0a0c] border-t border-slate-100 dark:border-[#1e1e2a] flex justify-center items-center">
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-1 transition-colors">
                                    View Match <ChevronRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* BOTTOM PANELS */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Today's Spotlight */}
                    <div className="bg-white dark:bg-[#13131a] rounded-[20px] border border-slate-200 dark:border-[#1e1e2a] p-5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Today's Spotlight</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Afghanistan A <span className="text-slate-400 font-normal">vs</span> Sri Lanka A</span>
                                    <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded">LIVE</span>
                                </div>
                                <div className="flex flex-col text-[11px] text-slate-500 ml-8">
                                    <div className="flex justify-between w-32"><span className="font-bold text-slate-700 dark:text-slate-300">AFD-A</span> <span>218/8 <span className="text-[9px]">(54.0 ov)</span></span></div>
                                    <div className="flex justify-between w-32"><span className="font-bold text-slate-700 dark:text-slate-300">SL-A</span> <span>37/0 <span className="text-[9px]">(8.3 ov)</span></span></div>
                                </div>
                                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 mt-1 ml-8">Sri Lanka A need 182 runs</div>
                            </div>
                            <div className="w-32 flex flex-col items-center">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Win Probability</div>
                                <div className="w-full flex items-center justify-between text-[11px] font-bold mb-1">
                                    <span className="text-slate-900 dark:text-white">33%</span>
                                    <span className="text-blue-500">67%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600" style={{ width: '33%' }}></div>
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600" style={{ width: '67%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Results */}
                    <div className="bg-white dark:bg-[#13131a] rounded-[20px] border border-slate-200 dark:border-[#1e1e2a] p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Results</h3>
                            <button className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">View All Results</button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">India vs South Africa</span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">IND won by 6 wickets</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Australia vs West Indies</span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">AUS won by 201 runs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR / PANEL */}
            <div className="w-full xl:w-72 flex-shrink-0 flex flex-col gap-6">
                
                {/* Match Overview */}
                <div className="bg-white dark:bg-[#13131a] rounded-[20px] border border-slate-200 dark:border-[#1e1e2a] p-5">
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Match Overview</h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Live</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">15</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Upcoming</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">7</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Stumps</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">4</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Result</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">3</span>
                        </li>
                    </ul>
                    <button className="w-full mt-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-100 dark:border-[#1e1e2a]">
                        View All Analytics
                    </button>
                </div>

                {/* Top Momentum */}
                <div className="bg-white dark:bg-[#13131a] rounded-[20px] border border-slate-200 dark:border-[#1e1e2a] p-5">
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Top Momentum</h3>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 w-3">1</span>
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><img src="https://api.dicebear.com/7.x/initials/svg?seed=Yorkshire" alt="Yorkshire" /></div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Yorkshire</span>
                            </div>
                            <span className="text-xs font-black text-emerald-500">82%</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 w-3">2</span>
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><img src="https://api.dicebear.com/7.x/initials/svg?seed=Jabalpur" alt="Jabalpur" /></div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Jabalpur</span>
                            </div>
                            <span className="text-xs font-black text-emerald-500">78%</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 w-3">3</span>
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><img src="https://api.dicebear.com/7.x/initials/svg?seed=Middlesex" alt="Middlesex" /></div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Middlesex</span>
                            </div>
                            <span className="text-xs font-black text-emerald-500">76%</span>
                        </li>
                    </ul>
                </div>

                {/* Upcoming Next */}
                <div className="bg-white dark:bg-[#13131a] rounded-[20px] border border-slate-200 dark:border-[#1e1e2a] p-5">
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Upcoming Next</h3>
                    <div className="space-y-4">
                        {matches.filter(m => m.statusText && m.statusText.toLowerCase().includes('upcoming')).slice(0, 3).map((match, i, arr) => (
                            <div key={match.id || i} className={i !== arr.length - 1 ? "border-b border-slate-100 dark:border-[#1e1e2a] pb-3" : ""}>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Upcoming Match</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{match.teamA} <span className="text-slate-400 text-xs mx-0.5">vs</span> {match.teamB}</span>
                                </div>
                                <div className="text-[10px] font-medium text-slate-500 ml-5">{new Date(match.date || new Date()).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} • {new Date(match.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        ))}
                        {matches.filter(m => m.statusText && m.statusText.toLowerCase().includes('upcoming')).length === 0 && (
                            <div className="text-sm text-slate-500 dark:text-slate-400">No upcoming matches right now.</div>
                        )}
                    </div>
                    <button className="w-full mt-4 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-center">
                        View Full Calendar
                    </button>
                </div>

                {/* AI Match Insights */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-[#0f1f1a] dark:to-[#0a1410] rounded-[20px] p-6 text-white relative overflow-hidden border border-transparent dark:border-emerald-500/20">
                    {/* Decorative pattern */}
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 w-32 h-32 rounded-full border-8 border-white"></div>
                    <div className="absolute left-0 top-0 opacity-5 transform -translate-x-1/4 -translate-y-1/4 w-24 h-24 rounded-full border-4 border-white"></div>
                    
                    <h3 className="text-lg font-black tracking-tight mb-1 relative z-10">AI MATCH INSIGHTS</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-100 dark:text-emerald-500 mb-4 relative z-10">Powered by Kinetix AI</p>
                    <p className="text-xs font-medium text-emerald-50 dark:text-slate-300 leading-relaxed mb-6 relative z-10">
                        Real-time AI insights, momentum shifts, and game predictions.
                    </p>
                    
                    {/* Tiny wave graphic */}
                    <svg className="w-full h-8 mb-4 opacity-50 dark:opacity-30 relative z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0,10 C20,20 30,0 50,10 C70,20 80,0 100,10" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>

                    <button className="w-full py-2.5 bg-white dark:bg-emerald-500 text-emerald-700 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-transform hover:scale-105 active:scale-95 relative z-10 shadow-lg shadow-emerald-900/20">
                        Explore Insights
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LiveMatchPulseCenter;
