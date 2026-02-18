import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getPlayerAssignments, 
  getDrill, 
  getWorkout, 
  createLog,
  getPlayerLogs
} from '../../data/database';
import paceAI from '../../services/paceAI';

const PlayerAssignments = ({ user, team }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loggingItem, setLoggingItem] = useState(null);
  const [loggingContext, setLoggingContext] = useState(null); // { type: 'assignment' | 'goal', id, weekIndex, dayIndex }
  const [activeTab, setActiveTab] = useState(team ? 'team' : 'personal');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  
  const [personalGoals, setPersonalGoals] = useState(() => {
    const stored = localStorage.getItem(`paceHoops_goals_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [newGoal, setNewGoal] = useState({
    description: '',
    timeframe: '4 weeks',
    daysPerWeek: 3,
    minutesPerDay: 45
  });
  
  const [logData, setLogData] = useState({
    makes: '',
    attempts: '',
    sets: '',
    reps: '',
    weight: '',
    difficulty: 3,
    soreness: 'none',
    notes: ''
  });

  // Only auto-refresh when no modals/expansions are open
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (showGoalModal || loggingItem || selectedGoal || selectedAssignment) return;
    const interval = setInterval(() => setRefreshKey(k => k + 1), 3000);
    return () => clearInterval(interval);
  }, [showGoalModal, loggingItem, selectedGoal, selectedAssignment]);

  const logs = getPlayerLogs(user.id);
  const assignments = team ? getPlayerAssignments(user.id, team.id) : [];

  const saveGoals = (goals) => {
    setPersonalGoals(goals);
    localStorage.setItem(`paceHoops_goals_${user.id}`, JSON.stringify(goals));
  };

  const handleCreateGoal = () => {
    if (!newGoal.description) return;

    const plan = paceAI.generateTrainingPlan(newGoal, { age: user.age });
    
    const goal = {
      id: `goal_${Date.now()}`,
      ...newGoal,
      plan,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    saveGoals([...personalGoals, goal]);
    setNewGoal({ description: '', timeframe: '4 weeks', daysPerWeek: 3, minutesPerDay: 45 });
    setShowGoalModal(false);
  };

  const getItemDetails = (itemId, type) => {
    return type === 'drill' ? getDrill(itemId) : getWorkout(itemId);
  };

  const isItemLogged = (assignmentId, itemId) => {
    return logs.some(l => l.assignmentId === assignmentId && l.itemId === itemId);
  };

  const isGoalDayCompleted = (goalId, weekIndex, dayIndex) => {
    return logs.some(l => l.assignmentId === `${goalId}_w${weekIndex}_d${dayIndex}`);
  };

  const handleLog = () => {
    if (!loggingItem || !loggingContext) return;

    const assignmentId = loggingContext.type === 'assignment' 
      ? loggingContext.id 
      : `${loggingContext.goalId}_w${loggingContext.weekIndex}_d${loggingContext.dayIndex}`;

    createLog(user.id, {
      assignmentId,
      itemId: loggingItem.id,
      itemType: loggingItem.requiresAccuracyLog !== undefined ? 'drill' : 'workout',
      makes: logData.makes ? parseInt(logData.makes) : undefined,
      attempts: logData.attempts ? parseInt(logData.attempts) : undefined,
      sets: logData.sets ? parseInt(logData.sets) : undefined,
      reps: logData.reps ? parseInt(logData.reps) : undefined,
      weight: logData.weight ? parseFloat(logData.weight) : undefined,
      difficulty: logData.difficulty,
      soreness: logData.soreness,
      notes: logData.notes,
      completed: true
    });

    setLogData({ makes: '', attempts: '', sets: '', reps: '', weight: '', difficulty: 3, soreness: 'none', notes: '' });
    setLoggingItem(null);
    setLoggingContext(null);
  };

  // Check if ALL items in assignment are logged
  const isAssignmentCompleted = (assignment) => {
    if (!assignment.items || assignment.items.length === 0) return false;
    return assignment.items.every(itemId => isItemLogged(assignment.id, itemId));
  };

  const pendingAssignments = assignments.filter(a => {
    const isPastDue = new Date(a.dueDate) < new Date();
    const isCompleted = isAssignmentCompleted(a);
    return !isPastDue && !isCompleted;
  });

  const activeGoals = personalGoals.filter(g => g.status === 'active');

  return (
    <div className="p-4 md:p-6 space-y-6" key={refreshKey}>
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="text-slate-400">Your workouts and personal goals</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl">
        {team && (
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'team' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Team Assignments
          </button>
        )}
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'personal' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Personal Goals
        </button>
      </div>

      {/* Team Assignments Tab */}
      {activeTab === 'team' && team && (
        <div className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <span className="text-3xl">📋</span>
              <p className="text-slate-400 mt-4">No pending assignments from your coach</p>
              <p className="text-slate-500 text-sm mt-1">Check back later or work on your personal goals</p>
            </div>
          ) : (
            pendingAssignments.map((assignment) => {
              const items = assignment.items.map(id => getItemDetails(id, assignment.type)).filter(Boolean);
              const completedCount = items.filter(item => isItemLogged(assignment.id, item.id)).length;
              const isExpanded = selectedAssignment?.id === assignment.id;

              return (
                <div key={assignment.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setSelectedAssignment(isExpanded ? null : assignment)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{assignment.title}</h3>
                        <p className="text-sm text-slate-400">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {completedCount}/{items.length}
                      </span>
                    </div>
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all" style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-700 p-4 space-y-3">
                      {items.map((item) => {
                        const isLogged = isItemLogged(assignment.id, item.id);
                        return (
                          <div key={item.id} className={`p-4 rounded-xl ${isLogged ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-700/50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  {isLogged && <span className="text-green-400">✓</span>}
                                  <h4 className="font-medium text-white">{item.name}</h4>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                                <p className="text-xs text-slate-500 mt-1">{item.duration} min • {item.category}</p>
                              </div>
                              {!isLogged && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLoggingItem(item);
                                    setLoggingContext({ type: 'assignment', id: assignment.id });
                                  }}
                                  className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-400"
                                >
                                  Log
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Personal Goals Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowGoalModal(true)}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium hover:from-blue-400 hover:to-blue-500"
          >
            + Create New Goal
          </button>

          {activeGoals.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <span className="text-3xl">🎯</span>
              <h3 className="text-lg font-semibold text-white mt-4">No Personal Goals Yet</h3>
              <p className="text-slate-400">Create a goal and we'll build a training plan for you.</p>
            </div>
          ) : (
            activeGoals.map((goal) => {
              const isExpanded = selectedGoal?.id === goal.id;
              const totalTrainingDays = goal.plan.weeklyPlans.reduce((sum, week) => 
                sum + week.days.filter(d => d.isTrainingDay).length, 0);
              const completedDays = goal.plan.weeklyPlans.reduce((sum, week, wIndex) => 
                sum + week.days.filter((d, dIndex) => d.isTrainingDay && isGoalDayCompleted(goal.id, wIndex, dIndex)).length, 0);

              return (
                <div key={goal.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedGoal(isExpanded ? null : goal);
                      setSelectedWeek(null);
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{goal.description}</h3>
                        <p className="text-sm text-slate-400">
                          {goal.plan.totalWeeks} weeks • {goal.plan.sessionsPerWeek}x/week • {goal.minutesPerDay} min/session
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400">
                        {goal.plan.category}
                      </span>
                    </div>
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${totalTrainingDays > 0 ? (completedDays / totalTrainingDays) * 100 : 0}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{completedDays}/{totalTrainingDays} training days completed</p>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-700 p-4 space-y-3">
                      {goal.plan.weeklyPlans.map((week, weekIndex) => {
                        const weekTrainingDays = week.days.filter(d => d.isTrainingDay);
                        const weekCompletedDays = weekTrainingDays.filter((d, dIndex) => 
                          isGoalDayCompleted(goal.id, weekIndex, week.days.indexOf(d))).length;
                        const isWeekExpanded = selectedWeek === weekIndex;

                        return (
                          <div key={weekIndex} className="bg-slate-900/50 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setSelectedWeek(isWeekExpanded ? null : weekIndex)}
                              className="w-full p-3 text-left flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  weekCompletedDays === weekTrainingDays.length && weekTrainingDays.length > 0
                                    ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-white'
                                }`}>
                                  {weekCompletedDays === weekTrainingDays.length && weekTrainingDays.length > 0 ? '✓' : week.week}
                                </div>
                                <div>
                                  <p className="font-medium text-white">Week {week.week}</p>
                                  <p className="text-xs text-slate-400">{weekCompletedDays}/{weekTrainingDays.length} days completed</p>
                                </div>
                              </div>
                              <span className="text-slate-400">{isWeekExpanded ? '▲' : '▼'}</span>
                            </button>

                            {isWeekExpanded && (
                              <div className="border-t border-slate-700 p-3 space-y-2">
                                {week.days.map((day, dayIndex) => {
                                  if (day.isRestDay) {
                                    return (
                                      <div key={dayIndex} className="p-3 bg-slate-800/50 rounded-lg text-slate-500 text-sm">
                                        {day.dayName} - Rest Day 🛌
                                      </div>
                                    );
                                  }

                                  const isDayCompleted = isGoalDayCompleted(goal.id, weekIndex, dayIndex);

                                  return (
                                    <div key={dayIndex} className={`p-3 rounded-lg ${isDayCompleted ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800'}`}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          {isDayCompleted ? <span className="text-green-400">✓</span> : <span className="text-slate-500">○</span>}
                                          <span className={`font-medium ${isDayCompleted ? 'text-green-400' : 'text-white'}`}>{day.dayName}</span>
                                          <span className="text-xs text-slate-500">• {day.focus}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Show drills for this day */}
                                      <div className="space-y-2 mt-2">
                                        {day.drills.map((drill, drillIndex) => (
                                          <div key={drillIndex} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                                            <div>
                                              <p className="text-sm text-white">{drill.name}</p>
                                              <p className="text-xs text-slate-400">{drill.duration} min • {drill.category}</p>
                                            </div>
                                            {!isDayCompleted && (
                                              <button
                                                onClick={() => {
                                                  setLoggingItem(drill);
                                                  setLoggingContext({ type: 'goal', goalId: goal.id, weekIndex, dayIndex });
                                                }}
                                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-400"
                                              >
                                                Log
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {day.drills.length === 0 && (
                                        <p className="text-xs text-slate-500 mt-2">No drills assigned for this day</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Goal actions */}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => {
                            saveGoals(personalGoals.map(g => g.id === goal.id ? { ...g, status: 'completed' } : g));
                            setSelectedGoal(null);
                          }}
                          className="flex-1 p-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {
                            saveGoals(personalGoals.filter(g => g.id !== goal.id));
                            setSelectedGoal(null);
                          }}
                          className="flex-1 p-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Info card */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h4 className="font-medium text-white">AI-Powered Training</h4>
                <p className="text-slate-400 text-sm mt-1">
                  Tell us your goal and we'll create a personalized training plan with drills and workouts tailored to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowGoalModal(false)}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Create a Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">What do you want to improve?</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g., Improve my three-point shooting, Get better ball handling..."
                  rows={3}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Timeframe</label>
                <select
                  value={newGoal.timeframe}
                  onChange={(e) => setNewGoal(p => ({ ...p, timeframe: e.target.value }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="2 weeks">2 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="6 weeks">6 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="12 weeks">12 weeks</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Days per week</label>
                  <select
                    value={newGoal.daysPerWeek}
                    onChange={(e) => setNewGoal(p => ({ ...p, daysPerWeek: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Minutes/session</label>
                  <select
                    value={newGoal.minutesPerDay}
                    onChange={(e) => setNewGoal(p => ({ ...p, minutesPerDay: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    {[30, 45, 60, 75, 90].map(n => <option key={n} value={n}>{n} min</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.description}
                className="w-full p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 disabled:opacity-50"
              >
                Generate Training Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal - Full version with all fields */}
      {loggingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => { setLoggingItem(null); setLoggingContext(null); }}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">Log {loggingItem.name}</h2>
            <p className="text-slate-400 text-sm mb-4">{loggingItem.category} • {loggingItem.duration} min</p>

            <div className="space-y-4">
              {/* Shooting metrics */}
              {loggingItem.requiresAccuracyLog && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Makes</label>
                    <input
                      type="number"
                      value={logData.makes}
                      onChange={(e) => setLogData(p => ({ ...p, makes: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Attempts</label>
                    <input
                      type="number"
                      value={logData.attempts}
                      onChange={(e) => setLogData(p => ({ ...p, attempts: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Workout metrics */}
              {loggingItem.metrics?.includes('sets') && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sets</label>
                    <input
                      type="number"
                      value={logData.sets}
                      onChange={(e) => setLogData(p => ({ ...p, sets: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Reps</label>
                    <input
                      type="number"
                      value={logData.reps}
                      onChange={(e) => setLogData(p => ({ ...p, reps: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Weight</label>
                    <input
                      type="number"
                      value={logData.weight}
                      onChange={(e) => setLogData(p => ({ ...p, weight: e.target.value }))}
                      placeholder="lbs"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                </div>
              )}

              {/* Difficulty slider */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How hard was it? {logData.difficulty}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={logData.difficulty}
                  onChange={(e) => setLogData(p => ({ ...p, difficulty: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Easy</span>
                  <span>Hard</span>
                </div>
              </div>

              {/* Soreness */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Any soreness or pain?</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'none', label: 'None', color: 'green' },
                    { value: 'mild', label: 'Mild', color: 'yellow' },
                    { value: 'moderate', label: 'Moderate', color: 'orange' },
                    { value: 'severe', label: 'Severe', color: 'red' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLogData(p => ({ ...p, soreness: option.value }))}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        logData.soreness === option.value
                          ? option.color === 'green' ? 'bg-green-500 text-white' :
                            option.color === 'yellow' ? 'bg-yellow-500 text-black' :
                            option.color === 'orange' ? 'bg-orange-500 text-white' :
                            'bg-red-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                <textarea
                  value={logData.notes}
                  onChange={(e) => setLogData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="How did it go? Any issues?"
                  rows={2}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                />
              </div>

              <button
                onClick={handleLog}
                className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAssignments;
