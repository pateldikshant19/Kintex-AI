import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const Players = () => {
  const { selectedTeamId, selectedLeagueId } = useSession();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        let queryStr = '';
        if (selectedTeamId) queryStr += `?teamId=${selectedTeamId}`;
        if (selectedLeagueId) queryStr += queryStr ? `&leagueId=${selectedLeagueId}` : `?leagueId=${selectedLeagueId}`;

        const res = await fetch(`${process.env.REACT_APP_API_URL}/players${queryStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setPlayers(data);
        }
      } catch (err) {
        console.error("Failed to load roster:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, []);

  const filteredPlayers = players.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.sport && p.sport.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.teamName && p.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <Users size={18} className="text-blue-500" /> Squad Roster
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage and monitor all registered elite athletes.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search athletes or sports..."
            className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-xl py-2.5 pl-10 pr-5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full md:w-72 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Player Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map(player => {
            const status = player.status || 'Optimal';
            const sc = statusConfig[status] || statusConfig.Optimal;
            const initials = player.name ? player.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
            const performance = player.metrics?.readinessScore || 85;
            const barColor = performance > 90 ? 'bg-emerald-500' : performance > 80 ? 'bg-blue-500' : 'bg-amber-400';
            const playerId = player._id || player.id;

            return (
              <Link
                key={playerId}
                to={`/player/${playerId}`}
                className="group bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 hover:border-slate-300 dark:hover:border-[#2a2a3a] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 relative overflow-hidden block"
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${barColor} rounded-l-2xl`}></div>

                <div className="flex items-start gap-4 mb-5">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-sm text-blue-500 flex-shrink-0 overflow-hidden">
                    {player.playerImg ? <img src={player.playerImg} alt={player.name} className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors tracking-tight truncate">{player.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{player.role || player.teamName}</p>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">{player.sport || 'Cricket'}</span>
                </div>

                {/* Readiness */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Readiness Score</span>
                    <span className={`text-[10px] font-black ${performance > 90 ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {performance}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${performance}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status + CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${sc.badge}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase tracking-widest group-hover:gap-2 transition-all">
                    View Profile <ChevronRight size={11} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#13131a] rounded-2xl border border-dashed border-slate-200 dark:border-[#1e1e2a]">
          <Activity size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-400">No athletes found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Players;
