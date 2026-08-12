import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Line, Rect, Text as KonvaText } from 'react-konva';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line as RechartsLine } from 'recharts';
import { io } from 'socket.io-client';
import { Play, Pause, RefreshCw, Cpu, ShieldAlert, Sparkles, User, Activity, Zap, CheckCircle2, AlertTriangle, Eye, Video, Thermometer, ChevronRight, FileText, ActivitySquare, BrainCircuit, History, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CricketLab = () => {
    const { user } = useAuth();
    // -------------------------------------------------------------
    // STATES
    // -------------------------------------------------------------
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // Default to overview now
    const [canvasSubTab, setCanvasSubTab] = useState('wheel'); // wheel, pitch, field
    const [selectedFielder, setSelectedFielder] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    
    // Medical Intel States
    const [players, setPlayers] = useState([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [intel, setIntel] = useState(null);
    const [intelLoading, setIntelLoading] = useState(false);
    
    const selectedPlayer = players.find(p => p._id === selectedPlayerId);

    
    // AI/ML States
    const [aiTasks, setAiTasks] = useState({
        win: { prob: 0.72, confidence: 0.88, model: "XGBoost Classifier" },
        injury: { score: 0.18, level: "LOW", model: "RandomForestClassifier" },
        fatigue: { index: 0.35, classification: "OPTIMAL", suggest: "Full training load clear" }
    });
    
    // Slider state inputs for the AI simulation
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

    // Computer Vision States
    const [cvProcessing, setCvProcessing] = useState(false);
    const [cvResults, setCvResults] = useState(null);
    const [cvVideoFrame, setCvVideoFrame] = useState(0);
    const [cvPlayback, setCvPlayback] = useState(false);
    
    // Socket Status
    const [socketConnected, setSocketConnected] = useState(false);
    const [liveLogs, setLiveLogs] = useState(["Websocket: Initialization started..."]);

    const heatmapCanvasRef = useRef(null);
    const socketRef = useRef(null);
    
    const API_URL = `${process.env.REACT_APP_API_URL || '/api'}/cricket`;

    // -------------------------------------------------------------
    // REAL-TIME SOCKET.IO INTEGRATION
    // -------------------------------------------------------------
    useEffect(() => {
        // Connect to express socket backend
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL || window.location.origin);

        socketRef.current.on('connect', () => {
            setSocketConnected(true);
        });

        fetchMatchTelemetry();

        socketRef.current.on('disconnect', () => {
            setSocketConnected(false);
            setLiveLogs(prev => [...prev, "Websocket: Connection severed."]);
        });

        // Listen for live delivery updates pushed by Express Backend via Socket.io
        socketRef.current.on('deliveryUpdate', (data) => {
            setLiveLogs(prev => [
                ...prev, 
                `Live ball ${data.newDelivery.ball}: ${data.newDelivery.batsman} scored ${data.newDelivery.runs} runs! (Speed: ${data.newDelivery.speed} km/h)`
            ]);
            
            // Highlight screen / add delivery
            setDeliveries(prev => [...prev, data.newDelivery]);
            
            // Sync overall match stats
            setMatch(prev => ({
                ...prev,
                stats: data.stats
            }));

            // Sync AI Predictions
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
        });

        // Fetch initial match telemetry
        fetchMatchTelemetry();

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveMatch', 'c1');
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Redraw Heatmap whenever deliveries change
    useEffect(() => {
        if (deliveries.length > 0 && activeTab === 'canvas' && canvasSubTab === 'wheel') {
            drawScoringHeatmap();
        }
    }, [deliveries, activeTab, canvasSubTab]);

    async function fetchPlayers() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL.replace('/cricket', '/players')}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                let filteredData = data;
                if (user && (user.role === 'manager' || user.role === 'analyst')) {
                    const userTeam = user.teamName;
                    if (userTeam) {
                        filteredData = data.filter(p => p.teamName === userTeam);
                    } else if (user.name && user.name.includes('India')) {
                        // Fallback for "Team India Manager"
                        filteredData = data.filter(p => p.teamName === 'India');
                    }
                }
                
                setPlayers(filteredData);
                if (filteredData.length > 0) {
                    setSelectedPlayerId(filteredData[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to load players:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPlayers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (!selectedPlayerId) return;
        const fetchIntel = async () => {
            setIntelLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL.replace('/cricket', '')}/injury-intelligence/profile?playerId=${selectedPlayerId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIntel(data.injuryIntelligence);
                }
            } catch (err) {
                console.error("Failed to load medical intel:", err);
            } finally {
                setIntelLoading(false);
            }
        };
        fetchIntel();
    }, [selectedPlayerId, API_URL]);

    async function fetchMatchTelemetry() {
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
                // Fallback if no live matches exist in database, DB connection failed, or returned 404
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

    // Trigger next ball simulation in Backend (Will broadcast socket.io emit!)
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

    // -------------------------------------------------------------
    // MATHEMATICAL GRADIENT HEATMAP RENDERING (HTML5 Canvas)
    // -------------------------------------------------------------
    const drawScoringHeatmap = () => {
        const canvas = heatmapCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw heat points based on Wagon Wheel shots
        deliveries.forEach(del => {
            if (del.runs === 0) return;
            // Convert angle to X, Y
            const angleRad = (del.wagonAngle - 90) * Math.PI / 180;
            const dist = del.wagonLength * 1.5;
            const x = centerX + Math.cos(angleRad) * dist;
            const y = centerY + Math.sin(angleRad) * dist;

            // Draw radial blur gradient
            const grad = ctx.createRadialGradient(x, y, 2, x, y, 40);
            const alpha = del.runs === 6 ? 0.6 : del.runs === 4 ? 0.45 : 0.3;
            const heatColor = del.runs === 6 ? '239, 68, 68' : del.runs === 4 ? '245, 158, 11' : '59, 130, 246';
            
            grad.addColorStop(0, `rgba(${heatColor}, ${alpha})`);
            grad.addColorStop(1, `rgba(${heatColor}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    // -------------------------------------------------------------
    // AI/ML SIMULATION PREDICTORS (XGBoost & scikit-learn models)
    // -------------------------------------------------------------
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
            console.error("AI simulation run failed: ", err);
        }
    };

    // -------------------------------------------------------------
    // COMPUTER VISION LAB (OpenCV Ball Tracker & MediaPipe Pose skeletal renderer)
    // -------------------------------------------------------------
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
            }, 2500); // Simulated delay to show CV frame analysis processing
        } catch (err) {
            console.error(err);
            setCvProcessing(false);
        }
    };

    // Playback framework for CV skeletal overlay frames
    useEffect(() => {
        let interval;
        if (cvPlayback && cvResults) {
            interval = setInterval(() => {
                setCvVideoFrame(prev => (prev < 15 ? prev + 1 : 0));
            }, 120);
        }
        return () => clearInterval(interval);
    }, [cvPlayback, cvResults]);

    // Handle interactive Konva field placement drag-ends
    const handleFielderDrag = (e, idx) => {
        const updatedPlacement = [...match.fieldPlacements];
        updatedPlacement[idx].x = e.target.x();
        updatedPlacement[idx].y = e.target.y();
        setMatch(prev => ({
            ...prev,
            fieldPlacements: updatedPlacement
        }));
    };

    // -------------------------------------------------------------
    // UI LAYOUT
    // -------------------------------------------------------------
    if (loading || !match) return (
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Hydrating Cricket Telemetry...</span>
        </div>
    );

    // Dynamic win rates over phases for Recharts
    const trendData = deliveries.map((d, i) => ({
        ball: i + 1,
        score: match.stats.runs - (deliveries.length - i) * 2,
        winProb: Math.round((0.55 + Math.sin(i / 4) * 0.15) * 100)
    }));

    return (
        <div className="space-y-6 py-4">
            {/* STAGE HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-slate-200 dark:border-[#1e1e2a]">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge-live flex items-center gap-1">
                            <span className="live-dot"></span> Socket.IO Connected
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">CRICDATA COMPACT v1.4</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                        CRICKET INTELLIGENCE <span className="text-blue-500 font-light tracking-widest">& CV LAB</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
                        A real-time sports visualization engine integrating Cricsheet datasets, OpenCV Red-Ball tracking, MediaPipe Pose-Skeleton Bowling Action analytics, and XGBoost-based Win Probability.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                    <button 
                        onClick={simulateNextBall}
                        className="inline-flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
                    >
                        <Zap size={14} className="animate-bounce" /> Bowl Simulated Delivery
                    </button>
                    <button 
                        onClick={fetchMatchTelemetry}
                        className="inline-flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] text-slate-700 dark:text-slate-300 rounded-xl hover:border-slate-300 dark:hover:border-[#2a2a3a] transition-all"
                    >
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* TOP SECTION: SELECTORS */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-4">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Player</label>
                    <select 
                        value={selectedPlayerId}
                        onChange={(e) => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                    >
                        {players.map(p => (
                            <option key={p._id} value={p._id}>{p.name} - {p.role}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Match Context</label>
                    <select className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors">
                        <option>Current Active Match</option>
                        <option>Upcoming Match</option>
                    </select>
                </div>
                <div className="flex items-end pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><RefreshCw size={12}/> Last updated: Just now</span>
                </div>
            </div>

            {/* TAB SELECTORS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PLAYER PROFILE</span>
                        {intel && intel.predictionDetails && intel.predictionDetails.isMockData && (
                            <span className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30 uppercase">Demo Data</span>
                        )}
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-none mb-1.5">{selectedPlayer ? selectedPlayer.name : '...'}</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedPlayer ? selectedPlayer.teamName : '...'}</span>
                </div>
                <div className="border-l border-slate-100 dark:border-[#1e1e2a] pl-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ROLE</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1.5 mt-1">{selectedPlayer ? (selectedPlayer.role || 'Player') : '...'}</h2>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedPlayer ? selectedPlayer.country : ''}</span>
                </div>
                <div className="border-l border-slate-100 dark:border-[#1e1e2a] pl-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">INJURY STATUS</span>
                    <h4 className="text-base font-black text-emerald-500 leading-none mb-1.5 mt-1">{intel ? intel.availabilityStatus : '...'}</h4>
                    <span className="text-xs font-black text-slate-950 dark:text-slate-200 k-mono">
                        {intel ? intel.riskLevel : '...'} <span className="text-[10px] text-slate-400 font-medium ml-1">Risk</span>
                    </span>
                </div>
                <div className="border-l border-slate-100 dark:border-[#1e1e2a] pl-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">AI INTELLIGENCE</span>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={14} className={intel?.riskScore > 50 ? "text-red-500" : "text-amber-500"} />
                        <span className={`text-xl font-black k-mono ${intel?.riskScore > 50 ? "text-red-500" : "text-amber-500"}`}>{intel?.riskScore ? intel.riskScore : 0}%</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">INJURY RISK</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">FATIGUE: {intel?.riskScore ? (intel.riskScore * 0.8).toFixed(0) : 0}% ({intel?.riskScore > 50 ? 'HIGH' : 'OPTIMAL'})</span>
                </div>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex border-b border-slate-200 dark:border-[#1e1e2a] pb-px overflow-x-auto whitespace-nowrap hide-scrollbar">
                {[
                    { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
                    { id: 'timeline', label: 'Medical Timeline', icon: <History size={14} /> },
                    { id: 'articles', label: 'Injury Articles', icon: <FileText size={14} /> },
                    { id: 'recovery', label: 'Recovery & Rehab', icon: <ActivitySquare size={14} /> },
                    { id: 'prediction', label: 'AI Prediction', icon: <BrainCircuit size={14} /> },
                    { id: 'canvas', label: 'CV / Heatmap', icon: <Video size={14} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3.5 border-b-2 text-xs font-black uppercase tracking-wider transition-all
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
            <div className="min-h-[500px]">
                
                {intelLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                        <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Analyzing Medical Data...</span>
                    </div>
                ) : (
                    <>
                    {/* MEDICAL OVERVIEW TAB */}
                    {activeTab === 'overview' && intel && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Risk Score */}
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-l-2xl"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Injury Probability</span>
                                        <AlertTriangle size={16} className={intel.riskAssessment.riskScore >= 80 ? 'text-red-500' : 'text-amber-500'} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white k-mono">{intel.riskAssessment.riskScore}%</h2>
                                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">{intel.riskAssessment.riskLevel} RISK</span>
                                </div>
                                {/* Recovery Progress */}
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l-2xl"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Progress</span>
                                        <Activity size={16} className="text-blue-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white k-mono">{intel.medicalProfile?.recoveryProgress || 100}%</h2>
                                    <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-1.5 mt-2">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${intel.medicalProfile?.recoveryProgress || 100}%`}}></div>
                                    </div>
                                </div>
                                {/* Availability */}
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-2xl"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight mt-1">{intel.availability}</h2>
                                </div>
                                {/* Minutes */}
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 rounded-l-2xl"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Mins</span>
                                        <Timer size={16} className="text-amber-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white k-mono">{intel.playingRecommendation?.recommendedPlayingMinutes || 90}</h2>
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{intel.playingRecommendation?.selectionAdvice || 'START PLAYER'}</span>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Sparkles className="text-emerald-500" size={18}/> AI Medical Summary</h3>
                                <div className="space-y-2">
                                    {intel.aiSummary && intel.aiSummary.map((summary, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{summary}</p>
                                        </div>
                                    ))}
                                    {(!intel.aiSummary || intel.aiSummary.length === 0) && (
                                        <p className="text-sm text-slate-500">No medical summary available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* MEDICAL TIMELINE TAB */}
                    {activeTab === 'timeline' && intel && (
                        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">Chronological Medical Timeline</h3>
                            <div className="relative border-l border-slate-200 dark:border-[#1e1e2a] ml-4 space-y-8">
                                {intel.timeline && intel.timeline.map((event, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#13131a] ${event.eventType === 'Injury' ? 'bg-red-500' : event.eventType === 'Recovery' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{new Date(event.eventDate || event.date).toLocaleDateString()}</span>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.eventType} - {event.bodyPart || event.description || 'General Update'}</h4>
                                        {event.severity && <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500">{event.severity}</span>}
                                        {event.sourceName && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><FileText size={12}/> {event.sourceName}</p>}
                                    </div>
                                ))}
                                {(!intel.timeline || intel.timeline.length === 0) && (
                                    <p className="pl-6 text-sm text-slate-500">No events recorded on the timeline.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ARTICLES TAB */}
                    {activeTab === 'articles' && intel && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {intel.supportingArticles && intel.supportingArticles.map((article, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 hover:border-blue-500/50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">{article.source}</span>
                                        <span className="text-[10px] font-medium text-slate-400">{new Date(article.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">{article.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-3 mb-4">{article.content}</p>
                                    <a href={article.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">Read Source <ChevronRight size={14}/></a>
                                </div>
                            ))}
                            {(!intel.supportingArticles || intel.supportingArticles.length === 0) && (
                                <p className="text-sm text-slate-500">No supporting articles found for this player's recent health events.</p>
                            )}
                        </div>
                    )}

                    {/* RECOVERY & REHAB TAB */}
                    {activeTab === 'recovery' && intel && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Recovery Estimate</h3>
                                <p className="text-2xl font-black text-emerald-500 mb-4">{intel.estimatedReturn?.progressStatus || 'Unknown'}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] p-4 rounded-xl border border-slate-100 dark:border-[#1e1e2a]">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Expected Return</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{intel.estimatedReturn?.recoveryWindow || 'Ready'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] p-4 rounded-xl border border-slate-100 dark:border-[#1e1e2a]">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Confidence</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{intel.estimatedReturn?.confidence || 100}%</span>
                                    </div>
                                </div>
                            </div>

                            {intel.exerciseRecommendations && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                                        <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 size={14}/> Recommended Exercises</h4>
                                        <ul className="space-y-2">
                                            {intel.exerciseRecommendations.recommendedExercises.map((ex, i) => (
                                                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> {ex}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                                        <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Exercises To Avoid</h4>
                                        <ul className="space-y-2">
                                            {intel.exerciseRecommendations.exercisesToAvoid.map((ex, i) => (
                                                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> {ex}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI PREDICTION TAB */}
                    {activeTab === 'prediction' && intel && (
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Cpu size={18} className="text-blue-500"/> Predictive Analysis</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                                                <span className="text-slate-400">Re-injury Probability</span>
                                                <span className="text-slate-900 dark:text-white">{intel.predictionDetails?.chanceOfReinjury || 0}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-2">
                                                <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500 rounded-full" style={{ width: `${intel.predictionDetails?.chanceOfReinjury || 0}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Risk Factors</h4>
                                        <ul className="space-y-2">
                                            {intel.predictionDetails?.riskFactors?.length > 0 ? intel.predictionDetails.riskFactors.map((r, i) => (
                                                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-red-500 mt-0.5">↓</span> {r}</li>
                                            )) : <li className="text-xs text-slate-500">No significant risk factors</li>}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Protection Factors</h4>
                                        <ul className="space-y-2">
                                            {intel.predictionDetails?.protectionFactors?.length > 0 ? intel.predictionDetails.protectionFactors.map((p, i) => (
                                                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">↑</span> {p}</li>
                                            )) : <li className="text-xs text-slate-500">None identified</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 h-full">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">Historical Records</h3>
                                    <div className="space-y-4">
                                        {intel.historicalInjuries && intel.historicalInjuries.length > 0 ? (
                                            intel.historicalInjuries.map((hist, i) => (
                                                <div key={i} className="border-b border-slate-100 dark:border-[#1e1e2a] pb-3 last:border-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{hist.injury}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(hist.date).getFullYear()}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{hist.severity} • {hist.recoveryDays} days out</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 text-center mt-10">No previous injury history available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ORIGINAL CV / HEATMAP CANVAS TAB */}
                    {activeTab === 'canvas' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Control Box */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Canvas Layer</h3>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'wheel', label: 'Wagon Wheel Projection', desc: 'Line trajectory of runs hit' },
                                        { id: 'pitch', label: 'Bowler Pitch Bounce Map', desc: 'Ball release coordinates & lengths' },
                                        { id: 'field', label: 'Field Placements (Drag)', desc: 'Interact & drag squad players' }
                                    ].map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setCanvasSubTab(sub.id)}
                                            className={`w-full text-left p-3.5 rounded-xl border transition-all
                                                ${canvasSubTab === sub.id 
                                                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-500 shadow-sm' 
                                                    : 'bg-slate-50 dark:bg-[#0a0a0c] border-slate-100 dark:border-[#1e1e2a] text-slate-500 hover:bg-slate-100 dark:hover:bg-[#13131a]'
                                                }`}
                                        >
                                            <p className="text-xs font-black uppercase tracking-wider mb-0.5">{sub.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{sub.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Feed Telemetry</h3>
                                <div className="space-y-2.5 max-h-48 overflow-y-auto font-mono text-[9px] text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-black/40 rounded-xl p-3 border border-slate-100 dark:border-[#1e1e2a]/60">
                                    {deliveries.slice().reverse().map((d, i) => (
                                        <div key={i} className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1">
                                            <span>Ball {d.ball} ({d.ballType}):</span>
                                            <span className={d.runs >= 4 ? 'text-amber-500 font-black' : 'text-slate-200'}>+{d.runs} Runs</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Stage Panel */}
                        <div className="lg:col-span-9 bg-[#17252A] dark:bg-[#060D13] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
                            {/* Graphic background coordinates for stadium */}
                            <div className="absolute top-6 left-6 text-white/10 font-bold uppercase tracking-widest text-xs pointer-events-none">
                                Stadium Telemetry Grid: 400m radius
                            </div>
                            
                            {/* WAGON WHEEL HEATMAP LAYER (HTML5 Canvas overlay) */}
                            {canvasSubTab === 'wheel' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-60">
                                    <canvas 
                                        ref={heatmapCanvasRef} 
                                        width={400} 
                                        height={400} 
                                        className="rounded-full"
                                    />
                                </div>
                            )}

                            {/* STAGE CONTAINER (react-konva) */}
                            <div className="relative border border-white/5 rounded-full overflow-hidden bg-emerald-900/5 z-20">
                                <Stage width={400} height={400}>
                                    <Layer>
                                        {/* 1. WAGON WHEEL RENDERER */}
                                        {canvasSubTab === 'wheel' && (
                                            <>
                                                {/* Pitch Oval */}
                                                <Circle cx={200} cy={200} radius={185} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} dash={[6, 4]} />
                                                <Circle cx={200} cy={200} radius={120} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                                
                                                {/* Center Pitch Representation */}
                                                <Rect x={192} y={160} width={16} height={80} fill="#f4ecd8" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                                                
                                                {/* Draw Wagon Wheel Vectors */}
                                                {deliveries.map((del, idx) => {
                                                    if (del.runs === 0) return null;
                                                    const angleRad = (del.wagonAngle - 90) * Math.PI / 180;
                                                    const endX = 200 + Math.cos(angleRad) * (del.wagonLength * 1.8);
                                                    const endY = 200 + Math.sin(angleRad) * (del.wagonLength * 1.8);

                                                    const runColor = del.runs === 6 ? '#EF4444' : del.runs === 4 ? '#F59E0B' : '#3B82F6';
                                                    const width = del.runs >= 4 ? 2.5 : 1.2;

                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <Line
                                                                points={[200, 200, endX, endY]}
                                                                stroke={runColor}
                                                                strokeWidth={width}
                                                                opacity={0.8}
                                                            />
                                                            <Circle
                                                                cx={endX}
                                                                cy={endY}
                                                                radius={del.runs >= 4 ? 4.5 : 3.0}
                                                                fill={runColor}
                                                                stroke="#FFFFFF"
                                                                strokeWidth={1}
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* 2. BOWLER PITCH MAP RENDERER */}
                                        {canvasSubTab === 'pitch' && (
                                            <>
                                                {/* Draw Cricket Pitch borders */}
                                                <Rect x={130} y={40} width={140} height={320} fill="#4E7848" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                                                <Rect x={145} y={50} width={110} height={300} fill="#dfcfad" stroke="rgba(255,255,255,0.15)" />
                                                
                                                {/* Batting/Bowling Creases */}
                                                <Line points={[145, 90, 255, 90]} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                                                <Line points={[145, 310, 255, 310]} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />

                                                {/* Wickets */}
                                                <Rect x={194} y={88} width={12} height={3} fill="#B22222" />
                                                <Rect x={194} y={309} width={12} height={3} fill="#B22222" />
                                                
                                                {/* Pitch bounce markings (Yorker, Full, Good Length, Short) */}
                                                {deliveries.map((del, idx) => {
                                                    // Mapping: pitchX(40-60) -> 145-255, pitchY(60-90) -> 90-310
                                                    const mapX = 145 + ((del.pitchX - 40) / 20) * 110;
                                                    const mapY = 90 + ((del.pitchY - 60) / 30) * 220;
                                                    const runColor = del.runs === 0 ? '#3B82F6' : del.runs >= 4 ? '#EF4444' : '#10B981';

                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <Circle
                                                                cx={mapX}
                                                                cy={mapY}
                                                                radius={6.5}
                                                                fill={runColor}
                                                                stroke="#FFFFFF"
                                                                strokeWidth={1.5}
                                                                opacity={0.9}
                                                            />
                                                            <KonvaText 
                                                                x={mapX + 8}
                                                                y={mapY - 5}
                                                                text={`${del.speed}k`}
                                                                fill="#FFFFFF"
                                                                fontSize={9}
                                                                fontStyle="bold"
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* 3. FIELD PLACEMENT DRAGGING LAYER */}
                                        {canvasSubTab === 'field' && (
                                            <>
                                                {/* Inner Ring Restriction Circle */}
                                                <Circle cx={200} cy={200} radius={110} stroke="rgba(255,255,255,0.18)" strokeWidth={1} dash={[5, 5]} />
                                                <Circle cx={200} cy={200} radius={185} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                                                <Rect x={192} y={170} width={16} height={60} fill="#eed9b3" stroke="rgba(255,255,255,0.2)" />
                                                
                                                {/* Draw Draggable Fielder nodes */}
                                                {match.fieldPlacements?.map((fielder, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <Circle
                                                            cx={fielder.x}
                                                            cy={fielder.y}
                                                            radius={8.5}
                                                            fill="#EF4444"
                                                            stroke="#FFFFFF"
                                                            strokeWidth={1.5}
                                                            draggable
                                                            onDragEnd={(e) => handleFielderDrag(e, idx)}
                                                            onClick={() => setSelectedFielder(fielder)}
                                                            onTap={() => setSelectedFielder(fielder)}
                                                            shadowColor="black"
                                                            shadowBlur={3}
                                                            shadowOpacity={0.4}
                                                        />
                                                        <KonvaText
                                                            x={fielder.x - 22}
                                                            y={fielder.y - 18}
                                                            text={fielder.role}
                                                            fill="#FFFFFF"
                                                            fontSize={8}
                                                            fontStyle="bold"
                                                            width={44}
                                                            align="center"
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </>
                                        )}
                                    </Layer>
                                </Stage>
                            </div>

                            {/* Spatial Layer Overlay legends */}
                            <div className="mt-5 w-full flex justify-between px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-white/5 pt-4">
                                {canvasSubTab === 'wheel' && (
                                    <>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Red: Six (6 Runs)</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Orange: Four (4 Runs)</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Blue: Singles/Doubles</span>
                                    </>
                                )}
                                {canvasSubTab === 'pitch' && (
                                    <>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Boundary Bounces</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Dot Balls</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Runs Conceded</span>
                                    </>
                                )}
                                {canvasSubTab === 'field' && (
                                    <span className="text-center w-full text-slate-300 italic">Drag any red dot to modify tactical fielding formations. Tap fielder to display bio.</span>
                                )}
                            </div>

                            {selectedFielder && canvasSubTab === 'field' && (
                                <div className="absolute bottom-5 left-5 right-5 p-3.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl text-left animate-in slide-in-from-bottom duration-300 z-30">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Selected Fielder Profile</p>
                                            <h4 className="text-sm font-black text-white">{selectedFielder.name}</h4>
                                            <span className="text-[10px] text-slate-400">Position: {selectedFielder.role} | Telemetry: X {Math.round(selectedFielder.x)}, Y {Math.round(selectedFielder.y)}</span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedFielder(null)}
                                            className="text-[9px] font-black uppercase text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded-lg"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. XGBOOST & SCIKIT-LEARN PREDICTOR TAB */}
                {activeTab === 'ai' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* AI Prediction Model Controllers */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight mb-1 uppercase">MODEL CALIBRATION</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimize parameters for live neural runs</p>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Score diff slider */}
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

                                {/* Wickets lost slider */}
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

                                {/* Overs remaining slider */}
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

                                {/* Fatigue workload */}
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

                                {/* Heart Rate slider */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span>BIOMETRIC HEART RATE</span>
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
                                className="w-full py-4 text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} /> Run Model Predictors
                            </button>
                        </div>

                        {/* ML Prediction Output Panel */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* Win Probability XGBoost result */}
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">XGBOOST PREDICTIVE CORE</span>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Live Match Outcome Forecast</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                        {aiTasks.win.model}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div className="md:col-span-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EAGLES WIN ODDS</span>
                                        <h2 className="text-5xl font-black text-blue-500 k-mono mt-1">{(aiTasks.win.prob * 100).toFixed(1)}%</h2>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                            The gradient-boosted decision tree maps workload history, current score difference, remaining deliveries, and team momentum indicators.
                                        </p>
                                        <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-2 overflow-hidden">
                                            <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500" style={{ width: `${aiTasks.win.prob * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Injury prediction scikit-learn result */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Injury Risk */}
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">SCIKIT-LEARN CLASSIFIER</span>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Injury Risk Assessment</h4>
                                    
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
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                        RandomForest ensemble processes physical load stats and joint workload values against historic rest-day parameters.
                                    </p>
                                </div>

                                {/* Fatigue Index */}
                                <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">SCIKIT-LEARN RIDGE REGRESSION</span>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">Biological Fatigue Index</h4>
                                    
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <h3 className="text-3xl font-black text-emerald-500 k-mono">{(aiTasks.fatigue.index * 100).toFixed(0)}%</h3>
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase">
                                            {aiTasks.fatigue.classification}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-1">
                                        Ridge Regressor maps fatigue index ratios and heart rate velocities against standard recovery timelines.
                                    </p>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block mt-2">SUGGESTION: {aiTasks.fatigue.suggest}</span>
                                </div>
                            </div>

                            {/* Recharts chart showing historical model trends */}
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Win Probability Trajectory</h3>
                                <div className="h-44 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis dataKey="ball" stroke="#64748b" fontSize={10} fontStyle="bold" />
                                            <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" />
                                            <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} />
                                            <Area type="monotone" dataKey="winProb" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProb)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. COMPUTER VISION TAB */}
                {activeTab === 'cv' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* CV Action Controls */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase">Bowling Action Analyzer</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OpenCV Red-Ball & MediaPipe Pose engine</p>
                            </div>

                            <div className="aspect-video bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-[#1e1e2a] rounded-2xl flex flex-col justify-center items-center p-4 text-center">
                                <Video size={36} className="text-slate-400 animate-pulse mb-3" />
                                <h5 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">RCA_BOWLER_CAM.MP4</h5>
                                <p className="text-[10px] text-slate-400">High speed 120 FPS camera feed ready</p>
                            </div>

                            <button 
                                onClick={startCVAnalysis}
                                disabled={cvProcessing}
                                className={`w-full py-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2
                                    ${cvProcessing 
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'
                                    }`}
                            >
                                <Play size={14} /> {cvProcessing ? "Processing Video Frames..." : "Run Skeletal Analysis"}
                            </button>

                            {cvResults && (
                                <div className="border-t border-slate-100 dark:border-[#1e1e2a] pt-4 space-y-3.5">
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">SKELETAL SENTINEL REPORT</h4>
                                    
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">ICC 15° Chucking Test:</span>
                                        <span className="font-black text-emerald-500 flex items-center gap-1"><CheckCircle2 size={13} /> {cvResults.icc_15_degree_test}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Elbow Extension Delta:</span>
                                        <span className="font-black text-slate-900 dark:text-white k-mono">{cvResults.measured_extension_delta_deg}°</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Max Elbow Flexion:</span>
                                        <span className="font-black text-slate-900 dark:text-white k-mono">{cvResults.max_elbow_flexion_deg}°</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Ball Track Speed:</span>
                                        <span className="font-black text-amber-500 k-mono">{cvResults.average_ball_speed_kmh} KM/H</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Frame Visualizer */}
                        <div className="lg:col-span-8 bg-[#18233C] border border-slate-200 dark:border-[#1e1e2a] rounded-3xl p-6 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden text-center">
                            
                            {cvProcessing && (
                                <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-30 flex flex-col justify-center items-center space-y-3">
                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                        <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Cpu size={24} className="text-blue-500 animate-pulse" />
                                    </div>
                                    <p className="text-xs font-black uppercase text-white tracking-widest animate-pulse">Analyzing skeleton nodes using MediaPipe...</p>
                                </div>
                            )}

                            {cvResults ? (
                                <>
                                    <div className="relative w-full max-w-[420px] aspect-square bg-[#0f172a] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
                                        
                                        {/* Mock video background representing bowler */}
                                        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center p-8">
                                            <Eye size={120} className="text-slate-500 animate-pulse" />
                                        </div>

                                        {/* Dynamic MediaPipe skeletal drawing based on video playback frames */}
                                        <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-500 stroke-[1.2] fill-none">
                                            {/* Spine & Shoulders */}
                                            <line x1="50" y1="25" x2="50" y2="55" />
                                            <line x1="38" y1="30" x2="62" y2="30" />
                                            
                                            {/* Head Circle */}
                                            <circle cx="50" cy="18" r="6" fill="#1e293b" stroke="#3b82f6" strokeWidth={1} />

                                            {/* LEFT ARM (Static / Gather) */}
                                            <line x1="38" y1="30" x2="28" y2="42" />
                                            <line x1="28" y1="42" x2="22" y2="50" />
                                            
                                            {/* RIGHT ARM (Dynamic Bowler Bowing Action skeleton based on current video frame) */}
                                            {/* Shoulder is (62, 30). Elbow swings, Wrist swings */}
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
                                                        
                                                        {/* Joints coordinates circles */}
                                                        <circle cx="62" cy="30" r="2" fill="#ef4444" />
                                                        <circle cx={elbX} cy={elbY} r="2" fill="#eab308" />
                                                        <circle cx={wrstX} cy={wrstY} r="2" fill="#3b82f6" />

                                                        {/* Ball Tracking Point (OpenCV red ball) */}
                                                        <circle cx={wrstX + 3} cy={wrstY - 3} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth={0.5} className="animate-pulse" />
                                                    </>
                                                );
                                            })()}

                                            {/* Hips & Legs */}
                                            <line x1="42" y1="55" x2="58" y2="55" />
                                            <line x1="42" y1="55" x2="40" y2="75" />
                                            <line x1="40" y1="75" x2="38" y2="92" />
                                            <line x1="58" y1="55" x2="60" y2="75" />
                                            <line x1="60" y1="75" x2="62" y2="92" />
                                        </svg>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between w-full max-w-[420px] text-xs font-bold text-slate-300">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> MediaPipe arm vector</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Red Ball path tracker</span>
                                        <span className="k-mono text-[10px] text-slate-400">Frame {cvVideoFrame}/15</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 p-8 space-y-4">
                                    <Eye size={48} className="mx-auto opacity-30 text-white" />
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">No active overlay session</h4>
                                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                            Upload high speed footage or select rca_bowler_cam.mp4, and trigger the MediaPipe engine to overlay pose calculations.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    );
};

export default CricketLab;
