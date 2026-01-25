import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTarget, FiClock, FiCalendar, FiSend, FiArrowLeft, FiInfo, FiChevronDown, FiChevronUp } = FiIcons;

const GoalInput = ({ coach, user, onSubmitGoal, isLoading, onBack }) => {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [showAvailability, setShowAvailability] = useState(false);
  const [availability, setAvailability] = useState({
    daysPerWeek: '',
    minutesPerDay: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goal.trim() && timeframe.trim()) {
      onSubmitGoal({
        description: goal.trim(),
        timeframe: timeframe.trim(),
        coachId: coach.id,
        availability: showAvailability ? availability : {}
      });
    }
  };

  const exampleGoals = [
    { text: "Improve my jump shot accuracy", icon: "🎯" },
    { text: "Master ball handling under pressure", icon: "🏀" },
    { text: "Develop better defensive footwork", icon: "🦶" },
    { text: "Increase my shooting range", icon: "📏" },
    { text: "Build basketball conditioning", icon: "💪" }
  ];

  const timeframeOptions = [
    { value: "1 week", label: "1 Week", description: "Intense focus" },
    { value: "2 weeks", label: "2 Weeks", description: "Recommended" },
    { value: "1 month", label: "1 Month", description: "Steady progress" },
    { value: "2 months", label: "2 Months", description: "Deep development" },
    { value: "3 months", label: "3 Months", description: "Mastery track" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Coach Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center space-x-4">
            <img
              src={coach.image}
              alt={coach.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.name)}&size=64&background=ffffff&color=3b82f6`;
              }}
            />
            <div>
              <h3 className="font-bold text-xl">{coach.name}</h3>
              <p className="text-blue-100">{coach.title}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span className="text-sm">Choose different coach</span>
          </button>

          {/* Goal Input */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <SafeIcon icon={FiTarget} className="w-4 h-4 text-blue-600" />
              <span>What's your training goal?</span>
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe what you want to improve or achieve..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
              rows={3}
              required
            />
            
            {/* Example Goals */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {exampleGoals.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setGoal(example.text)}
                    className={`flex items-center space-x-1 text-xs px-3 py-2 rounded-full transition-all ${
                      goal === example.text
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    <span>{example.icon}</span>
                    <span>{example.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeframe Input */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-600" />
              <span>Training Timeframe</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTimeframe(option.value)}
                  className={`p-3 text-center border rounded-xl transition-all ${
                    timeframe === option.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>
            
            {/* Custom timeframe input */}
            <div className="mt-3">
              <input
                type="text"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="Or type custom (e.g., '10 days')"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Training Availability Toggle */}
          <div className="bg-gray-50 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setShowAvailability(!showAvailability)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Custom Training Schedule</span>
                <span className="text-xs text-gray-400">(optional)</span>
              </div>
              <SafeIcon 
                icon={showAvailability ? FiChevronUp : FiChevronDown} 
                className="w-4 h-4 text-gray-400" 
              />
            </button>
            
            {showAvailability && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <SafeIcon icon={FiInfo} className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Leave blank to let Pace automatically determine the optimal schedule based on your age and goal timeframe.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Days per week</label>
                    <select
                      value={availability.daysPerWeek}
                      onChange={(e) => setAvailability({...availability, daysPerWeek: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Auto-select</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="4">4 days</option>
                      <option value="5">5 days</option>
                      <option value="6">6 days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minutes per day</label>
                    <select
                      value={availability.minutesPerDay}
                      onChange={(e) => setAvailability({...availability, minutesPerDay: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Auto-select (~45 min)</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!goal.trim() || !timeframe.trim() || isLoading}
            whileHover={{ scale: (!goal.trim() || !timeframe.trim() || isLoading) ? 1 : 1.02 }}
            whileTap={{ scale: (!goal.trim() || !timeframe.trim() || isLoading) ? 1 : 0.98 }}
            className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
              !goal.trim() || !timeframe.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <SafeIcon icon={FiSend} className="w-5 h-5" />
                <span>Generate Training Plan</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Coach Philosophy Reminder */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-700">{coach.name}'s approach:</span>{' '}
              {coach.philosophy}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoalInput;
