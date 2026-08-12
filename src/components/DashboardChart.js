import React, { useMemo, useState } from 'react';

const DashboardChart = ({ data = [], labels = [], height = 300, color = '#3b82f6', title = 'Real Match Impact Score' }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const points = useMemo(() => {
        if (!data || data.length < 2) return "";

        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const range = maxVal - minVal || 1;

        const width = 1000;
        const step = width / (data.length - 1);

        return data.map((val, i) => {
            const x = i * step;
            const y = height - ((val - minVal) / range) * (height * 0.75) - (height * 0.12);
            return `${x},${y}`;
        }).join(" ");
    }, [data, height]);

    const areaPoints = useMemo(() => {
        if (!points) return "";
        const width = 1000;
        return `0,${height} ${points} ${width},${height}`;
    }, [points, height]);

    const pointCoords = useMemo(() => {
        if (!points) return [];
        return points.split(" ").map((p, i) => {
            const [x, y] = p.split(",");
            return { x: parseFloat(x), y: parseFloat(y), value: data[i], label: labels[i] || `Match ${i + 1}` };
        });
    }, [points, data, labels]);

    return (
        <div className="w-full h-full relative group">
            <svg viewBox={`0 0 1000 ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0.1, 0.35, 0.6, 0.85].map((p, i) => (
                    <line
                        key={i}
                        x1="0" y1={height * p}
                        x2="1000" y2={height * p}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Area under line */}
                {areaPoints && (
                    <polyline
                        points={areaPoints}
                        fill="url(#chartGradient)"
                    />
                )}

                {/* Main Line */}
                {points && (
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    />
                )}

                {/* Data Points with Hover Interaction */}
                {pointCoords.map((pt, i) => (
                    <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPoint === pt ? "7" : "5"}
                            fill="#0f172a"
                            stroke={color}
                            strokeWidth="2.5"
                            className="transition-all duration-200 shadow-md"
                        />
                        {/* Glow on hover */}
                        {hoveredPoint === pt && (
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="12"
                                fill={color}
                                fillOpacity="0.25"
                                className="animate-ping"
                            />
                        )}
                    </g>
                ))}
            </svg>

            {/* Dynamic Legend / Title */}
            <div className="absolute top-2 right-4 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</span>
            </div>

            {/* Hover Tooltip */}
            {hoveredPoint && (
                <div
                    className="absolute bg-slate-900/95 border border-blue-500/40 text-white px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none z-20 backdrop-blur-md transition-all"
                    style={{
                        left: `${(hoveredPoint.x / 1000) * 85 + 5}%`,
                        top: `${(hoveredPoint.y / height) * 60}%`
                    }}
                >
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">{hoveredPoint.label}</p>
                    <p className="text-sm font-black text-white">{hoveredPoint.value} <span className="text-[10px] font-normal text-slate-400">Score</span></p>
                </div>
            )}
        </div>
    );
};

export default DashboardChart;
