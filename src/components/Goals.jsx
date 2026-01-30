import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  getCurrentGoals, 
  getPreviousGoals, 
  reactivateGoal, 
  markGoalComplete,
  getCoach,
  getPlanByGoal
} from '../data/database';
import { paceBrain } from '../services/paceBrain';

const { FiPlus, FiTarget, FiClock, FiChevronRight, FiArchive, FiRefreshCw, FiStar, FiLock, FiEdit2 } = FiIcons;

const Goals = ({ user, onSelectGoal, onNewGoal, onCustomPlan, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('current');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const currentGoals = getCurrentGoals(user.id);
  const previousGoals = getPreviousGoals(user.id);
  const goalLimit = user.isPremium ? 20 : 10;

  const handleReactivateGoal = (goalId) => {
    try {
      reactivateGoal(goalId, user.id);
      onRefresh();
    } catch (error) {
      if (error.message.includes('limit')) {
        setShowPremiumModal(true);
      } else {
        alert(error.message);
      }
    }
  };

  const handleArchiveGoal = (goalId) => {
    markGoalComplete(goalId);
    onRefresh();
  };

  const handleNewGoalClick = () => {
    if (currentGoals.length >= goalLimit) {
      setShowPremiumModal(true);
    } else {
      onNewGoal();
    }
  };

  const GoalCard = ({ goal, isCurrentGoal }) => {
    const coach = getCoach(goal.coachId);
    const plan = getPlanByGoal(goal.id);
    const progress = plan ? paceBrain.calculateProgress(goal, plan) : { sessions: 0 };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
        onClick={() => onSelectGoal(goal)}
      >
        {/* Coach Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <div className="flex items-center space-x-3">
            <img
              src={coach?.image}
              alt={coach?.name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white/30"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coach?.name || 'Coach')}&size=48&background=ffffff&color=3b82f6`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-medium">Training with</p>
              <p className="text-white font-semibold truncate">{coach?.name || 'Coach'}</p>
            </div>
            <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-white/60" />
          </div>
        </div>

        {/* Goal Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{goal.description}</h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiClock} className="w-4 h-4" />
              <span>{goal.timeframe}</span>
            </div>
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiTarget} className="w-4 h-4" />
              <span>{progress.completedCount || 0}/{progress.totalCount || 0} sessions</span>
            </div>
          </div>

          {/* Progress Bar */}
          {isCurrentGoal && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progress.sessions}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.sessions}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {progress.accuracy !== null && (
                <p className="text-xs text-gray-500 mt-2">
                  Shooting accuracy: <span className="font-medium text-blue-600">{progress.accuracy}%</span>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons for Previous Goals */}
          {!isCurrentGoal && (
            <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactivateGoal(goal.id);
                }}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                <span>Reactivate</span>
              </button>
            </div>
          )}

          {/* Archive Button for Current Goals */}
          {isCurrentGoal && progress.sessions === 100 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveGoal(goal.id);
              }}
              className="mt-3 w-full flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              <SafeIcon icon={FiArchive} className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Goals</h1>
          <p className="text-gray-500">
            {currentGoals.length} of {goalLimit} active goals
            {!user.isPremium && currentGoals.length >= 5 && (
              <span className="text-yellow-600 ml-2">• Upgrade for more</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={onCustomPlan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            <SafeIcon icon={FiEdit2} className="w-5 h-5" />
            <span>Custom Plan</span>
          </motion.button>
          
          <motion.button
            onClick={handleNewGoalClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            <span>New Goal</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'current'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <SafeIcon icon={FiTarget} className="w-4 h-4" />
          <span>Current ({currentGoals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('previous')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'previous'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <SafeIcon icon={FiArchive} className="w-4 h-4" />
          <span>Previous ({previousGoals.length})</span>
        </button>
      </div>

      {/* Goals Grid */}
      <AnimatePresence mode="wait">
        {activeTab === 'current' ? (
          <motion.div
            key="current"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {currentGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {currentGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} isCurrentGoal={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiTarget} className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active goals</h3>
                <p className="text-gray-500 mb-4">Create your first goal to start training</p>
                <button
                  onClick={onNewGoal}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Create Goal</span>
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="previous"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {previousGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {previousGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} isCurrentGoal={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiArchive} className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed goals yet</h3>
                <p className="text-gray-500">Goals you complete will appear here</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiStar} className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Goal Limit Reached</h3>
              <p className="text-gray-500 mb-6">
                You've reached the maximum of {goalLimit} active goals. 
                {!user.isPremium && ' Upgrade to Premium for up to 20 active goals!'}
              </p>
              
              {!user.isPremium ? (
                <div className="space-y-3">
                  <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg">
                    Upgrade to Premium
                  </button>
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Got It
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals;
