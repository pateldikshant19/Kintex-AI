import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Trophy, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'player', sport: 'Cricket', leagueId: '', teamId: ''
    });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    
    const navigate = useNavigate();
    const { signup } = useAuth();
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

    const isLeagueActive = (league) => {
        if (!league) return false;
        if (league.seriesType && league.seriesType.toLowerCase() === 'international') return true;
        if (league.name && league.name.toLowerCase().includes('international')) return true;
        if (!league.startDate || !league.endDate) return true;
        
        const now = new Date();
        const start = new Date(league.startDate);
        const end = new Date(league.endDate);
        
        const accessStart = new Date(start.getTime() - 21 * 24 * 60 * 60 * 1000);
        const accessEnd = new Date(end.getTime() + 21 * 24 * 60 * 60 * 1000);
        
        return now >= accessStart && now <= accessEnd;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        const selectedLeague = leagues.find(l => l.leagueId === formData.leagueId);
        const selectedTeam = teams.find(t => t.teamId === formData.teamId);

        if (selectedLeague && !isLeagueActive(selectedLeague)) {
            setError("Access Denied: League is currently inactive. Access is only available ±21 days around the tournament.");
            return;
        }

        try {
            await signup({
                name: formData.name, email: formData.email,
                password: formData.password, role: formData.role,
                sport: formData.sport, teamName: selectedTeam ? selectedTeam.name : formData.teamId
            });
            
            // Set session context after successful signup
            if (formData.role === 'analyst' || formData.role === 'manager') {
                 setSession(formData.leagueId, formData.teamId);
            } else {
                 setSession(null, null);
            }
            
            navigate('/home', { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredTeams = teams.filter(t => t.leagueIds && t.leagueIds.includes(formData.leagueId));

    const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm";
    const selectClass = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none";
    const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#0a0a0c] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Subtle ambient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 dark:bg-blue-600/8 blur-[80px] rounded-full"></div>
                <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/4 dark:bg-emerald-600/6 blur-[80px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-10 md:gap-16">

                {/* Left: Mascot */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                        <div className={`absolute inset-0 blur-[80px] rounded-full transition-all duration-700 ${isPasswordFocused ? 'bg-blue-500/15' : 'bg-slate-400/8 dark:bg-slate-500/10'}`}></div>
                        <img
                            src={isPasswordFocused ? "/mascot/tiger-hidden-cutout.PNG" : "/mascot/tiger-open-cutout.PNG"}
                            alt="Tiger Mascot"
                            className="w-full h-auto object-contain relative z-10 transition-all duration-500"
                        />
                    </div>
                    <div className="mt-6 text-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                            {isPasswordFocused ? "Privacy Secured" : "Ready to Roar?"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                            {isPasswordFocused
                                ? "Kinetix AI protects your details with the highest level of security."
                                : "Join the elite cohort of athletes using AI to dominate their field."}
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="w-full max-w-md">
                    <Link to="/home" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest transition-colors mb-8">
                        <ArrowLeft size={12} /> Back
                    </Link>

                    <div className="mb-7">
                        <div className="w-12 h-12 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl p-2.5 shadow-sm mb-5 overflow-hidden">
                            <img src="/logo.png" alt="Kinetix AI" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Create Account</h2>
                        <p className="text-sm text-slate-400">Join the revolution of data-driven performance</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2.5 px-3.5 rounded-lg mb-5 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" name="name" value={formData.name} onChange={handleChange}
                                    className={inputClass} placeholder="Champion Name" required />
                            </div>
                        </div>

                        {/* Role + Sport row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Role</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select name="role" value={formData.role} onChange={handleChange} className={selectClass}>
                                        <option value="player">Player</option>
                                        <option value="analyst">Data Analyst</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Sport</label>
                                <div className="relative">
                                    <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select name="sport" value={formData.sport} onChange={handleChange} className={selectClass}>
                                        <option value="Football">Football</option>
                                        <option value="Cricket">Cricket</option>
                                        <option value="Track & Field">Track & Field</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* League Selection */}
                        <div>
                            <label className={labelClass}>Competition Context</label>
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
                                    {leagues.map(l => (
                                        <option key={l.leagueId} value={l.leagueId}>
                                            {l.name} {isLeagueActive(l) ? '' : '(Inactive)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Team Selection */}
                        <div>
                            <label className={labelClass}>Team / Organisation</label>
                            <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select 
                                    name="teamId" 
                                    value={formData.teamId} 
                                    onChange={handleChange} 
                                    className={selectClass}
                                    required
                                >
                                    <option value="" disabled>-- Select Your Team --</option>
                                    {formData.sport === 'Football' && (<>
                                        <option value="LIGASPORT">LIGASPORT</option>
                                        <option value="TECHRUN">TECHRUN</option>
                                        <option value="DATA FC">DATA FC</option>
                                        <option value="REAL MADRID">REAL MADRID</option>
                                        <option value="MAN CITY">MAN CITY</option>
                                        <option value="BAYERN MUNICH">BAYERN MUNICH</option>
                                        <option value="PSG">PSG</option>
                                    </>)}
                                    {formData.sport === 'Cricket' && (<>
                                        {filteredTeams.map(t => (
                                            <option key={t.teamId} value={t.teamId}>{t.name}</option>
                                        ))}
                                    </>)}
                                    {formData.sport === 'Track & Field' && (<>
                                        <option value="USA Athletics">USA Athletics</option>
                                        <option value="Jamaica Sprint Elite">Jamaica Sprint Elite</option>
                                        <option value="Kenya Distance Pro">Kenya Distance Pro</option>
                                        <option value="Ethiopia Run Club">Ethiopia Run Club</option>
                                        <option value="Team Great Britain">Team Great Britain</option>
                                        <option value="Germany Track Force">Germany Track Force</option>
                                        <option value="Australia Athletics">Australia Athletics</option>
                                        <option value="India Athletics">India Athletics</option>
                                        <option value="China Gold Track">China Gold Track</option>
                                        <option value="Canada Sprint Speed">Canada Sprint Speed</option>
                                    </>)}
                                </select>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className={inputClass} placeholder="athlete@kinetix.ai" required />
                            </div>
                        </div>

                        {/* Password row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                                        onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)}
                                        className={inputClass} placeholder="••••••••" required />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Confirm</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                        onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)}
                                        className={inputClass} placeholder="••••••••" required />
                                </div>
                            </div>
                        </div>

                        <button type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm uppercase tracking-wider shadow-sm mt-2">
                            Create Account <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-500 hover:text-blue-600 font-bold transition-colors">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
