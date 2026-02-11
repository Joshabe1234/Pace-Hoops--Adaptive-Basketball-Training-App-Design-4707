import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getPlayerAssignments, 
  getDrill, 
  getWorkout, 
  createLog,
  getPlayerLogs,
  getAllDrills,
  getAllWorkouts
} from '../../data/database';
import paceAI from '../../services/paceAI';

const PlayerAssignments = ({ user, team }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loggingItem, setLoggingItem] = useState(null);
  const [activeTab, setActiveTab] = useState(team ? 'team' : 'personal');
  const [showGoalModal, setShowGoalModal] = useState(false);
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
    time: '',
    difficulty: 3,
    soreness: 'none',
    notes: ''
  });

  const logs = getPlayerLogs(user.id);
  const assignments = team ? getPlayerAssignments(user.id, team.id) : [];

  const saveGoals = (goals) => {
    setPersonalGoals(goals);
    localStorage.setItem(`paceHoops_goals_${user.id}`, JSON.stringify(goals));
  };

  const handleCreateGoal = () => {
    if (!newGoal.description) return;

    // Generate training plan using AI
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

  const isGoalDrillLogged = (goalId, drillId, weekNum, dayNum) => {
    return logs.some(l => 
      l.assignmentId === `${goalId}_w${weekNum}_d${dayNum}` && l.itemId === drillId
    );
  };

  const handleLog = (assignmentId) => {
    if (!loggingItem) return;

    createLog(user.id, {
      assignmentId: assignmentId || selectedAssignment?.id,
      itemId: loggingItem.id,
      itemType: loggingItem.requiresAccuracyLog !== undefined ? 'drill' : 'workout',
      makes: logData.makes ? parseInt(logData.makes) : undefined,
      attempts: logData.attempts ? parseInt(logData.attempts) : undefined,
      sets: logData.sets ? parseInt(logData.sets) : undefined,
      reps: logData.reps ? parseInt(logData.reps) : undefined,
      weight: logData.weight ? parseFloat(logData.weight) : undefined,
      time: logData.time ? parseInt(logData.time) : undefined,
      difficulty: logData.difficulty,
      soreness: logData.soreness,
      notes: logData.notes,
      completed: true
    });

    setLogData({ makes: '', attempts: '', sets: '', reps: '', weight: '', time: '', difficulty: 3, soreness: 'none', notes: '' });
    setLoggingItem(null);
  };

  const pendingAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date());
  const activeGoals = personalGoals.filter(g => g.status === 'active');

  return (
    <div className="p-6 space-y-6">
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
              activeTab === 'team' 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team Assignments
          </button>
        )}
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'personal' 
              ? 'bg-blue-500 text-white' 
              : 'text-slate-400 hover:text-white'
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
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-slate-400">No pending assignments from your coach</p>
              <p className="text-slate-500 text-sm mt-1">Check back later or work on your personal goals</p>
            </div>
          ) : (
            pendingAssignments.map((assignment) => {
              const items = assignment.items.map(id => getItemDetails(id, assignment.type)).filter(Boolean);
              const completedCount = items.filter(item => isItemLogged(assignment.id, item.id)).length;

              return (
                <div 
                  key={assignment.id} 
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedAssignment(selectedAssignment?.id === assignment.id ? null : assignment)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{assignment.title}</h3>
                        <p className="text-sm text-slate-400">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {completedCount}/{items.length}
                      </span>
                    </div>
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
                        style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedAssignment?.id === assignment.id && (
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
                              <div 
                                key={item.id}
                                className={`p-4 rounded-xl ${isLogged ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-700/50'}`}
                              >
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLoggingItem(item);
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
          {/* Create Goal Button */}
          <button
            onClick={() => setShowGoalModal(true)}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium hover:from-blue-400 hover:to-blue-500 transition-all flex items-center justify-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Create New Goal</span>
          </button>

          {activeGoals.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Personal Goals Yet</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Create a goal and our AI will generate a personalized training plan to help you improve.
              </p>
            </div>
          ) : (
            activeGoals.map((goal) => (
              <div key={goal.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{goal.description}</h3>
                      <p className="text-sm text-slate-400">
                        {goal.plan.totalWeeks} weeks • {goal.plan.sessionsPerWeek}x/week • {goal.minutesPerDay} min/session
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400">
                      {goal.plan.category}
                    </span>
                  </div>

                  {/* Weekly breakdown */}
                  <div className="mt-4 space-y-2">
                    {goal.plan.weeklyPlans.slice(0, 2).map((week) => (
                      <div key={week.week} className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-white mb-2">Week {week.week}</p>
                        <div className="flex flex-wrap gap-2">
                          {week.days.filter(d => d.isTrainingDay).slice(0, 3).map((day) => (
                            <div key={day.dayOfWeek} className="text-xs">
                              <span className="text-slate-400">{day.dayName.slice(0, 3)}:</span>
                              <span className="text-slate-300 ml-1">{day.drills.length} drills</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {goal.plan.weeklyPlans.length > 2 && (
                      <p className="text-xs text-slate-500 text-center">
                        + {goal.plan.weeklyPlans.length - 2} more weeks
                      </p>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        const updatedGoals = personalGoals.map(g => 
                          g.id === goal.id ? { ...g, status: 'completed' } : g
                        );
                        saveGoals(updatedGoals);
                      }}
                      className="flex-1 p-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => {
                        const updatedGoals = personalGoals.filter(g => g.id !== goal.id);
                        saveGoals(updatedGoals);
                      }}
                      className="flex-1 p-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Info about personal goals */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h4 className="font-medium text-white">AI-Powered Training</h4>
                <p className="text-slate-400 text-sm mt-1">
                  Tell us your goal (e.g., "Improve my three-point shooting" or "Get better handles") 
                  and we'll create a personalized training plan with drills and workouts tailored to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
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
              className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create a Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">What do you want to improve?</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.g., Improve my three-point shooting, Get better ball handling, Increase vertical jump..."
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
                      {[2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} days</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Minutes per session</label>
                    <select
                      value={newGoal.minutesPerDay}
                      onChange={(e) => setNewGoal(p => ({ ...p, minutesPerDay: parseInt(e.target.value) }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    >
                      {[30, 45, 60, 75, 90].map(n => (
                        <option key={n} value={n}>{n} min</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateGoal}
                  disabled={!newGoal.description}
                  className="w-full p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50"
                >
                  Generate Training Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Modal */}
      <AnimatePresence>
        {loggingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setLoggingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-2">Log {loggingItem.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{loggingItem.category}</p>

              <div className="space-y-4">
                {loggingItem.requiresAccuracyLog && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Makes</label>
                      <input
                        type="number"
                        value={logData.makes}
                        onChange={(e) => setLogData(p => ({ ...p, makes: e.target.value }))}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Attempts</label>
                      <input
                        type="number"
                        value={logData.attempts}
                        onChange={(e) => setLogData(p => ({ ...p, attempts: e.target.value }))}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      />
                    </div>
                  </div>
                )}

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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Any soreness?</label>
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={logData.notes}
                    onChange={(e) => setLogData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="How did it go?"
                    rows={2}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white resize-none"
                  />
                </div>

                <button
                  onClick={() => handleLog()}
                  className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400"
                >
                  Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerAssignments;
