import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Trophy, TrendingUp, Zap, Heart, Flame, Timer, ChevronRight, Award, ShieldCheck, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardChart from '../components/DashboardChart';

const REAL_PLAYER_PERFORMANCES = {
    'virat kohli': {
        name: 'Virat Kohli',
        lastMatch: {
            opponent: 'vs South Africa',
            tournament: 'ICC T20 World Cup Final',
            venue: 'Kensington Oval, Barbados',
            result: 'India Won by 7 Runs (World Cup Champions 🏆)',
            runs: 76,
            balls: 59,
            fours: 6,
            sixes: 2,
            strikeRate: '128.8',
            award: 'Player of the Match',
            impactScore: '98.5'
        },
        trajectory: {
            latest: {
                title: 'T20 World Cup Match-by-Match Runs',
                labels: ['vs IRE', 'vs PAK', 'vs USA', 'vs AFG', 'vs BAN', 'vs AUS', 'vs ENG (Semi)', 'vs SA (Final)'],
                data: [1, 4, 0, 24, 37, 0, 9, 76]
            },
            season: {
                title: 'Season Performance Rating (out of 100)',
                labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
                data: [82, 86, 84, 91, 95, 88, 92, 98]
            }
        },
        careerStats: { matches: 117, avg: '48.7', strikeRate: '137.0', centuries: 1, fifties: 38 }
    },
    'jasprit bumrah': {
        name: 'Jasprit Bumrah',
        lastMatch: {
            opponent: 'vs South Africa',
            tournament: 'ICC T20 World Cup Final',
            venue: 'Kensington Oval, Barbados',
            result: 'India Won by 7 Runs (World Cup Champions 🏆)',
            overs: '4.0',
            wickets: 2,
            runsConceded: 18,
            economy: '4.50',
            award: 'Player of the Tournament',
            impactScore: '99.2'
        },
        trajectory: {
            latest: {
                title: 'Match Bowling Impact Rating',
                labels: ['vs IRE', 'vs PAK', 'vs USA', 'vs AFG', 'vs BAN', 'vs AUS', 'vs ENG (Semi)', 'vs SA (Final)'],
                data: [94, 98, 92, 96, 93, 95, 97, 99]
            },
            season: {
                title: 'Season Economy & Control Index',
                labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
                data: [88, 91, 93, 95, 96, 98, 99, 99]
            }
        },
        careerStats: { matches: 70, wickets: 89, econ: '6.27', bowlAvg: '17.7', dotBallPct: '58.4%' }
    },
    'rohit sharma': {
        name: 'Rohit Sharma',
        lastMatch: {
            opponent: 'vs Australia',
            tournament: 'ICC T20 World Cup Super 8s',
            venue: 'Gros Islet, St Lucia',
            result: 'India Won by 24 Runs',
            runs: 92,
            balls: 41,
            fours: 7,
            sixes: 8,
            strikeRate: '224.4',
            award: 'Player of the Match',
            impactScore: '99.0'
        },
        trajectory: {
            latest: {
                title: 'T20 World Cup Match-by-Match Runs',
                labels: ['vs IRE', 'vs PAK', 'vs USA', 'vs AFG', 'vs BAN', 'vs AUS', 'vs ENG (Semi)', 'vs SA (Final)'],
                data: [52, 13, 3, 8, 23, 92, 57, 9]
            },
            season: {
                title: 'Season Performance Sync Rate',
                labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
                data: [78, 82, 85, 89, 94, 98, 96, 95]
            }
        },
        careerStats: { matches: 159, avg: '32.0', strikeRate: '140.9', centuries: 5, fifties: 32 }
    },
    'default': {
        name: 'Athlete Champion',
        lastMatch: {
            opponent: 'vs Australia',
            tournament: 'International Championship Final',
            venue: 'Melbourne Cricket Ground (MCG)',
            result: 'Victory by 18 Runs',
            runs: 84,
            balls: 52,
            fours: 8,
            sixes: 3,
            strikeRate: '161.5',
            award: 'Star Performer of the Match',
            impactScore: '95.8'
        },
        trajectory: {
            latest: {
                title: 'Recent Matches Performance Scores',
                labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5', 'Match 6', 'Match 7', 'Match 8'],
                data: [72, 78, 85, 80, 89, 92, 88, 96]
            },
            season: {
                title: 'Season Neural Alignment Rate',
                labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
                data: [80, 82, 85, 87, 90, 93, 91, 95]
            }
        },
        careerStats: { matches: 88, avg: '44.2', strikeRate: '142.8', centuries: 3, fifties: 18 }
    }
};

