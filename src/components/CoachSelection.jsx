import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiStar, FiTarget } = FiIcons;

const CoachSelection = ({ coaches, onSelectCoach, selectedCoach }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your AI Coach</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Each coach brings their unique philosophy and methodology. Select a coaching style that matches your goals and how you like to train.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {coaches.map((coach, index) => (
          <motion.div
            key={coach.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-lg ${
              selectedCoach?.id === coach.id
                ? 'border-blue-500 bg-blue-50 shadow-blue-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onSelectCoach(coach)}
          >
            <div className="flex items-start space-x-4">
              <div className="relative">
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-md"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.name)}&size=80&background=3b82f6&color=fff`;
                  }}
                />
                {selectedCoach?.id === coach.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{coach.name}</h3>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">4.9</span>
                  </div>
                </div>
                
                <p className="text-sm font-semibold text-blue-600 mb-2">{coach.title}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{coach.philosophy}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiTarget} className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">{coach.specialty}</span>
                  </div>
                  
                  {selectedCoach?.id === coach.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-1 text-blue-600"
                    >
                      <span className="text-sm font-semibold">Continue</span>
                      <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Coach Methods Tags */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {coach.methods.map((method, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                  >
                    {method.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CoachSelection;
