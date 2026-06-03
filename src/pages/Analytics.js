import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Activity, Zap, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        const [matchRes, perfRes] = await Promise.all([
          fetch(`${API_URL}/analytics/matches?limit=12`, { headers }),
          fetch(`${API_URL}/analytics/performance?limit=12`, { headers })
        ]);
        const matchData = await matchRes.json();
        const perfData = await perfRes.json();
        if (matchRes.ok) setMatches(matchData.data || []);
        if (perfRes.ok) setPerformances(perfData.data || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-[#1e1e2a]">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {user?.role === 'analyst' ? 'Global Analytics Hub' : `${user?.sport?.toUpperCase() || 'SPORTS'} Analytics`}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Real-time insights and AI-driven predictions for elite performance.</p>
      </div>

      {/* Match Predictions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Target size={14} className="text-blue-500" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Live Match Predictions</h2>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => {
              const winPct = (match.aiPredictedWinProbability * 100).toFixed(1);
              const isHighWin = match.aiPredictedWinProbability > 0.5;
              return (
                <div key={match._id} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-sm transition-all">
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isHighWin ? 'bg-emerald-500' : 'bg-red-500'} rounded-l-2xl`}></div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-[#1e1e2a] border border-slate-200 dark:border-[#2a2a3a] rounded-md">
                      {match.sport}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 k-mono">{match.minuteOrPhase} phase</span>
                  </div>

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Win Probability</p>
                      <p className={`text-3xl font-black k-mono tracking-tight ${isHighWin ? 'text-emerald-500' : 'text-red-500'}`}>{winPct}%</p>
                    </div>
                    <Activity className={isHighWin ? 'text-emerald-500' : 'text-red-400'} size={20} />
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-1.5 mb-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isHighWin ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${winPct}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-[#1e1e2a]">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fatigue</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 k-mono">{(match.playerFatigueLevel * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Injury Risk</p>
                      <p className={`text-sm font-black k-mono ${match.injuryRiskScore > 0.7 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {(match.injuryRiskScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl py-12 text-center text-sm text-slate-400">
            No match predictions available. Ensure backend is running.
          </div>
        )}
      </div>

      {/* Performance Stream */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Player Performance Stream</h2>
        </div>

        {performances.length > 0 ? (
          <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1e1e2a]">
                  <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Player</th>
                  <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Situation</th>
                  <th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Speed</th>
                  <th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</th>
                  <th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Win %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
                {performances.map((perf) => {
                  const winPct = perf.ai_targets?.win_probability ?? null;
                  return (
                    <tr key={perf._id} className="hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {perf.playerId?.name || 'Unknown Player'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 capitalize">
                        {perf.situation?.replace('_', ' ')}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs font-bold text-slate-700 dark:text-slate-300 k-mono">
                        {perf.physical_metrics?.speed?.toFixed(1) || '—'} <span className="text-slate-400 font-normal">km/h</span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs font-bold text-slate-700 dark:text-slate-300 k-mono">
                        {perf.physical_metrics?.heart_rate || '—'} <span className="text-slate-400 font-normal">bpm</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {winPct !== null ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 dark:bg-[#1e1e2a] rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${winPct > 0.5 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${winPct * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-black k-mono ${winPct > 0.5 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {(winPct * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl py-12 text-center text-sm text-slate-400">
            No performance data available. Ensure backend is running.
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;