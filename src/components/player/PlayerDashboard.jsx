import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  getTeamByJoinCode, 
  addPlayerToTeam, 
  updateUser,
  getPlayerAssignments,
  getPlayerStats,
  getTeamSchedule,
  getUser
} from '../../data/database';

const PlayerDashboard = ({ user, team, onTeamJoined, refreshUser }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // If no team, show join team flow
  if (!team) {
    const handleJoinTeam = () => {
      setError('');
      const foundTeam = getTeamByJoinCode(joinCode);
      if (!foundTeam) {
        setError('Invalid team code. Please check with your coach.');
        return;
      }
      
      addPlayerToTeam(foundTeam.id, user.id);
      onTeamJoined(foundTeam);
    };

    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏀</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join Your Team</h2>
            <p className="text-slate-400">Enter the code from your coach</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-center text-2xl tracking-widest font-mono placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleJoinTeam}
              disabled={joinCode.length !== 6}
              className="w-full p-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Team
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const assignments = getPlayerAssignments(user.id, team.id);
  const stats = getPlayerStats(user.id);
  const schedule = getTeamSchedule(team.id, { from: new Date() });
  const coach = getUser(team.coachId);

  const pendingAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date());

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Hey, {user.name?.split(' ')[0]}!</h1>
        <p className="text-slate-400">{team.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-white">{pendingAssignments.length}</p>
          <p className="text-xs text-slate-500">assignments</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-3xl font-bold text-white">{stats.totalLogs}</p>
          <p className="text-xs text-slate-500">workouts</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Shooting</p>
          <p className="text-3xl font-bold text-white">{stats.shooting.percentage || '--'}%</p>
          <p className="text-xs text-slate-500">{stats.shooting.makes}/{stats.shooting.attempts}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Completion</p>
          <p className="text-3xl font-bold text-white">{stats.completionRate}%</p>
          <p className="text-xs text-slate-500">rate</p>
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Your Assignments</h2>
        </div>
        <div className="p-4">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No pending assignments</p>
              <p className="text-slate-500 text-sm">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="p-4 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{assignment.title}</h3>
                      <p className="text-sm text-slate-400">
                        {assignment.items.length} {assignment.type}s • Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
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

      {/* Upcoming Schedule */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Upcoming</h2>
        </div>
        <div className="p-4">
          {schedule.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-slate-400">
                      {event.startTime && `${event.startTime}`} {event.location && `• ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coach Info */}
      {coach && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-orange-400">{coach.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-white">Coach {coach.name}</p>
              <p className="text-sm text-slate-400">{coach.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDashboard;
