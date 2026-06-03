import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Kinetix Pulse Strip - Differentiating Momentum Visualization
 * A gradient horizontal bar that shows match momentum across the full duration.
 */
const PulseStrip = ({ momentum = 0.5 }) => {
    // Current momentum visualized as a "breathing" indicator
    const percentage = momentum * 100;
    
    return (
        <div className="w-full h-8 relative bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-md group border border-slate-200 dark:border-white/5">
            <div 
                className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-10 bg-gradient-to-r from-slate-400 to-zinc-600"
            ></div>
            
            {/* Momentum Indicator Block */}
            <div 
                className="absolute top-0 bottom-0 transition-all duration-700 ease-out flex items-center justify-center bg-slate-900 dark:bg-white"
                style={{
                    left: `${percentage}%`,
                    width: '32px',
                    marginLeft: '-16px'
                }}
            >
                <Activity size={14} className="text-white dark:text-black animate-pulse" />
            </div>
            
            <div className="absolute top-0 left-4 text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest leading-8">SIDE A</div>
            <div className="absolute top-0 right-4 text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest leading-8">SIDE B</div>
        </div>
    );
};

export default PulseStrip;
