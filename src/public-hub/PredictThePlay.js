import React, { useState, useEffect } from 'react';
import { Target, Trophy, Clock, Zap, BarChart3, TrendingUp, Users, Heart } from 'lucide-react';

const PredictThePlay = () => {
    const [prediction, setPrediction] = useState(null);
    const [stats, setStats] = useState({ iq: 845, streak: 3, accuracy: 78 });
    const [matchContext, setMatchContext] = useState(null);

    useEffect(() => {
        // Receiving Professional Signals for the Simulator
        setMatchContext({
            sport: 'Cricket',
            phase: '16.4 Overs',
            score: '142/3',
            batsman: 'Dikshant Patel',
            professionalSignals: {
                fatigue: 0.12,
                momentum: 0.68,
                predictedNext: 'Aggressive Boundary Attempt'
            }
        });
    }, []);

    const predictions = [
        { id: 'bound', label: 'NEXT BOUNDARY', points: 150, color: 'text-amber-400' },
        { id: 'wicket', label: 'NEXT WICKET', points: 400, color: 'text-rose-500' },
        { id: 'maiden', label: 'NEXT MAIDEN OVER', points: 800, color: 'text-emerald-400' },
        { id: 'dot', label: 'NEXT DOT BALL', points: 50, color: 'text-slate-400' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-[#09090b] text-slate-900 dark:text-white rounded-[40px] border border-slate-200 dark:border-zinc-800 relative overflow-hidden transition-all duration-500 min-h-[700px] shadow-2xl">
            {/* Background Animation */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>

            <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
                {/* Simulator Area */}
                <div className="md:w-2/3">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black italic tracking-widest text-slate-900 dark:text-white mb-2 leading-none uppercase">PREDICT THE PLAY</h1>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <Clock size={12} /> REAL-TIME PROFESSIONAL DATA BRIDGE ACTIVE
                        </p>
                    </div>

                    {/* LIVE PROFESSIONAL CONTEXT */}
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 mb-10 group hover:border-slate-400 transition-all shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-slate-900 dark:text-white" /> PROFESSIONAL PULSE SIGNALS
                            </h3>
                            <div className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full">LIVE DATA STREAM</div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-12">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">CURRENT PHASE</p>
                                <p className="text-3xl font-black text-white italic tracking-tighter uppercase">{matchContext?.phase}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">SCORE RECONSTRUCT</p>
                                <p className="text-3xl font-black text-white italic tracking-tighter uppercase">{matchContext?.score}</p>
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">MOMENTUM SWING</p>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full max-w-[200px]">
                                    <div className="h-full bg-blue-600 shadow-[0_0_10px_#3b82f6] animate-pulse transition-all" style={{ width: '68%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-black italic tracking-widest text-white mb-6 uppercase">WHAT HAPPENS NEXT?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {predictions.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => setPrediction(p.id)}
                                className={`p-8 rounded-[32px] border text-left transition-all duration-300 transform active:scale-95 ${prediction === p.id ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-black shadow-2xl' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-400'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${prediction === p.id ? 'text-slate-200 dark:text-slate-700' : 'text-slate-500'}`}>{p.label}</h4>
                                    <div className={`${prediction === p.id ? 'text-white dark:text-black' : p.color} font-black text-xs uppercase tracking-widest`}>+{p.points} IQ</div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-4 mb-2">CROWD CONFIDENCE</p>
                                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                     <div 
                                        className={`h-full opacity-60 transition-all ${p.id === 'wicket' ? 'bg-slate-400' : 'bg-slate-300 dark:bg-white'}`}
                                        style={{ width: `${Math.random() * 80 + 10}%` }}
                                     ></div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={!prediction}
                        className={`w-full mt-10 py-6 rounded-[32px] font-black italic tracking-widest uppercase transition-all shadow-2xl ${prediction ? 'bg-white text-black hover:bg-slate-100 hover:scale-105 active:scale-95 shadow-white/10' : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5'}`}
                    >
                        SUBMIT KINETIX PREDICTION
                    </button>
                </div>

                {/* Leaderboard & IQ Sidebar */}
                <div className="md:w-1/3 border-l border-slate-200 dark:border-white/5 pl-8">
                    <div className="p-8 bg-slate-900 dark:bg-white rounded-[32px] text-white dark:text-black shadow-2xl mb-10 overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">YOUR KINETIX IDENTITY</h3>
                            <div className="flex items-end justify-between mb-8">
                                <div className="text-6xl font-black italic tracking-tighter leading-none">{stats.iq}</div>
                                <div className="text-sm font-black italic uppercase text-slate-400 dark:text-slate-500">IQ RANK</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">STREAK</p>
                                    <p className="text-xl font-black text-white dark:text-black italic tracking-tighter uppercase">{stats.streak} LIVES</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">ACCURACY</p>
                                    <p className="text-xl font-black text-white dark:text-black italic tracking-tighter uppercase">{stats.accuracy}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                             <TrendingUp size={180} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Trophy size={14} className="text-amber-500" /> LIVE LEADERBOARD
                            </h3>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">WEEKLY CHALLENGE</span>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { rank: 1, name: 'Alex_SportAI', points: 14201 },
                                { rank: 2, name: 'Kinetix_Pro_2', points: 13500 },
                                { rank: 3, name: 'Fanatic101', points: 12891 },
                                { rank: 4, name: 'DataWizard', points: 11002 }
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-black ${i < 3 ? 'text-amber-400' : 'text-slate-600'}`}>#{user.rank}</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-white">{user.name}</span>
                                    </div>
                                    <span className="text-xs font-black italic text-blue-500">{user.points.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        
                        <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white border border-white/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest">VIEW GLOBAL RANKINGS</button>
                    </div>
                </div>
            </div>

            {/* CROWD INTELLIGENCE PANEL */}
            <div className="mt-20 border-t border-white/5 pt-12">
                 <div className="flex items-center justify-between mb-12">
                     <h3 className="text-2xl font-black italic tracking-widest text-white uppercase flex items-center gap-4">
                        <Users className="text-blue-500 animate-bounce" /> CROWD INTELLIGENCE PULSE
                     </h3>
                     <div className="flex items-center gap-6">
                         <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PREDICTIONS ACTIVE</p>
                            <p className="text-lg font-black text-white">1,402</p>
                         </div>
                         <div className="w-px h-10 bg-white/10"></div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CROWD CONFIDENCE</p>
                            <p className="text-lg font-black text-emerald-500 italic">HI-RES</p>
                         </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-10 h-64 overflow-hidden relative group">
                         <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">LIVE CONFIDENCE WAVEFORM</h4>
                         {/* Mosaic Pulse Graph */}
                         <div className="absolute inset-x-10 bottom-10 h-32 flex items-end gap-1">
                             {Array.from({ length: 40 }).map((_, i) => (
                                 <div 
                                    key={i} 
                                    className="flex-grow bg-blue-600/40 rounded-full transition-all duration-1000 group-hover:bg-blue-600"
                                    style={{ height: `${20 + Math.sin(i/3) * 30 + Math.random() * 50}%` }}
                                 ></div>
                             ))}
                         </div>
                         <div className="absolute top-10 right-10 flex items-center gap-2">
                             <Heart size={14} className="text-rose-500 animate-pulse" />
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">CROWD EMOTION: POSITIVE</span>
                         </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <p className="text-4xl font-black italic tracking-tighter text-white mb-6 leading-tight uppercase">THE CROWD EXPECTS A <span className="text-amber-500 underline decoration-blue-600/50 underline-offset-8">BOUNDARY</span> WITHIN THE NEXT 12 BALLS.</p>
                        <p className="text-sm text-slate-500 font-medium italic leading-relaxed">Cross-referencing real-time crowd data with Kinetix AI professional momentum scores. Accuracy correlation factor: 0.92.</p>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default PredictThePlay;
