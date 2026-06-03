import React from 'react';

/**
 * PerformanceSignature - Customizable Radar Chart (SVG)
 * Shows a player's strengths across multiple sport-specific dimensions.
 */
const PerformanceSignature = ({ 
    metrics = { speed: 85, power: 72, agility: 91, control: 68, intelligence: 94, endurance: 80 }, 
    color = '#3B82F6', 
    size = 200 
}) => {
    const labels = Object.keys(metrics);
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / labels.length;

    // Generate points for the shape
    const points = labels.map((key, i) => {
        const val = metrics[key] / 100;
        const x = center + Math.cos(i * angleStep - Math.PI / 2) * radius * val;
        const y = center + Math.sin(i * angleStep - Math.PI / 2) * radius * val;
        return `${x},${y}`;
    }).join(' ');

    // Generate web lines
    const webs = [0.25, 0.5, 0.75, 1].map((lvl, idx) => {
        return labels.map((_, i) => {
            const x = center + Math.cos(i * angleStep - Math.PI / 2) * radius * lvl;
            const y = center + Math.sin(i * angleStep - Math.PI / 2) * radius * lvl;
            return `${x},${y}`;
        }).join(' ');
    });

    return (
        <div className="relative flex flex-col items-center group">
            <svg width={size} height={size} className="overflow-visible drop-shadow-xl translate-y-2">
                {/* Webs */}
                {webs.map((w, i) => (
                    <polygon key={i} points={w} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                ))}
                
                {/* Axis lines */}
                {labels.map((_, i) => {
                    const x = center + Math.cos(i * angleStep - Math.PI / 2) * radius;
                    const y = center + Math.sin(i * angleStep - Math.PI / 2) * radius;
                    return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" />;
                })}

                {/* The Signature Shape */}
                <polygon 
                    points={points} 
                    fill={`${color}30`} 
                    stroke={color} 
                    strokeWidth={3} 
                    strokeLinejoin="round" 
                    className="group-hover:fill-opacity-50 transition-all duration-700 ease-in-out"
                />
                
                {/* Points */}
                {points.split(' ').map((p, i) => {
                    const [x, y] = p.split(',');
                    return <circle key={i} cx={x} cy={y} r={3} fill={color} className="shadow-lg shadow-white/50" />;
                })}

                {/* Labels */}
                {labels.map((lbl, i) => {
                    const x = center + Math.cos(i * angleStep - Math.PI / 2) * (radius + 20);
                    const y = center + Math.sin(i * angleStep - Math.PI / 2) * (radius + 20);
                    return (
                        <text 
                            key={i} 
                            x={x} 
                            y={y} 
                            textAnchor="middle" 
                            className="fill-slate-500 font-bold uppercase text-[8px] tracking-[0.2em]"
                            style={{ transform: 'translateY(4px)' }}
                        >
                            {lbl}
                        </text>
                    );
                })}
            </svg>
            
            <div className="mt-8 text-center invisible group-hover:visible transition-all animate-in fade-in slide-in-from-bottom-2">
                <p className="text-[10px] font-black italic uppercase tracking-widest text-white/40">KINETIX SIGNATURE SCORE</p>
                <p className="text-2xl font-black text-white italic tracking-tighter">
                    {Math.round(Object.values(metrics).reduce((a,b)=>a+b,0) / labels.length)}
                </p>
            </div>
        </div>
    );
};

export default PerformanceSignature;
