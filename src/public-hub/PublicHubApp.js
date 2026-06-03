import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LiveMatchPulseCenter from './LiveMatchPulseCenter';
import MatchCanvas from './MatchCanvas';
import PlayerEncyclopedia from './PlayerEncyclopedia';
import PredictThePlay from './PredictThePlay';
import { Target, Users, BookMarked, Radio, Menu, X, ArrowLeft } from 'lucide-react';
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

    const sections = [
        { id: 'pulse', label: 'Match Pulse', icon: <Radio size={15} /> },
        { id: 'canvas', label: 'Match Canvas', icon: <Target size={15} /> },
        { id: 'player', label: 'Player Encyclopedia', icon: <BookMarked size={15} /> },
        { id: 'simulator', label: 'Predict the Play', icon: <Users size={15} /> }
    ];

    return (
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300 relative">

            {/* ===== NAVBAR ===== */}
            <nav className="fixed top-0 left-0 right-0 z-[100] h-14 flex items-center px-6 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl transition-colors">
                {/* Accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>

                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    {/* Brand */}
                    <div
                        onClick={() => navigateTo('pulse')}
                        className="flex items-center gap-2.5 cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                                KINETIX<span className="text-blue-500 font-light ml-1 tracking-widest text-xs">HUB</span>
                            </span>
                        </div>
                    </div>

                    {/* Desktop Nav Tabs */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-[#13131a] rounded-xl p-1 border border-slate-200 dark:border-[#1e1e2a]">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => navigateTo(s.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    activeSection === s.id
                                        ? 'bg-white dark:bg-[#0a0a0c] text-blue-500 shadow-sm border border-slate-200 dark:border-[#1e1e2a]'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span className={activeSection === s.id ? 'text-blue-500' : 'text-slate-400'}>{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5">
                            <div className="live-dot"></div>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Pro Bridge Active</span>
                        </div>
                        <div className="w-px h-5 bg-slate-200 dark:bg-[#1e1e2a]"></div>
                        <ThemeToggle />
                        <button
                            className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-[#1e1e2a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#13131a] transition-all"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[110] bg-white dark:bg-[#0a0a0c] lg:hidden flex flex-col pt-16">
                    <div className="p-4 space-y-1 border-t border-slate-100 dark:border-[#1e1e2a] mt-14">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => navigateTo(s.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest text-left transition-all ${
                                    activeSection === s.id
                                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#13131a]'
                                }`}
                            >
                                <span>{s.icon}</span> {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== MAIN CONTENT ===== */}
            <main className="pt-20 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Back button */}
                    {activeSection === 'canvas' && selectedMatchId && (
                        <button
                            onClick={() => navigateTo('pulse')}
                            className="flex items-center gap-1.5 mb-5 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors group"
                        >
                            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Pulse Center
                        </button>
                    )}

                    <div>
                        {activeSection === 'pulse' && <LiveMatchPulseCenter onSelectMatch={(id) => navigateTo('canvas', id)} />}
                        {activeSection === 'canvas' && <MatchCanvas matchId={selectedMatchId || 'm1'} />}
                        {activeSection === 'player' && <PlayerEncyclopedia />}
                        {activeSection === 'simulator' && <PredictThePlay />}
                    </div>
                </div>
            </main>

            {/* ===== FOOTER ===== */}
            <footer className="relative bg-white dark:bg-[#13131a] py-10">
                <div className="absolute top-0 left-0 right-0 k-accent-line"></div>
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] rounded-xl p-2 shadow-sm overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">KINETIX</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Public Intelligence Bridge</p>
                        </div>
                    </div>

                    <div className="flex gap-16 text-[10px]">
                        <div>
                            <h5 className="font-black text-slate-400 uppercase tracking-widest mb-3">Resources</h5>
                            <ul className="space-y-2 font-bold text-slate-500 dark:text-slate-500">
                                <li><a href="#" className="hover:text-blue-500 transition-colors">API Docs</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Methodology</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Partners</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-slate-400 uppercase tracking-widest mb-3">Platform</h5>
                            <ul className="space-y-2 font-bold text-slate-500 dark:text-slate-500">
                                <li><Link to="/home" className="hover:text-blue-500 transition-colors">PRO PORTAL</Link></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Simulator Rankings</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Legal</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 pt-8 mt-8 text-center">
                    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-800 to-transparent opacity-30"></div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        © 2026 Kinetix AI Sports Ecosystem. All Data Federated In Real-Time.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicHubApp;
