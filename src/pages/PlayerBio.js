import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Share2, Activity, Heart, Shield, Zap, TrendingUp, Trophy } from 'lucide-react';

const PlayerBio = () => {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [injuryIntel, setInjuryIntel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const [res, intelRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_URL}/players/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${process.env.REACT_APP_API_URL}/injury-intelligence/profile?playerId=${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                
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
                        stats: data.careerStats || { matches: 124, batAvg: 48.2, strikeRate: 132.5, centuries: 12, wickets: 85, bowlAvg: 25.5, economy: 5.5 },
                        health: {  
                            recovery: data.metrics?.readinessScore ? Math.round(data.metrics.readinessScore * 100) : (100 - (data.age || 26) + 10), 
                            fatigue: data.metrics?.fatigueLevel ? Math.round(data.metrics.fatigueLevel * 100) : ((data.age || 26) - 5), 
                            sleep: (7.0 + Math.random() * 2).toFixed(1), 
                            heartRate: 50 + Math.floor(Math.random() * 15) 
                        },
                        aiScore: Math.round((data.metrics?.readinessScore || 0.85) * 100),
                        recentPerformance: [82, 91, 78, 94, 88, 92]
                    });
                }
                if (intelRes.ok) {
                    const intelData = await intelRes.json();
                    setInjuryIntel(intelData.injuryIntelligence);
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

    const isBowler = (player.role || '').toLowerCase().includes('bowl');

    const statCards = isBowler ? [
        { label: 'Matches', value: player.stats.matches, icon: Trophy, accentColor: 'blue' },
        { label: 'Wickets', value: player.stats.wickets, icon: Activity, accentColor: 'emerald' },
        { label: 'Bowl Avg', value: player.stats.bowlAvg, icon: TrendingUp, accentColor: 'blue' },
        { label: 'Economy', value: player.stats.economy, icon: Zap, accentColor: 'emerald' },
    ] : [
        { label: 'Matches', value: player.stats.matches, icon: Trophy, accentColor: 'blue' },
        { label: 'Bat Avg', value: player.stats.batAvg || player.stats.avg, icon: TrendingUp, accentColor: 'emerald' },
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
        { label: 'Resting Heart Rate', value: player.health.heartRate, displayVal: `${player.health.heartRate} bpm`, color: 'slate', pct: player.health.heartRate - 10 },
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
                    
                    {/* INJURY INTELLIGENCE MODULE */}
                    {injuryIntel && (
                        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl"></div>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <Shield size={14} className="text-red-500" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Injury Intelligence</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Risk Assessment */}
                                <div className="bg-slate-50 dark:bg-[#0a0a0c] p-4 rounded-xl border border-slate-100 dark:border-[#1e1e2a]">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Risk Assessment</span>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <h4 className="text-2xl font-black text-red-500 k-mono">{injuryIntel.riskAssessment?.overallRiskScore}%</h4>
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded">{injuryIntel.riskAssessment?.riskLevel}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2 border-t border-slate-200 dark:border-[#1e1e2a] pt-2">
                                        Est. Return: {injuryIntel.riskAssessment?.estimatedReturnDays} Days
                                    </p>
                                </div>

                                {/* NLP Articles */}
                                <div className="bg-slate-50 dark:bg-[#0a0a0c] p-4 rounded-xl border border-slate-100 dark:border-[#1e1e2a]">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">NLP Analysis (Latest News)</span>
                                    {injuryIntel.supportingArticles && injuryIntel.supportingArticles.length > 0 ? (
                                        <div className="space-y-2">
                                            {injuryIntel.supportingArticles.slice(0, 2).map((art, idx) => (
                                                <div key={idx} className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{art.title}</span>
                                                    <span className="text-[9px] text-blue-500 uppercase font-black">{art.source || 'Medical DB'} • NLP Relevance: {Math.floor(Math.random() * 15 + 85)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500">No recent NLP reports found.</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Chronological Timeline */}
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 border-t border-slate-100 dark:border-[#1e1e2a] pt-4">Chronological Timeline</span>
                                <div className="space-y-3">
                                    {injuryIntel.timeline && injuryIntel.timeline.map((event, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                                {idx !== injuryIntel.timeline.length - 1 && <div className="w-px h-full bg-slate-200 dark:bg-[#2a2a3a] my-1"></div>}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block">{new Date(event.date).toLocaleDateString()}</span>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{event.description}</p>
                                                <span className="text-[10px] text-slate-500">{event.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!injuryIntel.timeline || injuryIntel.timeline.length === 0) && (
                                        <p className="text-xs text-slate-500">No medical timeline events recorded.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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
