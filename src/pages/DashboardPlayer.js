import React, { useState } from 'react';
import { Activity, Calendar, Trophy, TrendingUp, Zap, Heart, Flame, Timer, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardChart from '../components/DashboardChart';

const DashboardPlayer = () => {
    const { user } = useAuth();
    const [chartData] = useState([82, 85, 84, 88, 92, 90, 95, 94]);

    return (
        <div className="space-y-5 py-4">

            {/* Player Identity Header */}
            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden">
                {/* Subtle ambient glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/4 dark:bg-blue-600/6 blur-[60px] rounded-full -mr-24 -mt-24 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] flex items-center justify-center text-4xl font-black text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {user?.name?.charAt(0) || 'A'}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                            <Zap size={10} /> Athlete Performance Portal
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                            Welcome back, <span className="text-blue-500">{user?.name || 'Champion'}</span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Unit #{(user?._id?.slice(-4) || '0724')} · Squad: {user?.teamName || 'ELITE'} · Protocol: {user?.sport}
                        </p>
                    </div>

                    {/* Next match pill */}
                    <div className="flex-shrink-0 text-center px-6 py-4 bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Fixture</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            {user?.teamName === 'England' ? 'vs Australia' : user?.teamName === 'Australia' ? 'vs India' : 'vs Australia'}
                        </p>
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Tomorrow</span>
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

            {/* Chart + Schedule Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Personal Trajectory</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Performance Sync Over Time</p>
                        </div>
                        <div className="flex bg-slate-50 dark:bg-[#0a0a0c] rounded-lg p-0.5 border border-slate-200 dark:border-[#1e1e2a]">
                            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest">LATEST</button>
                            <button className="px-4 py-1.5 text-slate-400 rounded-md text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">SEASON</button>
                        </div>
                    </div>
                    <div className="h-[260px] w-full bg-slate-50 dark:bg-[#0a0a0c] rounded-xl border border-slate-100 dark:border-[#1e1e2a] p-4">
                        <DashboardChart data={chartData} height={220} color="#3b82f6" />
                    </div>
                </div>

                {/* Schedule + Progress */}
                <div className="space-y-3">
                    {/* Schedule */}
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Mission Schedule</h2>
                            <Calendar size={15} className="text-slate-400" />
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
                            <TrainingItem time="09:00" title="Neural Conditioning" type="Bio-Lab" icon={Activity} />
                            <TrainingItem time="13:30" title="Tactical Simulation" type="Hub" icon={Zap} />
                            <TrainingItem time="16:00" title="High-G Training" type="Field" icon={Timer} />
                        </div>
                        <div className="p-4">
                            <button className="w-full py-2.5 bg-slate-50 dark:bg-[#0a0a0c] hover:bg-slate-100 dark:hover:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-all">
                                View Full Protocol
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
                            {user?.sport === 'Track & Field' && <>Target: 15 Personal Bests<br />Current Progress: 12 Units</>}
                            {user?.sport === 'Cricket' && <>Target: 500 Runs Scored<br />Current Progress: 380 Units</>}
                            {(user?.sport === 'Football' || !user?.sport) && <>Target: 15 Goals Scored<br />Current Progress: 12 Units</>}
                        </p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0a0a0c] rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black text-emerald-500">80%</span>
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
