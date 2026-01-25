/**
 * Prototype local "database" (localStorage-backed).
 *
 * This file is the right place to "add" the schemas you shared.
 * We keep them as JSDoc typedefs + enforce them through the create/update helpers.
 */

const STORAGE_KEY = 'pace_hoops_db_v2';

const nowIso = () => new Date().toISOString();
const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {number} age
 * @property {number} [height]
 * @property {number} [weight]
 * @property {string} skillLevel
 * @property {string} athleticism
 * @property {string} injuries
 * @property {boolean} isPremium
 * @property {string|null} lastViewedGoalId
 */

/**
 * @typedef {Object} Goal
 * @property {string} id
 * @property {string} userId
 * @property {string} coachId
 * @property {string} title
 * @property {string} summary
 * @property {string} prompt
 * @property {"current"|"previous"} status
 * @property {string} createdAt
 * @property {{daysPerWeek?: number, minutesPerDay?: number}} availability
 */

/**
 * @typedef {Object} SessionLog
 * @property {string} id
 * @property {string} planId
 * @property {string} goalId
 * @property {number} dayIndex
 * @property {boolean} completed
 * @property {number} difficulty
 * @property {"none"|"mild"|"moderate"|"severe"} soreness
 * @property {Object.<string, {makes: number, attempts: number}>} shootingMetrics
 * @property {string} notes
 * @property {string} createdAt
 */

