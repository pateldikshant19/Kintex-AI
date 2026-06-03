import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Target, Shield, BarChart3, Activity, Zap, Sparkles } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
    const navigate = useNavigate();
    const [currentSlogan, setCurrentSlogan] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [nodeAnimation, setNodeAnimation] = useState(0);
    const [particles, setParticles] = useState([]);
    const [buttonPulse, setButtonPulse] = useState(true);

    const slogans = [
        "POWERING THE NEXT GENERATION OF ATHLETES",
        "AI-DRIVEN PERFORMANCE ANALYTICS",
        "REAL-TIME BIOMETRIC TRACKING",
        "PREDICTIVE INJURY AVERSION",
        "COGNITIVE LOAD OPTIMIZATION",
        "NEXT-GEN SCOUTING INTELLIGENCE"
    ];

    // Generate floating particles for background
    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    // Dynamic animations and interactions
    useEffect(() => {
        setIsLoaded(true);

        const sloganInterval = setInterval(() => {
            setCurrentSlogan((prev) => (prev + 1) % slogans.length);
        }, 3500);

        const nodeInterval = setInterval(() => {
            setNodeAnimation((prev) => (prev + 1) % 4);
        }, 2500);

        return () => {
            clearInterval(sloganInterval);
            clearInterval(nodeInterval);
        };
    }, [slogans.length]);

    const handleInitialize = () => {
        // Add a visual feedback before navigation
        setButtonPulse(false);
        setTimeout(() => {
            navigate('/home');
        }, 300);
    };

    const nodes = [
        { icon: Brain, label: "COGNITION", color: "text-slate-200", bgColor: "bg-slate-500/20" },
        { icon: Target, label: "STRATEGY", color: "text-zinc-300", bgColor: "bg-zinc-500/20" },
        { icon: BarChart3, label: "ANALYTICS", color: "text-slate-300", bgColor: "bg-slate-500/20" },
        { icon: Shield, label: "RECOVERY", color: "text-gray-300", bgColor: "bg-gray-500/20" }
    ];

    return (
        <div className={`min-h-screen w-full bg-white dark:bg-[#09090b] text-slate-900 dark:text-white relative overflow-x-hidden flex flex-col transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            {/* Theme Toggle Overlay */}
            <div className="fixed top-8 right-8 z-[100] scale-125">
                <ThemeToggle />
            </div>
            {/* Floating Particles Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full bg-slate-400/20 animate-float"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDuration: `${particle.duration}s`,
                            animationDelay: `${particle.delay}s`,
                            filter: 'blur(1px)'
                        }}
                    />
                ))}
            </div>

            {/* Animated Background Lines */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#475569" stopOpacity="0" />
                            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#475569" stopOpacity="0" />
                        </linearGradient>
                        <radialGradient id="glowGrad" cx="50%" cy="50%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <g className="animate-pulse">
                        <line x1="500" y1="500" x2="200" y2="300" stroke="url(#lineGrad)" strokeWidth="2" className="animate-line" />
                        <line x1="500" y1="500" x2="800" y2="300" stroke="url(#lineGrad)" strokeWidth="2" className="animate-line" />
                        <line x1="150" y1="700" x2="500" y2="500" stroke="url(#lineGrad)" strokeWidth="2" className="animate-line" />
                        <circle cx="500" cy="500" r="50" fill="url(#glowGrad)" opacity="0.3" />
                    </g>
                </svg>
            </div>

            {/* Header Section */}
            <div className="relative z-10 w-full flex flex-col items-center pt-6 pb-3">
                <div className="w-28 h-28 mb-6 relative group cursor-pointer" onClick={() => setIsLoaded(!isLoaded)}>
                    <div className="absolute inset-0 bg-slate-500 blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
                    <div className="absolute inset-0 bg-zinc-400 blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500" />
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-all duration-500" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-3 bg-gradient-to-r from-slate-400 via-white to-zinc-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-500 cursor-default">
                    KINETIX AI
                </h1>
                <p className="text-base md:text-xl text-slate-300 tracking-[0.4em] uppercase font-light animate-pulse mb-4">
                    Elite Athletic Intelligence
                </p>

                {/* Dynamic Slogan Display with Fade Effect */}
                <div className="mt-2 h-10 flex items-center justify-center overflow-hidden">
                    <p
                        key={currentSlogan}
                        className="text-slate-400 text-sm md:text-base font-bold tracking-wider animate-fade-in px-4 text-center"
                    >
                        <Sparkles className="inline-block mr-2 opacity-50" size={16} />
                        {slogans[currentSlogan]}
                        <Sparkles className="inline-block ml-2 opacity-50" size={16} />
                    </p>
                </div>
            </div>

            {/* Interactive Node Display */}
            <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-10 my-4 max-w-5xl mx-auto px-4">
                {nodes.map((node, index) => (
                    <Node
                        key={node.label}
                        icon={node.icon}
                        label={node.label}
                        color={node.color}
                        bgColor={node.bgColor}
                        isActive={nodeAnimation === index}
                        onClick={() => setNodeAnimation(index)}
                    />
                ))}
            </div>

            {/* Main Action Section */}
            <div className="relative z-10 flex flex-col items-center gap-4 pb-8">
                <div className="max-w-3xl text-center px-4">
                    <p className="text-base md:text-lg text-slate-200 leading-relaxed font-light backdrop-blur-md bg-white/5 p-4 md:p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-default shadow-2xl">
                         Engineering the future of sport through <span className="text-slate-300 font-semibold underline decoration-white/30 underline-offset-4">Neural-Mechanical Synthesis</span>.
                        Deciphering complex performance data into a singular vision of mastery.
                    </p>
                </div>

                {/* Dynamic Initialize Button with Pulsing Glow */}
                <div className="relative">
                    {buttonPulse && (
                        <div className="absolute inset-0 rounded-full bg-slate-500 blur-3xl opacity-20" style={{ transform: 'scale(1.2)' }} />
                    )}
                    <button
                        onClick={handleInitialize}
                        className="group relative px-12 py-5 bg-white text-black rounded-full transition-all duration-500 hover:scale-105 hover:bg-slate-100 shadow-2xl active:scale-95 border border-slate-200"
                        style={{ minWidth: '320px' }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3 text-xl md:text-2xl font-black tracking-widest">
                            <Activity size={24} />
                            INITIALIZE SYSTEM
                            <ArrowRight size={28} className="group-hover:translate-x-4 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 rounded-full bg-slate-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                        <div className="absolute -inset-1 rounded-full bg-white opacity-0 blur-xl group-hover:opacity-10 transition-opacity duration-500" />
                    </button>
                </div>

                {/* Enhanced Taglines */}
                <div className="text-center space-y-2 mt-2 mb-16">
                    <p className="text-slate-400 dark:text-slate-200 text-lg md:text-xl tracking-wide font-bold max-w-lg mx-auto px-4 hover:text-slate-900 dark:hover:text-white transition-all duration-300 cursor-default">
                        "Transform Data Into Victory"
                    </p>
                </div>

                {/* MISSION BRIEF: WHAT WE OFFER & INDUSTRY IMPACT */}
                <div className="max-w-6xl mx-auto px-6 mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">KINETIX MISSION BRIEF</h2>
                        <div className="h-1 w-20 bg-slate-900 dark:bg-white mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 opacity-90">
                        <div className="highlight-box p-10 rounded-[48px] border-slate-200 dark:border-white/5 transition-all hover:scale-[1.02]">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                             <Zap size={14} className="text-slate-900 dark:text-white" /> OUR CORE OFFERING
                        </h3>
                        <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase mb-6 leading-tight">Elite Deep-Data Reconstruction</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic uppercase tracking-widest">
                            We bridge the gap between raw biometrics and tactical mastery. Kinetix provides real-time spatial scorecards, AI-driven performance signatures, and predictive match simulations for the next generation of sport.
                        </p>
                    </div>

                    <div className="highlight-box p-10 rounded-[48px] border-slate-200 dark:border-white/5 transition-all hover:scale-[1.02]">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                             <Activity size={14} className="text-slate-900 dark:text-white" /> INDUSTRY IMPACT
                        </h3>
                        <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase mb-6 leading-tight">Digital Athletic Transformation</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic uppercase tracking-widest">
                            Revolutionizing the industry through predictive injury aversion, optimized squad logistics, and high-fidelity fan engagement. Deciphering performance complexity into actionable strategic dominance.
                        </p>
                    </div>
                    </div>
                </div>
            </div>

            {/* Animated Ticker */}
            <div className="w-full bg-slate-900/70 backdrop-blur-lg border-y border-white/10 py-4 overflow-hidden relative z-20 mt-8">
                <div className="animate-ticker">
                    {[...slogans, ...slogans].map((text, i) => (
                        <div key={i} className="flex items-center whitespace-nowrap mx-10">
                            <div className="w-2 h-2 rounded-full bg-slate-600 mr-4" />
                            <span className="text-sm font-black tracking-widest text-slate-500 uppercase hover:text-slate-300 transition-colors">
                                {text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Node = ({ icon: Icon, label, color, bgColor, isActive, onClick }) => (
    <div
        className={`flex flex-col items-center gap-3 cursor-pointer transition-all duration-500 ${isActive ? 'scale-125 -translate-y-2' : 'hover:scale-110 hover:-translate-y-1'
            }`}
        onClick={onClick}
    >
        <div className={`w-16 h-16 rounded-full bg-slate-900 border flex items-center justify-center backdrop-blur-md transition-all duration-500 relative ${isActive ? 'border-slate-400 shadow-lg' : 'border-white/10 hover:border-white/30'
            }`}>
            {isActive && (
                <div className={`absolute inset-0 rounded-full ${bgColor} blur-lg`} />
            )}
            <Icon className={`${color} transition-all duration-500 relative z-10 ${isActive ? 'scale-110' : ''}`} size={28} />
        </div>
        <span className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 ${isActive ? 'text-white scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {label}
        </span>
    </div>
);

export default Landing;