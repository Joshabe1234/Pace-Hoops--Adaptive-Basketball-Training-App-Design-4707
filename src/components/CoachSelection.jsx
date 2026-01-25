import React, { useEffect, useMemo, useState } from 'react';
import { getCoaches } from '../data/database';

export default function CoachSelection({ onSelectCoach, selectedCoachId, onBack }) {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    setCoaches(getCoaches());
  }, []);

  const selectedCoach = useMemo(
    () => coaches.find((c) => c.id === selectedCoachId),
    [coaches, selectedCoachId]
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Choose Your Coach</h1>
          <p className="text-gray-600 mt-1">
            Pick a coach to start a goal-specific plan.
          </p>
        </div>

        {onBack && (
          <button onClick={onBack} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {coaches.map((coach) => {
          const active = coach.id === selectedCoachId;
          return (
            <button
              key={coach.id}
              onClick={() => onSelectCoach(coach.id)}
              className={`text-left rounded-2xl border bg-white p-5 hover:shadow-sm transition ${
                active ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-16 h-16 rounded-xl object-cover border"
                />
                <div>
                  <div className="text-lg font-semibold">{coach.name}</div>
                  <div className="text-sm text-gray-600">{coach.specialty}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-4">{coach.description}</p>
            </button>
          );
        })}
      </div>

      {selectedCoach && (
        <div className="mt-8 p-5 rounded-2xl border bg-white">
          <div className="font-semibold">Selected coach</div>
          <div className="text-gray-700 mt-1">
            {selectedCoach.name} — {selectedCoach.specialty}
          </div>
        </div>
      )}
    </div>
  );
}