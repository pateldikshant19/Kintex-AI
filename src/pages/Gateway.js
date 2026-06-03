import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, ArrowRight, Lock, Activity, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Gateway = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-300">
            {/* Subtle ambient glows — contained */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-8%] left-[-5%] w-[45%] h-[40%] bg-blue-500/5 dark:bg-blue-600/8 blur-[90px] rounded-full"></div>
                <div className="absolute bottom-[-8%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/4 dark:bg-emerald-600/7 blur-[90px] rounded-full"></div>
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Header */}
            <div className="mb-14 text-center relative z-10">
                <div className="flex flex-col items-center gap-5">
                    {/* Logo container with glow */}
                    <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-16 h-16 bg-white dark:bg-[#13131a] border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex items-center justify-center shadow-sm p-3">
                            <img src="/logo.png" alt="Kinetix" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                            KINETIX
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-2">
                            Advanced Sports Intelligence
                        </p>
                    </div>
                </div>
            </div>

            {/* Portal Selection Cards */}
            <div className="flex flex-col md:flex-row gap-5 w-full max-w-4xl relative z-10">

                {/* PUBLIC HUB */}
                <div
                    onClick={() => navigate('/hub')}
                    className="flex-1 group cursor-pointer bg-white dark:bg-[#13131a] border border-blue-500/10 dark:border-white/5 rounded-2xl p-8 hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1"
                >
                    {/* Left accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l-2xl"></div>

                    <div className="flex items-start gap-5 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center p-2.5 flex-shrink-0 group-hover:bg-blue-500/15 transition-colors overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Public Fan Hub
                            </h2>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">Live Scores · Simulator · Crowd Intel</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        Real-time multi-sport scorecards, AI momentum dynamics, and world-first spatial match visualizations. No login required.
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="live-dot"></div>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">14 Live Events</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest group-hover:gap-2.5 transition-all">
                            Enter Hub <ArrowRight size={13} />
                        </div>
                    </div>
                </div>

                {/* PRO PORTAL */}
                <div
                    onClick={() => navigate('/home')}
                    className="flex-1 group cursor-pointer bg-white dark:bg-[#13131a] border border-emerald-500/10 dark:border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1"
                >
                    {/* Left accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-2xl"></div>

                    <div className="flex items-start gap-5 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-2.5 flex-shrink-0 group-hover:bg-emerald-500/15 transition-colors overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Pro Portal
                            </h2>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">Analytics · Squad · Deep Intel</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        Secured access for analysts, coaches, and players. AI-driven biometrics, tactical simulators, and real-time squad management.
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield size={11} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role-Based Access</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest group-hover:gap-2.5 transition-all">
                            Enter Portal <Lock size={11} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Strip */}
            <div className="mt-12 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                <div className="bg-white dark:bg-[#13131a] border border-blue-500/10 dark:border-blue-500/5 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap size={13} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What We Offer</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                        Elite deep-data reconstruction — bridging raw biometrics with tactical mastery through real-time AI-driven analysis.
                    </p>
                </div>
                <div className="bg-white dark:bg-[#13131a] border border-emerald-500/10 dark:border-emerald-500/5 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity size={13} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Impact</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                        Predictive injury aversion, squad optimization, and high-fidelity fan engagement — shaping the digital athletic future.
                    </p>
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-10 relative z-10 flex items-center gap-8 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.35em]">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Database Federated
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Public Signals Active
                </div>
                <div className="hidden md:block">Kinetix OS v1.0.4</div>
            </div>
        </div>
    );
};

export default Gateway;
