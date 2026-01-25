import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getLogsByGoal, logAccuracy } from '../data/database';
import { paceBrain } from '../services/paceBrain';

const { 
  FiCalendar, FiClock, FiTarget, FiTrendingUp, FiAlertCircle, FiCheck, 
  FiChevronDown, FiChevronUp, FiPlay, FiVideo, FiClipboard, FiBarChart2,
  FiCheckCircle
} = FiIcons;

const TrainingPlan = ({ plan, coach, goal, user, onLogSession, onRefreshGoal }) => {
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLogsHistory, setShowLogsHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [accuracyInputs, setAccuracyInputs] = useState({});
  const [logData, setLogData] = useState({
    completed: 'yes',
    difficulty: 3,
    soreness: 'none',
    notes: ''
  });

  if (!plan || !plan.weeklyPlans) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No training plan available. Create a goal first.</p>
      </div>
    );
  }

  const sessionLogs = getLogsByGoal(goal.id);
  const progress = paceBrain.calculateProgress(goal, plan);
  const completedSessions = goal.completedSessions || [];

  const handleOpenLogModal = (day) => {
    setSelectedSession(day);
    setAccuracyInputs({});
    setShowLogModal(true);
  };

  const handleLogSession = () => {
    // Log accuracy for shooting drills
    if (selectedSession && selectedSession.drills) {
      selectedSession.drills.forEach(drill => {
        if (drill.requiresAccuracyLog && accuracyInputs[drill.id]) {
          const { makes, attempts } = accuracyInputs[drill.id];
          if (makes !== undefined && attempts !== undefined && attempts > 0) {
            logAccuracy(goal.id, drill.id, selectedSession.sessionNumber, parseInt(makes), parseInt(attempts));
          }
        }
      });
    }

    onLogSession({
      ...logData,
      sessionIndex: selectedSession.sessionNumber - 1,
      dayNumber: selectedSession.dayNumber,
      planId: plan.id,
      goalId: goal.id,
      userId: user.id,
      accuracyData: accuracyInputs
    });

    setShowLogModal(false);
    setLogData({
      completed: 'yes',
      difficulty: 3,
      soreness: 'none',
      notes: ''
    });
    setAccuracyInputs({});
    onRefreshGoal();
  };

  const isSessionCompleted = (sessionNumber) => {
    return completedSessions.includes(sessionNumber - 1);
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'build-up': return 'bg-blue-100 text-blue-700';
      case 'peak': return 'bg-orange-100 text-orange-700';
      case 'taper': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (value) => {
    const labels = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Moderate',
      4: 'Hard',
      5: 'Very Hard'
    };
    return labels[value] || 'Moderate';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Progress */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={coach?.image}
                alt={coach?.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coach?.name || 'Coach')}&size=64&background=ffffff&color=3b82f6`;
                }}
              />
              <div>
                <h1 className="text-xl font-bold">{goal.description}</h1>
                <p className="text-blue-100">Training with {coach?.name} • {goal.timeframe}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-lg font-bold text-blue-600">{progress.sessions}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.sessions}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{plan.totalSessions}</div>
              <div className="text-xs text-gray-500">Total Sessions</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{progress.completedCount}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{plan.sessionsPerWeek}</div>
              <div className="text-xs text-gray-500">Per Week</div>
            </div>
            
            {progress.accuracy !== null && (
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{progress.accuracy}%</div>
                <div className="text-xs text-gray-500">Shooting Accuracy</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session History Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowLogsHistory(!showLogsHistory)}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <SafeIcon icon={FiClipboard} className="w-4 h-4" />
          <span>Session History ({sessionLogs.length})</span>
          <SafeIcon icon={showLogsHistory ? FiChevronUp : FiChevronDown} className="w-4 h-4" />
        </button>
      </div>

      {/* Session History Panel */}
      <AnimatePresence>
        {showLogsHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Previous Session Logs</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sessionLogs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {sessionLogs.map((log, index) => (
                    <div key={log.id || index} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Day {log.dayNumber || log.sessionIndex + 1}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          log.completed === 'yes' ? 'bg-green-100 text-green-700' :
                          log.completed === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.completed === 'yes' ? 'Completed' : log.completed === 'partial' ? 'Partial' : 'Skipped'}
                        </span>
                        <span>Difficulty: {getDifficultyLabel(log.difficulty)}</span>
                        <span>Soreness: {log.soreness}</span>
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic">"{log.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No sessions logged yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Plans */}
      <div className="space-y-4">
        {plan.weeklyPlans.map((week, weekIndex) => (
          <div key={weekIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Week Header */}
            <button
              onClick={() => setExpandedWeek(expandedWeek === weekIndex ? -1 : weekIndex)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-blue-600">{week.week}</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Week {week.week}</h3>
                  <p className="text-sm text-gray-500">
                    {week.days.filter(d => d.isTrainingDay).length} training days
                  </p>
                </div>
              </div>
              <SafeIcon 
                icon={expandedWeek === weekIndex ? FiChevronUp : FiChevronDown} 
                className="w-5 h-5 text-gray-400" 
              />
            </button>

            {/* Week Content */}
            <AnimatePresence>
              {expandedWeek === weekIndex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-4 space-y-2">
                    {week.days.map((day, dayIndex) => {
                      const dayKey = `${weekIndex}-${dayIndex}`;
                      const isExpanded = expandedDay === dayKey;
                      const isCompleted = day.isTrainingDay && isSessionCompleted(day.sessionNumber);

                      return (
                        <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Day Header */}
                          <button
                            onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                            className={`w-full p-3 flex items-center justify-between transition-colors ${
                              day.isRestDay 
                                ? 'bg-gray-50' 
                                : isCompleted 
                                ? 'bg-green-50' 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                day.isRestDay 
                                  ? 'bg-gray-200 text-gray-500' 
                                  : isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {isCompleted ? (
                                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                                ) : (
                                  <span className="text-sm font-bold">{day.dayNumber}</span>
                                )}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">
                                    Day {day.dayNumber} - {day.dayName}
                                  </span>
                                  {day.isTrainingDay && day.phase && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPhaseColor(day.phase)}`}>
                                      {day.phase}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {day.isRestDay ? 'Rest Day' : `${day.focus} • ${day.estimatedDuration}min`}
                                </p>
                              </div>
                            </div>
                            {day.isTrainingDay && (
                              <SafeIcon 
                                icon={isExpanded ? FiChevronUp : FiChevronDown} 
                                className="w-4 h-4 text-gray-400" 
                              />
                            )}
                          </button>

                          {/* Day Drills (Expanded) */}
                          {day.isTrainingDay && isExpanded && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-4 border-t border-gray-200 bg-gray-50"
                            >
                              <div className="space-y-4">
                                {/* Skill Drills */}
                                {day.drills.filter(d => d.type === 'skill').length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                      <SafeIcon icon={FiTarget} className="w-4 h-4" />
                                      <span>Skill Drills</span>
                                    </h4>
                                    <div className="space-y-3">
                                      {day.drills.filter(d => d.type === 'skill').map((drill, drillIndex) => (
                                        <DrillCard key={drillIndex} drill={drill} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Cardio Drills */}
                                {day.drills.filter(d => d.type === 'cardio').length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                      <SafeIcon icon={FiTrendingUp} className="w-4 h-4" />
                                      <span>Cardio/Conditioning</span>
                                    </h4>
                                    <div className="space-y-3">
                                      {day.drills.filter(d => d.type === 'cardio').map((drill, drillIndex) => (
                                        <DrillCard key={drillIndex} drill={drill} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Log Session Button */}
                                {!isCompleted && (
                                  <button
                                    onClick={() => handleOpenLogModal(day)}
                                    className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    <SafeIcon icon={FiCheck} className="w-4 h-4" />
                                    <span>Complete & Log Session</span>
                                  </button>
                                )}

                                {isCompleted && (
                                  <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                                    <p className="text-green-700 font-medium flex items-center justify-center space-x-2">
                                      <SafeIcon icon={FiCheckCircle} className="w-5 h-5" />
                                      <span>Session Completed!</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Injury Notice */}
      {user.injuries && user.injuries !== 'none' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Injury Modifications Active</h4>
              <p className="text-sm text-yellow-700">
                Your training plan has been adjusted for your injury status. Focus on proper form.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showLogModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Log Session - Day {selectedSession.dayNumber}
            </h3>
            
            <div className="space-y-5">
              {/* Completion Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Did you complete the session?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'yes', label: 'Yes', color: 'green' },
                    { value: 'partial', label: 'Partial', color: 'yellow' },
                    { value: 'no', label: 'No', color: 'red' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLogData({...logData, completed: option.value})}
                      className={`p-3 text-sm font-medium border rounded-xl transition-all ${
                        logData.completed === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How difficult was it? <span className="text-blue-600 font-semibold">{getDifficultyLabel(logData.difficulty)}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={logData.difficulty}
                  onChange={(e) => setLogData({...logData, difficulty: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Easy</span>
                  <span>Very Hard</span>
                </div>
              </div>
              
              {/* Soreness Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soreness Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['none', 'mild', 'severe'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setLogData({...logData, soreness: option})}
                      className={`p-3 text-sm font-medium border rounded-xl transition-all ${
                        logData.soreness === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shooting Accuracy Inputs */}
              {selectedSession.drills.some(d => d.requiresAccuracyLog) && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                    <SafeIcon icon={FiBarChart2} className="w-4 h-4" />
                    <span>Track Your Shooting</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedSession.drills.filter(d => d.requiresAccuracyLog).map((drill) => (
                      <div key={drill.id} className="bg-white p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">{drill.name}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Makes</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={accuracyInputs[drill.id]?.makes || ''}
                              onChange={(e) => setAccuracyInputs({
                                ...accuracyInputs,
                                [drill.id]: { ...accuracyInputs[drill.id], makes: e.target.value }
                              })}
                              className="w-full p-2 border border-gray-200 rounded-lg text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Attempts</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="0"
                              value={accuracyInputs[drill.id]?.attempts || ''}
                              onChange={(e) => setAccuracyInputs({
                                ...accuracyInputs,
                                [drill.id]: { ...accuracyInputs[drill.id], attempts: e.target.value }
                              })}
                              className="w-full p-2 border border-gray-200 rounded-lg text-center"
                            />
                          </div>
                        </div>
                        {accuracyInputs[drill.id]?.makes && accuracyInputs[drill.id]?.attempts && (
                          <p className="text-xs text-blue-600 mt-2 text-center">
                            {Math.round((parseInt(accuracyInputs[drill.id].makes) / parseInt(accuracyInputs[drill.id].attempts)) * 100)}% accuracy
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={logData.notes}
                  onChange={(e) => setLogData({...logData, notes: e.target.value})}
                  placeholder="How did it go? Any observations?"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogSession}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Save Log
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Drill Card Component
const DrillCard = ({ drill }) => {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h5 className="font-semibold text-gray-900">{drill.name}</h5>
            {drill.requiresAccuracyLog && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                Track Accuracy
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{drill.category} • {drill.duration} min</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          drill.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
          drill.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {drill.difficulty}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{drill.description}</p>
      
      {drill.modification && (
        <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mb-3">
          <strong>Modified:</strong> {drill.modification}
        </p>
      )}
      
      {/* Video Link */}
      {drill.videoUrl && (
        <a
          href={drill.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 mb-3"
        >
          <SafeIcon icon={FiVideo} className="w-4 h-4" />
          <span>Watch Tutorial</span>
        </a>
      )}

      {/* Steps Toggle */}
      {drill.steps && drill.steps.length > 0 && (
        <div>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <SafeIcon icon={showSteps ? FiChevronUp : FiChevronDown} className="w-4 h-4" />
            <span>{showSteps ? 'Hide' : 'Show'} Steps ({drill.steps.length})</span>
          </button>
          
          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <ol className="space-y-2">
                  {drill.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TrainingPlan;
