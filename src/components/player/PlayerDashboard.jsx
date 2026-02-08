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
  const [showJoinTeam, setShowJoinTeam] = useState(false);

  const handleJoinTeam = () => {
    setError('');
    if (!joinCode || joinCode.trim().length === 0) {
      setError('Please enter a team code');
      return;
    }
    
    const foundTeam = getTeamByJoinCode(joinCode);
    if (!foundTeam) {
      setError('Invalid team code. Please check with your coach.');
      return;
    }
    
    addPlayerToTeam(foundTeam.id, user.id);
    if (refreshUser) refreshUser();
    onTeamJoined(foundTeam);
  };

  const stats = getPlayerStats(user.id);

  // If no team, show dashboard with option to join
  if (!team) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Hey, {user.name?.split(' ')[0]}!</h1>
          <p className="text-slate-400">Welcome to Pace Hoops</p>
        </div>

        {/* Join Team Card */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Join a Team</h2>
              <p className="text-blue-300 text-sm">Enter your coach's team code to get started</p>
            </div>
          </div>

          {showJoinTeam ? (
            <div className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="ABC123"
                maxLength={6}
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-widest font-mono placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowJoinTeam(false);
                    setJoinCode('');
                    setError('');
                  }}
                  className="flex-1 p-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinTeam}
                  disabled={joinCode.length !== 6}
                  className="flex-1 p-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-400 transition-colors disabled:opacity-50"
                >
                  Join Team
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowJoinTeam(true)}
              className="w-full p-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-400 transition-colors"
            >
              Enter Team Code
            </button>
          )}
        </div>

        {/* Solo Training Stats */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.totalLogs}</p>
              <p className="text-sm text-slate-400">Workouts</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.shooting.percentage || '--'}%</p>
              <p className="text-sm text-slate-400">Shooting</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="font-semibold text-white mb-2">Training Without a Team</h3>
          <p className="text-slate-400 text-sm">
            You can still use Pace Hoops to track your individual workouts. Once you join a team, 
            your coach will be able to assign drills and track your progress.
          </p>
        </div>
      </div>
    );
  }

  // Has a team - show full dashboard
  const assignments = getPlayerAssignments(user.id, team.id);
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
