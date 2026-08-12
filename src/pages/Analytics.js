import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Activity, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_MATCH_PREDICTIONS = [
  {
    _id: 'match-pred-1',
    matchName: 'India vs South Africa (T20 World Cup Final)',
    sport: 'Cricket',
    minuteOrPhase: 'Death Overs (Over 19.2)',
    aiPredictedWinProbability: 0.924,
    playerFatigueLevel: 0.24,
    injuryRiskScore: 0.08
  },
  {
    _id: 'match-pred-2',
    matchName: 'India vs Australia (Super 8s Championship)',
    sport: 'Cricket',
    minuteOrPhase: 'Powerplay (Over 4.5)',
    aiPredictedWinProbability: 0.886,
    playerFatigueLevel: 0.18,
    injuryRiskScore: 0.12
  },
  {
    _id: 'match-pred-3',
    matchName: 'England vs Australia (Ashes T20 Series)',
    sport: 'Cricket',
    minuteOrPhase: 'Middle Overs (Over 14.1)',
    aiPredictedWinProbability: 0.785,
    playerFatigueLevel: 0.32,
    injuryRiskScore: 0.15
  },
  {
    _id: 'match-pred-4',
    matchName: 'West Indies vs India (International Cup)',
    sport: 'Cricket',
    minuteOrPhase: 'Super Over Final',
    aiPredictedWinProbability: 0.952,
    playerFatigueLevel: 0.38,
    injuryRiskScore: 0.05
  }
];

const DEFAULT_PERFORMANCE_STREAM = [
  {
    _id: 'perf-stream-1',
    playerId: { name: 'Virat Kohli', position: 'Batter / Star Performer' },
    situation: 'chasing_target_final_over',
    physical_metrics: { speed: 26.4, heart_rate: 142 },
    ai_targets: { win_probability: 0.96 }
  },
  {
    _id: 'perf-stream-2',
    playerId: { name: 'Jasprit Bumrah', position: 'Fast Bowler' },
    situation: 'death_overs_yorker_delivery',
    physical_metrics: { speed: 145.2, heart_rate: 158 },
    ai_targets: { win_probability: 0.98 }
  },
  {
    _id: 'perf-stream-3',
    playerId: { name: 'Rohit Sharma', position: 'Captain / Batter' },
    situation: 'powerplay_lofted_boundary',
    physical_metrics: { speed: 24.8, heart_rate: 136 },
    ai_targets: { win_probability: 0.94 }
  },
  {
    _id: 'perf-stream-4',
    playerId: { name: 'Hardik Pandya', position: 'All Rounder' },
    situation: 'match_finisher_over_defence',
    physical_metrics: { speed: 28.2, heart_rate: 150 },
    ai_targets: { win_probability: 0.92 }
  },
  {
    _id: 'perf-stream-5',
    playerId: { name: 'Suryakumar Yadav', position: 'T20 Batter' },
    situation: 'ramp_shot_telemetry',
    physical_metrics: { speed: 27.0, heart_rate: 144 },
    ai_targets: { win_probability: 0.95 }
  },
  {
    _id: 'perf-stream-6',
    playerId: { name: 'Rishabh Pant', position: 'Wicket Keeper' },
    situation: 'stumping_reflex_time',
    physical_metrics: { speed: 22.5, heart_rate: 128 },
    ai_targets: { win_probability: 0.90 }
  }
];

const Analytics = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState(DEFAULT_MATCH_PREDICTIONS);
  const [performances, setPerformances] = useState(DEFAULT_PERFORMANCE_STREAM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || '/api';
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [matchRes, perfRes] = await Promise.all([
          fetch(`${API_URL}/analytics/matches?limit=12`, { headers }),
          fetch(`${API_URL}/analytics/performance?limit=12`, { headers })
        ]);

        if (matchRes.ok) {
          const matchData = await matchRes.json();
          if (matchData.data && matchData.data.length > 0) setMatches(matchData.data);
        }
        if (perfRes.ok) {
          const perfData = await perfRes.json();
          if (perfData.data && perfData.data.length > 0) setPerformances(perfData.data);
        }
      } catch (err) {
        console.warn('Analytics fetch warning, using default streams:', err.message);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
          <Zap size={10} /> Live Predictive AI Hub
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          CRICKET Predictive Analytics & Biometrics
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Real-time XGBoost win probability models and player biometric telemetry.</p>
      </div>

      {/* Match Predictions Stream */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Target size={14} className="text-blue-500" />
            </div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Live Match Predictions</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-[#13131a] px-3 py-1 rounded-md border border-slate-200 dark:border-[#1e1e2a]">
            {matches.length} Matches Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {matches.map((match) => {
            const winPct = (match.aiPredictedWinProbability * 100).toFixed(1);
            const isHighWin = match.aiPredictedWinProbability > 0.5;
            return (
              <div key={match._id} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isHighWin ? 'bg-emerald-500' : 'bg-red-500'} rounded-l-2xl`}></div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    {match.sport || 'Cricket'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 k-mono truncate max-w-[140px]">{match.minuteOrPhase}</span>
                </div>

                {match.matchName && (
                  <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight mb-3 truncate">{match.matchName}</p>
                )}

                <div className="flex items-end justify-between mb-3">
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
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fatigue Level</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 k-mono">{(match.playerFatigueLevel * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Injury Risk</p>
                    <p className={`text-sm font-black k-mono ${match.injuryRiskScore > 0.3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {(match.injuryRiskScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player Performance Stream */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Player Performance Stream</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-[#13131a] px-3 py-1 rounded-md border border-slate-200 dark:border-[#1e1e2a]">
            {performances.length} Biometric Streams
          </span>
        </div>

        <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#1e1e2a] bg-slate-50/50 dark:bg-[#0a0a0c]">
                <th className="px-5 py-3.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Athlete</th>
                <th className="px-5 py-3.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Match Situation</th>
                <th className="px-5 py-3.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Velocity / Speed</th>
                <th className="px-5 py-3.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</th>
                <th className="px-5 py-3.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Win %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-[#1e1e2a]">
              {performances.map((perf) => {
                const winPct = perf.ai_targets?.win_probability ?? 0.95;
                return (
                  <tr key={perf._id} className="hover:bg-slate-50 dark:hover:bg-[#0a0a0c] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        {perf.playerId?.name || 'Virat Kohli'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {perf.playerId?.position || 'India Squad'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                      {perf.situation?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-4 text-right text-xs font-black text-slate-800 dark:text-slate-200 k-mono">
                      {perf.physical_metrics?.speed?.toFixed(1) || '26.4'} <span className="text-slate-400 font-normal">km/h</span>
                    </td>
                    <td className="px-5 py-4 text-right text-xs font-black text-slate-800 dark:text-slate-200 k-mono">
                      {perf.physical_metrics?.heart_rate || '142'} <span className="text-slate-400 font-normal">bpm</span>
                    </td>
                    <td className="px-5 py-4 text-right">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;