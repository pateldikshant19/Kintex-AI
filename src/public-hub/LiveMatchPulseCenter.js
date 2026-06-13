import React, { useState, useEffect } from 'react';
import { Target, Activity, ArrowUpRight, Users, Radio } from 'lucide-react';
import PulseStrip from './PulseStrip';

const LiveMatchPulseCenter = ({ onSelectMatch }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/public/matches');
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const mapped = data.map(m => ({
                        id: m.id,
                        sport: 'Cricket',
                        teamA: m.name ? m.name.split(' vs ')[0] : 'Team A',
                        teamB: m.name && m.name.includes(' vs ') ? m.name.split(' vs ')[1].split(',')[0] : 'Team B',
                        score: m.score && m.score.length > 0 ? `${m.score[0].r}/${m.score[0].w} (${m.score[0].o})` : 'Starts Soon',
                        phase: m.status || 'Upcoming',
                        momentum: Math.random() * 0.8 + 0.1, // Simulated momentum
                        predicted: 'Action Expected'
                    }));
                    setMatches(mapped);
                } else {
                    setMatches([]);
                }
            } catch (err) {
                console.error("Failed to fetch matches", err);
            }
        };

        fetchMatches();
        const interval = setInterval(() => {
            setMatches(prev => prev.map(m => ({
                ...m,
                momentum: Math.min(0.9, Math.max(0.1, m.momentum + (Math.random() - 0.5) * 0.1))
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const liveCount = matches.filter(m => m.score !== 'Upcoming').length;

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="badge-live"><span className="live-dot" style={{width:6,height:6}}></span> Live Global Feed</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kinetix Mission Control Active</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Match Pulse Center</h1>
                    <p className="text-sm text-slate-400 mt-1">The world's sports momentum, redefined through AI.</p>
                </div>

                <div className="flex-shrink-0 px-5 py-3 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Events</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white k-mono">{liveCount}</p>
                </div>
            </div>

            {/* Score Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(m => {
                    const isLive = m.score !== 'Upcoming';
                    return (
                        <div
                            key={m.id}
                            onClick={() => onSelectMatch(m.id)}
                            className={`group relative bg-white dark:bg-[#13131a] border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md overflow-hidden ${
                                isLive
                                    ? 'border-slate-200 dark:border-[#1e1e2a] hover:border-slate-300 dark:hover:border-[#2a2a3a]'
                                    : 'border-slate-100 dark:border-[#1e1e2a] opacity-70 hover:opacity-100'
                            }`}
                        >
                            {/* Live left accent */}
                            {isLive && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-2xl"></div>
                            )}

                            {/* Header row */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    {isLive ? (
                                        <span className="badge-live">
                                            <span className="live-dot" style={{width:6,height:6}}></span>
                                            {m.phase}
                                        </span>
                                    ) : (
                                        <span className="badge-info">{m.phase}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-blue-500 uppercase tracking-widest transition-colors">
                                    Canvas <ArrowUpRight size={11} />
                                </div>
                            </div>

                            {/* Score display */}
                            <div className="mb-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.sport} · Matchup</p>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {m.teamA} <span className="text-slate-400 font-light text-sm mx-1">vs</span> {m.teamB}
                                </h3>
                                <p className="text-xl font-black text-slate-700 dark:text-slate-200 k-mono mt-1 tracking-tight">
                                    {m.score}
                                </p>
                            </div>

                            {/* Momentum Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Activity size={10} className="text-blue-500" /> AI Momentum
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${m.momentum > 0.5 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {m.momentum > 0.5 ? m.teamB : m.teamA} Lead
                                    </span>
                                </div>
                                <PulseStrip momentum={m.momentum} />
                            </div>

                            {/* Crowd Prediction */}
                            <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0a0a0c] border border-slate-100 dark:border-[#1e1e2a] rounded-xl">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Crowd Prediction</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.predicted}</p>
                                </div>
                                <Users size={14} className="text-slate-300 dark:text-slate-600" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Simulator CTA */}
            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Simulator</p>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Experience the Simulator</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                        Access professional-grade data signals. Predict next events. Compete globally. Earn Intelligence Points.
                    </p>
                </div>
                <button className="flex-shrink-0 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm whitespace-nowrap">
                    Enter Kinetix Stadium
                </button>
            </div>
        </div>
    );
};

export default LiveMatchPulseCenter;
