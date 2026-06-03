import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Share2, Activity, Heart, Shield, Zap, TrendingUp, Trophy } from 'lucide-react';

const PlayerBio = () => {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const res = await fetch(`${process.env.REACT_APP_API_URL}/players/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setPlayer({
                        id: data._id || data.id,
                        name: data.name,
                        sport: data.sport || 'Cricket',
                        role: data.role || data.teamName,
                        age: data.age || 26,
                        team: data.teamName || 'International',
                        imageUrl: data.playerImg || null,
                        stats: { matches: 124, avg: 48.2, strikeRate: 132.5, centuries: 12, fifties: 34 },
                        health: { recovery: 92, fatigue: 24, sleep: 8.5, heartRate: 58 },
                        aiScore: Math.round((data.metrics?.readinessScore || 85) * 10),
                        recentPerformance: [82, 91, 78, 94, 88, 92]
                    });
                }
            } catch (err) {
                console.error("Failed to load player:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Analyzing athlete metrics...</div>
            </div>
        );
    }

    const statCards = [
        { label: 'Matches', value: player.stats.matches, icon: Trophy, accentColor: 'blue' },
        { label: 'Avg', value: player.stats.avg, icon: TrendingUp, accentColor: 'emerald' },
        { label: '100s', value: player.stats.centuries, icon: Shield, accentColor: 'blue' },
        { label: 'Strike Rate', value: player.stats.strikeRate, icon: Zap, accentColor: 'emerald' },
    ];

    const colors = {
        blue:    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: 'bg-blue-500' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' },
    };

    const healthMetrics = [
        { label: 'Muscle Recovery', value: player.health.recovery, displayVal: `${player.health.recovery}%`, color: 'emerald', pct: player.health.recovery },
        { label: 'Fatigue Level', value: player.health.fatigue, displayVal: `${player.health.fatigue}%`, color: 'red', pct: player.health.fatigue },
        { label: 'Sleep Cycle', value: player.health.sleep, displayVal: `${player.health.sleep} hrs`, color: 'blue', pct: (player.health.sleep / 10) * 100 },
        { label: 'Resting Heart Rate', value: player.health.heartRate, displayVal: `${player.health.heartRate} bpm`, color: 'slate', pct: 58 },
    ];

    const healthBarColor = { emerald: 'bg-emerald-500', red: 'bg-red-500', blue: 'bg-blue-500', slate: 'bg-slate-400' };
    const healthTextColor = { emerald: 'text-emerald-500', red: 'text-red-500', blue: 'text-blue-500', slate: 'text-slate-400' };

    return (
        <div className="space-y-5 py-4">
            {/* Back */}
            <Link to="/players" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest transition-colors group">
                <ChevronLeft size={13} className="group-hover:-translate-x-1 transition-transform" /> Back to Squad
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left Column: Profile */}
                <div className="space-y-4">
                    {/* Identity Card */}
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l-2xl"></div>

                        <div className="flex items-start justify-between mb-6">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl font-black text-blue-500">
                                {player.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <button className="p-2 bg-slate-50 dark:bg-[#0a0a0c] hover:bg-slate-100 dark:hover:bg-[#13131a] text-slate-400 hover:text-blue-500 rounded-xl border border-slate-200 dark:border-[#1e1e2a] transition-all">
                                <Share2 size={14} />
                            </button>
                        </div>

                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{player.name}</h1>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">{player.role}</p>

                        <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-[#1e1e2a] border border-slate-200 dark:border-[#2a2a3a] text-slate-500 rounded-lg">{player.sport}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-[#1e1e2a] border border-slate-200 dark:border-[#2a2a3a] text-slate-500 rounded-lg">{player.team}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-[#1e1e2a] border border-slate-200 dark:border-[#2a2a3a] text-slate-500 rounded-lg">Age {player.age}</span>
                        </div>
                    </div>

                    {/* AI Score */}
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-2xl"></div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kinetix AI Score</span>
                            <span className="badge-live">Elite Platinum</span>
                        </div>
                        <div className="flex items-end justify-between mb-3">
                            <span className="text-4xl font-black text-slate-900 dark:text-white k-mono tracking-tight">{player.aiScore}</span>
                            <TrendingUp className="text-emerald-500 mb-1" size={20} />
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[94.5%] rounded-full"></div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">94.5 / 100 percentile</p>
                    </div>
                </div>

                {/* Right Column: Stats + Health */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {statCards.map((stat, i) => {
                            const c = colors[stat.accentColor] || colors.blue;
                            return (
                                <div key={i} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-4 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${c.bar} rounded-l-2xl`}></div>
                                    <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                                        <stat.icon size={15} className={c.text} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white k-mono tracking-tight">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Biometric Health Panel */}
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Heart size={14} className="text-red-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Bio-Metric Readout</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {healthMetrics.map((metric, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
                                        <span className={`text-[10px] font-black k-mono ${healthTextColor[metric.color]}`}>{metric.displayVal}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${healthBarColor[metric.color]} transition-all duration-700`}
                                            style={{ width: `${Math.min(100, metric.pct)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Analysis CTA */}
                    <div className="bg-blue-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="text-base font-black text-white tracking-tight mb-1">AI Ready for Analysis</h4>
                            <p className="text-sm text-blue-100/70">Generate a comprehensive performance projection report for this athlete.</p>
                        </div>
                        <button className="flex-shrink-0 px-6 py-2.5 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition-all text-xs uppercase tracking-wider whitespace-nowrap shadow-sm">
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBio;
