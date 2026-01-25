import React, { useEffect, useMemo, useState } from 'react';
import {
  addSessionLog,
  getCoaches,
  getGoals,
  getSessionLogs,
  getTrainingPlan,
  setLastViewedGoal,
} from '../data/database';

function isRestDay(dayPlan) {
  return (dayPlan?.title || '').toLowerCase().includes('rest');
}

function isShootingDrill(drill) {
  if (!drill) return false;
  if (drill.skillType === 'shooting') return true;
  if (Array.isArray(drill.tags) && drill.tags.includes('shooting')) return true;
  return false;
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function clampInt(value, min, max) {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function sumShootingMetrics(shootingMetrics) {
  let makes = 0;
  let attempts = 0;

  if (shootingMetrics && typeof shootingMetrics === 'object') {
    Object.values(shootingMetrics).forEach((v) => {
      const m = Number.parseInt(String(v?.makes ?? 0), 10);
      const a = Number.parseInt(String(v?.attempts ?? 0), 10);
      if (!Number.isNaN(m)) makes += m;
      if (!Number.isNaN(a)) attempts += a;
    });
  }

  const pct = attempts > 0 ? Math.round((makes / attempts) * 100) : null;
  return { makes, attempts, pct };
}

export default function TrainingPlan({ userId, goalId, onSelectGoal, onDataChange }) {
  const [openDayIndex, setOpenDayIndex] = useState(null);
  const [formByDayIndex, setFormByDayIndex] = useState({});
  const [savingDayIndex, setSavingDayIndex] = useState(null);
  const [uiError, setUiError] = useState('');

  const coaches = useMemo(() => getCoaches(), []);
  const allGoals = useMemo(() => (userId ? getGoals(userId) : []), [userId]);

  const currentGoals = useMemo(
    () => allGoals.filter((g) => g.status === 'current').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [allGoals]
  );

  const goal = useMemo(() => allGoals.find((g) => g.id === goalId) || null, [allGoals, goalId]);
  const coach = useMemo(() => coaches.find((c) => c.id === goal?.coachId) || null, [coaches, goal?.coachId]);

  const plan = useMemo(() => (goalId ? getTrainingPlan(goalId) : null), [goalId]);
  const dayPlans = plan?.dailyPlans || [];

  const logs = useMemo(() => (goalId ? getSessionLogs(goalId) : []), [goalId]);
  const logsSorted = useMemo(
    () => [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [logs]
  );

  // Keep Training tab locked on last viewed goal
  useEffect(() => {
    if (userId && goalId) setLastViewedGoal(userId, goalId);
  }, [userId, goalId]);

  const latestLogByDayIndex = useMemo(() => {
    const map = new Map();
    [...logs]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .forEach((l) => map.set(l.dayIndex, l));
    return map;
  }, [logs]);

  const completedDayIndexSet = useMemo(() => {
    const s = new Set();
    logs.forEach((l) => {
      if (l.completed) s.add(l.dayIndex);
    });
    return s;
  }, [logs]);

  const completionStats = useMemo(() => {
    const trainingDays = dayPlans.filter((d) => !isRestDay(d));
    const completedTrainingDays = trainingDays.filter((d) => completedDayIndexSet.has(d.dayIndex)).length;
    const totalTrainingDays = trainingDays.length;
    const pct = totalTrainingDays ? Math.round((completedTrainingDays / totalTrainingDays) * 100) : 0;
    return { completedTrainingDays, totalTrainingDays, pct };
  }, [dayPlans, completedDayIndexSet]);

  const overallShooting = useMemo(() => {
    let makes = 0;
    let attempts = 0;
    logs.forEach((l) => {
      const s = sumShootingMetrics(l.shootingMetrics);
      makes += s.makes;
      attempts += s.attempts;
    });
    return {
      makes,
      attempts,
      pct: attempts > 0 ? Math.round((makes / attempts) * 100) : null,
    };
  }, [logs]);

  const weeks = useMemo(() => {
    const weekMap = new Map();
    dayPlans.forEach((day) => {
      const wk = day.weekIndex ?? 1;
      if (!weekMap.has(wk)) weekMap.set(wk, []);
      weekMap.get(wk).push(day);
    });

    return [...weekMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([weekIndex, days]) => ({
        weekIndex,
        days: [...days].sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0)),
      }));
  }, [dayPlans]);

  const initFormForDay = (dayPlan) => {
    const dayIndex = dayPlan.dayIndex;
    const latest = latestLogByDayIndex.get(dayIndex);

    const shootingDrills = (dayPlan.drills || []).filter(isShootingDrill);
    const shootingMetrics = {};

    shootingDrills.forEach((drill) => {
      const prev = latest?.shootingMetrics?.[drill.id] || {};
      shootingMetrics[drill.id] = {
        makes: prev.makes ?? '',
        attempts: prev.attempts ?? '',
      };
    });

    return {
      completed: Boolean(latest?.completed) || false, // only completes if user checks it
      difficulty: latest?.difficulty ?? 5,
      soreness: latest?.soreness ?? 'none',
      notes: latest?.notes ?? '',
      shootingMetrics,
    };
  };

  const toggleDay = (dayPlan) => {
    const dayIndex = dayPlan.dayIndex;
    setUiError('');

    setOpenDayIndex((cur) => (cur === dayIndex ? null : dayIndex));

    setFormByDayIndex((prev) => {
      if (prev[dayIndex]) return prev;
      return { ...prev, [dayIndex]: initFormForDay(dayPlan) };
    });
  };

  const updateForm = (dayIndex, patch) => {
    setFormByDayIndex((prev) => ({
      ...prev,
      [dayIndex]: { ...(prev[dayIndex] || {}), ...patch },
    }));
  };

  const updateShootingMetric = (dayIndex, drillId, key, value) => {
    setFormByDayIndex((prev) => {
      const cur = prev[dayIndex] || {};
      const sm = cur.shootingMetrics || {};
      const drill = sm[drillId] || { makes: '', attempts: '' };
      return {
        ...prev,
        [dayIndex]: {
          ...cur,
          shootingMetrics: {
            ...sm,
            [drillId]: { ...drill, [key]: value },
          },
        },
      };
    });
  };

  const saveLogForDay = (dayPlan) => {
    if (!plan) return;
    const dayIndex = dayPlan.dayIndex;

    try {
      setSavingDayIndex(dayIndex);
      setUiError('');

      const form = formByDayIndex[dayIndex] || initFormForDay(dayPlan);

      const difficulty = clampInt(form.difficulty, 1, 10);
      const soreness = form.soreness || 'none';

      // Only save shooting metrics where attempts > 0
      const shootingMetrics = {};
      Object.entries(form.shootingMetrics || {}).forEach(([drillId, v]) => {
        const attempts = clampInt(v?.attempts ?? 0, 0, 9999);
        const makes = clampInt(v?.makes ?? 0, 0, 9999);
        if (attempts > 0) {
          shootingMetrics[drillId] = { makes, attempts };
        }
      });

      addSessionLog(plan.id, {
        goalId,
        dayIndex,
        completed: Boolean(form.completed), // DAY ONLY COMPLETES IF THIS IS TRUE
        difficulty,
        soreness,
        shootingMetrics,
        notes: form.notes || '',
      });

      // Refresh UI
      onDataChange?.();

      // Keep the day open and update defaults for next time (latest log values)
      setFormByDayIndex((prev) => ({
        ...prev,
        [dayIndex]: { ...form, difficulty, soreness },
      }));
    } catch (e) {
      setUiError(e?.message || 'Could not save session.');
    } finally {
      setSavingDayIndex(null);
    }
  };

  if (!goalId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-6 bg-white border rounded-2xl">
          <div className="text-xl font-bold">No goal selected</div>
          <p className="text-gray-600 mt-2">
            Go to the <span className="font-semibold">Goals</span> tab and open a goal to see its plan.
          </p>
        </div>
      </div>
    );
  }

  if (!plan || !goal) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-6 bg-white border rounded-2xl">
          <div className="text-xl font-bold">Training plan not found</div>
          <p className="text-gray-600 mt-2">
            Open a goal from the <span className="font-semibold">Goals</span> tab, or create a new goal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header / Goal switcher */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          {coach && (
            <img
              src={coach.image}
              alt={coach.name}
              className="w-16 h-16 rounded-2xl object-cover border"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">Training</h1>
            <div className="text-gray-700 font-semibold mt-1">{goal.title}</div>
            <div className="text-sm text-gray-600 mt-1">{goal.summary || goal.prompt}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-gray-600">Switch current goal</div>
          <select
            className="p-3 border rounded-lg bg-white"
            value={goalId}
            onChange={(e) => onSelectGoal?.(e.target.value)}
          >
            {currentGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border rounded-2xl p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="font-semibold">Plan Progress</div>
            <div className="text-sm text-gray-600 mt-1">
              Completed {completionStats.completedTrainingDays}/{completionStats.totalTrainingDays} training days
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Shooting accuracy:{' '}
            <span className="font-semibold text-gray-900">
              {overallShooting.pct === null ? '—' : `${overallShooting.pct}%`}
            </span>
            {overallShooting.attempts > 0 && (
              <span className="text-gray-500"> ({overallShooting.makes}/{overallShooting.attempts})</span>
            )}
          </div>
        </div>

        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${completionStats.pct}%` }}
          />
        </div>
      </div>

      {/* Weekly breakdown + dropdown days */}
      <div className="space-y-6">
        {weeks.map((week) => (
          <div key={week.weekIndex}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Week {week.weekIndex}</h2>
              <div className="text-sm text-gray-600">
                Days 1–7 (numbered within the week)
              </div>
            </div>

            <div className="space-y-2">
              {week.days.map((day) => {
                const isOpen = openDayIndex === day.dayIndex;
                const completed = completedDayIndexSet.has(day.dayIndex);
                const rest = isRestDay(day);

                return (
                  <div key={day.dayIndex} className="bg-white border rounded-2xl overflow-hidden">
                    <button
                      className="w-full px-4 py-4 flex items-center justify-between gap-4 hover:bg-gray-50"
                      onClick={() => toggleDay(day)}
                    >
                      <div className="text-left">
                        <div className="text-sm text-gray-600">
                          Day {day.dayOfWeek} {rest ? '• Rest / Recovery' : ''}
                        </div>
                        <div className="font-semibold">{day.title}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`text-sm ${completed ? 'text-green-700' : 'text-gray-500'}`}>
                          {completed ? 'Completed' : 'Not completed'}
                        </div>
                        <div className="text-gray-400">{isOpen ? '▴' : '▾'}</div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5">
                        {/* Day details */}
                        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            {/* Split drills: Skill vs Cardio */}
                            <div className="mb-4">
                              <div className="font-bold mb-2">Skill Drills</div>
                              <div className="space-y-3">
                                {(day.drills || [])
                                  .filter((d) => d.type !== 'cardio')
                                  .map((drill) => (
                                    <div key={drill.id} className="border rounded-xl p-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="font-semibold">{drill.name}</div>
                                        <div className="text-sm text-gray-600">
                                          {drill.durationMinutes} min
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-1">{drill.description}</p>

                                      {Array.isArray(drill.steps) && drill.steps.length > 0 && (
                                        <ol className="list-decimal ml-5 text-sm text-gray-700 mt-3 space-y-1">
                                          {drill.steps.map((s, idx) => (
                                            <li key={idx}>{s}</li>
                                          ))}
                                        </ol>
                                      )}

                                      {drill.videoUrl && (
                                        <a
                                          href={drill.videoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                                        >
                                          Watch technique video →
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                {(day.drills || []).filter((d) => d.type !== 'cardio').length === 0 && (
                                  <div className="text-sm text-gray-600">No skill drills today.</div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="font-bold mb-2">Cardio / Conditioning</div>
                              <div className="space-y-3">
                                {(day.drills || [])
                                  .filter((d) => d.type === 'cardio')
                                  .map((drill) => (
                                    <div key={drill.id} className="border rounded-xl p-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="font-semibold">{drill.name}</div>
                                        <div className="text-sm text-gray-600">
                                          {drill.durationMinutes} min
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-1">{drill.description}</p>

                                      {Array.isArray(drill.steps) && drill.steps.length > 0 && (
                                        <ol className="list-decimal ml-5 text-sm text-gray-700 mt-3 space-y-1">
                                          {drill.steps.map((s, idx) => (
                                            <li key={idx}>{s}</li>
                                          ))}
                                        </ol>
                                      )}

                                      {drill.videoUrl && (
                                        <a
                                          href={drill.videoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                                        >
                                          Watch technique video →
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                {(day.drills || []).filter((d) => d.type === 'cardio').length === 0 && (
                                  <div className="text-sm text-gray-600">No cardio today.</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Logging */}
                          <div>
                            <div className="border rounded-2xl p-5 bg-gray-50">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="font-bold">Log this session</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    The day only becomes “Completed” if you check the box below.
                                  </div>
                                </div>
                              </div>

                              {uiError && (
                                <div className="mt-3 p-3 rounded-xl border bg-red-50 text-red-700">
                                  {uiError}
                                </div>
                              )}

                              {(() => {
                                const latest = latestLogByDayIndex.get(day.dayIndex);
                                if (!latest) return null;
                                const s = sumShootingMetrics(latest.shootingMetrics);
                                return (
                                  <div className="mt-4 p-3 rounded-xl bg-white border text-sm">
                                    <div className="font-semibold">Most recent log</div>
                                    <div className="text-gray-700 mt-1">
                                      {formatDateTime(latest.createdAt)} • Difficulty {latest.difficulty}/10 • Soreness: {latest.soreness}
                                    </div>
                                    {s.attempts > 0 && (
                                      <div className="text-gray-700 mt-1">
                                        Shooting: {s.pct}% ({s.makes}/{s.attempts})
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              <div className="mt-4 space-y-4">
                                {/* Completed checkbox */}
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(formByDayIndex[day.dayIndex]?.completed)}
                                    onChange={(e) => updateForm(day.dayIndex, { completed: e.target.checked })}
                                  />
                                  Mark session complete
                                </label>

                                {/* Difficulty */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">Difficulty (1–10)</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    className="w-full p-3 border rounded-lg bg-white"
                                    value={formByDayIndex[day.dayIndex]?.difficulty ?? 5}
                                    onChange={(e) => updateForm(day.dayIndex, { difficulty: e.target.value })}
                                  />
                                </div>

                                {/* Soreness */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">Soreness</label>
                                  <select
                                    className="w-full p-3 border rounded-lg bg-white"
                                    value={formByDayIndex[day.dayIndex]?.soreness ?? 'none'}
                                    onChange={(e) => updateForm(day.dayIndex, { soreness: e.target.value })}
                                  >
                                    <option value="none">None</option>
                                    <option value="mild">Mild</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                  </select>
                                </div>

                                {/* Shooting accuracy logging */}
                                {(() => {
                                  const shootingDrills = (day.drills || []).filter(isShootingDrill);
                                  if (shootingDrills.length === 0) return null;

                                  return (
                                    <div className="p-4 rounded-xl bg-white border">
                                      <div className="font-semibold">Shooting accuracy</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        Log makes/attempts for shooting drills to track improvement.
                                      </div>

                                      <div className="mt-3 space-y-3">
                                        {shootingDrills.map((drill) => {
                                          const v = formByDayIndex[day.dayIndex]?.shootingMetrics?.[drill.id] || {};
                                          return (
                                            <div key={drill.id} className="border rounded-xl p-3">
                                              <div className="font-medium text-sm">{drill.name}</div>
                                              <div className="grid grid-cols-2 gap-3 mt-2">
                                                <div>
                                                  <label className="block text-xs text-gray-600 mb-1">Makes</label>
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    className="w-full p-2 border rounded-lg"
                                                    value={v.makes ?? ''}
                                                    onChange={(e) =>
                                                      updateShootingMetric(day.dayIndex, drill.id, 'makes', e.target.value)
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs text-gray-600 mb-1">Attempts</label>
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    className="w-full p-2 border rounded-lg"
                                                    value={v.attempts ?? ''}
                                                    onChange={(e) =>
                                                      updateShootingMetric(day.dayIndex, drill.id, 'attempts', e.target.value)
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Notes */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">Notes</label>
                                  <textarea
                                    className="w-full p-3 border rounded-lg bg-white"
                                    rows={3}
                                    value={formByDayIndex[day.dayIndex]?.notes ?? ''}
                                    onChange={(e) => updateForm(day.dayIndex, { notes: e.target.value })}
                                    placeholder="What felt good? What was hard? Any tweaks?"
                                  />
                                </div>

                                <button
                                  onClick={() => saveLogForDay(day)}
                                  disabled={savingDayIndex === day.dayIndex}
                                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                                >
                                  {savingDayIndex === day.dayIndex ? 'Saving…' : 'Save Session Log'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Previous session logs */}
                        <div className="mt-6">
                          <div className="font-bold mb-2">Previous logged sessions (this goal)</div>
                          <div className="space-y-2">
                            {logsSorted.length === 0 && (
                              <div className="text-sm text-gray-600">No sessions logged yet.</div>
                            )}

                            {logsSorted.slice(0, 10).map((log) => {
                              const dp = dayPlans.find((d) => d.dayIndex === log.dayIndex);
                              const s = sumShootingMetrics(log.shootingMetrics);
                              return (
                                <button
                                  key={log.id}
                                  className="w-full text-left p-3 rounded-xl border bg-white hover:bg-gray-50"
                                  onClick={() => {
                                    // jump to that day
                                    const target = dayPlans.find((d) => d.dayIndex === log.dayIndex);
                                    if (target) {
                                      setOpenDayIndex(target.dayIndex);
                                      setFormByDayIndex((prev) => {
                                        if (prev[target.dayIndex]) return prev;
                                        return { ...prev, [target.dayIndex]: initFormForDay(target) };
                                      });
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <div className="font-semibold text-sm">
                                        {dp ? `Week ${dp.weekIndex} • Day ${dp.dayOfWeek} — ${dp.title}` : `Day ${log.dayIndex + 1}`}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {formatDateTime(log.createdAt)} • Difficulty {log.difficulty}/10 • Soreness: {log.soreness} • {log.completed ? 'Completed' : 'Not completed'}
                                      </div>
                                      {s.attempts > 0 && (
                                        <div className="text-xs text-gray-700 mt-1">
                                          Shooting: {s.pct}% ({s.makes}/{s.attempts})
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {logsSorted.length > 10 && (
                            <div className="text-xs text-gray-500 mt-2">
                              Showing 10 most recent logs. (All logs are still saved.)
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}