import React, { useState, useEffect } from 'react';
import { getTeamPlayers, getPlayerLogs, getTeamInjuries } from '../../data/supabaseDb';

const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const CoachHealth = ({ user, team }) => {
  const [activeTab, setActiveTab] = useState('injuries');
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [playerHealthMap, setPlayerHealthMap] = useState({});
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [expandedInjuryPlayer, setExpandedInjuryPlayer] = useState(null);
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
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const recentLogs = logs
          .filter(l => new Date(l.createdAt) >= weekAgo)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const recentInjuries = logs.filter(l => l.injured === true && new Date(l.createdAt) >= twoWeeksAgo);
        const hasActiveInjury = recentInjuries.length > 0;

        const mostRecentLog = recentLogs[0];
        const mostRecentSoreness = mostRecentLog?.soreness || 'none';
        const sorenessLabel = mostRecentSoreness.charAt(0).toUpperCase() + mostRecentSoreness.slice(1);

        let status;
        if (hasActiveInjury) {
          status = 'injured';
        } else if (mostRecentSoreness === 'moderate' || mostRecentSoreness === 'severe') {
          status = 'at-risk';
        } else {
          status = 'healthy';
        }

        healthMap[player.id] = {
          totalLogs: logs.length,
          recentLogs: recentLogs.length,
          mostRecentSoreness,
          sorenessLabel,
          injuryCount: recentInjuries.length,
          hasActiveInjury,
          status,
          weekLogs: recentLogs
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

  const currentWeekStart = getWeekStart();

  const injuriesByPlayer = (() => {
    const playerMap = {};
    injuries.forEach(injury => {
      const playerId = injury.player?.id;
      if (!playerId) return;
      if (!playerMap[playerId]) playerMap[playerId] = { player: injury.player, injuries: [] };
      playerMap[playerId].injuries.push(injury);
    });
    return Object.values(playerMap);
  })();

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
          {injuriesByPlayer.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <span className="text-4xl">✅</span>
              <h3 className="text-xl font-semibold text-white mt-4">No Injuries Reported</h3>
              <p className="text-slate-400 mt-2">All players are healthy with no reported injuries</p>
            </div>
          ) : (
            injuriesByPlayer.map(({ player, injuries: playerInjuries }) => {
              const thisWeek = playerInjuries.filter(i => new Date(i.date) >= currentWeekStart);
              const prevInjuries = playerInjuries.filter(i => new Date(i.date) < currentWeekStart);
              const isExpanded = expandedInjuryPlayer === player.id;

              return (
                <div key={player.id} className="bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{player.jerseyNumber || player.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{player.name}</h3>
                          <p className="text-xs text-slate-400">{playerInjuries.length} total report{playerInjuries.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">Injured</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">This Week</p>
                      {thisWeek.length === 0 ? (
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-sm text-slate-400">No injuries reported this week</p>
                        </div>
                      ) : (
                        thisWeek.map(injury => (
                          <div key={injury.id} className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-300">{injury.injuryDescription || 'No description'}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatDate(injury.date)}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {prevInjuries.length > 0 && (
                      <button
                        onClick={() => setExpandedInjuryPlayer(isExpanded ? null : player.id)}
                        className="mt-3 flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{isExpanded ? 'Hide' : 'View'} previous reports ({prevInjuries.length})</span>
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-red-500/20 p-4 space-y-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Previous Reports</p>
                      {prevInjuries.map(injury => (
                        <div key={injury.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-sm text-slate-300">{injury.injuryDescription || 'No description'}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(injury.date)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
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
                const health = playerHealthMap[player.id] || { status: 'healthy', sorenessLabel: 'None', recentLogs: 0, hasActiveInjury: false, weekLogs: [] };
                const isExpanded = expandedPlayer === player.id;

                return (
                  <div key={player.id} className={`bg-slate-800 rounded-xl border overflow-hidden ${health.status === 'injured' ? 'border-red-500/50' : health.status === 'at-risk' ? 'border-yellow-500/50' : 'border-slate-700'}`}>
                    <button
                      onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                      className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${health.status === 'injured' ? 'bg-red-500/20' : health.status === 'at-risk' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                              <span className="text-xl font-bold text-white">{player.jerseyNumber || player.name?.charAt(0)}</span>
                            </div>
                            {health.status !== 'healthy' && (
                              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${health.status === 'injured' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                !
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white truncate">{player.name}</h3>
                            <p className="text-sm text-slate-400 truncate">{player.position || 'No position'} · {health.recentLogs} logs this week</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div className="text-center hidden sm:block">
                            <p className="text-xs text-slate-500">Soreness</p>
                            <p className={`font-medium text-sm ${
                              health.sorenessLabel === 'None' ? 'text-green-400' :
                              health.sorenessLabel === 'Mild' ? 'text-yellow-400' :
                              health.sorenessLabel === 'Moderate' ? 'text-orange-400' : 'text-red-400'
                            }`}>{health.sorenessLabel}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                            health.status === 'injured' ? 'bg-red-500/20 text-red-400' :
                            health.status === 'at-risk' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {health.status === 'injured' ? '🚨 Injured' : health.status === 'at-risk' ? '⚠️ At Risk' : '✅ Healthy'}
                          </span>
                          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-700 p-4">
                        <p className="text-sm font-medium text-slate-300 mb-3">This Week's Soreness Reports</p>
                        {health.weekLogs.length === 0 ? (
                          <p className="text-slate-500 text-sm">No logs this week</p>
                        ) : (
                          <div className="space-y-2">
                            {health.weekLogs.map((log, idx) => (
                              <div key={log.id || idx} className="flex items-start justify-between p-3 bg-slate-900/50 rounded-lg">
                                <div>
                                  <p className="text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                                  {log.injured && (
                                    <p className="text-xs text-red-400 mt-0.5">⚠️ Injury: {log.injuryDescription || 'No description'}</p>
                                  )}
                                </div>
                                <span className={`text-sm font-medium ml-4 ${
                                  !log.soreness || log.soreness === 'none' ? 'text-green-400' :
                                  log.soreness === 'mild' ? 'text-yellow-400' :
                                  log.soreness === 'moderate' ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                  {log.soreness ? log.soreness.charAt(0).toUpperCase() + log.soreness.slice(1) : 'None'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
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
