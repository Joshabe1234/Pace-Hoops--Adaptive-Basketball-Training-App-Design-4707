import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getTeam,
  getTeamPlayers,
  getTeamAssignments,
  getAllTeamAssignments,
  getTeamStats,
  getTeamMessages,
  getUnreadDMCount,
  getTeamInjuries
} from '../../data/database';

const CoachDashboard = ({ user, team, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (team) {
      loadData();
      const interval = setInterval(() => setRefreshKey(k => k + 1), 5000);
      return () => clearInterval(interval);
    }
  }, [team?.id, refreshKey]);

  const loadData = () => {
    if (team) {
      setStats(getTeamStats(team.id));
    }
  };

  const players = team ? getTeamPlayers(team.id) : [];
  const activeAssignments = team ? getTeamAssignments(team.id) : [];
  const allAssignments = team ? getAllTeamAssignments(team.id) : [];
  const messages = team ? getTeamMessages(team.id) : [];
  const dmUnread = getUnreadDMCount(user.id);
  const injuries = team ? getTeamInjuries(team.id) : [];

  // Parse date string as local date (YYYY-MM-DD) to avoid timezone issues
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const formatDate = (dateStr) => {
    return parseLocalDate(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get recent injuries (last 7 days)
  const recentInjuries = injuries.filter(i => {
    const injuryDate = new Date(i.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return injuryDate >= weekAgo;
  });

  // Get past assignments (completed or past due, within last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const pastAssignments = allAssignments.filter(a => {
    const dueDate = parseLocalDate(a.dueDate);
    const isPastDue = dueDate < new Date(new Date().setHours(0,0,0,0));
    const isWithinWeek = dueDate >= oneWeekAgo;
    const isInactive = a.status !== 'active' || isPastDue;
    return isInactive && isWithinWeek;
  });

  // Recent messages (last 24h)
  const recentMessages = messages.filter(m => {
    const msgDate = new Date(m.createdAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return msgDate >= oneDayAgo;
  });

  const handleAssignmentClick = (assignment) => {
    // Navigate to analytics with the assignment selected
    if (onNavigate) {
      onNavigate('stats', { selectedAssignment: assignment });
    }
  };

  if (!team) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome, Coach {user.name?.split(' ')[0]}!</h1>
          <p className="text-slate-400 mt-2">Create a team to get started</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">🏀 Create Your Team</h3>
          <p className="text-white/80 mb-4">Set up your team to start assigning drills and tracking progress.</p>
          <button
            onClick={() => onNavigate && onNavigate('roster')}
            className="px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">{team.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700"
        >
          <p className="text-slate-400 text-sm">Players</p>
          <p className="text-2xl font-bold text-white">{players.length}</p>
          <p className="text-xs text-slate-500">of 12 max</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700"
        >
          <p className="text-slate-400 text-sm">Active Assignments</p>
          <p className="text-2xl font-bold text-white">{activeAssignments.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700"
        >
          <p className="text-slate-400 text-sm">Team Shooting</p>
          <p className="text-2xl font-bold text-white">
            {stats?.teamTotals?.shooting?.percentage ?? '--'}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-xl p-4 border border-slate-700"
        >
          <p className="text-slate-400 text-sm">Completion Rate</p>
          <p className="text-2xl font-bold text-white">
            {stats?.teamTotals?.avgCompletionRate ?? 0}%
          </p>
        </motion.div>
      </div>

      {/* Team Code */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Team Join Code</p>
            <p className="text-2xl font-mono font-bold text-white tracking-widest">{team.joinCode}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(team.joinCode);
              alert('Code copied!');
            }}
            className="p-3 bg-slate-600 rounded-lg hover:bg-slate-500"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Share this code with your players</p>
      </div>

      {/* Active Assignments - CLICKABLE */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-white">Active Assignments</h3>
          <button
            onClick={() => onNavigate && onNavigate('assignments')}
            className="text-sm text-orange-400 hover:text-orange-300"
          >
            View All →
          </button>
        </div>
        {activeAssignments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500">No active assignments</p>
            <button
              onClick={() => onNavigate && onNavigate('assignments')}
              className="mt-2 text-orange-400 hover:text-orange-300 text-sm"
            >
              Create one
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {activeAssignments.slice(0, 3).map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => handleAssignmentClick(assignment)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors text-left"
              >
                <div>
                  <h4 className="font-medium text-white">{assignment.title}</h4>
                  <p className="text-sm text-slate-400">
                    Due {formatDate(assignment.dueDate)} • {assignment.items?.length || 0} {assignment.type}s
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {assignment.type}
                  </span>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Past Assignments Section */}
      {pastAssignments.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-400">Past Assignments (Last 7 Days)</h3>
            <span className="text-xs text-slate-500">{pastAssignments.length} total</span>
          </div>
          <div className="divide-y divide-slate-700">
            {pastAssignments.slice(0, 5).map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => handleAssignmentClick(assignment)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors text-left opacity-70"
              >
                <div>
                  <h4 className="font-medium text-slate-300">{assignment.title}</h4>
                  <p className="text-sm text-slate-500">
                    Due {formatDate(assignment.dueDate)} • {assignment.items?.length || 0} {assignment.type}s
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-full">
                    Past Due
                  </span>
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 p-3 text-center border-t border-slate-700">
            Past assignments auto-clear after 7 days
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Team Chat</h3>
            {(recentMessages.length > 0 || dmUnread > 0) && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <div className="p-4">
            {recentMessages.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent messages</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <p className="text-slate-300 truncate">{msg.content}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => onNavigate && onNavigate('chat')}
              className="w-full mt-4 p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center space-x-2"
            >
              <span>Open Chat</span>
              {dmUnread > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                  {dmUnread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Player Health Alerts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <button
            onClick={() => onNavigate && onNavigate('health')}
            className="w-full p-4 border-b border-slate-700 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <h3 className="font-semibold text-white">Player Alerts</h3>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="p-4">
            {recentInjuries.length > 0 ? (
              <div className="space-y-3">
                {recentInjuries.slice(0, 3).map((injury, idx) => (
                  <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">🚨</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{injury.player?.name || 'Unknown'}</p>
                        <p className="text-xs text-red-400 mt-0.5">
                          Injured during: {injury.drillName}
                        </p>
                        {injury.injuryDescription && (
                          <p className="text-xs text-slate-400 mt-1 truncate">
                            "{injury.injuryDescription}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {recentInjuries.length > 3 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{recentInjuries.length - 3} more injury reports
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-3xl">✅</span>
                <p className="text-slate-400 mt-2">All players healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate && onNavigate('assignments')}
          className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl hover:bg-orange-500/20 transition-colors"
        >
          <span className="text-2xl">📋</span>
          <p className="text-sm font-medium text-white mt-2">Create Assignment</p>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('schedule')}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-2xl">📅</span>
          <p className="text-sm font-medium text-white mt-2">Add to Schedule</p>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('stats')}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-colors"
        >
          <span className="text-2xl">📊</span>
          <p className="text-sm font-medium text-white mt-2">View Analytics</p>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('roster')}
          className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors"
        >
          <span className="text-2xl">👥</span>
          <p className="text-sm font-medium text-white mt-2">Manage Roster</p>
        </button>
      </div>
    </div>
  );
};

export default CoachDashboard;