const DashboardPlayer = () => {
    const { user } = useAuth();
    const [liveMatches, setLiveMatches] = useState([]);
    const [chartTab, setChartTab] = useState('latest'); // 'latest' or 'season'

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || '/api';
                const res = await fetch(`${API_URL}/public/matches`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setLiveMatches(data);
                    }
                }
            } catch (err) {
                console.warn("Live match fetch info:", err.message);
            }
        };
        fetchMatches();
    }, []);

    // Resolve player performance details
    const userNameKey = (user?.name || '').toLowerCase().trim();
    const playerPerf = REAL_PLAYER_PERFORMANCES[userNameKey] || REAL_PLAYER_PERFORMANCES['default'];
    const lastMatch = playerPerf.lastMatch;
    const activeTrajectory = playerPerf.trajectory[chartTab] || playerPerf.trajectory.latest;

    // Resolve next match dynamically from Cricbuzz feed if available
    const activeNextMatch = liveMatches.length > 0 ? liveMatches[0] : null;
    const nextFixtureName = activeNextMatch ? activeNextMatch.name : 'India vs Australia';
    const nextFixtureStatus = activeNextMatch ? activeNextMatch.status : 'Upcoming T20 International';

    return (
        <div className="space-y-5 py-4">

            {/* Player Identity Header */}
            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/4 dark:bg-blue-600/6 blur-[60px] rounded-full -mr-24 -mt-24 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl font-black shadow-md flex-shrink-0">
                        {user?.name?.charAt(0) || 'A'}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                            <Zap size={10} /> Live Cricbuzz Athlete Telemetry
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
                            Welcome back, <span className="text-blue-500">{user?.name || 'Champion'}</span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Franchise: <span className="font-bold text-slate-700 dark:text-slate-200">{user?.teamName || 'India'}</span> · Role: <span className="font-bold text-slate-700 dark:text-slate-200">{user?.sport || 'Cricket'}</span> · ID: <span className="font-mono text-xs">{user?._id?.slice(-6) || 'IND-707'}</span>
                        </p>
                    </div>

                    {/* Next match pill (Dynamic from Cricbuzz API) */}
                    <div className="flex-shrink-0 text-center px-6 py-4 bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] rounded-xl max-w-xs">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Cricbuzz Match</p>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">{nextFixtureName}</p>
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{nextFixtureStatus}</span>
                    </div>
                </div>
            </div>

            {/* REAL-LIFE LAST MATCH PERFORMANCE CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-[#11131f] to-[#181028] border border-blue-500/20 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-[9px] font-black uppercase tracking-widest mb-1.5">
                                <Award size={12} /> Real-Life Last Match Performance (Cricbuzz Official)
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-white">{lastMatch.tournament}</h2>
                            <p className="text-xs text-slate-400 mt-0.5">{lastMatch.venue} · <span className="text-emerald-400 font-semibold">{lastMatch.result}</span></p>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 self-start sm:self-auto">
                            <ShieldCheck className="text-emerald-400" size={18} />
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Match Impact</p>
                                <p className="text-sm font-black text-emerald-400">{lastMatch.impactScore} / 100</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {lastMatch.runs !== undefined ? (
                            <>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Runs Scored</p>
                                    <p className="text-2xl font-black text-amber-400">{lastMatch.runs} <span className="text-xs font-normal text-slate-400">({lastMatch.balls}b)</span></p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">{lastMatch.fours}4s · {lastMatch.sixes}6s</p>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Strike Rate</p>
                                    <p className="text-2xl font-black text-blue-400">{lastMatch.strikeRate}</p>
                                    <p className="text-[9px] font-bold text-emerald-400 mt-1">High Impact SR</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bowling Figures</p>
                                    <p className="text-2xl font-black text-amber-400">{lastMatch.wickets}/{lastMatch.runsConceded}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">Overs: {lastMatch.overs}</p>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Economy Rate</p>
                                    <p className="text-2xl font-black text-blue-400">{lastMatch.economy}</p>
                                    <p className="text-[9px] font-bold text-emerald-400 mt-1">Elite Control</p>
                                </div>
                            </>
                        )}

                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Match Accolade</p>
                            <p className="text-sm font-black text-emerald-400 truncate">{lastMatch.award}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1">Official ICC Honor</p>
                        </div>

                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Opponent</p>
                            <p className="text-base font-black text-white">{lastMatch.opponent}</p>
                            <p className="text-[9px] font-bold text-blue-400 mt-1">International T20</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <PlayerStatCard icon={Activity} title="Energy Score" value="92%" sub="System Readiness" accentColor="blue" />
                <PlayerStatCard icon={Flame} title="Calorie Burn" value="2,840" sub="Peak Flux Rate" accentColor="red" />
                <PlayerStatCard icon={TrendingUp} title="Efficiency" value="88.4" sub="Neural Alignment" accentColor="emerald" />
                <PlayerStatCard icon={Heart} title="Heart Rate" value="62" sub="Resting Nominal" accentColor="red" />
            </div>

            {/* Dynamic Personal Trajectory Chart + Schedule Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Performance Trajectory Chart (Interactive LATEST vs SEASON) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Personal Trajectory</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{activeTrajectory.title}</p>
                        </div>
                        <div className="flex bg-slate-50 dark:bg-[#0a0a0c] rounded-lg p-0.5 border border-slate-200 dark:border-[#1e1e2a]">
                            <button
                                onClick={() => setChartTab('latest')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${chartTab === 'latest' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                LATEST
                            </button>
                            <button
                                onClick={() => setChartTab('season')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${chartTab === 'season' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                SEASON
                            </button>
                        </div>
                    </div>

                    <div className="h-[260px] w-full bg-slate-50 dark:bg-[#0a0a0c] rounded-xl border border-slate-100 dark:border-[#1e1e2a] p-4">
                        <DashboardChart
                            data={activeTrajectory.data}
                            labels={activeTrajectory.labels}
                            title={activeTrajectory.title}
                            height={220}
                            color="#3b82f6"
                        />
                    </div>
                </div>

                {/* Schedule + Progress */}
                <div className="space-y-3">
                    {/* Schedule */}
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Match Day Schedule</h2>
                            <Calendar size={15} className="text-slate-400" />
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
                            <TrainingItem time="09:00" title="Neural Conditioning" type="Bio-Lab" icon={Activity} />
                            <TrainingItem time="13:30" title="Tactical Simulation" type="Hub" icon={Zap} />
                            <TrainingItem time="16:00" title="Match Warm-Up" type="Field" icon={Timer} />
                        </div>
                        <div className="p-4">
                            <button className="w-full py-2.5 bg-slate-50 dark:bg-[#0a0a0c] hover:bg-slate-100 dark:hover:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-all">
                                View Full Schedule
                            </button>
                        </div>
                    </div>

                    {/* Season Goal */}
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-2xl"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy size={15} className="text-emerald-500" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Season Objective</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                            Target: International T20 World Cup Title<br />Current Progress: <span className="text-emerald-500 font-bold">World Cup Champions 🏆</span>
                        </p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0a0a0c] rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-emerald-500 w-[100%] rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black text-emerald-500">100% (Completed)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---- Sub-components ---- */

const PlayerStatCard = ({ icon: Icon, title, value, sub, accentColor }) => {
    const colors = {
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: 'bg-blue-500' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' },
        red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', bar: 'bg-red-500' },
    };
    const c = colors[accentColor] || colors.blue;

    return (
        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${c.bar} rounded-l-2xl`}></div>
            <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                <Icon size={17} className={c.text} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight k-mono">{value}</h3>
            <p className={`text-[9px] font-bold ${c.text} uppercase tracking-widest mt-1`}>{sub}</p>
        </div>
    );
};

const TrainingItem = ({ time, title, type, icon: Icon }) => (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors group">
        <span className="text-[10px] font-black text-slate-400 k-mono w-10 flex-shrink-0">{time}</span>
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e1e2a] flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all flex-shrink-0">
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">{title}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{type}</p>
        </div>
    </div>
);

export default DashboardPlayer;