const DEFAULT_DB = {
  users: {},
  goals: {},
  plans: {},
  sessionLogs: {},
  coaches: {
    coach1: {
      id: 'coach1',
      name: 'Phil Jackson',
      specialty: 'Leadership, Fundamentals, Calm Consistency',
      bio: 'Legendary NBA coach focused on fundamentals, focus, and steady growth.',
      // Updated to 'image' to match component expectations
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Phil%20Jackson%201968.jpeg',
      style: {
        tone: 'calm',
        drillBias: { shooting: 0.5, handling: 0.25, footwork: 0.25 },
      },
      drillLibrary: [
        {
          id: 'form_shooting',
          name: 'Form Shooting (Close Range)',
          category: 'shooting',
          type: 'skill',
          duration: 12,
          requiresShootingMetrics: true,
          description: 'Build repeatable mechanics close to the hoop.',
          steps: [
            'Start 3–5 feet from rim.',
            'Hold follow-through 2 seconds.',
            'Focus on straight wrist snap + soft arc.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=Hj5hZt6rZGc',
        },
        {
          id: 'spot_up_5spots',
          name: 'Spot-Up: 5 Spots',
          category: 'shooting',
          type: 'skill',
          duration: 18,
          requiresShootingMetrics: true,
          description: 'Catch-and-shoot from 5 spots around arc.',
          steps: [
            'Shoot 10 attempts per spot.',
            'Track makes/attempts.',
            'Reset feet and balance every shot.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=YyqkYFzQ9Rk',
        },
        {
          id: 'suicides',
          name: 'Suicides (Cardio)',
          category: 'conditioning',
          type: 'cardio',
          duration: 10,
          requiresShootingMetrics: false,
          description: 'Short burst conditioning to build game endurance.',
          steps: [
            'Run 4 lines down & back.',
            'Rest 45–60s.',
            'Repeat 3–5 sets.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=RzH8RjXrOLU',
        },
      ],
    },
    coach2: {
      id: 'coach2',
      name: 'Steve Kerr',
      specialty: 'Movement Shooting, Quick Decisions',
      bio: 'Modern spacing and rhythm shooting principles.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Steve_Kerr_Talks_to_Reporters.jpg/640px-Steve_Kerr_Talks_to_Reporters.jpg',
      style: {
        tone: 'fast',
        drillBias: { shooting: 0.6, handling: 0.2, footwork: 0.2 },
      },
      drillLibrary: [
        {
          id: 'one_dribble_pullup',
          name: '1-Dribble Pull-Up Series',
          category: 'shooting',
          type: 'skill',
          duration: 18,
          requiresShootingMetrics: true,
          description: 'Game-like pull-ups off one dribble.',
          steps: [
            'Start at wing.',
            '1 hard dribble.',
            'Rise straight up, land balanced.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=O0gQm3lT8DQ',
        },
        {
          id: 'cone_handles',
          name: 'Cone Handles (Cardio + Skill)',
          category: 'handling',
          type: 'cardio',
          duration: 12,
          requiresShootingMetrics: false,
          description: 'Ball handling with movement intensity.',
          steps: [
            'Set 4 cones.',
            'Cross/behind/in&out combos.',
            'Go full speed, keep head up.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
        },
      ],
    },
    coach3: {
      id: 'coach3',
      name: 'Gregg Popovich',
      specialty: 'Discipline, Footwork, Consistency',
      bio: 'Structured growth and repeatable fundamentals.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Gregg_Popovich_2017.jpg/640px-Gregg_Popovich_2017.jpg',
      style: {
        tone: 'direct',
        drillBias: { shooting: 0.45, handling: 0.25, footwork: 0.3 },
      },
      drillLibrary: [
        {
          id: 'pivot_series',
          name: 'Pivot + Footwork Series',
          category: 'footwork',
          type: 'skill',
          duration: 15,
          requiresShootingMetrics: false,
          description: 'Improve balance, pivots, and controlled movement.',
          steps: [
            'Forward pivot 10 reps.',
            'Reverse pivot 10 reps.',
            'Add ball + jab step.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=2QK4VQ5u4fA',
        },
      ],
    },
    coach4: {
      id: 'coach4',
      name: 'Kobe Bryant',
      specialty: 'Footwork, Scoring Moves, Work Ethic',
      bio: 'Detail-heavy skill development and scoring craft.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kobe_Bryant_2014.jpg/640px-Kobe_Bryant_2014.jpg',
      style: {
        tone: 'intense',
        drillBias: { shooting: 0.5, handling: 0.2, footwork: 0.3 },
      },
      drillLibrary: [
        {
          id: 'midrange_mikan',
          name: 'Midrange Footwork Into Shot',
          category: 'shooting',
          type: 'skill',
          duration: 20,
          requiresShootingMetrics: true,
          description: 'Footwork into midrange jumper, Kobe-style detail work.',
          steps: [
            'Start at elbow.',
            '1-2 step into jumper.',
            'Track makes/attempts.',
          ],
          videoUrl: 'https://www.youtube.com/watch?v=YFJ5aI5vF6Y',
        },
      ],
    },
  },
};

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DB);
    return { ...structuredClone(DEFAULT_DB), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_DB);
  }
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// -------------------- Users --------------------

export function createUser(payload) {
  const db = loadDb();
  const id = uid('user');
  const user = {
    id,
    name: payload.name || 'Athlete',
    age: Number(payload.age) || 14,
    height: payload.height ? Number(payload.height) : undefined,
    weight: payload.weight ? Number(payload.weight) : undefined,
    skillLevel: payload.skillLevel || 'intermediate',
    athleticism: payload.athleticism || 'average',
    injuries: payload.injuries || 'none',
    isPremium: Boolean(payload.isPremium) || false,
    lastViewedGoalId: null,
    createdAt: nowIso(),
  };
  db.users[id] = user;
  saveDb(db);
  return user;
}

export function updateUser(userId, updates) {
  const db = loadDb();
  if (!db.users[userId]) return null;
  db.users[userId] = { ...db.users[userId], ...updates };
  saveDb(db);
  return db.users[userId];
}

export function getUserById(userId) {
  const db = loadDb();
  return db.users[userId] || null;
}

export function setLastViewedGoal(userId, goalId) {
  return updateUser(userId, { lastViewedGoalId: goalId });
}

export function getUserGoalLimit(userId) {
  const u = getUserById(userId);
  return u?.isPremium ? 20 : 10;
}

// -------------------- Coaches --------------------

export function getAllCoaches() {
  const db = loadDb();
  return Object.values(db.coaches);
}

export function getCoachById(coachId) {
  const db = loadDb();
  return db.coaches[coachId] || null;
}

// -------------------- Goals --------------------

export function getUserGoals(userId) {
  const db = loadDb();
  return Object.values(db.goals)
    .filter((g) => g.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getGoalById(goalId) {
  const db = loadDb();
  return db.goals[goalId] || null;
}

export function createGoal(goalPayload) {
  const db = loadDb();
  const user = db.users[goalPayload.userId];
  if (!user) throw new Error('User not found');

  const currentGoalsCount = Object.values(db.goals).filter(
    (g) => g.userId === goalPayload.userId && g.status === 'current'
  ).length;

  const limit = user.isPremium ? 20 : 10;
  if (currentGoalsCount >= limit) {
    const err = new Error('Goal limit reached');
    err.code = 'GOAL_LIMIT';
    throw err;
  }

  const id = uid('goal');
  const goal = {
    id,
    userId: goalPayload.userId,
    coachId: goalPayload.coachId,
    title: goalPayload.title,
    summary: goalPayload.summary || '',
    prompt: goalPayload.prompt || '',
    status: goalPayload.status || 'current',
    createdAt: nowIso(),
    availability: goalPayload.availability || {},
  };
  db.goals[id] = goal;
  user.lastViewedGoalId = id;
  db.users[user.id] = user;
  saveDb(db);
  return goal;
}

export function setGoalStatus(goalId, status) {
  const db = loadDb();
  if (!db.goals[goalId]) return null;
  db.goals[goalId] = { ...db.goals[goalId], status };
  saveDb(db);
  return db.goals[goalId];
}

// -------------------- Plans --------------------

export function saveTrainingPlan(planPayload) {
  const db = loadDb();
  const id = uid('plan');
  const plan = {
    id,
    userId: planPayload.userId,
    goalId: planPayload.goalId,
    coachId: planPayload.coachId,
    ...planPayload.planData,
    createdAt: nowIso(),
  };
  db.plans[id] = plan;
  saveDb(db);
  return plan;
}

export function getLatestPlanForGoal(goalId) {
  const db = loadDb();
  const plans = Object.values(db.plans).filter((p) => p.goalId === goalId);
  if (!plans.length) return null;
  plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return plans[0];
}

// -------------------- Session Logs --------------------

export function addSessionLog(logPayload) {
  const db = loadDb();
  const id = uid('log');
  const log = {
    id,
    planId: logPayload.planId,
    goalId: logPayload.goalId,
    dayIndex: Number(logPayload.dayIndex),
    completed: Boolean(logPayload.completed),
    difficulty: Number(logPayload.difficulty) || 5,
    soreness: logPayload.soreness || 'none',
    shootingMetrics: logPayload.shootingMetrics || {},
    notes: logPayload.notes || '',
    createdAt: nowIso(),
  };
  db.sessionLogs[id] = log;
  saveDb(db);
  return log;
}

export function getSessionLogsForGoal(goalId) {
  const db = loadDb();
  return Object.values(db.sessionLogs)
    .filter((l) => l.goalId === goalId)
    .sort((a, b) => a.dayIndex - b.dayIndex);
}

// -------------------- Misc --------------------

export function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY);
}

// -------------------- Aliases for Compatibility --------------------
// These match the imports expected by App.jsx and other components

export const getUser = getUserById;
export const getCoaches = getAllCoaches;
export const getGoals = getUserGoals;
export const getSessionLogs = getSessionLogsForGoal;
export const getTrainingPlan = getLatestPlanForGoal;