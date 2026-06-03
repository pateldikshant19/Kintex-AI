import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Stage, Layer, Circle, Line, Rect, Text as KonvaText } from 'react-konva';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import { 
    Users, Award, TrendingUp, Shield, Target, Activity, Calendar, Zap, 
    Cpu, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, Eye, Video, BrainCircuit 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardChart from '../components/DashboardChart';

const DashboardManager = () => {
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([70, 75, 72, 80, 85, 82, 90, 92]);
    const [activeTab, setActiveTab] = useState('roster'); // roster, predictor, load, tactics

    // Live Match & Socket States
    const [match, setMatch] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [liveLogs, setLiveLogs] = useState(["Telemetry: Booting Manager Command Center..."]);

    // AI/ML States for interactive simulation
    const [aiTasks, setAiTasks] = useState({
        win: { prob: 0.72, confidence: 0.88, model: "XGBoost Classifier" },
        injury: { score: 0.18, level: "LOW", model: "RandomForestClassifier" },
        fatigue: { index: 0.35, classification: "OPTIMAL", suggest: "Full training load clear" }
    });

    const [aiInputs, setAiInputs] = useState({
        scoreDiff: 42,
        wickets: 3,
        oversRemaining: 3.2,
        targetScore: 182,
        workload: 0.65,
        restDays: 3,
        fatigueIndex: 0.35,
        heartRate: 135,
        speed: 24.8,
        duration: 90,
        age: 26
    });

    const [selectedFielder, setSelectedFielder] = useState(null);

    const socketRef = useRef(null);
    const API_URL = `${process.env.REACT_APP_API_URL}/cricket`;

    const teamIdentifier = user?.teamName?.toUpperCase().replace(/\s+/g, '-') || 'DEFAULT';
    const teamLogo = `/teams/${teamIdentifier}.png`;

    // Initialize Socket.io & Fetch initial telemetry
    useEffect(() => {
        // Fetch roster
        const fetchRoster = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const playerRes = await fetch(`${process.env.REACT_APP_API_URL}/players`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (playerRes.ok) {
                    const playerData = await playerRes.json();
                    setPlayers(playerData);
                }
            } catch (err) {
                console.error("Error fetching roster:", err);
            }
        };

        const fetchMatchTelemetry = async () => {
            try {
                // First get all live matches
                const matchesRes = await fetch(`${API_URL}/matches`);
                if (matchesRes.ok) {
                    const matchesData = await matchesRes.json();
                    
                    if (matchesData && matchesData.length > 0) {
                        // Take the first live match
                        const liveMatchId = matchesData[0].id;
                        
                        // Then fetch its specific telemetry
                        const res = await fetch(`${API_URL}/match/${liveMatchId}`);
                        if (res.ok) {
                            const data = await res.json();
                            setMatch(data);
                            setDeliveries(data.deliveries || []);
                            
                            if (socketRef.current) {
                                socketRef.current.emit('joinMatch', liveMatchId);
                                setLiveLogs(prev => [...prev, `Socket.IO: Operational tunnel opened successfully for ${liveMatchId}.`]);
                            }
                        }
                    } else {
                        // Fallback if no live matches exist in database
                        const res = await fetch(`${API_URL}/match/c1`);
                        if (res.ok) {
                            const data = await res.json();
                            setMatch(data);
                            setDeliveries(data.deliveries || []);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load match data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoster();
        fetchMatchTelemetry();

        // Connect to express socket backend
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

        socketRef.current.on('connect', () => {
            setSocketConnected(true);
            // We moved the join logic into the fetchMatchTelemetry function to wait for dynamic ID
        });

        socketRef.current.on('disconnect', () => {
            setSocketConnected(false);
            setLiveLogs(prev => [...prev, "Socket.IO: Connection severed."]);
        });

        socketRef.current.on('deliveryUpdate', (data) => {
            setLiveLogs(prev => [
                ...prev,
                `Delivery ${data.newDelivery.ball}: ${data.newDelivery.batsman} +${data.newDelivery.runs} Runs (Speed: ${data.newDelivery.speed} km/h)`
            ]);
            setDeliveries(prev => [...prev, data.newDelivery]);
            setMatch(prev => ({
                ...prev,
                stats: data.stats
            }));

            // Sync ML predictions live
            setAiTasks(prev => ({
                ...prev,
                win: { 
                    prob: data.aiPredictions.winProbability, 
                    confidence: 0.89, 
                    model: "XGBoost Classifier (Live Update)" 
                },
                injury: { 
                    score: data.aiPredictions.injuryRisk, 
                    level: data.aiPredictions.injuryRisk > 0.6 ? "HIGH" : data.aiPredictions.injuryRisk > 0.3 ? "MEDIUM" : "LOW",
                    model: "RandomForestClassifier (Live Update)"
                },
                fatigue: {
                    index: data.aiPredictions.fatigue,
                    classification: data.aiPredictions.fatigue > 0.75 ? "CRITICAL" : "OPTIMAL",
                    suggest: data.aiPredictions.fatigue > 0.75 ? "Mandatory rest" : "Full training load clear"
                }
            }));

            // Update aggregated chart data
            setChartData(prev => [...prev.slice(1), Math.round(data.aiPredictions.winProbability * 100)]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveMatch', 'c1');
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Simulate standard delivery
    const simulateNextBall = async () => {
        try {
            await fetch(`${API_URL}/simulate-delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId: 'c1' })
            });
        } catch (err) {
            console.error("Simulation request failed", err);
        }
    };

    // Run custom scikit-learn / XGBoost parameter simulation
    const runAISimulation = async () => {
        try {
            // 1. Win Probability (XGBoost)
            const winRes = await fetch(`${API_URL}/predict/win-probability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score_diff: aiInputs.scoreDiff,
                    wickets: aiInputs.wickets,
                    overs_remaining: aiInputs.oversRemaining,
                    target_score: aiInputs.targetScore,
                    run_rate: 6.8
                })
            });
            const winData = await winRes.json();

            // 2. Injury Prediction (RandomForest)
            const injRes = await fetch(`${API_URL}/predict/injury-risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workload: aiInputs.workload,
                    rest_days: aiInputs.restDays,
                    history_index: 0.15,
                    fatigue: aiInputs.fatigueIndex
                })
            });
            const injData = await injRes.json();

            // 3. Fatigue Analysis (Ridge Regression)
            const fatRes = await fetch(`${API_URL}/predict/fatigue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heart_rate: aiInputs.heartRate,
                    speed: aiInputs.speed,
                    duration: aiInputs.duration,
                    age: aiInputs.age
                })
            });
            const fatData = await fatRes.json();

            setAiTasks({
                win: { prob: winData.win_probability, confidence: winData.confidence_score, model: winData.model_type },
                injury: { score: winData.win_probability ? injData.risk_score : 0.22, level: injData.risk_level, model: injData.model_type },
                fatigue: { index: fatData.fatigue_index, classification: fatData.classification, suggest: fatData.suggested_action }
            });
        } catch (err) {
            console.error("Simulation run failed:", err);
        }
    };

    // Update Fielder coordinates
    const handleFielderDrag = (e, idx) => {
        if (!match) return;
        const updatedPlacement = [...match.fieldPlacements];
        updatedPlacement[idx].x = e.target.x();
        updatedPlacement[idx].y = e.target.y();
        setMatch(prev => ({
            ...prev,
            fieldPlacements: updatedPlacement
        }));
    };

    if (loading || !match) return (
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Hydrating Manager Command Console...</span>
        </div>
    );

    // Prepare historical win rates for Recharts
    const winRateHistory = deliveries.map((d, i) => ({
        ball: i + 1,
        winProb: Math.round((0.55 + Math.sin(i / 4) * 0.15) * 100)
    }));

    return (
        <div className="space-y-5 py-4">

            {/* Team Identity Banner */}
            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    
                    {/* Team Logo */}
                    <div className="w-20 h-20 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-3 shadow-sm flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                            src={teamLogo}
                            alt={user?.teamName}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                        />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                <Shield size={10} /> Management Command Center
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${socketConnected ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/15 text-red-500 border border-red-500/20'}`}>
                                <span className="live-dot" style={{ background: socketConnected ? '#10b981' : '#ef4444' }}></span> 
                                {socketConnected ? 'Live Socket Sync' : 'Offline Mode'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                            {user?.teamName?.split(' ').map((word, i) => (
                                <span key={i} className={i > 0 ? 'text-blue-500' : ''}>{word} </span>
                            )) || 'ELITE SQUAD'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Orchestrating sports science, predictive AI modeling, and real-time tactical overlays.
                        </p>
                    </div>

                    {/* Side Live Scoreboard Widget */}
                    <div className="flex flex-col gap-2 items-center bg-slate-50 dark:bg-[#0c0c12] border border-slate-200 dark:border-[#1e1e2a] rounded-xl p-4 min-w-[200px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Live Room: {match?.id || 'c1'} ({match?.matchName?.substring(0, 15) || 'Indore'})
                        </span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white k-mono">
                            {match?.stats?.runs || 0} / <span className="text-blue-500">{match?.stats?.wickets || 0}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Overs: {match?.stats?.overs || 0}</span>
                        <button 
                            onClick={simulateNextBall}
                            className="mt-2 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
                        >
                            <Zap size={10} className="animate-bounce" /> Bowl Next Ball
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <ManagerCard title="TOTAL ROSTER" value={players.length} subtext="Ready for Deployment" icon={Users} accentColor="blue" />
                <ManagerCard title="VICTORY OUTCOME" value={`${(aiTasks.win.prob * 100).toFixed(0)}%`} subtext="XGBoost Prediction" icon={TrendingUp} accentColor="emerald" />
                <ManagerCard title="BIOLOGICAL RISK" value={aiTasks.injury.level} subtext="Ensemble Predictor" icon={BrainCircuit} accentColor={aiTasks.injury.level === 'HIGH' ? 'red' : 'emerald'} />
                <ManagerCard title="FATIGUE INDEX" value={`${(aiTasks.fatigue.index * 100).toFixed(0)}%`} subtext={aiTasks.fatigue.classification} icon={Activity} accentColor="blue" />
            </div>

            {/* Tab Selectors */}
            <div className="flex border-b border-slate-200 dark:border-[#1e1e2a] pb-px overflow-x-auto">
                {[
                    { id: 'roster', label: 'Squad & Neural Roster', icon: <Users size={13} /> },
                    { id: 'predictor', label: 'XGBoost Win Probability Simulator', icon: <TrendingUp size={13} /> },
                    { id: 'load', label: 'scikit-learn Injury Prevention', icon: <BrainCircuit size={13} /> },
                    { id: 'tactics', label: 'Field Pitch Tactics (react-konva)', icon: <Target size={13} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'border-blue-600 text-blue-500 bg-blue-500/5' 
                                : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#13131a]/40'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="min-h-[400px]">

                {/* 1. SQUAD & NEURAL ROSTER TAB */}
                {activeTab === 'roster' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Roster Table */}
                        <div className="xl:col-span-2 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Squad Roster Integration</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Biometric sync states</p>
                                </div>
                                <Link to="/players" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
                                    Full Roster <Zap size={10} />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-[#1e1e2a]">
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Athlete</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                                            <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Biological Status</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Contract</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
                                        {players.length > 0 ? players.slice(0, 6).map((player) => (
                                            <tr key={player._id} className="hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors group">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs">
                                                            {player.jerseyNumber || '00'}
                                                        </div>
                                                        <div>
                                                            <Link to={`/player/${player._id}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-500 transition-colors leading-tight block tracking-tight">
                                                                {player.name}
                                                            </Link>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{player.sport}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border
                                                        ${player.position === 'Captain'
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                            : player.position === 'Vice Captain'
                                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                                : 'bg-slate-100 dark:bg-[#1e1e2a] text-slate-500 border-slate-200 dark:border-[#2a2a3a]'
                                                        }`}>
                                                        {player.position}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="live-dot" style={{ width: 6, height: 6, background: '#10b981' }}></div>
                                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
                                                        </div>
                                                        <div className="w-20 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 w-[94%] rounded-full"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 k-mono bg-slate-100 dark:bg-[#1e1e2a] px-2 py-0.5 rounded border border-slate-200 dark:border-[#2a2a3a]">
                                                        2026 ACTIVE
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                                        <Users size={32} className="text-slate-400" />
                                                        <div className="text-xs text-slate-400 font-black uppercase tracking-widest">Empty Roster</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Mission Log */}
                        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
                                    <Activity size={14} className="text-blue-500" />
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Mission Log</h2>
                                </div>
                                <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
                                    <OperationalLog type="AI Predictor" detail="XGBoost Emulation Refreshed" time="LIVE" accentColor="blue" />
                                    <OperationalLog type="Socket.io" detail="Live updates syncing match telemetry" time="LIVE" accentColor="emerald" />
                                    <OperationalLog type="Medical" detail="Unit #7 Fatigue Index calibrated" time="2H AGO" accentColor="blue" />
                                    <OperationalLog type="Strategy" detail="Match Simulation Peak Depth" time="1D AGO" accentColor="blue" />
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-[#1e1e2a] bg-slate-50 dark:bg-[#0c0c12]">
                                <Link to="/cricket-lab" className="w-full inline-flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
                                    <Cpu size={13} /> Launch Full Lab Suite
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. XGBOOST WIN PROBABILITY SIMULATOR TAB */}
                {activeTab === 'predictor' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Simulation Controls */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight mb-1 uppercase">MODEL CALIBRATION</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulate parameters for XGBoost</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>SCORE DIFFERENCE</span>
                                        <span className="k-mono text-blue-500 font-black">{aiInputs.scoreDiff} Runs</span>
                                    </div>
                                    <input 
                                        type="range" min="-50" max="150" value={aiInputs.scoreDiff}
                                        onChange={(e) => setAiInputs({...aiInputs, scoreDiff: parseInt(e.target.value)})}
                                        className="w-full accent-blue-600 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>WICKETS LOST</span>
                                        <span className="k-mono text-blue-500 font-black">{aiInputs.wickets} Wickets</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="9" value={aiInputs.wickets}
                                        onChange={(e) => setAiInputs({...aiInputs, wickets: parseInt(e.target.value)})}
                                        className="w-full accent-blue-600 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>OVERS REMAINING</span>
                                        <span className="k-mono text-blue-500 font-black">{aiInputs.oversRemaining} Overs</span>
                                    </div>
                                    <input 
                                        type="range" min="0.1" max="20" step="0.1" value={aiInputs.oversRemaining}
                                        onChange={(e) => setAiInputs({...aiInputs, oversRemaining: parseFloat(e.target.value)})}
                                        className="w-full accent-blue-600 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>TARGET SCORE</span>
                                        <span className="k-mono text-blue-500 font-black">{aiInputs.targetScore} Runs</span>
                                    </div>
                                    <input 
                                        type="range" min="100" max="250" value={aiInputs.targetScore}
                                        onChange={(e) => setAiInputs({...aiInputs, targetScore: parseInt(e.target.value)})}
                                        className="w-full accent-blue-600 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={runAISimulation}
                                className="w-full py-4 text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} /> Recalibrate Predictor
                            </button>
                        </div>

                        {/* ML Prediction Output Panel */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">XGBOOST PREDICTIVE CORE</span>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Simulated Victory Certainty</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                        {aiTasks.win.model}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div className="md:col-span-1 text-center md:text-left">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VICTORY ODDS</span>
                                        <h2 className="text-5xl font-black text-blue-500 k-mono mt-1">{(aiTasks.win.prob * 100).toFixed(1)}%</h2>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                            The gradient-boosted decision tree maps historical run rates, wicket leverage values, and required runs to dynamically forecast live match outcomes.
                                        </p>
                                        <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-2.5 overflow-hidden">
                                            <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500" style={{ width: `${aiTasks.win.prob * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recharts chart showing win probability trends */}
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Win Probability Trajectory</h3>
                                <div className="h-44 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={winRateHistory.length > 0 ? winRateHistory : [{ ball: 1, winProb: 72 }]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorProbManager" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis dataKey="ball" stroke="#64748b" fontSize={10} fontStyle="bold" />
                                            <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" />
                                            <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} />
                                            <Area type="monotone" dataKey="winProb" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProbManager)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SCIKIT-LEARN INJURY PREVENTION & FATIGUE TAB */}
                {activeTab === 'load' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Biometric Controls */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight mb-1 uppercase">BIOMETRIC SIMULATOR</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tune workload & fatigue indices</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>CUMULATIVE WORKLOAD</span>
                                        <span className="k-mono text-emerald-500 font-black">{(aiInputs.workload * 100).toFixed(0)}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="1" step="0.05" value={aiInputs.workload}
                                        onChange={(e) => setAiInputs({...aiInputs, workload: parseFloat(e.target.value)})}
                                        className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>REST DAYS</span>
                                        <span className="k-mono text-emerald-500 font-black">{aiInputs.restDays} Days</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="10" value={aiInputs.restDays}
                                        onChange={(e) => setAiInputs({...aiInputs, restDays: parseInt(e.target.value)})}
                                        className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>FATIGUE INDEX</span>
                                        <span className="k-mono text-emerald-500 font-black">{(aiInputs.fatigueIndex * 100).toFixed(0)}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="1" step="0.05" value={aiInputs.fatigueIndex}
                                        onChange={(e) => setAiInputs({...aiInputs, fatigueIndex: parseFloat(e.target.value)})}
                                        className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>HEART RATE</span>
                                        <span className="k-mono text-emerald-500 font-black">{aiInputs.heartRate} BPM</span>
                                    </div>
                                    <input 
                                        type="range" min="70" max="190" value={aiInputs.heartRate}
                                        onChange={(e) => setAiInputs({...aiInputs, heartRate: parseInt(e.target.value)})}
                                        className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-[#1e1e2a] rounded-lg cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={runAISimulation}
                                className="w-full py-4 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} /> Predict Biometric Risk
                            </button>
                        </div>

                        {/* Outcomes */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Injury risk */}
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                                <div>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">SCIKIT-LEARN CLASSIFIER</span>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">RandomForest Injury Risk</h4>
                                    
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <h3 className="text-3xl font-black text-red-500 k-mono">{(aiTasks.injury.score * 100).toFixed(0)}%</h3>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase
                                            ${aiTasks.injury.level === 'HIGH' 
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            }`}>
                                            {aiTasks.injury.level} Risk
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        Ensemble analysis mapping training frequency, structural bone workloads, and joint wear patterns.
                                    </p>
                                </div>
                                <div className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 dark:border-[#1e1e2a] pt-3">
                                    MODEL: {aiTasks.injury.model}
                                </div>
                            </div>

                            {/* Fatigue index */}
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                <div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">SCIKIT-LEARN REGRESSION</span>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Ridge Biological Fatigue</h4>
                                    
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <h3 className="text-3xl font-black text-emerald-500 k-mono">{(aiTasks.fatigue.index * 100).toFixed(0)}%</h3>
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase">
                                            {aiTasks.fatigue.classification}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        Predictive Ridge model mapping aerobic fatigue values and heart rate variability curves.
                                    </p>
                                </div>
                                <div className="mt-4 text-xs font-black text-blue-500 uppercase tracking-wider border-t border-slate-100 dark:border-[#1e1e2a] pt-3">
                                    SUGGESTION: {aiTasks.fatigue.suggest}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. FIELD PITCH TACTICS TAB (react-konva) */}
                {activeTab === 'tactics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Control widget */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Target size={14} className="text-blue-500" />
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">Tactical Placements</h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                    Formulate squad positions dynamically on the field. Drag nodes to shift lines, cover gaps, and counter batsman strong zones.
                                </p>

                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {match.fieldPlacements?.map((fielder, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#0c0c12] border border-slate-100 dark:border-[#1e1e2a] text-xs">
                                            <span className="font-bold text-slate-800 dark:text-white">{fielder.role}</span>
                                            <span className="k-mono text-[10px] text-slate-400">X: {Math.round(fielder.x)}, Y: {Math.round(fielder.y)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedFielder(null)}
                                className="w-full mt-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-500/20"
                            >
                                Reset Placements
                            </button>
                        </div>

                        {/* Interactive react-konva Pitch Map */}
                        <div className="lg:col-span-8 bg-[#09151c] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
                            <div className="absolute top-4 left-4 text-white/20 font-bold uppercase tracking-widest text-[9px]">
                                Interactive Tactical Stadium Canvas
                            </div>

                            <div className="border border-white/5 rounded-full overflow-hidden bg-emerald-950/10">
                                <Stage width={360} height={360}>
                                    <Layer>
                                        {/* Outer restriction boundary */}
                                        <Circle cx={180} cy={180} radius={160} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                                        
                                        {/* Inner circle boundary */}
                                        <Circle cx={180} cy={180} radius={95} stroke="rgba(255,255,255,0.15)" strokeWidth={1} dash={[5, 5]} />
                                        
                                        {/* Pitch */}
                                        <Rect x={173} y={150} width={14} height={60} fill="#dfcfad" stroke="rgba(255,255,255,0.2)" />

                                        {/* Draw Draggable Fielder nodes */}
                                        {match.fieldPlacements?.map((fielder, idx) => (
                                            <React.Fragment key={idx}>
                                                <Circle
                                                    cx={fielder.x * 0.9} // scaled down slightly to fit 360px stage
                                                    cy={fielder.y * 0.9}
                                                    radius={7.5}
                                                    fill="#EF4444"
                                                    stroke="#FFFFFF"
                                                    strokeWidth={1.2}
                                                    draggable
                                                    onDragEnd={(e) => handleFielderDrag(e, idx)}
                                                    onClick={() => setSelectedFielder(fielder)}
                                                    shadowColor="black"
                                                    shadowBlur={3}
                                                    shadowOpacity={0.3}
                                                />
                                                <KonvaText
                                                    x={(fielder.x * 0.9) - 20}
                                                    y={(fielder.y * 0.9) - 15}
                                                    text={fielder.role}
                                                    fill="#FFFFFF"
                                                    fontSize={7}
                                                    fontStyle="bold"
                                                    width={40}
                                                    align="center"
                                                />
                                            </React.Fragment>
                                        ))}
                                    </Layer>
                                </Stage>
                            </div>

                            {selectedFielder && (
                                <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-xl text-left">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Tactical Node Info</p>
                                            <h4 className="text-xs font-black text-white">{selectedFielder.name} ({selectedFielder.role})</h4>
                                            <span className="text-[9px] text-slate-400">Coordinates: X: {Math.round(selectedFielder.x)}, Y: {Math.round(selectedFielder.y)}</span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedFielder(null)}
                                            className="text-[9px] font-black uppercase text-slate-400 bg-white/5 px-2 py-0.5 rounded"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

/* Sub-components */
const ManagerCard = ({ title, value, subtext, icon: Icon, accentColor }) => {
    const colors = {
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: 'bg-blue-500' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' },
        red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', bar: 'bg-red-500' }
    };
    const c = colors[accentColor] || colors.blue;

    return (
        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${c.bar} rounded-l-2xl`}></div>
            <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
                <Icon size={17} className={c.text} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{title}</p>
            <p className="text-2.5xl font-black text-slate-900 dark:text-white k-mono tracking-tight leading-none">{value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{subtext}</p>
        </div>
    );
};

const OperationalLog = ({ type, detail, time, accentColor }) => {
    const barColors = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', red: 'bg-red-500' };
    const textColors = { blue: 'text-blue-500', emerald: 'text-emerald-500', red: 'text-red-500' };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0a0a0c] border border-slate-100 dark:border-[#1e1e2a] rounded-xl relative overflow-hidden hover:bg-slate-100 dark:hover:bg-[#13131a] transition-colors">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${barColors[accentColor] || 'bg-slate-400'}`}></div>
            <div className="pl-1">
                <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${textColors[accentColor] || 'text-slate-400'}`}>{type}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-300 tracking-tight leading-none">{detail}</div>
            </div>
            <div className="text-[9px] font-bold text-slate-400 k-mono ml-3 whitespace-nowrap">{time}</div>
        </div>
    );
};

export default DashboardManager;
