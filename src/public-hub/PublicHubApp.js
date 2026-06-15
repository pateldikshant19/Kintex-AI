import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LiveMatchPulseCenter from './LiveMatchPulseCenter';
import MatchCanvas from './MatchCanvas';
import PlayerEncyclopedia from './PlayerEncyclopedia';
import PredictThePlay from './PredictThePlay';
import { Target, Users, BookMarked, Radio, Menu, X, ArrowLeft, LayoutDashboard, Calendar, FileText, Search, Bell, Settings } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const PublicHubApp = () => {
    const [activeSection, setActiveSection] = useState('pulse');
    const [selectedMatchId, setSelectedMatchId] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigateTo = (section, matchId = null) => {
        setActiveSection(section);
        setSelectedMatchId(matchId);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const sidebarSections = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'pulse', label: 'Match Center', icon: <Radio size={20} /> },
        { id: 'canvas', label: 'Analytics', icon: <Target size={20} /> },
        { id: 'player', label: 'Teams', icon: <Users size={20} /> },
        { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
        { id: 'simulator', label: 'Reports', icon: <FileText size={20} /> }
    ];

    return (
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300 flex font-sans">
            
            {/* ===== LEFT SIDEBAR ===== */}
            <aside className="w-16 md:w-20 fixed left-0 top-0 bottom-0 bg-white dark:bg-[#13131a] border-r border-slate-200 dark:border-[#1e1e2a] flex flex-col items-center py-6 z-[100]">
                <div className="w-10 h-10 mb-8 cursor-pointer flex-shrink-0" onClick={() => navigateTo('pulse')}>
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>

                <div className="flex flex-col gap-6 flex-grow w-full items-center">
                    {sidebarSections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => navigateTo(s.id)}
                            className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all group relative ${
                                activeSection === s.id
                                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {activeSection === s.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
                            )}
                            {s.icon}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-6 w-full items-center mb-4">
                    <ThemeToggle />
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </aside>

            {/* ===== MAIN CONTAINER ===== */}
            <div className="flex-1 ml-16 md:ml-20 flex flex-col min-h-screen relative">
                
                {/* ===== TOP NAVBAR ===== */}
                <nav className="sticky top-0 z-[90] h-20 flex items-center px-6 bg-white dark:bg-[#0a0a0c] border-b border-slate-200 dark:border-[#1e1e2a] transition-colors">
                    <div className="w-full flex justify-between items-center">
                        {/* Brand / Title Area */}
                        <div className="flex items-center gap-8">
                            <div
                                onClick={() => navigateTo('pulse')}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                                    KINETIX<span className="text-emerald-500 font-light ml-1 tracking-widest text-sm">HUB</span>
                                </span>
                            </div>

                            {/* Desktop Nav Tabs */}
                            <div className="hidden lg:flex items-center gap-6">
                                {sidebarSections.map(s => (
                                    <button
                                        key={`top-${s.id}`}
                                        onClick={() => navigateTo(s.id)}
                                        className={`pb-1 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                                            activeSection === s.id
                                                ? 'text-slate-900 dark:text-white border-emerald-500'
                                                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Area */}
                        <div className="flex items-center gap-5">
                            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <Search size={20} />
                            </button>
                            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0a0a0c]"></span>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 ml-2">
                                DK
                            </div>
                            <button
                                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#13131a] transition-all"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-[110] bg-white dark:bg-[#0a0a0c] lg:hidden flex flex-col pt-20 pl-16">
                        <div className="p-4 space-y-1">
                            {sidebarSections.map(s => (
                                <button
                                    key={`mob-${s.id}`}
                                    onClick={() => navigateTo(s.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest text-left transition-all ${
                                        activeSection === s.id
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#13131a]'
                                    }`}
                                >
                                    <span>{s.icon}</span> {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== MAIN CONTENT AREA ===== */}
                <main className="flex-1 p-6 md:p-8">
                    {/* Back button */}
                    {activeSection === 'canvas' && selectedMatchId && (
                        <button
                            onClick={() => navigateTo('pulse')}
                            className="flex items-center gap-1.5 mb-5 text-[11px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Match Center
                        </button>
                    )}

                    <div>
                        {activeSection === 'pulse' && <LiveMatchPulseCenter onSelectMatch={(id) => navigateTo('canvas', id)} />}
                        {activeSection === 'canvas' && <MatchCanvas matchId={selectedMatchId || 'm1'} />}
                        {activeSection === 'player' && <PlayerEncyclopedia />}
                        {activeSection === 'simulator' && <PredictThePlay />}
                        
                        {/* Placeholders for new sections */}
                        {activeSection === 'dashboard' && <div className="text-center p-20 text-slate-400">Dashboard View (Coming Soon)</div>}
                        {activeSection === 'calendar' && <div className="text-center p-20 text-slate-400">Calendar View (Coming Soon)</div>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PublicHubApp;
