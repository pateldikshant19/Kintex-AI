import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause, RotateCcw, Target, Zap } from 'lucide-react';
import PulseStrip from './PulseStrip';

/**
 * MatchCanvas — Spatial Match Timeline Reconstructor
 * Replaces traditional row/column tables with a time-series spatial view.
 */
const MatchCanvas = ({ matchId, sport = 'Cricket' }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [matchData, setMatchData] = useState(null);
    const timelineRef = useRef(null);

    // Mock timeline data - ideally fetched from /api/public/match-canvas/:id
    const totalDuration = sport === 'Cricket' ? 300 : sport === 'Football' ? 90 : 48; // overs, mins, etc.

    useEffect(() => {
        // Fetch real data in production
        setMatchData({
            id: matchId,
            sport: sport,
            teamA: { name: 'INDORE EAGLES', color: '#1B4D3E' },
            teamB: { name: 'MUMBAI TITANS', color: '#004BA0' },
            events: [
                { time: 10, type: 'Boundary', value: 4, detail: 'Pull shot through mid-wicket' },
                { time: 45, type: 'Wicket', value: 1, detail: 'Bowled out by express pace' },
                { time: 92, type: 'Boundary', value: 6, detail: 'Straight drive over the bowler' },
                { time: 156, type: 'Goal', value: 1, detail: 'Stunning header in top-left corner' },
            ]
        });
    }, [matchId, sport]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => (prev < totalDuration ? prev + 1 : prev));
                if (currentTime >= totalDuration) setIsPlaying(false);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTime, totalDuration]);

    const activeEvents = matchData?.events.filter(e => e.time <= currentTime) || [];
    const currentEvent = matchData?.events.find(e => e.time === currentTime);

    if (!matchData) return null;

    return (
        <div className="bg-white dark:bg-[#09090b] min-h-screen text-slate-800 dark:text-slate-100 p-8 rounded-[40px] border border-slate-200 dark:border-zinc-800 relative overflow-hidden transition-all duration-500 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-1/2 h-[300px] bg-slate-400/5 dark:bg-white/5 blur-[150px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                        <ChevronLeft className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white tracking-widest leading-none mb-2">MATCH CANVAS REPLAY</h2>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white animate-pulse"></div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{sport} SESSION • {currentTime} / {totalDuration} PHASES COMPLETE</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                    <button 
                        onClick={() => setCurrentTime(0)}
                        className="p-3 text-slate-400 hover:text-white transition-colors"
                    ><RotateCcw size={20} /></button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <div className="px-4 font-mono text-xl font-bold text-white tracking-wide">
                        {String(Math.floor(currentTime / 6)).padStart(2, '0')}.{currentTime % 6}
                    </div>
                </div>
            </div>

            {/* PULSE STRIP (The Momentum Bar) */}
            <div className="mb-12">
               <PulseStrip 
                   momentum={0.3 + (Math.sin(currentTime/20) + 1)/2 * 0.4} 
                   teamAColor={matchData.teamA.color} 
                   teamBColor={matchData.teamB.color} 
               />
               <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-2">
                   <span>{matchData.teamA.name} DOMINANCE</span>
                   <span>{matchData.teamB.name} DOMINANCE</span>
               </div>
            </div>

            {/* SPATIAL TIMELINE (The Reconstructor) */}
            <div className="relative h-64 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[40px] p-10 mb-12 shadow-sm overflow-hidden flex items-end">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-900/5 dark:bg-white/5 -translate-y-1/2"></div>
                
                <div 
                    ref={timelineRef}
                    className="flex items-end gap-1 w-full h-full relative"
                >
                    {Array.from({ length: totalDuration }).map((_, i) => {
                        const eventAtTick = matchData.events.find(e => e.time === i);
                        const isActive = i <= currentTime;
                        const isCurrent = i === currentTime;
                        
                        return (
                            <div 
                                key={i}
                                className={`flex-grow border-r border-white/5 relative transition-all duration-300 ${isActive ? 'h-full opacity-100' : 'h-8 opacity-20'}`}
                            >
                                {isActive && (
                                    <div 
                                        className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-700 ${isCurrent ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                                        style={{ height: `${20 + Math.sin(i/5) * 40}%` }}
                                    ></div>
                                )}
                                
                                {eventAtTick && isActive && (
                                    <div 
                                        className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-all animate-bounce ${
                                            eventAtTick.type === 'Wicket' ? 'bg-slate-900 dark:bg-white' : 
                                            eventAtTick.type === 'Goal' ? 'bg-zinc-800 dark:bg-zinc-100' : 
                                            'bg-slate-400 dark:bg-slate-500'
                                        }`}
                                    >
                                        <Zap size={8} className="text-white dark:text-black" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Scrubber Tooltip */}
                {currentEvent && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 p-4 bg-white text-black rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 z-50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">REALTIME EVENT</div>
                        <div className="text-sm font-black italic uppercase leading-tight">{currentEvent.detail}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full uppercase tracking-widest">{currentEvent.type}</span>
                            <span className="text-[10px] text-slate-400 italic">PHASE: {currentEvent.time}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* SPORT SPECIFIC SPATIAL VIEWS - MOCKUPS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 group hover:border-blue-500/30 transition-all">
                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                        <Target className="text-amber-500" /> Scoring Constellation
                    </h3>
                    <div className="aspect-square bg-black/40 rounded-3xl relative border border-white/5 flex items-center justify-center group-hover:bg-slate-800/40 transition-all overflow-hidden">
                        {/* Mockup of a field/court map */}
                        <div className="absolute inset-0 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-transparent stroke-[0.5]">
                                <circle cx="50" cy="50" r="45" />
                                <line x1="10" y1="50" x2="90" y2="50" />
                                <line x1="50" y1="10" x2="50" y2="90" />
                            </svg>
                        </div>
                        {activeEvents.map((e, idx) => (
                           <div 
                                key={idx}
                                className="absolute w-3 h-3 rounded-full bg-slate-900 dark:bg-white animate-pulse"
                                style={{ top: `${20 + Math.random() * 60}%`, left: `${20 + Math.random() * 60}%` }}
                           ></div>
                        ))}
                        <div className="relative text-center p-8 z-10">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-black leading-relaxed">
                                SCORES ARE NOT NUMBERS. THEY ARE SPATIAL EVENTS.<br/>
                                <span className="text-white italic">HOVER A POINT TO RELIVE THE SHOT.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 group hover:border-emerald-500/30 transition-all">
                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                        <Zap className="text-emerald-500" /> Momentum River FLOW
                    </h3>
                    <div className="h-full min-h-[300px] flex flex-col justify-center gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 group/item">
                                <span className="text-[10px] font-mono text-slate-600">{i * 20}m</span>
                                <div className="flex-grow h-6 relative bg-slate-800/40 rounded-full overflow-hidden">
                                     <div 
                                        className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-60 group-hover/item:opacity-100 transition-all"
                                        style={{ width: `${30 + Math.random() * 50}%`, left: `${Math.random() * 20}%` }}
                                     ></div>
                                </div>
                            </div>
                        ))}
                         <div className="text-center mt-6">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-black leading-relaxed">
                                DOMINANCE FLUCTUATIONS SHOWN AS A FLOWING RIVER.<br/>
                                <span className="text-emerald-400 italic font-black">EMERALD BREATHE: HEAVY POSSESSION</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCanvas;
