import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronRight, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const DEFAULT_SQUAD_FALLBACK = [
  { _id: 'ind-1', playerId: '101', name: 'Virat Kohli', role: 'Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 98 },
  { _id: 'ind-2', playerId: '102', name: 'Rohit Sharma', role: 'Captain / Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 95 },
  { _id: 'ind-3', playerId: '103', name: 'Jasprit Bumrah', role: 'Fast Bowler', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 99 },
  { _id: 'ind-4', playerId: '104', name: 'Hardik Pandya', role: 'All Rounder', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 94 },
  { _id: 'ind-5', playerId: '105', name: 'Suryakumar Yadav', role: 'T20 Captain / Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 96 },
  { _id: 'ind-6', playerId: '106', name: 'Rishabh Pant', role: 'Wicket-Keeper Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 92 },
  { _id: 'ind-7', playerId: '107', name: 'Shubman Gill', role: 'Opener / Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 91 },
  { _id: 'ind-8', playerId: '108', name: 'Yashasvi Jaiswal', role: 'Opener / Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 93 },
  { _id: 'ind-9', playerId: '109', name: 'Ravindra Jadeja', role: 'All Rounder', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 95 },
  { _id: 'ind-10', playerId: '110', name: 'Axar Patel', role: 'All Rounder', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 94 },
  { _id: 'ind-11', playerId: '111', name: 'Kuldeep Yadav', role: 'Spinner / Bowler', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 92 },
  { _id: 'ind-12', playerId: '112', name: 'Mohammed Siraj', role: 'Fast Bowler', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 90 },
  { _id: 'ind-13', playerId: '113', name: 'Arshdeep Singh', role: 'Fast Bowler', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 91 },
  { _id: 'ind-14', playerId: '114', name: 'KL Rahul', role: 'Wicket-Keeper Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 89 },
  { _id: 'ind-15', playerId: '115', name: 'Rinku Singh', role: 'Finisher / Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 92 },
  { _id: 'ind-16', playerId: '116', name: 'Sanju Samson', role: 'Wicket-Keeper Batter', teamName: 'India', sport: 'Cricket', country: 'India', status: 'Optimal', readinessScore: 88 }
];

const Players = () => {
  const { selectedTeamId, selectedLeagueId } = useSession();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All');

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || '/api';
        
        let queryStr = '';
        if (selectedTeamId) queryStr += `?teamId=${selectedTeamId}`;
        if (selectedLeagueId) queryStr += queryStr ? `&leagueId=${selectedLeagueId}` : `?leagueId=${selectedLeagueId}`;

        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/players${queryStr}`, { headers });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setPlayers(data);
            } else {
              setPlayers(DEFAULT_SQUAD_FALLBACK);
            }
        } else {
            setPlayers(DEFAULT_SQUAD_FALLBACK);
        }
      } catch (err) {
        console.error("Failed to load roster:", err);
        setPlayers(DEFAULT_SQUAD_FALLBACK);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [selectedTeamId, selectedLeagueId]);

  const filteredPlayers = players.filter(p => {
    const matchesSearch = 
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.role && p.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sport && p.sport.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.teamName && p.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTeam = selectedTeamFilter === 'All' || 
      (p.teamName && p.teamName.toLowerCase().includes(selectedTeamFilter.toLowerCase())) ||
      (p.country && p.country.toLowerCase().includes(selectedTeamFilter.toLowerCase()));

    return matchesSearch && matchesTeam;
  });

  const statusConfig = {
    Optimal:    { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    Recovering: { dot: 'bg-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    Fatigued:   { dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    Critical:   { dot: 'bg-red-500',     badge: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1e1e2a]">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> Official Squad Roster
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Showing all registered squad members and international athletes ({filteredPlayers.length} Players).</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Team Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-[#13131a] p-1 rounded-xl border border-slate-200 dark:border-[#1e1e2a]">
            {['All', 'India', 'Australia', 'England'].map(team => (
              <button
                key={team}
                onClick={() => setSelectedTeamFilter(team)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${selectedTeamFilter === team ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {team}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search athletes or roles..."
              className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full sm:w-60 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Player Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map(player => {
            const status = player.status || 'Optimal';
            const sc = statusConfig[status] || statusConfig.Optimal;
            const initials = player.name ? player.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
            const performance = player.readinessScore || player.metrics?.readinessScore || 92;
            const barColor = performance > 90 ? 'bg-emerald-500' : performance > 80 ? 'bg-blue-500' : 'bg-amber-400';
            const playerId = player._id || player.id || player.playerId;

            return (
              <Link
                key={playerId}
                to={`/player/${playerId}`}
                className="group bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 hover:border-blue-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 relative overflow-hidden block"
              >
                {/* Accent top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-500 transition-colors">
                      {player.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                      {player.teamName || 'India'} · {player.role || 'Athlete'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-slate-100 dark:border-[#1e1e2a] pt-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Style</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{player.battingStyle || 'Right Hand'}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Readiness Score</span>
                    <span className="font-bold text-emerald-500">{performance}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0a0a0c] rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${performance}%` }}></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${sc.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                    {status}
                  </span>
                  <span className="text-[10px] font-black text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Profile <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-12 text-center">
          <Activity size={24} className="text-slate-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No athletes found matching your search</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search for another player name.</p>
        </div>
      )}
    </div>
  );
};

export default Players;
