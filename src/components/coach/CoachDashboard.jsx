import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  createTeam, 
  getTeamPlayers, 
  getTeamAssignments,
  getTeamLogs,
  getTeamStats,
  getDrill,
  getWorkout,
  getUser
} from '../../data/database';

const CoachDashboard = ({ user, team, onTeamCreated, refreshTeam }) => {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamLevel, setTeamLevel] = useState('');
  const [, setRefreshKey] = useState(0);

  // Auto-refresh data every 3 seconds - only if we have a team
  useEffect(() => {
    if (!team) return;
    
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [team]);

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    
    const newTeam = createTeam(user.id, {
      name: teamName.trim(),
      level: teamLevel
    });
    
    onTeamCreated(newTeam);
    setShowCreateTeam(false);
    setTeamName('');
    setTeamLevel('');
  };

  // If no team, show create team option
  if (!team) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏀</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome, Coach!</h1>
            <p className="text-slate-400">Create your team to get started</p>
          </div>

          {showCreateTeam ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Your Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., Lincoln Lions"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                  <select
                    value={teamLevel}
                    onChange={(e) => setTeamLevel(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="">Select level</option>
                    <option value="youth">Youth</option>
                    <option value="middle-school">Middle School</option>
                    <option value="jv">JV</option>
                    <option value="varsity">Varsity</option>
                    <option value="aau">AAU</option>
                    <option value="college">College</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowCreateTeam(false)}
                    className="flex-1 p-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    disabled={!teamName.trim()}
                    className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 disabled:opacity-50"
                  >
                    Create Team
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowCreateTeam(true)}
              className="w-full p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white text-center hover:from-orange-400 hover:to-orange-500 transition-all"
            >
              <span className="text-4xl block mb-2">+</span>
              <span className="font-semibold text-lg">Create Your First Team</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Has team - get data
  const players = getTeamPlayers(team.id);
  const assignments = getTeamAssignments(team.id);
  const stats = getTeamStats(team.id);
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentLogs = getTeamLogs(team.id, { since: weekAgo });

  const getAssignmentTarget = (assignment) => {
    if (assignment.assignedTo === 'team') {
      return { label: 'Team', color: 'bg-blue-500/20 text-blue-400' };
    }
    if (Array.isArray(assignment.assignedTo)) {
      const assignedPlayers = assignment.assignedTo
        .map(id => players.find(p => p.id === id) || getUser(id))
        .filter(Boolean);
      
      if (assignedPlayers.length === 1) {
        return { label: assignedPlayers[0].name, color: 'bg-purple-500/20 text-purple-400' };
      }
      
      const positions = [...new Set(assignedPlayers.map(p => p.position).filter(Boolean))];
      if (positions.length === 1 && assignedPlayers.length > 1) {
        return { label: `${positions[0]}s (${assignedPlayers.length})`, color: 'bg-green-500/20 text-green-400' };
      }
      
      return { label: `${assignedPlayers.length} players`, color: 'bg-purple-500/20 text-purple-400' };
    }
    return { label: 'Unknown', color: 'bg-slate-500/20 text-slate-400' };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-slate-400">Welcome back, Coach {user.name?.split(' ')[0]}</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Team Join Code</p>
          <p className="font-mono text-xl text-orange-400 tracking-wider">{team.joinCode}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Players</p>
          <p className="text-3xl font-bold text-white">{players.length}</p>
          <p className="text-xs text-slate-500">/ 12 max</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Active Assignments</p>
          <p className="text-3xl font-bold text-white">{assignments.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Logs This Week</p>
          <p className="text-3xl font-bold text-white">{recentLogs.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Team Shooting</p>
          <p className={`text-3xl font-bold ${
            stats?.teamTotals?.shooting?.percentage >= 70 ? 'text-green-400' :
            stats?.teamTotals?.shooting?.percentage >= 50 ? 'text-yellow-400' :
            stats?.teamTotals?.shooting?.percentage ? 'text-red-400' : 'text-white'
          }`}>
            {stats?.teamTotals?.shooting?.percentage || '--'}%
          </p>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Active Assignments</h2>
        </div>
        <div className="p-4">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No active assignments</p>
              <p className="text-slate-500 text-sm">Create an assignment to get your team training</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => {
                const target = getAssignmentTarget(assignment);
                const items = assignment.items.map(id => 
                  assignment.type === 'drill' ? getDrill(id) : getWorkout(id)
                ).filter(Boolean);
                const dueDate = new Date(assignment.dueDate);
                const isOverdue = dueDate < new Date();

                return (
                  <div key={assignment.id} className="p-4 bg-slate-700/50 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="font-medium text-white">{assignment.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${target.color}`}>
                            {target.label}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {assignment.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">
                          {items.length} {assignment.type}s • Due {dueDate.toLocaleDateString()}
                          {isOverdue && <span className="text-red-400 ml-2">(Overdue)</span>}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {items.slice(0, 3).map(item => (
                            <span key={item.id} className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded">
                              {item.name}
                            </span>
                          ))}
                          {items.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-600 text-slate-400 text-xs rounded">
                              +{items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Player Activity */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Player Activity</h2>
        </div>
        <div className="p-4">
          {players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No players yet</p>
              <p className="text-slate-500 text-sm">Share your join code: <span className="font-mono text-orange-400">{team.joinCode}</span></p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.playerStats?.slice(0, 5).map((ps) => (
                <div key={ps.playerId} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
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
                  <div className="text-right">
                    <p className={`font-bold ${
                      ps.stats.shooting.percentage >= 70 ? 'text-green-400' :
                      ps.stats.shooting.percentage >= 50 ? 'text-yellow-400' :
                      ps.stats.shooting.percentage ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {ps.stats.shooting.percentage || '--'}%
                    </p>
                    <p className="text-xs text-slate-400">{ps.stats.totalLogs} logs</p>
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
