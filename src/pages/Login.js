import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Trophy, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', leagueId: '', teamId: '' });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setSession } = useSession();
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leaguesRes, teamsRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_URL}/public/leagues`),
                    fetch(`${process.env.REACT_APP_API_URL}/public/teams`)
                ]);
                if (leaguesRes.ok && teamsRes.ok) {
                    const fetchedLeagues = await leaguesRes.json();
                    setLeagues(fetchedLeagues);
                    setTeams(await teamsRes.json());
                    
                    // Pre-select an active league if possible
                    if (fetchedLeagues.length > 0) {
                        const activeLeague = fetchedLeagues.find(l => isLeagueActive(l)) || fetchedLeagues[0];
                        setFormData(prev => ({ ...prev, leagueId: activeLeague.leagueId }));
                    }
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };
        fetchData();
    }, []);

    const getLeagueStatus = (league) => {
        if (!league || !league.startDate || !league.endDate) return 'Live / Active';
        
        const now = new Date();
        const start = new Date(parseInt(league.startDate) || league.startDate);
        const end = new Date(parseInt(league.endDate) || league.endDate);
        
        if (now > end) return 'Complete';
        if (now >= start && now <= end) return 'Live / Active';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedLeague = leagues.find(l => l.leagueId === formData.leagueId);
            
            if (selectedLeague && !isLeagueActive(selectedLeague)) {
                setError("Access Denied: Selected league is currently inactive. Access is only available ±21 days around the tournament.");
                return;
            }

            const user = await login(formData.email, formData.password);
            
            // Set session context after successful login
            if (user.role === 'analyst' || user.role === 'manager') {
                 setSession(formData.leagueId, formData.teamId);
            } else {
                 setSession(null, null);
            }

            navigate('/home', { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter out leagues that ended in 2025 or earlier
    const validLeagues = leagues.filter(l => {
        if (!l.endDate) return true;
        const end = new Date(parseInt(l.endDate) || l.endDate);
        return end.getFullYear() >= 2026;
    });

    // Smart team filtering: if exact league mapping is missing, guess based on league name
    // If we STILL can't find any teams, we fallback to returning ALL teams so the user is never blocked.
    let filteredTeams = teams.filter(t => {
        if (t.leagueIds && t.leagueIds.includes(formData.leagueId)) return true;
        
        const selectedLeague = leagues.find(l => l.leagueId === formData.leagueId);
        if (selectedLeague && selectedLeague.name) {
            const leagueName = selectedLeague.name.toLowerCase();
            const teamName = t.name.toLowerCase();
            // Split team name by space to match partials (e.g. "India Women" matches "India")
            const parts = teamName.split(' ');
            return parts.some(part => part.length > 2 && leagueName.includes(part));
        }
        return false;
    });
    
    // Fallback: If strict matching yields 0 teams, show all teams to prevent blocking login
    if (filteredTeams.length === 0) {
        filteredTeams = teams;
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
                    <Link to="/home" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest transition-colors mb-8">
                        <ArrowLeft size={12} /> Back
                    </Link>

                    {/* Logo + Title */}
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl p-2.5 shadow-sm mb-5 overflow-hidden">
                            <img src="/logo.png" alt="Kinetix AI" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Sign In</h2>
                        <p className="text-sm text-slate-400">Access your performance portal</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2.5 px-3.5 rounded-lg mb-5 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* League Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Competition Context</label>
                            <div className="relative">
                                <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select 
                                    name="leagueId" 
                                    value={formData.leagueId} 
                                    onChange={handleChange} 
                                    className={selectClass}
                                    required
                                >
                                    <option value="" disabled>-- Select Competition --</option>
                                    {validLeagues.map(l => (
                                        <option key={l.leagueId} value={l.leagueId}>
                                            {l.name} ({getLeagueStatus(l)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Team Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Franchise Account</label>
                            <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select 
                                    name="teamId" 
                                    value={formData.teamId} 
                                    onChange={handleChange} 
                                    className={selectClass}
                                    required
                                >
                                    <option value="" disabled>-- Select Team --</option>
                                    {filteredTeams.map(t => (
                                        <option key={t.teamId} value={t.teamId}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="athlete@kinetix.ai"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
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

                    <div className="mt-6 text-center">
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
