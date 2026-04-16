import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getTeamByJoinCode, 
  addPlayerToTeam, 
  getPlayerAssignments,
  getPlayerStats,
  getTeamSchedule,
  getUser,
  getPlayerLogs,
  getDrill,
  getWorkout
} from '../../data/database';

const PlayerDashboard = ({ user, team, onTeamJoined, refreshUser, setCurrentView }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [personalGoals, setPersonalGoals] = useState([]);
  
  // Auto-refresh data
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Load personal goals
    const stored = localStorage.getItem(`paceHoops_goals_${user.id}`);
    if (stored) {
      setPersonalGoals(JSON.parse(stored));
    }
    
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [user.id]);

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

    // Check roster cap
    if (foundTeam.playerIds && foundTeam.playerIds.length >= 12) {
      setError('This team has reached the maximum roster size (12 players).');
      return;
    }
    
    addPlayerToTeam(foundTeam.id, user.id);
    if (refreshUser) refreshUser();
    onTeamJoined(foundTeam);
  };

  const stats = getPlayerStats(user.id);
  const logs = getPlayerLogs(user.id);

  // Check if assignment is completed (all items logged)
  const isAssignmentCompleted = (assignment) => {
    const items = assignment.items || [];
    return items.every(itemId => 
      logs.some(l => l.assignmentId === assignment.id && l.itemId === itemId)
    );
  };

  // Get active personal goals
  const activeGoals = personalGoals.filter(g => g.status === 'active');

  // Handle navigation clicks
  const handleAssignmentClick = () => {
    if (setCurrentView) setCurrentView('training');
  };

  const handleScheduleClick = () => {
    if (setCurrentView) setCurrentView('schedule');
  };

  const handleGoalClick = () => {
    if (setCurrentView) setCurrentView('training');
  };

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

        {/* Personal Goals */}
        {activeGoals.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-white">Your Personal Goals</h2>
              <span className="text-sm text-slate-400">{activeGoals.length} active</span>
            </div>
            <div className="p-4 space-y-3">
              {activeGoals.slice(0, 3).map((goal, index) => (
                <button
                  key={goal.id}
                  onClick={handleGoalClick}
                  className="w-full p-4 bg-slate-700/50 rounded-xl text-left hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{goal.description}</p>
                      <p className="text-sm text-slate-400">
                        {goal.plan?.totalWeeks} weeks • {goal.plan?.sessionsPerWeek}x/week
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400">
                      {goal.plan?.category || 'Goal'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
            You can still use Pace Hoops to track your individual workouts and personal goals. 
            Once you join a team, your coach will be able to assign drills and track your progress.
          </p>
        </div>
      </div>
    );
  }

  // Has a team - show full dashboard
  const assignments = getPlayerAssignments(user.id, team.id);
  const schedule = getTeamSchedule(team.id);
  const coach = getUser(team.coachId);

  // Parse date string as local date (YYYY-MM-DD)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };
  
  // Filter to only pending (not completed) assignments
  const pendingAssignments = assignments.filter(a => {
    const dueDate = parseLocalDate(a.dueDate);
    const isPastDue = dueDate < new Date(new Date().setHours(0,0,0,0));
    const isCompleted = isAssignmentCompleted(a);
    return !isCompleted && !isPastDue;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by most recent

  // Upcoming events - parse dates correctly
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = schedule.filter(e => {
    const eventDate = parseLocalDate(e.date);
    return eventDate >= today;
  });

  return (
    <div className="p-6 space-y-6" key={refreshKey}>
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
          <p className="text-slate-400 text-sm">Goals</p>
          <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
          <p className="text-xs text-slate-500">active</p>
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Pending Assignments</h2>
          {pendingAssignments.length > 0 && (
            <button 
              onClick={handleAssignmentClick}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              View All →
            </button>
          )}
        </div>
        <div className="p-4">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No pending assignments</p>
              <p className="text-slate-500 text-sm">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.slice(0, 5).map((assignment, index) => {
                const items = assignment.items.map(id => 
                  assignment.type === 'drill' ? getDrill(id) : getWorkout(id)
                ).filter(Boolean);
                const completedItems = items.filter(item => 
                  logs.some(l => l.assignmentId === assignment.id && l.itemId === item.id)
                );

                return (
                  <button
                    key={assignment.id}
                    onClick={handleAssignmentClick}
                    className="w-full p-4 bg-slate-700/50 rounded-xl text-left hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white truncate">{assignment.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${
                            assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {completedItems.length}/{items.length}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Due {parseLocalDate(assignment.dueDate).toLocaleDateString()}
                        </p>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all"
                            style={{ width: `${items.length > 0 ? (completedItems.length / items.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Personal Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Personal Goals</h2>
            <button 
              onClick={handleGoalClick}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All →
            </button>
          </div>
          <div className="p-4 space-y-3">
            {activeGoals.slice(0, 3).map((goal) => (
              <button
                key={goal.id}
                onClick={handleGoalClick}
                className="w-full p-4 bg-slate-700/50 rounded-xl text-left hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{goal.description}</p>
                    <p className="text-sm text-slate-400">
                      {goal.plan?.totalWeeks} weeks • {goal.plan?.sessionsPerWeek}x/week
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 ml-2 flex-shrink-0">
                    {goal.plan?.category || 'Goal'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Schedule */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Upcoming Events</h2>
          {upcomingEvents.length > 0 && (
            <button 
              onClick={handleScheduleClick}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              View All →
            </button>
          )}
        </div>
        <div className="p-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event) => {
                const eventDate = parseLocalDate(event.date);
                return (
                <button
                  key={event.id}
                  onClick={handleScheduleClick}
                  className="w-full flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-400">
                      {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {eventDate.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{event.title}</p>
                    <p className="text-sm text-slate-400">
                      {event.startTime && `${event.startTime}`} {event.location && `• ${event.location}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                    event.type === 'practice' ? 'bg-blue-500/20 text-blue-400' :
                    event.type === 'game' ? 'bg-red-500/20 text-red-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {event.type}
                  </span>
                </button>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Coach Info */}
      {coach && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-orange-400">{coach.name?.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white">Coach {coach.name}</p>
              <p className="text-sm text-slate-400 truncate">{coach.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDashboard;
