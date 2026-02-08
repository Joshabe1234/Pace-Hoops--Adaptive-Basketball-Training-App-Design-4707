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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachStats;
