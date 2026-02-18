import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getPlayerAssignments, 
  getDrill, 
  getWorkout, 
  createLog,
  getPlayerLogs
} from '../../data/database';

const PlayerAssignments = ({ user, team }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loggingItem, setLoggingItem] = useState(null);
  const [activeTab, setActiveTab] = useState(team ? 'team' : 'personal');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loggingGoalDay, setLoggingGoalDay] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [personalGoals, setPersonalGoals] = useState(() => {
    const stored = localStorage.getItem(`paceHoops_goals_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [newGoal, setNewGoal] = useState({
    description: '',
    focusArea: 'shooting',
    timeframe: 4,
    daysPerWeek: 3,
    minutesPerDay: 45
  });
  
  const [logData, setLogData] = useState({
    makes: '',
    attempts: '',
    sets: '',
    reps: '',
    difficulty: 3,
    soreness: 'none',
    notes: ''
  });
  
  const [dayLogData, setDayLogData] = useState({
    difficulty: 3,
    soreness: 'none',
    notes: '',
    feeling: 'good'
  });

  // Auto refresh every 3 seconds to get new assignments
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get fresh data on each render
  const logs = getPlayerLogs(user.id);
  const assignments = team ? getPlayerAssignments(user.id, team.id) : [];

  const saveGoals = (goals) => {
    setPersonalGoals(goals);
    localStorage.setItem(`paceHoops_goals_${user.id}`, JSON.stringify(goals));
  };

  const generateTrainingPlan = (goal) => {
    const focusAreaDrills = {
      shooting: ['form-shooting', 'free-throws', 'spot-shooting', 'off-dribble-shooting'],
      ballHandling: ['stationary-handles', 'two-ball-dribbling'],
      defense: ['defensive-slides'],
      conditioning: ['suicides', 'court-sprints', 'jump-rope'],
      strength: ['squats', 'lunges', 'push-ups', 'planks', 'box-jumps'],
      overall: ['form-shooting', 'free-throws', 'stationary-handles', 'defensive-slides']
    };

    const relevantDrillIds = focusAreaDrills[goal.focusArea] || focusAreaDrills.overall;
    const relevantDrills = relevantDrillIds.map(id => getDrill(id) || getWorkout(id)).filter(Boolean);
    
    const weeks = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const trainingDayIndices = [];
    const gap = Math.floor(7 / goal.daysPerWeek);
    for (let i = 0; i < goal.daysPerWeek; i++) {
      trainingDayIndices.push((i * gap) % 7);
    }

    for (let week = 1; week <= goal.timeframe; week++) {
      const days = [];
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const isTrainingDay = trainingDayIndices.includes(dayIndex);
        
        if (isTrainingDay) {
          const dayDrills = [];
          const numDrills = Math.min(2 + Math.floor(week / 2), 4);
          
          for (let d = 0; d < numDrills; d++) {
            const drillIndex = (dayIndex + d + week) % relevantDrills.length;
            const drill = relevantDrills[drillIndex];
            if (drill) {
              dayDrills.push({
                ...drill,
                sets: 3 + Math.floor(week / 2),
                reps: drill.requiresAccuracyLog ? 10 + (week * 2) : 10,
                targetMakes: drill.requiresAccuracyLog ? Math.floor((10 + week * 2) * 0.7) : null
              });
            }
          }
          
          days.push({
            dayIndex,
            dayName: daysOfWeek[dayIndex],
            isTrainingDay: true,
            drills: dayDrills,
            estimatedTime: goal.minutesPerDay,
            completed: false
          });
        } else {
          days.push({
            dayIndex,
            dayName: daysOfWeek[dayIndex],
            isTrainingDay: false,
            isRestDay: true
          });
        }
      }
      
      weeks.push({ weekNumber: week, days, focus: week <= goal.timeframe / 2 ? 'Foundation' : 'Intensity' });
    }

    return {
      totalWeeks: goal.timeframe,
      sessionsPerWeek: goal.daysPerWeek,
      minutesPerSession: goal.minutesPerDay,
      category: goal.focusArea,
      weeks
    };
  };

  const handleCreateGoal = () => {
    if (!newGoal.description) return;
    const plan = generateTrainingPlan(newGoal);
    const goal = {
      id: `goal_${Date.now()}`,
      ...newGoal,
      plan,
      createdAt: new Date().toISOString(),
      status: 'active',
      progress: { completedDays: 0, totalTrainingDays: newGoal.timeframe * newGoal.daysPerWeek }
    };
    saveGoals([...personalGoals, goal]);
    setNewGoal({ description: '', focusArea: 'shooting', timeframe: 4, daysPerWeek: 3, minutesPerDay: 45 });
    setShowGoalModal(false);
  };

  const handleLogGoalDay = (goalId, weekIndex, dayIndex) => {
    const updatedGoals = personalGoals.map(g => {
      if (g.id === goalId) {
        const updatedWeeks = [...g.plan.weeks];
        updatedWeeks[weekIndex].days[dayIndex] = {
          ...updatedWeeks[weekIndex].days[dayIndex],
          completed: true,
          loggedAt: new Date().toISOString(),
          log: { ...dayLogData }
        };
        const totalCompleted = updatedWeeks.reduce((sum, w) => 
          sum + w.days.filter(d => d.isTrainingDay && d.completed).length, 0
        );
        return {
          ...g,
          plan: { ...g.plan, weeks: updatedWeeks },
          progress: { ...g.progress, completedDays: totalCompleted }
        };
      }
      return g;
    });
    saveGoals(updatedGoals);
    setLoggingGoalDay(null);
    setDayLogData({ difficulty: 3, soreness: 'none', notes: '', feeling: 'good' });
  };

  const getItemDetails = (itemId, type) => {
    return type === 'drill' ? getDrill(itemId) : getWorkout(itemId);
  };

  const isItemLogged = (assignmentId, itemId) => {
    return logs.some(l => l.assignmentId === assignmentId && l.itemId === itemId);
  };

  // Check if ALL items in assignment are logged
  const isAssignmentCompleted = (assignment) => {
    if (!assignment.items || assignment.items.length === 0) return false;
    return assignment.items.every(itemId => isItemLogged(assignment.id, itemId));
  };

  const handleLog = () => {
    if (!loggingItem || !selectedAssignment) return;

    createLog(user.id, {
      assignmentId: selectedAssignment.id,
      itemId: loggingItem.id,
      itemType: loggingItem.requiresAccuracyLog !== undefined ? 'drill' : 'workout',
      makes: logData.makes ? parseInt(logData.makes) : undefined,
      attempts: logData.attempts ? parseInt(logData.attempts) : undefined,
      sets: logData.sets ? parseInt(logData.sets) : undefined,
      reps: logData.reps ? parseInt(logData.reps) : undefined,
      difficulty: logData.difficulty,
      soreness: logData.soreness,
      notes: logData.notes,
      completed: true
    });

    setLogData({ makes: '', attempts: '', sets: '', reps: '', difficulty: 3, soreness: 'none', notes: '' });
    setLoggingItem(null);
    setRefreshKey(k => k + 1); // Force refresh
  };

  // Filter assignments: show all that are not past due, hide completed ones
  const pendingAssignments = assignments.filter(a => {
    const isPastDue = new Date(a.dueDate) < new Date();
    const isCompleted = isAssignmentCompleted(a);
    return !isPastDue && !isCompleted;
  });

  const activeGoals = personalGoals.filter(g => g.status === 'active');

  // No team - show personal goals only
  if (!team) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Training</h1>
          <p className="text-slate-400">Your personal training goals</p>
        </div>

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
          <div className="space-y-4">
            {/* Goals list would go here - same as below */}
          </div>
        )}

        {/* Goal Modal - same as below */}
        {showGoalModal && renderGoalModal()}
      </div>
    );
  }

  const renderGoalModal = () => (
    <AnimatePresence>
      {showGoalModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowGoalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-4">Create a Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">What do you want to improve?</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g., Improve my three-point shooting..."
                  rows={2}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Focus Area</label>
                <select
                  value={newGoal.focusArea}
                  onChange={(e) => setNewGoal(p => ({ ...p, focusArea: e.target.value }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="shooting">Shooting</option>
                  <option value="ballHandling">Ball Handling</option>
                  <option value="defense">Defense</option>
                  <option value="conditioning">Conditioning</option>
                  <option value="strength">Strength</option>
                  <option value="overall">Overall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration: {newGoal.timeframe} weeks</label>
                <input type="range" min="2" max="12" value={newGoal.timeframe} onChange={(e) => setNewGoal(p => ({ ...p, timeframe: parseInt(e.target.value) }))} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Days per week</label>
                  <select value={newGoal.daysPerWeek} onChange={(e) => setNewGoal(p => ({ ...p, daysPerWeek: parseInt(e.target.value) }))} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white">
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Minutes/session</label>
                  <select value={newGoal.minutesPerDay} onChange={(e) => setNewGoal(p => ({ ...p, minutesPerDay: parseInt(e.target.value) }))} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white">
                    {[30, 45, 60, 75, 90].map(n => <option key={n} value={n}>{n} min</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleCreateGoal} disabled={!newGoal.description} className="w-full p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 disabled:opacity-50">
                Create Training Plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-4 md:p-6 space-y-6" key={refreshKey}>
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="text-slate-400">Your workouts and personal goals</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => { setActiveTab('team'); setSelectedGoal(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'team' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Team Assignments
        </button>
        <button
          onClick={() => { setActiveTab('personal'); setSelectedAssignment(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'personal' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Personal Goals
        </button>
      </div>

      {/* Team Assignments Tab */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-slate-400">All caught up!</p>
              <p className="text-slate-500 text-sm mt-1">No pending assignments</p>
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

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-700"
                      >
                        <div className="p-4 space-y-3">
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
                                  </div>
                                  {!isLogged && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setLoggingItem(item); }}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              const progressPercent = Math.round((goal.progress.completedDays / goal.progress.totalTrainingDays) * 100);
              const isExpanded = selectedGoal?.id === goal.id;

              return (
                <div key={goal.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <button onClick={() => { setSelectedGoal(isExpanded ? null : goal); setSelectedWeek(null); }} className="w-full p-4 text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{goal.description}</h3>
                        <p className="text-sm text-slate-400">{goal.plan.totalWeeks} weeks • {goal.plan.sessionsPerWeek}x/week</p>
                      </div>
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400">{progressPercent}%</span>
                    </div>
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-700">
                        <div className="p-4 space-y-3">
                          {goal.plan.weeks.map((week, weekIndex) => {
                            const weekTrainingDays = week.days.filter(d => d.isTrainingDay);
                            const completedDays = weekTrainingDays.filter(d => d.completed).length;
                            const isWeekExpanded = selectedWeek === weekIndex;

                            return (
                              <div key={weekIndex} className="bg-slate-900/50 rounded-xl overflow-hidden">
                                <button onClick={() => setSelectedWeek(isWeekExpanded ? null : weekIndex)} className="w-full p-3 text-left flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${completedDays === weekTrainingDays.length ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-white'}`}>
                                      {completedDays === weekTrainingDays.length ? '✓' : week.weekNumber}
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">Week {week.weekNumber}</p>
                                      <p className="text-xs text-slate-400">{completedDays}/{weekTrainingDays.length} days</p>
                                    </div>
                                  </div>
                                </button>

                                <AnimatePresence>
                                  {isWeekExpanded && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-slate-700">
                                      <div className="p-3 space-y-2">
                                        {week.days.map((day, dayIndex) => {
                                          if (day.isRestDay) {
                                            return <div key={dayIndex} className="p-3 bg-slate-800/50 rounded-lg text-slate-500">{day.dayName} - Rest</div>;
                                          }
                                          return (
                                            <div key={dayIndex} className={`p-3 rounded-lg ${day.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800'}`}>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  {day.completed ? <span className="text-green-400">✓</span> : <span className="text-slate-500">○</span>}
                                                  <span className={day.completed ? 'text-green-400' : 'text-white'}>{day.dayName}</span>
                                                </div>
                                                {!day.completed && (
                                                  <button onClick={() => setLoggingGoalDay({ goalId: goal.id, weekIndex, dayIndex, day })} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg">
                                                    Complete
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}

                          <button onClick={() => { saveGoals(personalGoals.filter(g => g.id !== goal.id)); setSelectedGoal(null); }} className="w-full p-2 bg-red-500/20 text-red-400 rounded-lg text-sm">
                            Delete Goal
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Goal Modal */}
      {renderGoalModal()}

      {/* Log Goal Day Modal */}
      <AnimatePresence>
        {loggingGoalDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setLoggingGoalDay(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Complete {loggingGoalDay.day.dayName}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">How did it go?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['great', 'good', 'okay', 'tired'].map(f => (
                      <button key={f} onClick={() => setDayLogData(p => ({ ...p, feeling: f }))} className={`p-2 rounded-lg text-sm capitalize ${dayLogData.feeling === f ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleLogGoalDay(loggingGoalDay.goalId, loggingGoalDay.weekIndex, loggingGoalDay.dayIndex)} className="w-full p-3 bg-green-500 text-white rounded-xl font-semibold">
                  ✓ Complete Day
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Assignment Item Modal */}
      <AnimatePresence>
        {loggingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setLoggingItem(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Log {loggingItem.name}</h2>
              <div className="space-y-4">
                {loggingItem.requiresAccuracyLog && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Makes</label>
                      <input type="number" value={logData.makes} onChange={(e) => setLogData(p => ({ ...p, makes: e.target.value }))} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Attempts</label>
                      <input type="number" value={logData.attempts} onChange={(e) => setLogData(p => ({ ...p, attempts: e.target.value }))} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Difficulty: {logData.difficulty}/5</label>
                  <input type="range" min="1" max="5" value={logData.difficulty} onChange={(e) => setLogData(p => ({ ...p, difficulty: parseInt(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Soreness</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['none', 'mild', 'moderate', 'severe'].map(s => (
                      <button key={s} onClick={() => setLogData(p => ({ ...p, soreness: s }))} className={`p-2 rounded-lg text-sm capitalize ${logData.soreness === s ? (s === 'none' ? 'bg-green-500' : s === 'mild' ? 'bg-yellow-500' : s === 'moderate' ? 'bg-orange-500' : 'bg-red-500') + ' text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleLog} className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold">Complete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerAssignments;
