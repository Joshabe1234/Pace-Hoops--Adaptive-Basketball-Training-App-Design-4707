// Lightweight Pace Brain v1 (prototype)
// - No "base intensity" setting
// - Uses athlete baseline + goal timeframe + optional per-goal availability
// - Output: day-by-day plan (groupable into weeks on the UI)

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const parseTimeframeToDays = (timeframe) => {
  if (!timeframe) return 14;
  const t = String(timeframe).toLowerCase().trim();
  const weekMatch = t.match(/(\d+)\s*week/);
  const dayMatch = t.match(/(\d+)\s*day/);
  const monthMatch = t.match(/(\d+)\s*month/);

  if (dayMatch) return clamp(parseInt(dayMatch[1], 10), 7, 180);
  if (weekMatch) return clamp(parseInt(weekMatch[1], 10) * 7, 7, 180);
  if (monthMatch) return clamp(parseInt(monthMatch[1], 10) * 30, 14, 180);

  // fallback for inputs like "2" meaning 2 weeks
  const num = Number(t);
  if (!Number.isNaN(num) && num > 0) return clamp(num * 7, 7, 180);

  return 14;
};

const getAgeBand = (age) => {
  const a = Number(age || 14);
  if (a <= 12) return 'youth';
  if (a <= 15) return 'early-teen';
  if (a <= 18) return 'late-teen';
  return 'adult';
};

const defaultSessionsPerWeek = (ageBand, skillLevel) => {
  const base = ageBand === 'youth' ? 3 : ageBand === 'early-teen' ? 4 : ageBand === 'late-teen' ? 5 : 5;
  const skillAdj = skillLevel === 'beginner' ? -1 : skillLevel === 'advanced' ? 1 : 0;
  return clamp(base + skillAdj, 2, 6);
};

const chooseTrainingDays = (totalDays, sessionsPerWeek) => {
  // evenly distribute sessions through the week
  const sessionsTotal = Math.round((totalDays / 7) * sessionsPerWeek);
  const indices = [];
  const step = totalDays / sessionsTotal;
  for (let i = 0; i < sessionsTotal; i++) {
    indices.push(Math.floor(i * step));
  }
  return Array.from(new Set(indices)).sort((a, b) => a - b);
};

const pickDrills = (coach, focusTag, minutes) => {
  const all = coach?.drillLibrary || [];
  const skill = all.filter((d) => d.type !== 'cardio');
  const cardio = all.filter((d) => d.type === 'cardio');

  const primary = skill.filter((d) => d.category === focusTag);
  const fallback = skill.length ? skill : all;

  const drills = [];
  let remaining = minutes;

  const add = (arr) => {
    for (const d of arr) {
      if (remaining <= 0) break;
      drills.push(d);
      remaining -= d.duration;
      if (drills.length >= 4) break;
    }
  };

  add(primary);
  if (drills.length < 2) add(fallback);

  // add 0–1 cardio finisher if time remains
  if (remaining >= 8 && cardio.length) {
    drills.push(cardio[0]);
  }

  return drills;
};

export function createTrainingPlan({ user, goal, coach }) {
  const totalDays = parseTimeframeToDays(goal?.timeframe || goal?.prompt);
  const ageBand = getAgeBand(user?.age);
  const availability = goal?.availability || {};

  const sessionsPerWeek = Number(availability.daysPerWeek) > 0
    ? clamp(Number(availability.daysPerWeek), 2, 6)
    : defaultSessionsPerWeek(ageBand, user?.skillLevel);

  const minutesPerDay = Number(availability.minutesPerDay) > 0
    ? clamp(Number(availability.minutesPerDay), 20, 120)
    : 45;

  const trainingDayIndices = chooseTrainingDays(totalDays, sessionsPerWeek);
  const focus = String(goal?.focusTag || 'shooting').toLowerCase();

  const dailyPlans = Array.from({ length: totalDays }, (_, i) => {
    const isTrainingDay = trainingDayIndices.includes(i);
    const weekIndex = Math.floor(i / 7) + 1;
    const dayOfWeek = (i % 7) + 1;

    if (!isTrainingDay) {
      return {
        dayIndex: i,
        weekIndex,
        dayOfWeek,
        title: `Rest / Recovery`,
        drills: [
          {
            id: 'recovery',
            name: 'Recovery + Light Mobility',
            type: 'skill',
            duration: 10,
            description: 'Light mobility + shooting form walk-through (optional).',
            steps: ['Stretch ankles/hips', 'Light ball-handling', 'Optional form reps'],
          },
        ],
        estimatedDuration: 10,
      };
    }

    const drills = pickDrills(coach, focus, minutesPerDay);
    const estimatedDuration = drills.reduce((sum, d) => sum + d.duration, 0);

    return {
      dayIndex: i,
      weekIndex,
      dayOfWeek,
      title: `Training Day`,
      drills,
      estimatedDuration,
    };
  });

  return {
    overview: {
      goal: goal?.title || 'Goal',
      timeframeDays: totalDays,
      sessionsPerWeek,
      minutesPerDay,
      coachName: coach?.name || 'Coach',
    },
    dailyPlans,
    totalSessions: trainingDayIndices.length,
    sessionsPerWeek,
    baseIntensity: 0.7, // default placeholder
    progression: dailyPlans.map((_, i) => ({
      phase: i < totalDays * 0.3 ? 'build-up' : i < totalDays * 0.8 ? 'peak' : 'taper',
      intensity: i < totalDays * 0.3 ? 0.6 : i < totalDays * 0.8 ? 0.85 : 0.5,
    })),
  };
}

export const paceBrain = {
  createTrainingPlan,
};