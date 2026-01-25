import React, { useMemo, useState } from 'react';
import { getGoals, getUser } from '../data/database';

const TIMEFRAMES = [
  { label: '2 weeks', value: '2 weeks' },
  { label: '4 weeks', value: '4 weeks' },
  { label: '8 weeks', value: '8 weeks' },
  { label: '12 weeks', value: '12 weeks' },
];

function clampInt(value, min, max) {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function buildSummary({ title, timeframe, daysPerWeek, minutesPerDay }) {
  const t = title?.trim();
  if (!t) return '';
  return `Goal: ${t} • ${timeframe} • ${daysPerWeek} days/week • ${minutesPerDay} min/day`;
}

export default function GoalInput({ userId, coach, onSubmit, onBack, error }) {
  const user = useMemo(() => (userId ? getUser(userId) : null), [userId]);
  const currentGoalsCount = useMemo(() => {
    if (!userId) return 0;
    return getGoals(userId).filter((g) => g.status === 'current').length;
  }, [userId]);

  const maxGoals = user?.isPremium ? 20 : 10;

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[1].value); // 4 weeks default
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [minutesPerDay, setMinutesPerDay] = useState(45);
  const [customSummary, setCustomSummary] = useState('');

  const autoSummary = useMemo(
    () => buildSummary({ title, timeframe, daysPerWeek, minutesPerDay }),
    [title, timeframe, daysPerWeek, minutesPerDay]
  );

  const submit = (e) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanPrompt = prompt.trim();
    if (!cleanTitle || !cleanPrompt) return;

    onSubmit({
      title: cleanTitle,
      prompt: cleanPrompt,
      summary: (customSummary.trim() || autoSummary).trim(),
      availability: {
        daysPerWeek: clampInt(daysPerWeek, 1, 7),
        minutesPerDay: clampInt(minutesPerDay, 10, 180),
      },
      timeframe,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create a Goal</h1>
          <p className="text-gray-600 mt-1">
            You can have multiple current goals. Free caps at 10; Premium unlocks 20.
          </p>
        </div>

        <button onClick={onBack} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
          Back
        </button>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-white border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {coach && (
            <img
              src={coach.image}
              alt={coach.name}
              className="w-12 h-12 rounded-lg object-cover border"
            />
          )}
          <div>
            <div className="font-semibold">{coach ? coach.name : 'No coach selected'}</div>
            <div className="text-sm text-gray-600">
              Current goals: {currentGoalsCount}/{maxGoals}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {user?.isPremium ? 'Premium' : 'Free'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl border bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="bg-white border rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Goal title</label>
          <input
            className="w-full p-3 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Improve 3-point shooting"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Describe your goal</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want to improve? Any context about your game?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plan length</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              {TIMEFRAMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Days per week</label>
            <input
              type="number"
              min={1}
              max={7}
              className="w-full p-3 border rounded-lg"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Minutes per day</label>
            <input
              type="number"
              min={10}
              max={180}
              className="w-full p-3 border rounded-lg"
              value={minutesPerDay}
              onChange={(e) => setMinutesPerDay(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-gray-50">
          <div className="text-sm font-semibold">Goal banner summary</div>
          <div className="text-sm text-gray-700 mt-1">
            Default: <span className="font-medium">{autoSummary || '—'}</span>
          </div>
          <input
            className="mt-3 w-full p-3 border rounded-lg"
            value={customSummary}
            onChange={(e) => setCustomSummary(e.target.value)}
            placeholder="Optional: override the summary that shows on the goal banner"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Generate Training Plan
        </button>
      </form>
    </div>
  );
}