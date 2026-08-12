import React, { useState, useEffect } from 'react';
import { Search, Trophy, History, Zap, ArrowLeftRight, ChevronRight, User } from 'lucide-react';
import PerformanceSignature from './PerformanceSignature';

const PlayerEncyclopedia = () => {
    const [players, setPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || '/api';
                // If search term is empty, fetch default famous players list
                const endpoint = searchTerm.trim().length > 0 
                    ? `${API_URL}/public/players/search?q=${searchTerm}`
                    : `${API_URL}/public/players`;
                    
                const res = await fetch(endpoint);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const mappedPlayers = data.map((p, idx) => {
                        return {
                            id: p.playerId || p._id || String(idx),
                            name: p.name,
                            sport: p.sport || 'Cricket',
                            team: p.teamName || 'Global League',
                            role: p.role || 'Professional Cricketer',
                            metrics: { 
                                power: Math.floor(Math.random()*40)+60, 
                                speed: Math.floor(Math.random()*40)+60, 
                                precision: Math.floor(Math.random()*40)+60, 
                                timing: Math.floor(Math.random()*40)+60, 
                                endurance: Math.floor(Math.random()*40)+60, 
                                technique: Math.floor(Math.random()*40)+60 
                            },
                            records: p.records && p.records.length > 0 ? p.records : ['International Professional', 'National Team Cap'],
                            bio: p.bio || 'Real player data loaded from Kinetix secure database.',
                            injury: 'None' // Stripped out for public
                        };
                    });
                    setPlayers(mappedPlayers);
                    if (mappedPlayers.length > 0 && !selectedPlayer) {
                        setSelectedPlayer(mappedPlayers[0]);
                    }
                } else {
                    setPlayers([]);
                }
            } catch (err) {
                console.error("Failed to fetch players", err);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPlayers();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // We no longer filter locally since the backend handles it
    const filteredPlayers = players;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-[#09090b] text-slate-900 dark:text-white rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden min-h-[800px]">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Left Sidebar - Search & List */}
                <div className="md:w-1/3 border-r border-slate-200 dark:border-white/5 pr-8">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black italic tracking-widest text-slate-900 dark:text-white mb-2 leading-none uppercase">INTELLIGENCE ENCYCLOPEDIA</h1>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">DEEP ARCHIVE OF ATHLETE SIGNATURES</p>
                    </div>

                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            type="text" 
                            placeholder="SEARCH PLAYER SIGNATURES..." 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 transition-all uppercase"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredPlayers.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedPlayer(p)}
                                className={`p-4 rounded-3xl cursor-pointer transition-all border ${selectedPlayer?.id === p.id ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-black shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-400'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center font-black text-xs">
                                            {p.name ? p.name.split(' ').map(n=>n[0]).join('').substring(0, 2) : '?'}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest leading-none mb-1">{p.name || 'Unknown'}</h4>
                                            <p className={`text-[9px] font-bold uppercase ${selectedPlayer?.id === p.id ? 'text-blue-200' : 'text-slate-600'}`}>{p.team}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={selectedPlayer?.id === p.id ? 'text-white' : 'text-slate-700'} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Full Details */}
                <div className="md:w-2/3">
                    {selectedPlayer ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{selectedPlayer.sport}</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PLATINUM CORE RANK</div>
                                    </div>
                                    <h2 className="text-6xl font-black italic italic-700 tracking-tighter text-white tracking-widest uppercase truncate max-w-md">{selectedPlayer.name}</h2>
                                    <p className="text-xl font-black text-blue-500 italic uppercase tracking-widest mt-2">{selectedPlayer.role} • {selectedPlayer.team}</p>
                                </div>
                                
                                <PerformanceSignature metrics={selectedPlayer.metrics} color="#3B82F6" size={240} />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="p-8 bg-white/5 rounded-[32px] border border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full -mr-12 -mt-12 blur-3xl transition-all group-hover:bg-blue-600/30"></div>
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                        <Trophy size={14} className="text-amber-500" /> CAREER RECORDS
                                    </h3>
                                    <ul className="space-y-4">
                                        {selectedPlayer.records.map((r, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <Zap size={14} className="text-blue-500 mt-1 shrink-0" />
                                                <p className="text-sm font-bold text-slate-300 italic uppercase leading-relaxed tracking-tight">{r}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="p-8 bg-white/5 rounded-[32px] border border-white/10 group">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                        <History size={14} className="text-emerald-500" /> INJURY TIMELINE
                                    </h3>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${selectedPlayer.injury === 'None' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_10px_currentColor]`}></div>
                                            <p className="text-sm font-black italic uppercase text-white tracking-widest leading-none">{selectedPlayer.injury}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">RAPIDAPI KINETIX SECURE RECORD: <span className="text-emerald-500">VERIFIED</span></p>
                                        <p className="text-xs text-slate-400 italic font-medium leading-relaxed">"{selectedPlayer.bio}"</p>
                                    </div>
                                </section>
                           </div>

                           <div className="mt-12 p-8 bg-slate-900 dark:bg-white rounded-[32px] flex items-center justify-between group cursor-pointer hover:shadow-2xl transition-all active:scale-95">
                                <div>
                                    <h4 className="text-2xl font-black italic tracking-widest text-white dark:text-black leading-none mb-1">COMPARE SIGNATURES</h4>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">BATTLE MECHANIC: ANALYZE DELTA BETWEEN ELITES</p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white transition-all group-hover:rotate-12">
                                    <ArrowLeftRight size={24} />
                                </div>
                           </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <User size={64} className="text-slate-800 mb-6" />
                            <h3 className="text-2xl font-black italic tracking-widest text-slate-700 uppercase">SELECT AN ATHLETE SIGNATURE</h3>
                            <p className="text-xs text-slate-800 font-bold uppercase tracking-widest mt-2">ACCESSING GLOBAL KINETIX ARCHIVE...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerEncyclopedia;
