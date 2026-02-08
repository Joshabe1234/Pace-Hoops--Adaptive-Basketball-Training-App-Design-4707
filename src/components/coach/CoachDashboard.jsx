import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  getTeamPlayers, 
  getTeamAssignments, 
  getTeamStats,
  getTeamRecommendations,
  createTeam,
  getCoachTeams
} from '../../data/database';
import paceAI from '../../services/paceAI';

const CoachDashboard = ({ user, team, onTeamChange, onTeamCreated, refreshUser, refreshTeam }) => {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLevel, setNewTeamLevel] = useState('');

  // If no team, show create team flow
  if (!team) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏀</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Team</h2>
            <p className="text-slate-400">Get started by creating your first team</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team Name</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Lincoln Lions"
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
              <select
                value={newTeamLevel}
                onChange={(e) => setNewTeamLevel(e.target.value)}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="youth">Youth</option>
                <option value="middle-school">Middle School</option>
                <option value="jv">JV</option>
                <option value="varsity">Varsity</option>
                <option value="aau">AAU</option>
                <option value="club">Club</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (newTeamName) {
                  const newTeam = createTeam(user.id, { name: newTeamName, level: newTeamLevel });
                  onTeamCreated(newTeam);
                  refreshUser();
                }
              }}
              disabled={!newTeamName}
              className="w-full p-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Team
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const players = getTeamPlayers(team.id);
  const assignments = getTeamAssignments(team.id);
  const stats = getTeamStats(team.id);
  const recommendations = getTeamRecommendations(team.id);
  const coachTeams = getCoachTeams(user.id);

  const activeAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date());
  const recentLogs = stats?.playerStats?.reduce((sum, p) => sum + p.stats.totalLogs, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, Coach {user.name?.split(' ')[0]}</p>
        </div>

        {/* Team Selector */}
        {coachTeams.length > 1 && (
          <select
            value={team.id}
            onChange={(e) => {
              const selected = coachTeams.find(t => t.id === e.target.value);
              if (selected) onTeamChange(selected);
            }}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {coachTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Team Code Banner */}
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-400 font-medium">Team Join Code</p>
            <p className="text-slate-400 text-sm">Share this code with your players</p>
          </div>
          <div className="bg-slate-800 px-6 py-3 rounded-xl">
            <span className="text-2xl font-mono font-bold text-white tracking-widest">{team.joinCode}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Players</p>
          <p className="text-3xl font-bold text-white">{players.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Active Assignments</p>
          <p className="text-3xl font-bold text-white">{activeAssignments.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Logs This Week</p>
          <p className="text-3xl font-bold text-white">{recentLogs}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Team Shooting</p>
          <p className="text-3xl font-bold text-white">
            {stats?.teamTotals?.shooting?.percentage || '--'}%
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🤖</span>
              <h2 className="font-semibold text-white">AI Insights</h2>
            </div>
            <span className="text-xs text-slate-400">Powered by Pace AI</span>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No insights yet</p>
                <p className="text-slate-500 text-sm">Insights will appear as players log workouts</p>
              </div>
            ) : (
              recommendations.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3 rounded-lg border ${
                    rec.type === 'concern' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : rec.type === 'achievement'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <p className="font-medium text-white text-sm">{rec.title}</p>
                  <p className="text-slate-400 text-xs mt-1">{rec.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold text-white">Player Activity</h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No players yet</p>
                <p className="text-slate-500 text-sm">Share your team code to add players</p>
              </div>
            ) : (
              players.map((player) => {
                const playerStat = stats?.playerStats?.find(p => p.playerId === player.id);
                return (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white">
                          {player.jerseyNumber || player.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-xs text-slate-400">{player.position || 'No position'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">{playerStat?.stats?.totalLogs || 0} logs</p>
                      <p className="text-xs text-slate-400">
                        {playerStat?.stats?.shooting?.percentage 
                          ? `${playerStat.stats.shooting.percentage}% shooting` 
                          : 'No data'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Active Assignments</h2>
          <span className="text-sm text-slate-400">{activeAssignments.length} active</span>
        </div>
        <div className="p-4">
          {activeAssignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No active assignments</p>
              <p className="text-slate-500 text-sm">Create an assignment to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{assignment.title}</p>
                    <p className="text-xs text-slate-400">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' :
                      assignment.type === 'workout' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {assignment.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
