import React, { useState, useEffect } from 'react';
import { getTeamPlayers, getPlayerLogs, getTeamInjuries } from '../../data/supabaseDb';

const CoachHealth = ({ user, team }) => {
  const [activeTab, setActiveTab] = useState('injuries');
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [playerHealthMap, setPlayerHealthMap] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!team) return;
    try {
      const [p, inj] = await Promise.all([getTeamPlayers(team.id), getTeamInjuries(team.id)]);
      setPlayers(p);
      setInjuries(inj);

      const healthMap = {};
      await Promise.all(p.map(async (player) => {
        const logs = await getPlayerLogs(player.id);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentLogs = logs.filter(l => new Date(l.createdAt) >= weekAgo);
        const sorenessLevels = { none: 0, mild: 1, moderate: 2, severe: 3 };
        const sorenessScores = recentLogs.map(l => sorenessLevels[l.soreness] || 0);
        const avgSoreness = sorenessScores.length > 0 ? sorenessScores.reduce((a, b) => a + b, 0) / sorenessScores.length : 0;
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const recentInjuries = logs.filter(l => l.injured === true && new Date(l.createdAt) >= twoWeeksAgo);
        const hasActiveInjury = recentInjuries.length > 0;
        healthMap[player.id] = {
          totalLogs: logs.length,
          recentLogs: recentLogs.length,
          avgSoreness,
          sorenessLabel: avgSoreness < 0.5 ? 'Low' : avgSoreness < 1.5 ? 'Mild' : avgSoreness < 2.5 ? 'Moderate' : 'High',
          injuryCount: recentInjuries.length,
          hasActiveInjury,
          status: hasActiveInjury ? 'injured' : avgSoreness >= 2 ? 'at-risk' : 'healthy'
        };
      }));
      setPlayerHealthMap(healthMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [team?.id]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  if (!team) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <span className="text-4xl">🏥</span>
          <p className="text-slate-400 mt-4">Create a team to view player health</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Player Health</h1>
        <p className="text-slate-400">Monitor player soreness, injuries, and overall health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Players</p>
          <p className="text-2xl font-bold text-white">{players.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
          <p className="text-green-400 text-sm">Healthy</p>
          <p className="text-2xl font-bold text-green-400">{players.filter(p => playerHealthMap[p.id]?.status === 'healthy').length}</p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
          <p className="text-yellow-400 text-sm">At Risk</p>
          <p className="text-2xl font-bold text-yellow-400">{players.filter(p => playerHealthMap[p.id]?.status === 'at-risk').length}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <p className="text-red-400 text-sm">Injured</p>
          <p className="text-2xl font-bold text-red-400">{players.filter(p => playerHealthMap[p.id]?.status === 'injured').length}</p>
        </div>
      </div>

      <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('injuries')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'injuries' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}>
          🚨 Injury Reports
        </button>
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}>
          📊 Team Overview
        </button>
      </div>

      {activeTab === 'injuries' && (
        <div className="space-y-4">
          {injuries.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="text-4xl">✅</span>
              <h3 className="text-xl font-semibold text-white mt-4">No Injuries Reported</h3>
              <p className="text-slate-400 mt-2">All players are healthy with no reported injuries</p>
            </div>
          ) : (
            injuries.map((injury) => (
              <div key={injury.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🚨</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{injury.player?.name || 'Unknown Player'}</h3>
                      <p className="text-sm text-slate-400">{formatDate(injury.date)}</p>
                      {injury.injuryDescription && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-sm text-slate-300"><span className="text-red-400 font-medium">Description:</span> {injury.injuryDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">Injury</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {players.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="text-4xl">👥</span>
              <h3 className="text-xl font-semibold text-white mt-4">No Players Yet</h3>
              <p className="text-slate-400 mt-2">Add players to your team to monitor their health</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {players.map((player) => {
                const health = playerHealthMap[player.id] || { status: 'healthy', sorenessLabel: 'Low', recentLogs: 0, hasActiveInjury: false };
                return (
                  <div key={player.id} className={`bg-slate-800 rounded-xl border p-4 ${health.status === 'injured' ? 'border-red-500/50' : health.status === 'at-risk' ? 'border-yellow-500/50' : 'border-slate-700'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${health.status === 'injured' ? 'bg-red-500/20' : health.status === 'at-risk' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                          <span className="text-xl font-bold text-white">{player.jerseyNumber || player.name?.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white truncate">{player.name}</h3>
                          <p className="text-sm text-slate-400 truncate">{player.position || 'No position'} • {health.recentLogs} logs this week</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-slate-500">Soreness</p>
                          <p className={`font-medium text-sm ${health.sorenessLabel === 'Low' ? 'text-green-400' : health.sorenessLabel === 'Mild' ? 'text-yellow-400' : health.sorenessLabel === 'Moderate' ? 'text-orange-400' : 'text-red-400'}`}>{health.sorenessLabel}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${health.status === 'injured' ? 'bg-red-500/20 text-red-400' : health.status === 'at-risk' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          {health.status === 'injured' ? '🚨 Injured' : health.status === 'at-risk' ? '⚠️ At Risk' : '✅ Healthy'}
                        </span>
                      </div>
                    </div>
                    {health.hasActiveInjury && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-sm text-red-400 font-medium mb-2">Recent Injuries:</p>
                        {injuries.filter(i => i.player?.id === player.id).slice(0, 2).map(injury => (
                          <div key={injury.id} className="text-sm text-slate-400 mb-1">
                            • {injury.injuryDescription || 'No description'}
                            <span className="text-slate-500 ml-2">({formatDate(injury.date)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachHealth;
