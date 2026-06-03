import React, { useState, useEffect } from 'react';
import { Users, Trophy, Target, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        const res = await fetch(`${API_URL}/dashboard`, { headers });
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  const activePlayers = data?.activePlayers || 0;
  const totalGoals = data?.totalGoals || 0;

  const stats = [
    { icon: Users, label: 'Active Players', value: activePlayers, change: '+2', accentColor: 'blue' },
    { icon: Trophy, label: 'Matches Won', value: '18', change: '+3', accentColor: 'emerald' },
    { icon: Target, label: 'Goals Scored', value: totalGoals, change: '+12', accentColor: 'blue' },
    { icon: TrendingUp, label: 'Win Rate', value: '75%', change: '+5%', accentColor: 'emerald' },
  ];

  const mockMatches = [
    { opponent: 'Team Alpha', score: '3-1', result: 'W' },
    { opponent: 'Team Beta', score: '2-2', result: 'D' },
    { opponent: 'Team Gamma', score: '4-0', result: 'W' },
  ];

  const resultStyles = {
    W: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    D: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    L: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="space-y-5 py-4">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-[#1e1e2a]">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {user?.role === 'manager' ? `${user.sport} Manager Dashboard` : 'Dashboard'}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Overview of your team's performance</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, change, accentColor }) => {
          const c = accentColor === 'emerald'
            ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' }
            : { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: 'bg-blue-500' };
          return (
            <div key={label} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${c.bar} rounded-l-2xl`}></div>
              <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                <Icon size={17} className={c.text} />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white k-mono tracking-tight">{value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
              <div className={`flex items-center gap-1 mt-2 text-[9px] font-bold ${c.text} uppercase tracking-widest`}>
                <ArrowUpRight size={10} /> {change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Matches + Performers */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Matches */}
        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Recent Matches</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
            {mockMatches.map((match, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{match.opponent}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 k-mono">{match.score}</span>
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black ${resultStyles[match.result] || ''}`}>
                    {match.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1e1e2a]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Top Performers</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
            {data?.topPerformers?.length > 0 ? data.topPerformers.map((player, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{player.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{player.position}</p>
                </div>
                <span className="badge-live">High Impact</span>
              </div>
            )) : (
              <div className="py-10 text-center text-sm text-slate-400">No performers data found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;