import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Trophy, Clock, Filter } from 'lucide-react';
import apiService from '../utils/apiService';

const PublicCalendarView = () => {
    const [leagues, setLeagues] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const res = await apiService.getPublicLeagues();
                setLeagues(res.data || []);
            } catch (err) {
                console.error("Calendar fetch error:", err);
            }
        };
        fetchLeagues();
    }, []);

    const defaultFixtures = [
        { id: 1, series: "ICC Women's T20 World Cup 2026", date: "2026-09-05", venue: "Lord's, London", type: "International T20I", status: "Upcoming" },
        { id: 2, series: "India tour of England 2026", date: "2026-09-12", venue: "The Oval, London", type: "Test Match", status: "Upcoming" },
        { id: 3, series: "England tour of Australia 2026", date: "2026-10-01", venue: "MCG, Melbourne", type: "ODI Series", status: "Scheduled" },
        { id: 4, series: "ICC Cricket World Cup League 2026", date: "2026-10-15", venue: "Kensington Oval, Barbados", type: "International ODI", status: "Scheduled" },
        { id: 5, series: "West Indies tour of India 2026", date: "2026-11-04", venue: "Eden Gardens, Kolkata", type: "T20I Series", status: "Scheduled" }
    ];

    return (
        <div className="space-y-8 max-w-screen-2xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white uppercase mb-2">
                        TOURNAMENT & MATCH FIXTURE CALENDAR
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        UPCOMING INTERNATIONAL TOURNAMENTS, SERIES & VENUES
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {['All', 'International', 'League', 'Upcoming'].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                                activeFilter === f 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-white dark:bg-[#13131a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e1e2a]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fixture List */}
            <div className="space-y-4">
                {defaultFixtures.map(f => (
                    <div 
                        key={f.id}
                        className="bg-white dark:bg-[#13131a] p-6 rounded-[24px] border border-slate-200 dark:border-[#1e1e2a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight mb-1">{f.series}</h3>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-emerald-500" /> {f.venue}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} className="text-blue-500" /> {f.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                            <div className="text-right">
                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase">{f.date}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{f.status}</div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase rounded-full">
                                {f.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PublicCalendarView;
