import React, { useState } from 'react';
import { getTeamStats, getTeamPlayers, getPlayerLogs } from '../../data/database';

const CoachStats = ({ user, team }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const stats = getTeamStats(team.id);
  const players = getTeamPlayers(team.id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Analytics</h1>
        <p className="text-slate-400">Track your team's performance and progress</p>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Logs</p>
          <p className="text-3xl font-bold text-white">{stats?.teamTotals?.totalLogs || 0}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Team Shooting</p>
          <p className="text-3xl font-bold text-white">{stats?.teamTotals?.shooting?.percentage || '--'}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Makes / Attempts</p>
          <p className="text-3xl font-bold text-white">
            {stats?.teamTotals?.shooting?.makes || 0} / {stats?.teamTotals?.shooting?.attempts || 0}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Avg Completion</p>
          <p className="text-3xl font-bold text-white">{stats?.teamTotals?.avgCompletionRate || 0}%</p>
        </div>
      </div>

      {/* Soreness Alert */}
      {stats?.teamTotals?.soreness?.playersWithHighSoreness > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-400">Soreness Alert</h3>
              <p className="text-slate-300 text-sm mt-1">
                {stats.teamTotals.soreness.playersWithHighSoreness} player(s) reported moderate or severe soreness in the last 7 days:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {stats.teamTotals.soreness.playersAtRisk.map((p) => (
                  <span 
                    key={p.player?.id} 
                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                  >
                    {p.player?.name} ({p.recentHighSoreness} reports)
                  </span>
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Consider checking in with these players about their workload and recovery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Player Stats Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Player Breakdown</h2>
        </div>
        
        {players.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No players on team yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 font-medium">Player</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Logs</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Shooting %</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Makes/Att</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Completion</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Soreness</th>
                </tr>
              </thead>
              <tbody>
                {stats?.playerStats?.map((ps) => (
                  <tr key={ps.playerId} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <span className="font-bold text-orange-400">
                            {ps.player?.jerseyNumber || ps.player?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{ps.player?.name}</p>
                          <p className="text-xs text-slate-400">{ps.player?.position || 'No position'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-white">{ps.stats.totalLogs}</td>
                    <td className="p-4 text-center">
                      <span className={`font-medium ${
                        ps.stats.shooting.percentage >= 70 ? 'text-green-400' :
                        ps.stats.shooting.percentage >= 50 ? 'text-yellow-400' :
                        ps.stats.shooting.percentage ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {ps.stats.shooting.percentage || '--'}%
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-300">
                      {ps.stats.shooting.makes}/{ps.stats.shooting.attempts}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-medium ${
                        ps.stats.completionRate >= 80 ? 'text-green-400' :
                        ps.stats.completionRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {ps.stats.completionRate}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {ps.stats.soreness.hasRecentSoreness ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                          ⚠️ {ps.stats.soreness.recentHighSoreness}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          ✓ OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Soreness Legend */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h3 className="font-medium text-white mb-3">Soreness Tracking</h3>
        <p className="text-slate-400 text-sm mb-3">
          Players report soreness when logging workouts. The table shows players who reported 
          moderate or severe soreness in the last 7 days.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-slate-400">None/Mild - Good to go</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-slate-400">Moderate - Monitor closely</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-400">Severe - Needs attention</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachStats;
