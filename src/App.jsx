import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from './common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

// Components
import UserOnboarding from './components/UserOnboarding';
import CoachSelection from './components/CoachSelection';
import GoalInput from './components/GoalInput';
import Goals from './components/Goals';
import TrainingPlan from './components/TrainingPlan';
import Profile from './components/Profile';

// Services
import { 
  initializeDatabase, 
  createUser, 
  getUser,
  updateUser,
  getAllCoaches, 
  getCoach,
  getCoachDrills,
  createGoal,
  getGoal,
  getCurrentGoals,
  createTrainingPlan,
  getPlanByGoal,
  createLog,
  setLastViewedGoal
} from './data/database';
import { paceBrain } from './services/paceBrain';

import './App.css';

const { FiHome, FiTarget, FiUser, FiActivity, FiList } = FiIcons;

function App() {
  const [currentStep, setCurrentStep] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    initializeDatabase();
    setCoaches(getAllCoaches());
    
    // Check for existing user in localStorage
    const savedUserId = localStorage.getItem('paceHoopsUserId');
    if (savedUserId) {
      const savedUser = getUser(savedUserId);
      if (savedUser) {
        setUser(savedUser);
        
        // Load last viewed goal if exists
        if (savedUser.lastViewedGoalId) {
          const lastGoal = getGoal(savedUser.lastViewedGoalId);
          if (lastGoal) {
            setCurrentGoal(lastGoal);
            const plan = getPlanByGoal(lastGoal.id);
            if (plan) {
              setCurrentPlan(plan);
              const coach = getCoach(lastGoal.coachId);
              setSelectedCoach(coach);
            }
          }
        }
        
        setCurrentStep('goals');
      }
    }
  }, []);

  const handleUserOnboardingComplete = (userData) => {
    setIsLoading(true);
    
    const newUser = createUser(userData);
    localStorage.setItem('paceHoopsUserId', newUser.id);
    
    setUser(newUser);
    setCurrentStep('coach-selection');
    setIsLoading(false);
  };

  const handleCoachSelection = (coach) => {
    setSelectedCoach(coach);
    setCurrentStep('goal-input');
  };

  const handleGoalSubmission = async (goalData) => {
    setIsLoading(true);
    
    try {
      // Create goal in database
      const goal = createGoal(user.id, goalData);
      setCurrentGoal(goal);
      
      // Get coach and drills
      const coach = getCoach(goalData.coachId);
      const drills = getCoachDrills(goalData.coachId);
      
      // Generate training plan using Pace Brain
      const planData = paceBrain.generateTrainingPlan(user, goal, coach, drills);
      
      // Create training plan in database
      const plan = createTrainingPlan(user.id, goal.id, coach.id, planData);
      setCurrentPlan(plan);
      
      // Update last viewed goal
      setLastViewedGoal(user.id, goal.id);
      
      setCurrentStep('training-plan');
    } catch (error) {
      console.error('Error creating training plan:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalSelect = (goal) => {
    setCurrentGoal(goal);
    const plan = getPlanByGoal(goal.id);
    setCurrentPlan(plan);
    const coach = getCoach(goal.coachId);
    setSelectedCoach(coach);
    setLastViewedGoal(user.id, goal.id);
    setCurrentStep('training-plan');
  };

  const handleLogSession = (logData) => {
    createLog(logData);
    
    // Refresh goal to get updated completedSessions
    const updatedGoal = getGoal(currentGoal.id);
    setCurrentGoal(updatedGoal);
    
    // Adapt the plan based on feedback
    if (currentPlan) {
      const adaptedPlan = paceBrain.adaptPlan(currentPlan, logData, user);
      setCurrentPlan(adaptedPlan);
    }
  };

  const handleNavigation = (step) => {
    setCurrentStep(step);
  };

  const handleProfileUpdate = (updatedData) => {
    const updatedUser = updateUser(user.id, updatedData);
    setUser(updatedUser);
  };

  const handleNewGoal = () => {
    setSelectedCoach(null);
    setCurrentStep('coach-selection');
  };

  const resetApp = () => {
    localStorage.removeItem('paceHoopsUserId');
    setUser(null);
    setSelectedCoach(null);
    setCurrentGoal(null);
    setCurrentPlan(null);
    setCurrentStep('onboarding');
  };

  const refreshUser = () => {
    if (user) {
      const refreshedUser = getUser(user.id);
      setUser(refreshedUser);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'onboarding':
        return (
          <UserOnboarding 
            onComplete={handleUserOnboardingComplete}
          />
        );
      
      case 'coach-selection':
        return (
          <CoachSelection
            coaches={coaches}
            selectedCoach={selectedCoach}
            onSelectCoach={handleCoachSelection}
          />
        );
      
      case 'goal-input':
        return (
          <GoalInput
            coach={selectedCoach}
            user={user}
            onSubmitGoal={handleGoalSubmission}
            isLoading={isLoading}
            onBack={() => setCurrentStep('coach-selection')}
          />
        );
      
      case 'goals':
        return (
          <Goals
            user={user}
            onSelectGoal={handleGoalSelect}
            onNewGoal={handleNewGoal}
            onRefresh={refreshUser}
          />
        );
      
      case 'training-plan':
        return (
          <TrainingPlan
            plan={currentPlan}
            coach={selectedCoach}
            goal={currentGoal}
            user={user}
            onLogSession={handleLogSession}
            onRefreshGoal={() => {
              const updated = getGoal(currentGoal.id);
              setCurrentGoal(updated);
            }}
          />
        );
      
      case 'profile':
        return (
          <Profile
            user={user}
            onUpdate={handleProfileUpdate}
            onLogout={resetApp}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Pace Hoops</h1>
            </div>
            
            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => handleNavigation('coach-selection')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === 'coach-selection' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiHome} className="w-4 h-4" />
                  <span>Coaches</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('goals')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === 'goals' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiList} className="w-4 h-4" />
                  <span>Goals</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('training-plan')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === 'training-plan' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  disabled={!currentPlan}
                >
                  <SafeIcon icon={FiActivity} className="w-4 h-4" />
                  <span>Training</span>
                </button>
                
                <button
                  onClick={() => handleNavigation('profile')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === 'profile' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </nav>
            )}
            
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.name} {user.isPremium && <span className="text-yellow-600">⭐ Premium</span>}
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation */}
          {user && (
            <nav className="md:hidden flex items-center justify-around py-2 border-t border-gray-100">
              <button
                onClick={() => handleNavigation('coach-selection')}
                className={`flex flex-col items-center p-2 ${
                  currentStep === 'coach-selection' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <SafeIcon icon={FiHome} className="w-5 h-5" />
                <span className="text-xs mt-1">Coaches</span>
              </button>
              
              <button
                onClick={() => handleNavigation('goals')}
                className={`flex flex-col items-center p-2 ${
                  currentStep === 'goals' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <SafeIcon icon={FiList} className="w-5 h-5" />
                <span className="text-xs mt-1">Goals</span>
              </button>
              
              <button
                onClick={() => handleNavigation('training-plan')}
                className={`flex flex-col items-center p-2 ${
                  currentStep === 'training-plan' ? 'text-blue-600' : 'text-gray-500'
                }`}
                disabled={!currentPlan}
              >
                <SafeIcon icon={FiActivity} className="w-5 h-5" />
                <span className="text-xs mt-1">Training</span>
              </button>
              
              <button
                onClick={() => handleNavigation('profile')}
                className={`flex flex-col items-center p-2 ${
                  currentStep === 'profile' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <SafeIcon icon={FiUser} className="w-5 h-5" />
                <span className="text-xs mt-1">Profile</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your personalized training plan...</p>
                </div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Pace Hoops. Powered by AI-driven basketball training.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
