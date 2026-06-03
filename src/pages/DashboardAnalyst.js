import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Stage, Layer, Circle, Line, Rect, Text as KonvaText } from 'react-konva';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import { 
    Database, TrendingUp, Share2, Activity, Cpu, Zap, 
    ArrowUpRight, ArrowDownRight, Video, Play, Pause, RefreshCw, 
    Eye, ShieldAlert, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardChart from '../components/DashboardChart';

const DashboardAnalyst = () => {
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [chartData, setChartData] = useState([65, 78, 72, 85, 82, 90, 88, 95]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('spatial'); // spatial, cv, socket, diagnostics

    // Live Telemetry states
    const [match, setMatch] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [canvasSubTab, setCanvasSubTab] = useState('wheel'); // wheel, pitch, field
    const [selectedFielder, setSelectedFielder] = useState(null);

    // CV states
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

    // Initialize sockets & load initial telemetry
    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.REACT_APP_API_URL}/analytics/performance?limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPlayers(data.data || []);
                    if (data.data && data.data.length > 0) {
                        const scores = data.data.map(p => p.ai_targets?.win_probability * 100 || 50).reverse();
                        if (scores.length > 2) setChartData(scores);
                    }
                }
            } catch (err) {
                console.error(err);
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
                                setLiveLogs(prev => [...prev, `Websocket: Joined Room [${liveMatchId}] - Live Telemetry Syncing...`]);
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

        fetchInsights();
        fetchMatchTelemetry();

        // Connect to express socket backend
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

        socketRef.current.on('connect', () => {
            setSocketConnected(true);
            setLiveLogs(prev => [...prev, "Websocket: Connected to Live Telemetry Stream."]);
            // Room join moved to fetchMatchTelemetry dynamically
        });

        socketRef.current.on('disconnect', () => {
            setSocketConnected(false);
            setLiveLogs(prev => [...prev, "Websocket: Connection closed."]);
        });

        socketRef.current.on('deliveryUpdate', (data) => {
            setLiveLogs(prev => [
                ...prev,
                `Live Delivery Event: Ball ${data.newDelivery.ball} -> batsman ${data.newDelivery.batsman} scores +${data.newDelivery.runs} Runs (Wagon Angle: ${data.newDelivery.wagonAngle}°)`
            ]);
            setDeliveries(prev => [...prev, data.newDelivery]);
            setMatch(prev => ({
                ...prev,
                stats: data.stats
            }));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveMatch', 'c1');
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Redraw heatmap on data update
    useEffect(() => {
        if (deliveries.length > 0 && activeTab === 'spatial' && canvasSubTab === 'wheel') {
            drawScoringHeatmap();
        }
    }, [deliveries, activeTab, canvasSubTab]);

    // Radial Gradient Scoring Heatmap (HTML5 Canvas)
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

            const grad = ctx.createRadialGradient(x, y, 2, x, y, 35);
            const alpha = del.runs === 6 ? 0.65 : del.runs === 4 ? 0.5 : 0.35;
            const heatColor = del.runs === 6 ? '239, 68, 68' : del.runs === 4 ? '245, 158, 11' : '59, 130, 246';

            grad.addColorStop(0, `rgba(${heatColor}, ${alpha})`);
            grad.addColorStop(1, `rgba(${heatColor}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    // Simulate standard delivery
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

    // MediaPipe Bowling Skeletal engine simulator
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
            <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Hydrating Analyst Intelligence Deck...</span>
        </div>
    );

    const trendData = deliveries.map((d, i) => ({
        ball: i + 1,
        winProb: Math.round((0.55 + Math.sin(i / 4) * 0.15) * 100)
    }));

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
                                <span className="text-blue-500 font-medium">Analytics Deck</span>
                            </h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${socketConnected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                <span className="live-dot" style={{ background: socketConnected ? '#10b981' : '#ef4444' }}></span>
                                {socketConnected ? 'Websocket Streaming' : 'Disconnected'}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Cricsheet Datasets • MediaPipe Pose • OpenCV Tracking
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={simulateNextBall}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Zap size={13} className="animate-pulse" /> Simulate Delivery
                    </button>
                    <Link to="/cricket-lab" className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] text-slate-700 dark:text-slate-300 rounded-lg hover:border-slate-300 dark:hover:border-[#2a2a3a] transition-all">
                        <Cpu size={13} /> Full Lab Suite
                    </Link>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MetricBox
                    title="TELEMETRY STREAM"
                    value="1.2M+"
                    sub="Socket Events Operational"
                    icon={Database}
                    trend="Connected"
                    isUp={true}
                    accentColor="blue"
                />
                <MetricBox
                    title="PREDICTION CORE"
                    value="XGBoost"
                    sub="Outcome Certainty Mode"
                    icon={Cpu}
                    trend="Active"
                    isUp={true}
                    accentColor="emerald"
                />
                <MetricBox
                    title="SQUAD STATUS"
                    value="OPTIMAL"
                    sub="Biological Fatigue Low"
                    icon={Activity}
                    trend="Ensemble validated"
                    isUp={false}
                    accentColor="emerald"
                />
            </div>

            {/* Tab Selectors */}
            <div className="flex border-b border-slate-200 dark:border-[#1e1e2a] pb-px overflow-x-auto">
                {[
                    { id: 'spatial', label: 'Spatial Shot & Pitch Analytics', icon: <Eye size={13} /> },
                    { id: 'cv', label: 'Computer Vision Pose Lab', icon: <Video size={13} /> },
                    { id: 'socket', label: 'WebSocket Event Logger', icon: <Activity size={13} /> },
                    { id: 'diagnostics', label: 'System Diagnostics & Trends', icon: <TrendingUp size={13} /> }
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

                {/* 1. SPATIAL BALL & SHOT ANALYTICS TAB */}
                {activeTab === 'spatial' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Control Box */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Overlay Layer</h3>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'wheel', label: 'Wagon Wheel & Heatmap', desc: 'Runs trajectories & density' },
                                        { id: 'pitch', label: 'Bowler Pitch bounce map', desc: 'Lengths & release coordinates' },
                                        { id: 'field', label: 'Fielding Placements', desc: 'Interactive tactical spacing' }
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
                                            <p className="text-[9px] text-slate-400 font-medium">{sub.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Feed Telemetry</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[9px] text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-black/40 rounded-xl p-3 border border-slate-100 dark:border-[#1e1e2a]/60">
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
                        <div className="lg:col-span-9 bg-[#0b151e] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
                            
                            <div className="absolute top-4 left-4 text-white/10 font-bold uppercase tracking-widest text-[9px]">
                                Interactive Telemetry Stadium Map
                            </div>

                            {/* HTML5 Canvas overlay for scoring heatmap */}
                            {canvasSubTab === 'wheel' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-60">
                                    <canvas 
                                        ref={heatmapCanvasRef} 
                                        width={360} 
                                        height={360} 
                                        className="rounded-full"
                                    />
                                </div>
                            )}

                            {/* react-konva Interactive layer */}
                            <div className="relative border border-white/5 rounded-full overflow-hidden bg-emerald-950/10 z-20">
                                <Stage width={360} height={360}>
                                    <Layer>
                                        
                                        {/* WAGON WHEEL GRAPH */}
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
                                                    const width = del.runs >= 4 ? 2.2 : 1.1;

                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <Line
                                                                points={[180, 180, endX, endY]}
                                                                stroke={runColor}
                                                                strokeWidth={width}
                                                                opacity={0.8}
                                                            />
                                                            <Circle
                                                                cx={endX}
                                                                cy={endY}
                                                                radius={del.runs >= 4 ? 4 : 2.5}
                                                                fill={runColor}
                                                                stroke="#FFFFFF"
                                                                strokeWidth={1}
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* BOWLER PITCH MAP */}
                                        {canvasSubTab === 'pitch' && (
                                            <>
                                                <Rect x={110} y={30} width={140} height={300} fill="#4E7848" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                                                <Rect x={125} y={40} width={110} height={280} fill="#dfcfad" stroke="rgba(255,255,255,0.15)" />
                                                <Line points={[125, 80, 235, 80]} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                                                <Line points={[125, 280, 235, 280]} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                                                
                                                <Rect x={174} y={78} width={12} height={3} fill="#B22222" />
                                                <Rect x={174} y={279} width={12} height={3} fill="#B22222" />

                                                {deliveries.map((del, idx) => {
                                                    const mapX = 125 + ((del.pitchX - 40) / 20) * 110;
                                                    const mapY = 80 + ((del.pitchY - 60) / 30) * 200;
                                                    const runColor = del.runs === 0 ? '#3B82F6' : del.runs >= 4 ? '#EF4444' : '#10B981';

                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <Circle
                                                                cx={mapX}
                                                                cy={mapY}
                                                                radius={6}
                                                                fill={runColor}
                                                                stroke="#FFFFFF"
                                                                strokeWidth={1.2}
                                                                opacity={0.9}
                                                            />
                                                            <KonvaText 
                                                                x={mapX + 7}
                                                                y={mapY - 4}
                                                                text={`${del.speed}k`}
                                                                fill="#FFFFFF"
                                                                fontSize={8}
                                                                fontStyle="bold"
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* FIELD PLACEMENTS */}
                                        {canvasSubTab === 'field' && (
                                            <>
                                                <Circle cx={180} cy={180} radius={95} stroke="rgba(255,255,255,0.18)" strokeWidth={1} dash={[5, 5]} />
                                                <Circle cx={180} cy={180} radius={165} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                                                <Rect x={173} y={150} width={14} height={60} fill="#eed9b3" stroke="rgba(255,255,255,0.2)" />
                                                
                                                {match.fieldPlacements?.map((fielder, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <Circle
                                                            cx={fielder.x * 0.9}
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
                                            </>
                                        )}

                                    </Layer>
                                </Stage>
                            </div>

                            {/* Legends */}
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
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Dot Balls</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Runs Conceded</span>
                                    </>
                                )}
                                {canvasSubTab === 'field' && (
                                    <span className="text-center w-full text-slate-300 italic">Analyst spacing interface: Drag nodes to test field spacing geometries.</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. COMPUTER VISION SKELETAL POSE TAB */}
                {activeTab === 'cv' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* CV Sentinel Controls */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase">Bowling Action CV Lab</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MediaPipe skeletal tracking</p>
                            </div>

                            <div className="aspect-video bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-[#1e1e2a] rounded-xl flex flex-col justify-center items-center p-4 text-center">
                                <Video size={32} className="text-slate-400 animate-pulse mb-2" />
                                <h5 className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">RCA_BOWLER_CAM.MP4</h5>
                                <p className="text-[9px] text-slate-400">High speed 120 FPS cam synced</p>
                            </div>

                            <button 
                                onClick={startCVAnalysis}
                                disabled={cvProcessing}
                                className={`w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center justify-center gap-2
                                    ${cvProcessing 
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'
                                    }`}
                            >
                                <Play size={13} /> {cvProcessing ? "Analyzing Frames..." : "Run Skeletal Analysis"}
                            </button>

                            {cvResults && (
                                <div className="border-t border-slate-100 dark:border-[#1e1e2a] pt-4 space-y-2.5">
                                    <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest">SKELETAL TEST RESULTS</h4>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">ICC 15° Chucking Test:</span>
                                        <span className="font-black text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> {cvResults.icc_15_degree_test}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Measured Extension:</span>
                                        <span className="font-black text-slate-900 dark:text-white k-mono">{cvResults.measured_extension_delta_deg}°</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Elbow Flexion Max:</span>
                                        <span className="font-black text-slate-900 dark:text-white k-mono">{cvResults.max_elbow_flexion_deg}°</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Tracked Ball Speed:</span>
                                        <span className="font-black text-amber-500 k-mono">{cvResults.average_ball_speed_kmh} KM/H</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SVGs Dynamic Skeletal Render */}
                        <div className="lg:col-span-8 bg-[#0e1624] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden text-center">
                            
                            {cvProcessing && (
                                <div className="absolute inset-0 bg-[#070c14]/85 backdrop-blur-sm z-30 flex flex-col justify-center items-center space-y-3">
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Cpu size={20} className="text-blue-500 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-white tracking-widest animate-pulse">Running joint tracking regression via MediaPipe...</p>
                                </div>
                            )}

                            {cvResults ? (
                                <>
                                    <div className="relative w-full max-w-[340px] aspect-square bg-[#070b12] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-4">
                                        
                                        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                                            <Eye size={100} className="text-slate-500 animate-pulse" />
                                        </div>

                                        <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-500 stroke-[1.2] fill-none">
                                            <line x1="50" y1="25" x2="50" y2="55" />
                                            <line x1="38" y1="30" x2="62" y2="30" />
                                            <circle cx="50" cy="18" r="6" fill="#1e293b" stroke="#3b82f6" strokeWidth={1} />
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
                                                        <circle cx={wrstX + 3} cy={wrstY - 3} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth={0.5} />
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
                                    <div className="mt-4 flex items-center justify-between w-full max-w-[340px] text-[10px] font-bold text-slate-300">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Pose skeleton</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Ball tracker</span>
                                        <span className="k-mono text-[9px] text-slate-400">Frame {cvVideoFrame}/15</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 p-8 space-y-4">
                                    <Eye size={42} className="mx-auto opacity-20 text-white" />
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Calibration Session Idle</h4>
                                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                                            Select rca_bowler_cam.mp4 camera and trigger MediaPipe to render joints and ICC legal test logs.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. WEBSOCKET EVENT LOGGER TAB */}
                {activeTab === 'socket' && (
                    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">WebSocket Telemetry Monitor</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time telemetry event bus stream</p>
                            </div>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${socketConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {socketConnected ? "Socket.IO Sync Connected" : "Socket.IO Offline"}
                            </span>
                        </div>

                        <div className="space-y-2 max-h-90 overflow-y-auto font-mono text-[11px] bg-slate-50 dark:bg-[#07070a] border border-slate-100 dark:border-[#1e1e2a] rounded-xl p-5 text-left">
                            {liveLogs.map((log, i) => (
                                <div key={i} className="flex gap-4 border-b border-slate-100 dark:border-white/5 pb-2 last:border-0">
                                    <span className="text-blue-500 font-bold flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                    <span className={log.includes("Delivery") || log.includes("Live") ? 'text-amber-500 font-bold' : 'text-slate-600 dark:text-slate-300'}>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. DIAGNOSTICS & TRENDS TAB */}
                {activeTab === 'diagnostics' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight font-sans">Trajectory Analysis</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-sans">Predictive win rates over delivery steps</p>
                                </div>
                                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    EAGLES OUTCOME TREND
                                </div>
                            </div>
                            <div className="h-[240px] w-full bg-slate-50 dark:bg-[#0a0a0c] rounded-xl border border-slate-100 dark:border-[#1e1e2a] p-4">
                                <DashboardChart data={chartData} height={200} color="#3b82f6" />
                            </div>
                        </div>

                        {/* Biometric sentinels */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
                                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Active Athlete Insights</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">High impact squad logs</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
                                    {players.slice(0, 3).map((perf, i) => (
                                        <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors">
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">{perf.playerId?.name || "Squad Unit"}</span>
                                            <span className="text-xs font-black text-emerald-500 k-mono">{(perf.ai_targets?.win_probability * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden p-4 space-y-2">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sentinel Warnings</h3>
                                <DiagnosticItem level="CRITICAL" msg="Unit #12 joint fatigue index elevated. 82% workload threshold crossed." accentColor="red" time="3M AGO" />
                                <DiagnosticItem level="INFO" msg="Websocket payload broadcast completed for match c1." accentColor="blue" time="15M AGO" />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

/* Sub-components */
const MetricBox = ({ title, value, sub, icon: Icon, trend, isUp, accentColor }) => {
    const colors = {
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: 'bg-blue-500' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' },
    };
    const c = colors[accentColor] || colors.blue;

    return (
        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${c.bar} rounded-l-2xl`}></div>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{title}</p>
                    <h3 className="text-2.5xl font-black text-slate-900 dark:text-white tracking-tight k-mono leading-none mb-1">{value}</h3>
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isUp ? 'text-emerald-500' : 'text-slate-400'} mb-2`}>
                        {trend}
                    </div>
                    <span className={`text-[9px] font-bold ${c.text} uppercase tracking-widest`}>{sub}</span>
                </div>
                <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <Icon size={18} className={c.text} />
                </div>
            </div>
        </div>
    );
};

const DiagnosticItem = ({ level, msg, accentColor, time }) => {
    const colors = {
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    const barColors = { red: 'bg-red-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' };

    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0c] border border-slate-100 dark:border-[#1e1e2a] relative overflow-hidden hover:bg-slate-100 dark:hover:bg-[#13131a] transition-colors">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${barColors[accentColor] || 'bg-slate-400'}`}></div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded border ${colors[accentColor] || ''}`}>
                        {level}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 k-mono">{time}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-normal">{msg}</p>
            </div>
        </div>
    );
};

export default DashboardAnalyst;
