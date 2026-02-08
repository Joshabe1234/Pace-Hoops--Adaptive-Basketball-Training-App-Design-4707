import React from 'react';
import { getPlayerStats, getPlayerLogs, getDrill, getWorkout } from '../../data/database';

const PlayerStats = ({ user, team }) => {
  const stats = getPlayerStats(user.id);
  const logs = getPlayerLogs(user.id);

  // Group logs by category
  const shootingLogs = logs.filter(l => l.makes !== undefined);
  const workoutLogs = logs.filter(l => l.itemType === 'workout');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Stats</h1>
        <p className="text-slate-400">Track your progress</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6">
          <p className="text-white/80 text-sm">Total Workouts</p>
          <p className="text-4xl font-bold text-white">{stats.totalLogs}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6">
          <p className="text-white/80 text-sm">Completion Rate</p>
          <p className="text-4xl font-bold text-white">{stats.completionRate}%</p>
        </div>
      </div>

      {/* Shooting Stats */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Shooting Stats</h2>
        </div>
        <div className="p-4">
          {stats.shooting.attempts === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No shooting data yet</p>
              <p className="text-slate-500 text-sm">Complete shooting drills to see stats</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overall Percentage</span>
                <span className={`text-2xl font-bold ${
                  stats.shooting.percentage >= 70 ? 'text-green-400' :
                  stats.shooting.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {stats.shooting.percentage}%
                </span>
              </div>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    stats.shooting.percentage >= 70 ? 'bg-green-500' :
                    stats.shooting.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.shooting.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>{stats.shooting.makes} makes</span>
                <span>{stats.shooting.attempts} attempts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="p-4">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => {
                const item = log.itemType === 'drill' ? getDrill(log.itemId) : getWorkout(log.itemId);
                
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{item?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {log.makes !== undefined && (
                        <p className="text-sm text-white">{log.makes}/{log.attempts} ({log.percentage}%)</p>
                      )}
                      {log.sets && (
                        <p className="text-sm text-white">{log.sets}x{log.reps} {log.weight && `@ ${log.weight}lbs`}</p>
                      )}
                      <p className="text-xs text-slate-400">Difficulty: {log.difficulty}/5</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
