import React, { useState, useEffect } from 'react';
import { Radio, Users, Target, Activity, Calendar, Trophy, ArrowRight, Zap } from 'lucide-react';
import apiService from '../utils/apiService';

const PublicDashboardView = ({ onNavigate }) => {
    const [liveMatches, setLiveMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await apiService.getLiveMatches();
                setLiveMatches(res.data || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const activeLive = liveMatches.filter(m => m.isLive);

    return (
        <div className="space-y-8 max-w-screen-2xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Hero Header Banner */}
            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 border border-slate-800 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                        <Activity size={14} className="animate-pulse" /> Kinetix Sports Hub 2026
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
                        NEXT-GEN SPORTS <span className="text-emerald-400">INTELLIGENCE</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed mb-6">
                        Real-time AI telemetry, match momentum tracking, biomechanical injury forecasting, and deep spatial analytics across international cricket leagues.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => onNavigate('pulse')}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            Open Live Match Center <ArrowRight size={16} />
                        </button>
                        <button 
                            onClick={() => onNavigate('player')}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                            Explore Athlete Signatures
                        </button>
                    </div>
                </div>
            </div>

            {/* Platform Live Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white dark:bg-[#13131a] p-6 rounded-[24px] border border-slate-200 dark:border-[#1e1e2a]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Live Events</span>
                        <Radio size={20} className="text-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{activeLive.length > 0 ? activeLive.length : 15}</div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">Streaming Real-time Scores</div>
                </div>

                <div className="bg-white dark:bg-[#13131a] p-6 rounded-[24px] border border-slate-200 dark:border-[#1e1e2a]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Indexed Athletes</span>
                        <Users size={20} className="text-blue-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">1,240+</div>
                    <div className="text-[10px] text-blue-500 font-bold mt-1 uppercase">Profiles & Biometrics</div>
                </div>

                <div className="bg-white dark:bg-[#13131a] p-6 rounded-[24px] border border-slate-200 dark:border-[#1e1e2a]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Accuracy Rate</span>
                        <Target size={20} className="text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">94.8%</div>
                    <div className="text-[10px] text-amber-500 font-bold mt-1 uppercase">Win Prob & Fatigue Models</div>
                </div>

                <div className="bg-white dark:bg-[#13131a] p-6 rounded-[24px] border border-slate-200 dark:border-[#1e1e2a]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Tournaments</span>
                        <Trophy size={20} className="text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">12</div>
                    <div className="text-[10px] text-purple-500 font-bold mt-1 uppercase">ICC & Global Leagues</div>
                </div>
            </div>

            {/* Featured Live Match Feed */}
            <div className="bg-white dark:bg-[#13131a] p-8 rounded-[32px] border border-slate-200 dark:border-[#1e1e2a]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">FEATURED LIVE MATCHES</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Scores & Win Probability</p>
                    </div>
                    <button 
                        onClick={() => onNavigate('pulse')}
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-600 uppercase tracking-wider flex items-center gap-1"
                    >
                        View All Matches <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {liveMatches.slice(0, 3).map((m) => (
                        <div 
                            key={m.id} 
                            onClick={() => onNavigate('canvas', m.id)}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded">LIVE</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{m.venue || 'International Ground'}</span>
                            </div>
                            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase mb-3">{m.name}</h4>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-700 dark:text-slate-300">{m.teamA}: <strong className="text-slate-900 dark:text-white">{m.teamA_Score}</strong></span>
                                <span className="text-slate-700 dark:text-slate-300">{m.teamB}: <strong className="text-slate-900 dark:text-white">{m.teamB_Score}</strong></span>
                            </div>
                            <div className="text-[11px] text-emerald-600 font-bold">{m.statusText || 'In Progress'}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicDashboardView;
