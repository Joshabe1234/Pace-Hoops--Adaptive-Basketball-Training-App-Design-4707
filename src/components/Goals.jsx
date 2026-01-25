import React, { useMemo, useState } from 'react';
import {
  getCoaches,
  getGoals,
  getUser,
  setGoalStatus,
  setLastViewedGoal,
} from '../data/database';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function GoalBanner({ goal, coach, rightSlot, onClick }) {
  return (
    <div
      className="w-full bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-sm transition cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={coach?.image}
          alt={coach?.name}
          className="w-14 h-14 rounded-xl object-cover border"
        />
        <div className="min-w-0">
          <div className="font-semibold truncate">{goal.title}</div>
          <div className="text-sm text-gray-600 truncate">{goal.summary || goal.prompt}</div>
          <div className="text-xs text-gray-500 mt-1">
            Coach: {coach?.name} • Created: {formatDate(goal.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
    </div>
  );
}

export default function Goals({ userId, onSelectGoal, onCreateNewGoal }) {
  const [uiError, setUiError] = useState('');

  const user = useMemo(() => getUser(userId), [userId]);
  const coaches = useMemo(() => getCoaches(), []);
  const goals = useMemo(() => getGoals(userId), [userId]);

  const coachById = useMemo(() => {
    const map = new Map();
    coaches.forEach((c) => map.set(c.id, c));
    return map;
  }, [coaches]);

  const currentGoals = useMemo(
    () => goals.filter((g) => g.status === 'current').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [goals]
  );
  const previousGoals = useMemo(
    () => goals.filter((g) => g.status === 'previous').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [goals]
  );

  const maxGoals = user?.isPremium ? 20 : 10;

  const openGoal = (goalId) => {
    setLastViewedGoal(userId, goalId);
    onSelectGoal?.(goalId);
  };

  const archiveGoal = (goalId) => {
    setGoalStatus(goalId, 'previous');
    setUiError('');
    // Parent refresh handled by App re-rendering (Goals reads from localStorage each render)
    // If you want immediate refresh without changing screens, the simplest is clicking away and back.
  };

  const makeCurrent = (goalId) => {
    setUiError('');

    if (currentGoals.length >= maxGoals) {
      setUiError(
        `You already have ${currentGoals.length}/${maxGoals} current goals. ` +
          (user?.isPremium ? 'Archive one first.' : 'Upgrade to Premium to unlock up to 20.')
      );
      return;
    }

    setGoalStatus(goalId, 'current');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-gray-600 mt-1">
            Current goals show up in Training. Click any goal to open its plan.
          </p>
        </div>

        <button
          onClick={onCreateNewGoal}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Goal
        </button>
      </div>

      {uiError && (
        <div className="mb-4 p-4 rounded-xl border bg-red-50 text-red-700">{uiError}</div>
      )}

      <div className="mb-6 p-4 rounded-xl bg-white border flex items-center justify-between">
        <div>
          <div className="font-semibold">Goal Limits</div>
          <div className="text-sm text-gray-600">
            Current goals: {currentGoals.length}/{maxGoals} • Plan access stays free; more goals requires Premium.
          </div>
        </div>
        <div className="text-sm text-gray-600">{user?.isPremium ? 'Premium' : 'Free'}</div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Current Goals</h2>
            <div className="text-sm text-gray-600">{currentGoals.length} active</div>
          </div>

          <div className="space-y-3">
            {currentGoals.length === 0 && (
              <div className="p-6 rounded-2xl border bg-white text-gray-600">
                No current goals yet. Create one to start training.
              </div>
            )}

            {currentGoals.map((goal) => {
              const coach = coachById.get(goal.coachId);
              return (
                <GoalBanner
                  key={goal.id}
                  goal={goal}
                  coach={coach}
                  onClick={() => openGoal(goal.id)}
                  rightSlot={
                    <>
                      <button
                        className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoal(goal.id);
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveGoal(goal.id);
                        }}
                      >
                        Move to Previous
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Previous Goals</h2>
            <div className="text-sm text-gray-600">{previousGoals.length} archived</div>
          </div>

          <div className="space-y-3">
            {previousGoals.length === 0 && (
              <div className="p-6 rounded-2xl border bg-white text-gray-600">
                No previous goals yet.
              </div>
            )}

            {previousGoals.map((goal) => {
              const coach = coachById.get(goal.coachId);
              return (
                <GoalBanner
                  key={goal.id}
                  goal={goal}
                  coach={coach}
                  onClick={() => openGoal(goal.id)}
                  rightSlot={
                    <>
                      <button
                        className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoal(goal.id);
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          makeCurrent(goal.id);
                        }}
                      >
                        Make Current
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}