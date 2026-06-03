import React, { useMemo } from 'react';

const DashboardChart = ({ data = [], height = 300, color = '#3b82f6' }) => {
    const points = useMemo(() => {
        if (!data || data.length < 2) return "";

        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const range = maxVal - minVal || 1;

        const width = 1000;
        const step = width / (data.length - 1);

        return data.map((val, i) => {
            const x = i * step;
            const y = height - ((val - minVal) / range) * (height * 0.8) - (height * 0.1);
            return `${x},${y}`;
        }).join(" ");
    }, [data, height]);

    const areaPoints = useMemo(() => {
        if (!points) return "";
        const width = 1000;
        return `0,${height} ${points} ${width},${height}`;
    }, [points, height]);

    return (
        <div className="w-full h-full relative group">
            <svg viewBox={`0 0 1000 ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <line
                        key={i}
                        x1="0" y1={height * p}
                        x2="1000" y2={height * p}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}

                {/* Area under line */}
                <polyline
                    points={areaPoints}
                    fill="url(#chartGradient)"
                />

                {/* Main Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />

                {/* Data Points */}
                {points.split(" ").map((p, i) => {
                    const [x, y] = p.split(",");
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#1e293b"
                            stroke={color}
                            strokeWidth="2"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                    );
                })}
            </svg>

            {/* Legend / Info */}
            <div className="absolute top-4 right-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Sync Rate</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardChart;
