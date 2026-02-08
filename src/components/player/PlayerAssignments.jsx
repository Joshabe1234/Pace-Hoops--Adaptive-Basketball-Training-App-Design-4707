import React, { useState } from 'react';
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

  // Handle case where player has no team
  if (!team) {
    return (
      <div className="p-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏋️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Team Yet</h3>
          <p className="text-slate-400">Join a team to receive training assignments from your coach.</p>
        </div>
      </div>
    );
  }

  const assignments = getPlayerAssignments(user.id, team.id);
  const logs = getPlayerLogs(user.id);

  const getItemDetails = (itemId, type) => {
    return type === 'drill' ? getDrill(itemId) : getWorkout(itemId);
  };

  const isItemLogged = (assignmentId, itemId) => {
    return logs.some(l => l.assignmentId === assignmentId && l.itemId === itemId);
  };

  const handleLog = () => {
    if (!loggingItem) return;

    createLog(user.id, {
      assignmentId: selectedAssignment.id,
      itemId: loggingItem.id,
      itemType: selectedAssignment.type,
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
  const pastAssignments = assignments.filter(a => new Date(a.dueDate) < new Date());

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="text-slate-400">Complete your assigned workouts</p>
      </div>

      {/* Pending Assignments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Pending ({pendingAssignments.length})</h2>
        {pendingAssignments.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400">No pending assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => {
              const items = assignment.items.map(id => getItemDetails(id, assignment.type)).filter(Boolean);
              const completedCount = items.filter(item => isItemLogged(assignment.id, item.id)).length;

              return (
                <div 
                  key={assignment.id} 
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                  onClick={() => setSelectedAssignment(selectedAssignment?.id === assignment.id ? null : assignment)}
                >
                  <div className="p-4 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{assignment.title}</h3>
                        <p className="text-sm text-slate-400">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {completedCount}/{items.length}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
                        style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Content */}
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
                                    <p className="text-xs text-slate-500 mt-1">
                                      {item.duration} min • {item.category}
                                    </p>
                                  </div>
                                  {!isLogged && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLoggingItem(item);
                                      }}
                                      className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-400 transition-colors"
                                    >
                                      Log
                                    </button>
                                  )}
                                </div>

                                {/* Steps */}
                                {item.steps && (
                                  <div className="mt-3 pt-3 border-t border-slate-600">
                                    <p className="text-xs font-medium text-slate-400 mb-2">Steps:</p>
                                    <ol className="space-y-1">
                                      {item.steps.map((step, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex">
                                          <span className="text-orange-400 mr-2">{i + 1}.</span>
                                          {step}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
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
          </div>
        )}
      </div>

      {/* Past Assignments */}
      {pastAssignments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-400 mb-4">Past ({pastAssignments.length})</h2>
          <div className="space-y-2 opacity-60">
            {pastAssignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <h3 className="font-medium text-white">{assignment.title}</h3>
                <p className="text-sm text-slate-400">
                  Was due {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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

                {/* Difficulty */}
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Any soreness or pain?
                  </label>
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
                  <p className="text-xs text-slate-500 mt-2">
                    This helps your coach monitor your recovery and adjust your training.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={logData.notes}
                    onChange={(e) => setLogData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="How did it go? Any issues?"
                    rows={2}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white resize-none"
                  />
                </div>

                <button
                  onClick={handleLog}
                  className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors"
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
