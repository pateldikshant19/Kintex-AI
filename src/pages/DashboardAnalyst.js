import React, { useState, useEffect, useRef } from 'react';

import { Stage, Layer, Circle, Line, Rect } from 'react-konva';
import { io } from 'socket.io-client';
import {
    Database, Activity, Cpu, Zap,
    Video, Play, CheckCircle2, AlertTriangle,
    Filter, FileText, Terminal, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const DEFAULT_ANALYST_SQUAD = [
    { _id: 'ind-1', name: 'Virat Kohli', role: 'Batter', teamName: 'India', status: 'Optimal', readinessScore: 98, battingStyle: 'Right Hand', bowlingStyle: 'Right arm medium' },
    { _id: 'ind-2', name: 'Rohit Sharma', role: 'Captain / Batter', teamName: 'India', status: 'Optimal', readinessScore: 95, battingStyle: 'Right Hand', bowlingStyle: 'Right arm offbreak' },
    { _id: 'ind-3', name: 'Jasprit Bumrah', role: 'Fast Bowler', teamName: 'India', status: 'Optimal', readinessScore: 99, battingStyle: 'Right Hand', bowlingStyle: 'Right arm fast' },
    { _id: 'ind-4', name: 'Hardik Pandya', role: 'All Rounder', teamName: 'India', status: 'Optimal', readinessScore: 94, battingStyle: 'Right Hand', bowlingStyle: 'Right arm fast-medium' },
    { _id: 'ind-5', name: 'Suryakumar Yadav', role: 'T20 Captain / Batter', teamName: 'India', status: 'Optimal', readinessScore: 96, battingStyle: 'Right Hand', bowlingStyle: 'Right arm medium' },
    { _id: 'ind-6', name: 'Rishabh Pant', role: 'Wicket-Keeper Batter', teamName: 'India', status: 'Optimal', readinessScore: 92, battingStyle: 'Left Hand', bowlingStyle: 'None' },
    { _id: 'ind-7', name: 'Shubman Gill', role: 'Opener / Batter', teamName: 'India', status: 'Optimal', readinessScore: 91, battingStyle: 'Right Hand', bowlingStyle: 'Right arm offbreak' },
    { _id: 'ind-8', name: 'Yashasvi Jaiswal', role: 'Opener / Batter', teamName: 'India', status: 'Optimal', readinessScore: 93, battingStyle: 'Left Hand', bowlingStyle: 'Right arm legbreak' },
    { _id: 'ind-9', name: 'Ravindra Jadeja', role: 'All Rounder', teamName: 'India', status: 'Optimal', readinessScore: 95, battingStyle: 'Left Hand', bowlingStyle: 'Slow left-arm orthodox' },
    { _id: 'ind-10', name: 'Axar Patel', role: 'All Rounder', teamName: 'India', status: 'Optimal', readinessScore: 94, battingStyle: 'Left Hand', bowlingStyle: 'Slow left-arm orthodox' },
    { _id: 'ind-11', name: 'Kuldeep Yadav', role: 'Spinner / Bowler', teamName: 'India', status: 'Optimal', readinessScore: 92, battingStyle: 'Left Hand', bowlingStyle: 'Left arm chinaman' },
    { _id: 'ind-12', name: 'Mohammed Siraj', role: 'Fast Bowler', teamName: 'India', status: 'Optimal', readinessScore: 90, battingStyle: 'Right Hand', bowlingStyle: 'Right arm fast' },
    { _id: 'ind-13', name: 'Arshdeep Singh', role: 'Fast Bowler', teamName: 'India', status: 'Optimal', readinessScore: 91, battingStyle: 'Left Hand', bowlingStyle: 'Left arm medium-fast' },
    { _id: 'ind-14', name: 'KL Rahul', role: 'Wicket-Keeper Batter', teamName: 'India', status: 'Optimal', readinessScore: 89, battingStyle: 'Right Hand', bowlingStyle: 'None' },
    { _id: 'ind-15', name: 'Rinku Singh', role: 'Finisher / Batter', teamName: 'India', status: 'Optimal', readinessScore: 92, battingStyle: 'Left Hand', bowlingStyle: 'Right arm offbreak' },
    { _id: 'ind-16', name: 'Sanju Samson', role: 'Wicket-Keeper Batter', teamName: 'India', status: 'Optimal', readinessScore: 88, battingStyle: 'Right Hand', bowlingStyle: 'None' }
];

const DashboardAnalyst = () => {
    const { user } = useAuth();
    const { selectedLeagueId, selectedTeamId } = useSession();

    // Core Data
    const [players, setPlayers] = useState(DEFAULT_ANALYST_SQUAD);
    const [loading, setLoading] = useState(true);

    // Workflow State
    const [activeTab, setActiveTab] = useState('pre-match'); // pre-match, live-match, post-match

    // Pre-Match Filters
    const [rosterFilter, setRosterFilter] = useState('All');

    // Live Telemetry states
    const [match, setMatch] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [canvasSubTab, setCanvasSubTab] = useState('wheel'); // wheel, pitch
    const [showDebugLogger, setShowDebugLogger] = useState(false);

    // CV / Post-Match states
    const [cvProcessing, setCvProcessing] = useState(false);
    const [cvResults, setCvResults] = useState(null);
    const [cvVideoFrame, setCvVideoFrame] = useState(0);
    const [cvPlayback, setCvPlayback] = useState(false);

    // Socket states
    const [socketConnected, setSocketConnected] = useState(false);
    const [liveLogs, setLiveLogs] = useState(["Websocket: Initialization started..."]);

    const heatmapCanvasRef = useRef(null);
    const socketRef = useRef(null);
    const API_URL = `${process.env.REACT_APP_API_URL}/cricket`;

    const teamIdentifier = user?.teamName?.toUpperCase().replace(/\s+/g, '-') || 'DEFAULT';
    const teamLogo = `/teams/${teamIdentifier}.png`;

    useEffect(() => {
        const fetchRoster = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL_BASE = process.env.REACT_APP_API_URL || '/api';
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch(`${API_URL_BASE}/players`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setPlayers(data);
                    } else {
                        setPlayers(DEFAULT_ANALYST_SQUAD);
                    }
                }
            } catch (err) {
                console.warn("Roster fetch warning, using default analyst squad:", err.message);
                setPlayers(DEFAULT_ANALYST_SQUAD);
            }
        };

        const fetchMatchTelemetry = async () => {
            try {
                let liveMatchId = null;
                let success = false;

                try {
                    const matchesRes = await fetch(`${API_URL}/matches`);
                    if (matchesRes.ok) {
                        const matchesData = await matchesRes.json();
                        if (matchesData && matchesData.length > 0) {
                            liveMatchId = matchesData[0].id;
                        }
                    }
                } catch (err) {
                    console.warn("Could not fetch live matches list, falling back.", err);
                }

                if (liveMatchId) {
                    try {
                        const res = await fetch(`${API_URL}/match/${liveMatchId}`);
                        if (res.ok) {
                            const data = await res.json();
                            setMatch(data);
                            setDeliveries(data.deliveries || []);

                            if (socketRef.current) {
                                socketRef.current.emit('joinMatch', liveMatchId);
                                setLiveLogs(prev => [...prev, `Websocket: Joined live room for [${liveMatchId}] - Live Telemetry Active`]);
                            }
                            success = true;
                        }
                    } catch (err) {
                        console.warn(`Could not fetch data for match ${liveMatchId}`, err);
                    }
                }

                if (!success) {
                    const res = await fetch(`${API_URL}/match/c1`);
                    if (res.ok) {
                        const data = await res.json();
                        setMatch(data);
                        setDeliveries(data.deliveries || []);
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

        socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

        socketRef.current.on('connect', () => {
            setSocketConnected(true);
            setLiveLogs(prev => [...prev, "Websocket: Connected to Live Telemetry Stream."]);
        });

        socketRef.current.on('disconnect', () => {
            setSocketConnected(false);
            setLiveLogs(prev => [...prev, "Websocket: Connection closed."]);
        });

        socketRef.current.on('deliveryUpdate', (data) => {
            setLiveLogs(prev => [
                ...prev,
                `Delivery Event: Ball ${data.newDelivery.ball} -> batsman ${data.newDelivery.batsman} +${data.newDelivery.runs} Runs`
            ]);
            setDeliveries(prev => [...prev, data.newDelivery]);
            setMatch(prev => ({ ...prev, stats: data.stats }));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveMatch', 'c1');
                socketRef.current.disconnect();
            }
        };
    }, [API_URL, selectedLeagueId, selectedTeamId, user]);

    useEffect(() => {
        if (deliveries.length > 0 && activeTab === 'live-match' && canvasSubTab === 'wheel') {
            drawScoringHeatmap();
        }
        // eslint-disable-next-line
    }, [deliveries, activeTab, canvasSubTab]);

    const drawScoringHeatmap = () => {
        const canvas = heatmapCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        deliveries.forEach(del => {
            if (del.runs === 0) return;
            const angleRad = (del.wagonAngle - 90) * Math.PI / 180;
            const dist = del.wagonLength * 1.35;
            const x = centerX + Math.cos(angleRad) * dist;
            const y = centerY + Math.sin(angleRad) * dist;

            const grad = ctx.createRadialGradient(x, y, 0, x, y, 35);
            grad.addColorStop(0, del.runs === 4 || del.runs === 6 ? 'rgba(59,130,246,0.8)' : 'rgba(16,185,129,0.8)');
            grad.addColorStop(1, 'rgba(59,130,246,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const simulateNextBall = async () => {
        try {
            await fetch(`${API_URL}/simulate-delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId: 'c1' })
            });
        } catch (err) {
            console.error("Simulation failed", err);
        }
    };

    const startCVAnalysis = async () => {
        setCvProcessing(true);
        setCvResults(null);
        setCvVideoFrame(0);

        try {
            const res = await fetch(`${API_URL}/cv/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_path: "rca_bowler_cam.mp4" })
            });
            const data = await res.json();

            setTimeout(() => {
                setCvResults(data);
                setCvProcessing(false);
                setCvPlayback(true);
            }, 2000);
        } catch (err) {
            console.error(err);
            setCvProcessing(false);
        }
    };

    useEffect(() => {
        let interval;
        if (cvPlayback && cvResults) {
            interval = setInterval(() => {
                setCvVideoFrame(prev => (prev < 15 ? prev + 1 : 0));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [cvPlayback, cvResults]);

    const getRiskIndicator = (riskScore) => {
        if (riskScore < 10) return { icon: '🟢', color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Low' };
        if (riskScore < 20) return { icon: '🟡', color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' };
        return { icon: '🔴', color: 'text-red-500', bg: 'bg-red-500/10', label: 'High' };
    };

    const getHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        return Math.abs(hash);
    };

    const computeMedicalStats = (p) => {
        if (p.medicalProfile) return p.medicalProfile;
        const seed = p._id + p.name + p.role;
        const hash = getHash(seed || '');
        const riskScore = 3 + (hash % 33); // 3-35%

        let availability = 'Ready';
        if (riskScore > 25) availability = 'Monitor';
        if (riskScore > 30) availability = 'Limited Training';
        if (riskScore > 33) availability = 'Rehabilitation';

        return { injuryRiskScore: riskScore, availability };
    };

    const filteredPlayers = players.filter(p => {
        if (rosterFilter === 'All Players') return true;

        const medical = computeMedicalStats(p);

        if (rosterFilter === 'Available') return medical.availability === 'Ready';
        if (rosterFilter === 'Monitor') return medical.availability === 'Monitor';
        if (rosterFilter === 'Injured') return medical.availability === 'Rehabilitation' || medical.availability === 'Limited Training';
        if (rosterFilter === 'High Risk') return medical.injuryRiskScore >= 20;

        const role = (p.role || '').toLowerCase();
        if (rosterFilter === 'Batsman') return role.includes('batsman') && !role.includes('wk');
        if (rosterFilter === 'Bowler') return role.includes('bowler');
        if (rosterFilter === 'All-rounder') return role.includes('allrounder') || role.includes('all-rounder');
        if (rosterFilter === 'Wicketkeeper') return role.includes('wk') || role.includes('wicket');

        return false;
    });

    if (loading || !match) return (
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Hydrating Analyst Deck...</span>
        </div>
    );

    return (
        <div className="space-y-5 py-4">

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-[#1e1e2a]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl p-2 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                        <img
                            src={teamLogo}
                            alt={user?.teamName}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {user?.teamName || 'ELITE'}{' '}
                                <span className="text-blue-500 font-medium">Data Analyst Deck</span>
                            </h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${socketConnected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                <span className="live-dot" style={{ background: socketConnected ? '#10b981' : '#ef4444' }}></span>
                                {socketConnected ? 'Streaming' : 'Offline'}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Performance Metrics • Match Analytics • Statistical Reports
                        </p>
                    </div>
                </div>
            </div>

            {/* Analyst Workflow Tabs */}
            <div className="flex border-b border-slate-200 dark:border-[#1e1e2a] pb-px overflow-x-auto">
                {[
                    { id: 'pre-match', label: 'Before Match (Pre-Match Analysis)', icon: <Filter size={13} /> },
                    { id: 'live-match', label: 'During Match (Live Insights)', icon: <Activity size={13} /> },
                    { id: 'post-match', label: 'After Match (Post-Match)', icon: <FileText size={13} /> }
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

            {/* TAB CONTENT PANELS */}
            <div className="min-h-[450px]">

                {/* 1. PRE-MATCH ANALYSIS */}
                {activeTab === 'pre-match' && (
                    <div className="space-y-4">
                        {/* Filters Row */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['All Players', 'Available', 'Monitor', 'Injured', 'High Risk', 'Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setRosterFilter(filter)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-colors ${rosterFilter === filter
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white dark:bg-[#13131a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e1e2a] hover:bg-slate-50 dark:hover:bg-[#0a0a0c]'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Streamlined Analyst Player List */}
                        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-[#1e1e2a] bg-slate-50/50 dark:bg-[#0a0a0c]/50">
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Player</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base Role</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fitness Status</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Injury Risk</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Recent Form (Last 5 Matches)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-[#1e1e2a]">
                                        {filteredPlayers.map((player) => {
                                            const medical = computeMedicalStats(player);
                                            const risk = medical.injuryRiskScore;
                                            const indicator = getRiskIndicator(risk);

                                            // Mock specific form based on role
                                            const roleStr = (player.role || '').toLowerCase();
                                            const isBat = roleStr.includes('batsman') || roleStr.includes('wk') || roleStr.includes('wicket');
                                            const primaryStat = isBat ? `${(30 + Math.random() * 20).toFixed(1)} Avg` : `${(6 + Math.random() * 3).toFixed(1)} Econ`;
                                            const secondaryStat = isBat ? `${(120 + Math.random() * 30).toFixed(0)} SR` : `${(18 + Math.random() * 10).toFixed(1)} Strike Rate`;

                                            return (
                                                <tr key={player.id || player._id} className="hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-slate-900 dark:text-white text-xs">{player.name}</div>
                                                        <div className="text-[10px] text-slate-400">{player.position}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                                                            {player.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                            ${medical.availability === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                medical.availability === 'Monitor' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}
                                                        >
                                                            {medical.availability}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${indicator.bg} ${indicator.color}`}>
                                                            {indicator.icon} {risk}% Risk
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{primaryStat}</div>
                                                        <div className="text-[10px] text-slate-400">{secondaryStat}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredPlayers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-5 py-10 text-center text-slate-400 text-xs">No players match the current filter.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. LIVE MATCH TELEMETRY */}
                {activeTab === 'live-match' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Live Status Column */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-sm">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    Current Match Status
                                    <button onClick={simulateNextBall} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 transition-colors" title="Simulate Event">
                                        <Zap size={14} />
                                    </button>
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Cpu size={12} /> Live Win Probability</div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-black text-emerald-500">{(0.55 + Math.sin(deliveries.length / 4) * 0.15 * 100).toFixed(1)}%</span>
                                            <span className="text-[10px] font-bold text-slate-400 mb-1">Target 182</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={12} /> Player Workload & Alerts</div>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center gap-2 text-amber-500 font-bold">
                                                <AlertTriangle size={12} /> Unit #12 High Fatigue
                                            </div>
                                            <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                                <CheckCircle2 size={12} /> Pacers Operating Optimal
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Event Timeline</div>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[9px] text-slate-500 pr-2 custom-scrollbar">
                                            {deliveries.slice().reverse().map((d, i) => (
                                                <div key={i} className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-1">
                                                    <span>Ball {d.ball} ({d.ballType}):</span>
                                                    <span className={`px-1.5 py-0.5 rounded ${d.runs >= 4 ? 'bg-amber-500/10 text-amber-500 font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
                                                        +{d.runs}
                                                    </span>
                                                </div>
                                            ))}
                                            {deliveries.length === 0 && <div className="text-center italic">Waiting for events...</div>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDebugLogger(!showDebugLogger)}
                                        className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white py-1 transition-colors"
                                    >
                                        <Terminal size={12} /> {showDebugLogger ? 'Hide Raw Socket Event Logger' : 'View Raw Socket Event Logger (Debug)'}
                                    </button>
                                </div>
                            </div>

                            {/* Layer Controls */}
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-sm">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Spatial Heatmaps</h3>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'wheel', label: 'Wagon Wheel Heatmap', desc: 'Shot density & trajectories' },
                                        { id: 'pitch', label: 'Pitch Bounce Map', desc: 'Bowler length groupings' }
                                    ].map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setCanvasSubTab(sub.id)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all
                                                ${canvasSubTab === sub.id
                                                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-500 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-[#0a0a0c] border-slate-100 dark:border-[#1e1e2a] text-slate-500 hover:bg-slate-100 dark:hover:bg-[#13131a]'
                                                }`}
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-wider">{sub.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Stage Panel */}
                        <div className="lg:col-span-9 space-y-4">
                            {showDebugLogger && (
                                <div className="bg-[#0b151e] border border-red-500/20 rounded-2xl p-4 h-32 overflow-y-auto font-mono text-[10px] shadow-inner">
                                    <div className="text-red-500 font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                                        <Terminal size={12} /> Raw Socket.IO Dump (Diagnostic Stream)
                                    </div>
                                    {liveLogs.slice().reverse().map((log, i) => (
                                        <div key={i} className="text-slate-400 border-b border-white/5 pb-1 mb-1">{log}</div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-[#0b151e] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[460px] shadow-sm">
                                <div className="absolute top-4 left-4 text-white/10 font-bold uppercase tracking-widest text-[9px]">
                                    Live Spatial Analytics
                                </div>

                                {canvasSubTab === 'wheel' && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-60">
                                        <canvas ref={heatmapCanvasRef} width={360} height={360} className="rounded-full" />
                                    </div>
                                )}

                                <div className="relative border border-white/5 rounded-full overflow-hidden bg-emerald-950/10 z-20">
                                    <Stage width={360} height={360}>
                                        <Layer>
                                            {/* WAGON WHEEL */}
                                            {canvasSubTab === 'wheel' && (
                                                <>
                                                    <Circle cx={180} cy={180} radius={170} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} dash={[6, 4]} />
                                                    <Circle cx={180} cy={180} radius={110} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                                    <Rect x={173} y={140} width={14} height={80} fill="#f4ecd8" stroke="rgba(255,255,255,0.2)" />
                                                    {deliveries.map((del, idx) => {
                                                        if (del.runs === 0) return null;
                                                        const angleRad = (del.wagonAngle - 90) * Math.PI / 180;
                                                        const endX = 180 + Math.cos(angleRad) * (del.wagonLength * 1.6);
                                                        const endY = 180 + Math.sin(angleRad) * (del.wagonLength * 1.6);
                                                        const runColor = del.runs === 6 ? '#EF4444' : del.runs === 4 ? '#F59E0B' : '#3B82F6';
                                                        return (
                                                            <React.Fragment key={idx}>
                                                                <Line points={[180, 180, endX, endY]} stroke={runColor} strokeWidth={del.runs >= 4 ? 2.2 : 1.1} opacity={0.8} />
                                                                <Circle cx={endX} cy={endY} radius={del.runs >= 4 ? 4 : 2.5} fill={runColor} />
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </>
                                            )}

                                            {/* PITCH MAP */}
                                            {canvasSubTab === 'pitch' && (
                                                <>
                                                    <Rect x={110} y={30} width={140} height={300} fill="#4E7848" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                                                    <Rect x={125} y={40} width={110} height={280} fill="#dfcfad" stroke="rgba(255,255,255,0.15)" />
                                                    <Line points={[125, 80, 235, 80]} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                                                    <Line points={[125, 280, 235, 280]} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                                                    {deliveries.map((del, idx) => {
                                                        const mapX = 125 + ((del.pitchX - 40) / 20) * 110;
                                                        const mapY = 80 + ((del.pitchY - 60) / 30) * 200;
                                                        const runColor = del.runs === 0 ? '#3B82F6' : del.runs >= 4 ? '#EF4444' : '#10B981';
                                                        return (
                                                            <Circle key={idx} cx={mapX} cy={mapY} radius={6} fill={runColor} stroke="#FFFFFF" opacity={0.9} />
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </Layer>
                                    </Stage>
                                </div>
                                <div className="mt-4 w-full flex justify-between px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-white/5 pt-3">
                                    {canvasSubTab === 'wheel' && (
                                        <>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Sixes</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Fours</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Singles</span>
                                        </>
                                    )}
                                    {canvasSubTab === 'pitch' && (
                                        <>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Boundary Conceded</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dot Balls</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Runs Conceded</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. POST-MATCH DIAGNOSTICS */}
                {activeTab === 'post-match' && (
                    <div className="space-y-6">

                        {/* Analyst Post-Match KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <FileText size={12} /> AI Match Summary
                                </h3>
                                <div className="text-xs text-slate-600 dark:text-slate-300 my-2 leading-relaxed">
                                    High intensity middle overs. Match secured via strong defensive field placements in death overs limiting boundaries.
                                </div>
                                <span className="text-emerald-500 font-black text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Outcome: Win</span>
                            </div>
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Activity size={12} /> Fatigue Report
                                </h3>
                                <div className="flex flex-col h-full justify-center">
                                    <div className="text-2xl font-black text-amber-500 font-mono mb-0.5">14.2% ↑</div>
                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Average squad fatigue increase</span>
                                    <div className="mt-2 text-[10px] text-slate-400 font-medium">+2 players moved to 'Monitor' state</div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <AlertCircle size={12} /> Workload vs Threshold
                                </h3>
                                <div className="flex flex-col justify-center gap-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-slate-500">
                                            <span>Fast Bowlers</span> <span className="text-red-500">85%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-slate-500">
                                            <span>Spinners</span> <span className="text-emerald-500">42%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full" style={{ width: '42%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Database size={12} /> Recovery Recommendations
                                </h3>
                                <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-2 mt-2">
                                    <li className="flex items-start gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                                        Cryotherapy for Fast Bowlers (Priority)
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                                        Light active recovery session (48h delay)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* CV Sentinel Controls */}
                        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase">Performance CV Analysis</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identify biomechanical action anomalies from match footage</p>
                                </div>
                                <button
                                    onClick={startCVAnalysis}
                                    disabled={cvProcessing}
                                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2
                                        ${cvProcessing ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    {cvProcessing ? <><RefreshCw size={12} className="animate-spin" /> Processing Video...</> : <><Play size={12} /> Run Skeletal Tracking</>}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-[#0e1624] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 flex items-center justify-center min-h-[300px] relative overflow-hidden">
                                    {cvProcessing && <div className="text-blue-500 font-bold animate-pulse text-xs uppercase tracking-widest">Extracting poses...</div>}

                                    {cvResults && (
                                        <div className="relative w-full max-w-[240px] aspect-square bg-[#070b12] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-4">
                                            <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-500 stroke-[1.2] fill-none">
                                                <line x1="50" y1="25" x2="50" y2="55" />
                                                <line x1="38" y1="30" x2="62" y2="30" />
                                                <circle cx="50" cy="18" r="6" fill="#1e293b" stroke="#3b82f6" />
                                                <line x1="38" y1="30" x2="28" y2="42" />
                                                <line x1="28" y1="42" x2="22" y2="50" />
                                                {(() => {
                                                    const frameRad = (cvVideoFrame * 18 * Math.PI) / 180;
                                                    const elbX = 62 + Math.cos(frameRad) * 14;
                                                    const elbY = 30 + Math.sin(frameRad) * 14;
                                                    const wrstX = elbX + Math.cos(frameRad + 0.2) * 14;
                                                    const wrstY = elbY + Math.sin(frameRad + 0.2) * 14;
                                                    return (
                                                        <>
                                                            <line x1="62" y1="30" x2={elbX} y2={elbY} className="stroke-emerald-400 stroke-2" />
                                                            <line x1={elbX} y1={elbY} x2={wrstX} y2={wrstY} className="stroke-emerald-400 stroke-2" />
                                                            <circle cx="62" cy="30" r="2" fill="#ef4444" />
                                                            <circle cx={elbX} cy={elbY} r="2" fill="#eab308" />
                                                            <circle cx={wrstX} cy={wrstY} r="2" fill="#3b82f6" />
                                                        </>
                                                    );
                                                })()}
                                                <line x1="42" y1="55" x2="58" y2="55" />
                                                <line x1="42" y1="55" x2="40" y2="75" />
                                                <line x1="40" y1="75" x2="38" y2="92" />
                                                <line x1="58" y1="55" x2="60" y2="75" />
                                                <line x1="60" y1="75" x2="62" y2="92" />
                                            </svg>
                                        </div>
                                    )}
                                    {!cvProcessing && !cvResults && (
                                        <div className="text-slate-400 text-center space-y-2">
                                            <Video size={32} className="mx-auto opacity-20" />
                                            <div className="text-[10px] font-bold uppercase tracking-widest">Select Video Feed</div>
                                        </div>
                                    )}
                                </div>
                                {cvResults && (
                                    <div className="flex flex-col justify-center space-y-4 bg-slate-50 dark:bg-[#0a0a0c] p-6 rounded-2xl border border-slate-100 dark:border-[#1e1e2a]">
                                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2">Biomechanical Assessment</h4>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">ICC 15° Chucking Test</span>
                                            <span className="font-black text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> {cvResults.icc_15_degree_test}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Measured Extension Delta</span>
                                            <span className="font-black text-slate-900 dark:text-white font-mono">{cvResults.measured_extension_delta_deg}°</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Elbow Flexion Max</span>
                                            <span className="font-black text-slate-900 dark:text-white font-mono">{cvResults.max_elbow_flexion_deg}°</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Tracked Speed</span>
                                            <span className="font-black text-amber-500 font-mono">{cvResults.average_ball_speed_kmh} KM/H</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardAnalyst;
