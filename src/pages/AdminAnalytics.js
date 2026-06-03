import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, AlertTriangle, Activity, Database, ShieldAlert, Cpu } from 'lucide-react';

const AdminAnalytics = () => {
    const [stats, setStats] = useState({
        activeUsers: 0,
        systemHealth: 0,
        totalAPIRequests: 0,
        errorRate: 0,
        recentErrors: [],
        topEndpoints: []
    });

    useEffect(() => {
        // Mocking real-time admin data stream
        const interval = setInterval(() => {
            setStats(prev => ({
                activeUsers: 1400 + Math.floor(Math.random() * 200),
                systemHealth: 98.2 + (Math.random() * 1.5),
                totalAPIRequests: 450321 + Math.floor(Math.random() * 1000),
                errorRate: 0.12 + (Math.random() * 0.05),
                recentErrors: [
                    { id: 1, time: '2 mins ago', type: 'Timeout', endpoint: '/api/analytics/risk' },
                    { id: 2, time: '5 mins ago', type: 'Auth Fail', endpoint: '/api/user/login' },
                    { id: 3, time: '12 mins ago', type: 'Database Connection', endpoint: 'N/A' }
                ],
                topEndpoints: [
                    { path: '/api/players/metrics', hits: 14502 , percent: 42 },
                    { path: '/api/analytics/forecast', hits: 10211, percent: 30 },
                    { path: '/api/auth/profile', hits: 8201, percent: 24 }
                ]
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-4 tracking-tighter italic">
                        <ShieldAlert size={48} className="text-rose-500 animate-pulse" /> SYSTEM OVERWATCH
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">Central hub for Kinetix AI infrastructure health and monitoring.</p>
                </div>
                <div className="flex flex-col items-end relative z-10">
                    <span className="text-emerald-500 font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Activity size={12} /> Systems Operational
                    </span>
                    <span className="text-slate-500 text-xs font-mono">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-600/10 to-transparent"></div>
            </div>

            {/* Top Row Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Active Users', value: stats.activeUsers, icon: <Users />, color: 'text-blue-400', bg: 'bg-blue-600/10' },
                    { label: 'System Health', value: `${stats.systemHealth.toFixed(1)}%`, icon: <Cpu />, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
                    { label: 'API Bandwidth', value: stats.totalAPIRequests.toLocaleString(), icon: <Activity />, color: 'text-indigo-400', bg: 'bg-indigo-600/10' },
                    { label: 'System Errors', value: `${stats.errorRate.toFixed(2)}%`, icon: <AlertTriangle />, color: 'text-rose-400', bg: 'bg-rose-600/10' },
                ].map((card, i) => (
                    <div key={i} className="bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-black/50 group">
                        <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${card.color}`}>
                            {card.icon}
                        </div>
                        <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{card.label}</h4>
                        <div className="text-2xl font-black text-white tracking-tight">{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Distribution */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Endpoint Traffic Distribution
                        </h3>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-slate-500">REALTIME</div>
                    </div>
                    
                    <div className="space-y-6">
                        {stats.topEndpoints.map((ep, i) => (
                            <div key={i} className="group cursor-default">
                                <div className="flex justify-between items-end mb-3">
                                    <div className="text-sm font-mono text-slate-300 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{ep.path}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{ep.hits.toLocaleString()} requests</div>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-white/5">
                                    <div 
                                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${ep.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Database className="text-indigo-400" size={24} />
                            <div>
                                <h4 className="text-white font-bold text-sm">Main Database Cluster</h4>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Region: US-East-1 (Primary)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                </div>

                {/* Recent Error Logs */}
                <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 blur-3xl transition-all group-hover:bg-rose-500/20"></div>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="text-rose-500" /> Error Log
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {stats.recentErrors.map(error => (
                            <div key={error.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-rose-500/30 transition-all cursor-crosshair">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-rose-500 text-[10px] font-black uppercase tracking-tighter">{error.type}</span>
                                    <span className="text-slate-600 text-[10px] font-bold">{error.time}</span>
                                </div>
                                <div className="text-white font-mono text-xs truncate uppercase tracking-tight">{error.endpoint}</div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-8 py-4 bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                        VIEW FULL LOGS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
