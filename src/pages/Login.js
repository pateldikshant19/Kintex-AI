import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Trophy, Users, Shield, Activity, BarChart3, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const DEFAULT_LEAGUES = [
    { leagueId: '2024', name: "ICC Women's T20 World Cup 2026", startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '10532', name: 'India tour of England 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '11876', name: 'England tour of Australia 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '7572', name: 'ICC Cricket World Cup League 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' },
    { leagueId: '11902', name: 'West Indies tour of India 2026', startDate: Date.now(), endDate: Date.now() + 30*86400000, seriesType: 'International' }
];

const DEFAULT_TEAMS = [
    { teamId: 'IND', name: 'India', leagueIds: ['2024', '10532', '11902'] },
    { teamId: 'ENG', name: 'England', leagueIds: ['2024', '10532', '11876'] },
    { teamId: 'AUS', name: 'Australia', leagueIds: ['2024', '11876'] },
    { teamId: 'WI', name: 'West Indies', leagueIds: ['2024', '11902'] },
    { teamId: 'NZ', name: 'New Zealand', leagueIds: ['2024'] },
    { teamId: 'SA', name: 'South Africa', leagueIds: ['2024'] },
    { teamId: 'PAK', name: 'Pakistan', leagueIds: ['2024'] }
];

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', leagueId: '2024', teamId: 'IND' });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [leagues, setLeagues] = useState(DEFAULT_LEAGUES);
    const [teams, setTeams] = useState(DEFAULT_TEAMS);
    
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setSession } = useSession();
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || '/api';
                const [leaguesRes, teamsRes] = await Promise.all([
                    fetch(`${API_URL}/public/leagues`),
                    fetch(`${API_URL}/public/teams`)
                ]);
                const isJson1 = leaguesRes.ok && leaguesRes.headers.get('content-type')?.includes('application/json');
                const isJson2 = teamsRes.ok && teamsRes.headers.get('content-type')?.includes('application/json');

                let fetchedLeagues = [];
                let fetchedTeams = [];

                if (isJson1 && isJson2) {
                    fetchedLeagues = await leaguesRes.json();
                    fetchedTeams = await teamsRes.json();
                }

                const finalLeagues = (fetchedLeagues && fetchedLeagues.length > 0) ? fetchedLeagues : DEFAULT_LEAGUES;
                const finalTeams = (fetchedTeams && fetchedTeams.length > 0) ? fetchedTeams : DEFAULT_TEAMS;

                setLeagues(finalLeagues);
                setTeams(finalTeams);

                const activeLeague = finalLeagues.find(l => isLeagueActive(l)) || finalLeagues[0];
                if (activeLeague) {
                    const selectedLeagueId = String(activeLeague.leagueId);
                    const matchingTeams = finalTeams.filter(t => t.leagueIds && t.leagueIds.some(id => String(id) === selectedLeagueId));
                    const initialTeamId = matchingTeams.length > 0 ? String(matchingTeams[0].teamId) : String(finalTeams[0]?.teamId || '');
                    
                    setFormData(prev => ({
                        ...prev,
                        leagueId: prev.leagueId && finalLeagues.some(l => String(l.leagueId) === String(prev.leagueId)) ? String(prev.leagueId) : selectedLeagueId,
                        teamId: prev.teamId && finalTeams.some(t => String(t.teamId) === String(prev.teamId)) ? String(prev.teamId) : initialTeamId
                    }));
                }
            } catch (err) {
                console.warn("Backend API unavailable for initial data load:", err.message);
                setLeagues(DEFAULT_LEAGUES);
                setTeams(DEFAULT_TEAMS);
            }
        };
        fetchData();
    }, []);

    const getLeagueStatus = (league) => {
        if (!league || !league.startDate || !league.endDate) return 'Live / Active';
        
        const now = new Date();
        const start = new Date(parseInt(league.startDate) || league.startDate);
        const end = new Date(parseInt(league.endDate) || league.endDate);
        
        if (!isNaN(end.getTime()) && now > end) return 'Complete';
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end) return 'Live / Active';
        return 'Upcoming';
    };

    const isLeagueActive = (league) => {
        const status = getLeagueStatus(league);
        return status === 'Live / Active' || status === 'Upcoming';
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const redirectUserByRole = (user) => {
        const role = (user.role || '').toLowerCase();
        if (role === 'manager') {
            setSession(formData.leagueId, formData.teamId);
            navigate('/dashboard/manager', { replace: true });
        } else if (role === 'analyst') {
            setSession(formData.leagueId, formData.teamId);
            navigate('/dashboard/analyst', { replace: true });
        } else if (role === 'admin') {
            setSession(null, null);
            navigate('/admin', { replace: true });
        } else {
            setSession(null, null);
            navigate('/dashboard/player', { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedLeague = leagues.find(l => String(l.leagueId) === String(formData.leagueId));
            
            if (selectedLeague && !isLeagueActive(selectedLeague)) {
                setError("Access Denied: Selected league is currently inactive.");
                return;
            }

            const user = await login(formData.email, formData.password);
            redirectUserByRole(user);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleQuickDemoLogin = async (demoEmail) => {
        try {
            setError('');
            const user = await login(demoEmail, 'password123');
            redirectUserByRole(user);
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter out leagues that ended in 2025 or earlier
    const activeLeagues = leagues.length > 0 ? leagues : DEFAULT_LEAGUES;
    const validLeagues = activeLeagues.filter(l => {
        if (!l.endDate) return true;
        const end = new Date(parseInt(l.endDate) || l.endDate);
        return isNaN(end.getTime()) || end.getFullYear() >= 2026;
    });

    const displayLeagues = validLeagues.length > 0 ? validLeagues : activeLeagues;

    const activeTeams = teams.length > 0 ? teams : DEFAULT_TEAMS;
    let filteredTeams = activeTeams.filter(t => {
        if (t.leagueIds && t.leagueIds.some(id => String(id) === String(formData.leagueId))) return true;
        
        const selectedLeague = displayLeagues.find(l => String(l.leagueId) === String(formData.leagueId));
        if (selectedLeague && selectedLeague.name) {
            const leagueName = selectedLeague.name.toLowerCase();
            const teamName = t.name.toLowerCase();
            const parts = teamName.split(' ');
            return parts.some(part => part.length > 2 && leagueName.includes(part));
        }
        return false;
    });
    
    if (filteredTeams.length === 0) {
        filteredTeams = activeTeams;
    }

    const inputClass = "w-full pl-10 pr-4 py-3 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm";
    const selectClass = "w-full pl-10 pr-4 py-3 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none";

    return (
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#0a0a0c] flex items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Subtle ambient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[15%] w-[35%] h-[35%] bg-blue-500/5 dark:bg-blue-600/8 blur-[80px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-emerald-500/4 dark:bg-emerald-600/6 blur-[80px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-10 md:gap-16">

                {/* Left Side: Mascot */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                        <div className={`absolute inset-0 blur-[80px] rounded-full transition-all duration-700 ${isPasswordFocused ? 'bg-blue-500/15' : 'bg-slate-500/10'}`}></div>
                        <img
                            src={isPasswordFocused ? "/mascot/tiger-hidden-cutout.PNG" : "/mascot/tiger-open-cutout.PNG"}
                            alt="Tiger Mascot"
                            className="w-full h-auto object-contain relative z-10 transition-all duration-500"
                        />
                    </div>
                    <div className="mt-6 text-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                            {isPasswordFocused ? "Privacy Secured" : "Welcome Athlete"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                            {isPasswordFocused
                                ? "Your credentials are protected with military-grade encryption."
                                : "Join the elite cohort using AI to optimize performance."}
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full max-w-sm">
                    {/* Back */}
                    <Link to="/home" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest transition-colors mb-6">
                        <ArrowLeft size={12} /> Back to Public Home
                    </Link>

                    {/* Logo + Title */}
                    <div className="mb-6">
                        <div className="w-12 h-12 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl p-2.5 shadow-sm mb-4 overflow-hidden">
                            <img src="/logo.png" alt="Kinetix AI" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Sign In</h2>
                        <p className="text-xs text-slate-400">Select your role or enter credentials</p>
                    </div>

                    {/* QUICK 1-CLICK DEMO ROLE SELECTOR */}
                    <div className="mb-6 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] p-3 rounded-2xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Zap size={11} className="text-amber-500" /> Quick Demo Role Selector
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleQuickDemoLogin('manager_india@kinetix.ai')}
                                className="flex items-center gap-1.5 px-2.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-500 transition-all text-left"
                            >
                                <Shield size={12} /> Team Manager
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickDemoLogin('analyst@kinetix.ai')}
                                className="flex items-center gap-1.5 px-2.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-500 transition-all text-left"
                            >
                                <BarChart3 size={12} /> Data Analyst
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickDemoLogin('player1@kinetix.ai')}
                                className="flex items-center gap-1.5 px-2.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-[10px] font-bold text-purple-500 transition-all text-left"
                            >
                                <Activity size={12} /> Athlete / Player
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickDemoLogin('admin@kinetix.ai')}
                                className="flex items-center gap-1.5 px-2.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-500 transition-all text-left"
                            >
                                <ShieldAlert size={12} /> System Admin
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2.5 px-3.5 rounded-lg mb-4 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        
                        {/* League Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Competition Context</label>
                            <div className="relative">
                                <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select 
                                    name="leagueId" 
                                    value={formData.leagueId} 
                                    onChange={handleChange} 
                                    className={selectClass}
                                    required
                                >
                                    <option value="" disabled className="bg-white dark:bg-[#13131a] text-slate-900 dark:text-slate-100">-- Select Competition --</option>
                                    {displayLeagues.map(l => (
                                        <option key={l.leagueId} value={l.leagueId} className="bg-white dark:bg-[#13131a] text-slate-900 dark:text-slate-100">
                                            {l.name} ({getLeagueStatus(l)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Team Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Franchise Account</label>
                            <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select 
                                    name="teamId" 
                                    value={formData.teamId} 
                                    onChange={handleChange} 
                                    className={selectClass}
                                    required
                                >
                                    <option value="" disabled className="bg-white dark:bg-[#13131a] text-slate-900 dark:text-slate-100">-- Select Team --</option>
                                    {filteredTeams.map(t => (
                                        <option key={t.teamId} value={t.teamId} className="bg-white dark:bg-[#13131a] text-slate-900 dark:text-slate-100">{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="manager_india@kinetix.ai"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    className={inputClass}
                                    placeholder="••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <label className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#2a2a3a] bg-white dark:bg-[#13131a] text-blue-600 focus:ring-blue-500/30" />
                                Remember Me
                            </label>
                            <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm uppercase tracking-wider shadow-sm mt-2"
                        >
                            Sign In <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <p className="text-xs text-slate-400">
                            New to the platform?{' '}
                            <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-bold transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
