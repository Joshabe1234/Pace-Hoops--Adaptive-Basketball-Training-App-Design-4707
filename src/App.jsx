import React, { useEffect, useMemo, useState } from 'react';

import UserOnboarding from './components/UserOnboarding';
import CoachSelection from './components/CoachSelection';
import GoalInput from './components/GoalInput';
import TrainingPlan from './components/TrainingPlan';
import Goals from './components/Goals';
import Profile from './components/Profile';

import {
  getUser,
  getCoaches,
  getGoals,
  createGoal,
  saveTrainingPlan,
  setLastViewedGoal,
} from './data/database';

import { createTrainingPlan } from './services/paceBrain';

const ACTIVE_USER_KEY = 'pace_active_user_id';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState('onboarding'); // onboarding | coach-selection | goal-input | training | goals | profile
  const [lastMainStep, setLastMainStep] = useState('coach-selection');

  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [activeGoalId, setActiveGoalId] = useState(null);

  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load existing user if present
  useEffect(() => {
    const savedUserId = localStorage.getItem(ACTIVE_USER_KEY);
    if (savedUserId && getUser(savedUserId)) {
      setUserId(savedUserId);
      setStep('coach-selection');
    } else {
      setStep('onboarding');
    }
  }, []);

  // Track the last non-profile screen so Profile can return to wherever you were
  useEffect(() => {
    if (step !== 'profile') setLastMainStep(step);
  }, [step]);

  const user = useMemo(() => (userId ? getUser(userId) : null), [userId, refreshKey]);
  const coaches = useMemo(() => getCoaches(), [refreshKey]);
  const goals = useMemo(() => (userId ? getGoals(userId) : []), [userId, refreshKey]);

  const selectedCoach = useMemo(
    () => coaches.find((c) => c.id === selectedCoachId) || null,
    [coaches, selectedCoachId]
  );

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  const goToTraining = () => {
    if (!userId) return;

    // Prefer current active, else last viewed, else most recent current goal
    let targetGoalId = activeGoalId || user?.lastViewedGoalId || null;

    if (!targetGoalId) {
      const currentGoals = goals
        .filter((g) => g.status === 'current')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (currentGoals.length) targetGoalId = currentGoals[0].id;
    }

    if (targetGoalId) setActiveGoalId(targetGoalId);
    setStep('training');
  };

  const handleOnboardingComplete = (createdUser) => {
    // UserOnboarding currently creates the user object. Persist id so they don't re-onboard.
    localStorage.setItem(ACTIVE_USER_KEY, createdUser.id);
    setUserId(createdUser.id);
    setError('');
    setStep('coach-selection');
    forceRefresh();
  };

  const handleSelectCoach = (coachId) => {
    setSelectedCoachId(coachId);
    setError('');
    setStep('goal-input');
  };

  const handleCreateGoal = (goalData) => {
    if (!userId || !selectedCoachId) return;

    try {
      setError('');

      const createdGoal = createGoal(userId, {
        coachId: selectedCoachId,
        title: goalData.title,
        summary: goalData.summary,
        prompt: goalData.prompt,
        status: 'current',
        availability: goalData.availability,
      });

      const latestUser = getUser(userId);
      const coach = coaches.find((c) => c.id === selectedCoachId);

      const plan = createTrainingPlan({
        user: latestUser,
        coach,
        goal: createdGoal,
      });

      saveTrainingPlan(createdGoal.id, plan);

      setActiveGoalId(createdGoal.id);
      setLastViewedGoal(userId, createdGoal.id);

      setStep('training');
      forceRefresh();
    } catch (e) {
      setError(e?.message || 'Could not create goal.');
    }
  };

  const handleSelectGoal = (goalId) => {
    if (!userId) return;
    setActiveGoalId(goalId);
    setLastViewedGoal(userId, goalId);
    setError('');
    setStep('training');
    forceRefresh();
  };

  const showNav = Boolean(userId && user);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && (
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="font-bold tracking-tight">PACE Hoops</div>

            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 rounded-lg text-sm border ${
                  step === 'coach-selection' ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'
                }`}
                onClick={() => setStep('coach-selection')}
              >
                Coaches
              </button>

              <button
                className={`px-3 py-2 rounded-lg text-sm border ${
                  step === 'goals' ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'
                }`}
                onClick={() => setStep('goals')}
              >
                Goals
              </button>

              <button
                className={`px-3 py-2 rounded-lg text-sm border ${
                  step === 'training' ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'
                }`}
                onClick={goToTraining}
              >
                Training
              </button>

              <button
                className={`px-3 py-2 rounded-lg text-sm border ${
                  step === 'profile' ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'
                }`}
                onClick={() => setStep('profile')}
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'onboarding' && (
        <UserOnboarding onComplete={handleOnboardingComplete} />
      )}

      {step === 'coach-selection' && (
        <CoachSelection
          selectedCoachId={selectedCoachId}
          onSelectCoach={handleSelectCoach}
        />
      )}

      {step === 'goal-input' && (
        <GoalInput
          userId={userId}
          coach={selectedCoach}
          onSubmit={handleCreateGoal}
          onBack={() => setStep('coach-selection')}
          error={error}
        />
      )}

      {step === 'goals' && (
        <Goals
          userId={userId}
          onSelectGoal={handleSelectGoal}
          onCreateNewGoal={() => {
            setSelectedCoachId(null);
            setStep('coach-selection');
          }}
        />
      )}

      {step === 'training' && (
        <TrainingPlan
          userId={userId}
          goalId={activeGoalId || user?.lastViewedGoalId || null}
          onSelectGoal={handleSelectGoal}
          onDataChange={forceRefresh}
        />
      )}

      {step === 'profile' && (
        <Profile
          userId={userId}
          onDone={() => setStep(lastMainStep)}
        />
      )}
    </div>
  );
}