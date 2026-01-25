import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiActivity, FiArrowRight, FiArrowLeft } = FiIcons;

const UserOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    skillLevel: '',
    athleticism: '',
    injuries: 'none'
  });

  const steps = [
    {
      title: 'Basic Information',
      icon: FiUser,
      fields: ['name', 'age']
    },
    {
      title: 'Physical Profile',
      icon: FiActivity,
      fields: ['height', 'weight', 'skillLevel', 'athleticism', 'injuries']
    }
  ];

  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner', description: 'Learning the basics of basketball' },
    { value: 'intermediate', label: 'Intermediate', description: 'Playing regularly, know fundamentals' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive level player' }
  ];

  const athleticismOptions = [
    { value: 'low', label: 'Developing', description: 'Building athletic foundation' },
    { value: 'moderate', label: 'Moderate', description: 'Decent speed and coordination' },
    { value: 'high', label: 'Athletic', description: 'Strong speed, agility, and coordination' }
  ];

  const injuryOptions = [
    { value: 'none', label: 'No Injuries', description: 'Ready for full training' },
    { value: 'mild', label: 'Minor Issues', description: 'Small aches or recovering' },
    { value: 'moderate', label: 'Limited', description: 'Some movements restricted' },
    { value: 'severe', label: 'Significant', description: 'Major limitations - focus on recovery' }
  ];

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepComplete = (stepIndex) => {
    const step = steps[stepIndex];
    return step.fields.every(field => {
      if (field === 'height' || field === 'weight') return true; // Optional
      return userData[field] && userData[field].toString().trim() !== '';
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What's your name?</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How old are you?</label>
              <input
                type="number"
                value={userData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                min="8"
                max="99"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                Your age helps us customize training intensity and recovery recommendations.
              </p>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (optional)</label>
                <input
                  type="text"
                  value={userData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="e.g., 5'10&quot;"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (optional)</label>
                <input
                  type="text"
                  value={userData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="e.g., 165 lbs"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Basketball Skill Level</label>
              <div className="space-y-2">
                {skillLevelOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('skillLevel', option.value)}
                    className={`w-full p-4 text-left border rounded-xl transition-all ${
                      userData.skillLevel === option.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Overall Athleticism</label>
              <div className="space-y-2">
                {athleticismOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('athleticism', option.value)}
                    className={`w-full p-4 text-left border rounded-xl transition-all ${
                      userData.athleticism === option.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Current Injury Status</label>
              <div className="grid grid-cols-2 gap-2">
                {injuryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('injuries', option.value)}
                    className={`p-3 text-left border rounded-xl transition-all ${
                      userData.injuries === option.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
          >
            <SafeIcon icon={steps[currentStep].icon} className="w-8 h-8 text-blue-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
          <p className="text-gray-500">
            {currentStep === 0 
              ? "Let's get to know you" 
              : "Tell us about your physical profile"}
          </p>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <motion.button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
            whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            disabled={!isStepComplete(currentStep)}
            whileHover={{ scale: !isStepComplete(currentStep) ? 1 : 1.02 }}
            whileTap={{ scale: !isStepComplete(currentStep) ? 1 : 0.98 }}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-colors ${
              !isStepComplete(currentStep)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span>{currentStep === steps.length - 1 ? 'Start Training' : 'Next'}</span>
            <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
