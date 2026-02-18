// Pace Hoops Coach Platform Database
// Uses localStorage to persist data across sessions

const STORAGE_KEY = 'paceHoopsDB';
const ROSTER_CAP = 12;

// Initialize database structure
const createEmptyDB = () => ({
  users: {},
  teams: {},
  drills: {},
  workouts: {},
  assignments: {},
  logs: {},
  messages: {},
  schedules: {},
  aiRecommendations: {}
});

// Load database from localStorage - ALWAYS fresh read
const loadDatabase = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        users: parsed.users || {},
        teams: parsed.teams || {},
        drills: parsed.drills || {},
        workouts: parsed.workouts || {},
        assignments: parsed.assignments || {},
        logs: parsed.logs || {},
        messages: parsed.messages || {},
        schedules: parsed.schedules || {},
        aiRecommendations: parsed.aiRecommendations || {}
      };
    }
  } catch (e) {
    console.error('Error loading database:', e);
  }
  return createEmptyDB();
};

// Save database to localStorage
const saveDatabase = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    console.log('Database saved. Teams:', Object.keys(database.teams).length);
  } catch (e) {
    console.error('Error saving database:', e);
  }
};

// Force reload from localStorage
const forceReload = () => {
  const fresh = loadDatabase();
  database.users = fresh.users;
  database.teams = fresh.teams;
  database.drills = fresh.drills;
  database.workouts = fresh.workouts;
  database.assignments = fresh.assignments;
  database.logs = fresh.logs;
  database.messages = fresh.messages;
  database.schedules = fresh.schedules;
  database.aiRecommendations = fresh.aiRecommendations;
};

// The database object
export let database = loadDatabase();

// Initialize drill and workout library
export const initializeDatabase = () => {
  forceReload();

  if (Object.keys(database.drills).length > 0) {
    return;
  }

  const drills = [
    { id: 'form-shooting', name: 'Form Shooting', category: 'shooting', type: 'skill', difficulty: 'beginner', duration: 15, description: 'Close-range shooting focusing on form.', requiresAccuracyLog: true, metrics: ['makes', 'attempts'], steps: ['Stand 3 feet from basket', 'Focus on elbow alignment', 'Follow through'] },
    { id: 'free-throws', name: 'Free Throw Routine', category: 'shooting', type: 'skill', difficulty: 'beginner', duration: 15, description: 'Consistent free throw practice.', requiresAccuracyLog: true, metrics: ['makes', 'attempts'], steps: ['Establish routine', 'Same motion every time', 'Shoot sets of 10'] },
    { id: 'spot-shooting', name: 'Spot Shooting (5 Spots)', category: 'shooting', type: 'skill', difficulty: 'intermediate', duration: 20, description: 'Catch and shoot from 5 spots.', requiresAccuracyLog: true, metrics: ['makes', 'attempts'], steps: ['Start in corner', 'Move around arc', '10 shots per spot'] },
    { id: 'off-dribble-shooting', name: 'Off-Dribble Pull-Ups', category: 'shooting', type: 'skill', difficulty: 'advanced', duration: 20, description: 'Game-speed pull-up jumpers.', requiresAccuracyLog: true, metrics: ['makes', 'attempts'], steps: ['Attack with 2-3 dribbles', 'Pull up at elbow', '10 each side'] },
    { id: 'stationary-handles', name: 'Stationary Ball Handling', category: 'ball-handling', type: 'skill', difficulty: 'beginner', duration: 10, description: 'Basic ball handling drills.', requiresAccuracyLog: false, metrics: ['completed'], steps: ['Pound dribbles', 'Crossovers', 'Between legs'] },
    { id: 'two-ball-dribbling', name: 'Two Ball Dribbling', category: 'ball-handling', type: 'skill', difficulty: 'intermediate', duration: 10, description: 'Advanced ball handling.', requiresAccuracyLog: false, metrics: ['completed'], steps: ['Both together', 'Alternating', 'Walking'] },
    { id: 'defensive-slides', name: 'Defensive Slide Series', category: 'defense', type: 'skill', difficulty: 'beginner', duration: 10, description: 'Lateral movement drills.', requiresAccuracyLog: false, metrics: ['completed'], steps: ['Stance check', 'Sideline slides', 'Zig-zag'] },
    { id: 'post-moves', name: 'Post Footwork', category: 'footwork', type: 'skill', difficulty: 'advanced', duration: 20, description: 'Low post moves.', requiresAccuracyLog: true, metrics: ['makes', 'attempts'], steps: ['Drop step', 'Up and under', 'Hook shot'] }
  ];

  const workouts = [
    { id: 'suicides', name: 'Suicides', category: 'conditioning', type: 'cardio', difficulty: 'intermediate', duration: 10, description: 'Line drill conditioning.', metrics: ['reps', 'time'], steps: ['Sprint to each line and back'] },
    { id: 'court-sprints', name: 'Full Court Sprints', category: 'conditioning', type: 'cardio', difficulty: 'beginner', duration: 10, description: 'Baseline to baseline.', metrics: ['reps', 'time'], steps: ['Sprint 100%', 'Walk back'] },
    { id: 'squats', name: 'Squats', category: 'strength', type: 'lower-body', difficulty: 'beginner', duration: 10, description: 'Lower body strength.', metrics: ['sets', 'reps', 'weight'], steps: ['Feet shoulder-width', 'Lower parallel', 'Drive up'] },
    { id: 'lunges', name: 'Lunges', category: 'strength', type: 'lower-body', difficulty: 'beginner', duration: 10, description: 'Single-leg strength.', metrics: ['sets', 'reps', 'weight'], steps: ['Step forward', '90 degree angles', 'Alternate'] },
    { id: 'push-ups', name: 'Push-Ups', category: 'strength', type: 'upper-body', difficulty: 'beginner', duration: 5, description: 'Upper body pushing.', metrics: ['sets', 'reps'], steps: ['Hands shoulder-width', 'Lower chest', 'Push up'] },
    { id: 'planks', name: 'Planks', category: 'strength', type: 'core', difficulty: 'beginner', duration: 5, description: 'Core stability.', metrics: ['sets', 'time'], steps: ['Forearms down', 'Body straight', 'Hold'] },
    { id: 'box-jumps', name: 'Box Jumps', category: 'plyometrics', type: 'explosive', difficulty: 'intermediate', duration: 10, description: 'Explosive power.', metrics: ['sets', 'reps'], steps: ['Face box', 'Explode up', 'Land soft'] },
    { id: 'jump-rope', name: 'Jump Rope', category: 'conditioning', type: 'cardio', difficulty: 'beginner', duration: 10, description: 'Footwork and conditioning.', metrics: ['time', 'reps'], steps: ['Basic bounce', 'Alternate feet', 'High knees'] }
  ];

  drills.forEach(d => database.drills[d.id] = d);
  workouts.forEach(w => database.workouts[w.id] = w);
  saveDatabase();
};

// ============ USER MANAGEMENT ============

export const createUser = (userData) => {
  forceReload();
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user = {
    id: userId,
    email: userData.email.toLowerCase().trim(),
    name: userData.name,
    role: userData.role,
    createdAt: new Date().toISOString(),
    ...(userData.role === 'coach' && { teamIds: [], organization: userData.organization || '' }),
    ...(userData.role === 'player' && {
      teamId: userData.teamId || null,
      age: userData.age,
      position: userData.position || '',
      jerseyNumber: userData.jerseyNumber || ''
    })
  };
  database.users[userId] = user;
  saveDatabase();
  return user;
};

export const getUser = (userId) => {
  forceReload();
  return database.users[userId];
};

export const getUserByEmail = (email) => {
  if (!email) return null;
  forceReload();
  const normalizedEmail = email.toLowerCase().trim();
  return Object.values(database.users).find(u => u.email?.toLowerCase().trim() === normalizedEmail);
};

export const updateUser = (userId, updates) => {
  forceReload();
  const user = database.users[userId];
  if (user) {
    database.users[userId] = { ...user, ...updates, updatedAt: new Date().toISOString() };
    saveDatabase();
    return database.users[userId];
  }
  return null;
};

// ============ TEAM MANAGEMENT ============

export const createTeam = (coachId, teamData) => {
  forceReload();
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const joinCode = generateJoinCode();
  const team = {
    id: teamId,
    coachId,
    name: teamData.name,
    sport: 'basketball',
    level: teamData.level || '',
    joinCode,
    playerIds: [],
    createdAt: new Date().toISOString()
  };
  database.teams[teamId] = team;
  
  console.log('Created team:', team.name, 'with code:', joinCode);
  console.log('All teams now:', Object.values(database.teams).map(t => ({ name: t.name, code: t.joinCode })));
  
  const coach = database.users[coachId];
  if (coach) {
    database.users[coachId] = { ...coach, teamIds: [...(coach.teamIds || []), teamId] };
  }
  saveDatabase();
  return team;
};

export const getTeam = (teamId) => {
  if (!teamId) return null;
  forceReload();
  return database.teams[teamId];
};

export const getTeamByJoinCode = (code) => {
  if (!code) return null;
  
  // CRITICAL: Force reload from localStorage to get latest data
  forceReload();
  
  const normalizedCode = code.toUpperCase().trim();
  
  console.log('Looking for team with code:', normalizedCode);
  console.log('Available teams:', Object.values(database.teams).map(t => ({ name: t.name, code: t.joinCode })));
  
  const found = Object.values(database.teams).find(t => 
    t.joinCode && t.joinCode.toUpperCase().trim() === normalizedCode
  );
  
  if (found) {
    console.log('Found team:', found.name);
  } else {
    console.log('Team NOT found for code:', normalizedCode);
  }
  
  return found || null;
};

export const getCoachTeams = (coachId) => {
  forceReload();
  return Object.values(database.teams).filter(t => t.coachId === coachId);
};

export const addPlayerToTeam = (teamId, playerId) => {
  forceReload();
  const team = database.teams[teamId];
  if (!team) return { error: 'Team not found' };
  
  if (team.playerIds && team.playerIds.length >= ROSTER_CAP) {
    return { error: `Team has reached maximum roster size (${ROSTER_CAP} players)` };
  }
  
  if (!team.playerIds) team.playerIds = [];
  if (!team.playerIds.includes(playerId)) {
    team.playerIds.push(playerId);
    database.teams[teamId] = team;
    
    const player = database.users[playerId];
    if (player) {
      database.users[playerId] = { ...player, teamId };
    }
    saveDatabase();
  }
  return team;
};

export const removePlayerFromTeam = (teamId, playerId) => {
  forceReload();
  const team = database.teams[teamId];
  if (team) {
    team.playerIds = (team.playerIds || []).filter(id => id !== playerId);
    database.teams[teamId] = team;
    
    const player = database.users[playerId];
    if (player) {
      database.users[playerId] = { ...player, teamId: null };
    }
    saveDatabase();
    return team;
  }
  return null;
};

export const getTeamPlayers = (teamId) => {
  const team = getTeam(teamId);
  if (!team) return [];
  return (team.playerIds || []).map(id => database.users[id]).filter(Boolean);
};

const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ============ ASSIGNMENT MANAGEMENT ============

export const createAssignment = (coachId, teamId, data) => {
  forceReload();
  const id = `assign_${Date.now()}`;
  const assignment = {
    id, coachId, teamId,
    title: data.title,
    description: data.description || '',
    type: data.type,
    items: data.items,
    assignedTo: data.assignedTo || 'team',
    dueDate: data.dueDate,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  database.assignments[id] = assignment;
  saveDatabase();
  return assignment;
};

export const getTeamAssignments = (teamId) => {
  forceReload();
  return Object.values(database.assignments)
    .filter(a => a.teamId === teamId && a.status === 'active')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getPlayerAssignments = (playerId, teamId) => {
  forceReload();
  return Object.values(database.assignments)
    .filter(a => {
      if (a.teamId !== teamId || a.status !== 'active') return false;
      if (a.assignedTo === 'team') return true;
      if (Array.isArray(a.assignedTo)) return a.assignedTo.includes(playerId);
      return false;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

export const deleteAssignment = (id) => {
  forceReload();
  delete database.assignments[id];
  saveDatabase();
};

// ============ LOG MANAGEMENT ============

export const createLog = (playerId, data) => {
  forceReload();
  const id = `log_${Date.now()}`;
  const log = {
    id, playerId,
    assignmentId: data.assignmentId,
    itemId: data.itemId,
    itemType: data.itemType,
    createdAt: new Date().toISOString(),
    makes: data.makes,
    attempts: data.attempts,
    percentage: data.attempts > 0 ? Math.round((data.makes / data.attempts) * 100) : null,
    sets: data.sets,
    reps: data.reps,
    weight: data.weight,
    time: data.time,
    difficulty: data.difficulty,
    soreness: data.soreness || 'none',
    notes: data.notes,
    completed: data.completed !== false
  };
  database.logs[id] = log;
  saveDatabase();
  return log;
};

export const getPlayerLogs = (playerId, options = {}) => {
  forceReload();
  let logs = Object.values(database.logs).filter(l => l.playerId === playerId);
  if (options.assignmentId) logs = logs.filter(l => l.assignmentId === options.assignmentId);
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAssignmentLogs = (assignmentId) => {
  forceReload();
  return Object.values(database.logs).filter(l => l.assignmentId === assignmentId);
};

export const getTeamLogs = (teamId, options = {}) => {
  const team = getTeam(teamId);
  if (!team) return [];
  let logs = Object.values(database.logs).filter(l => (team.playerIds || []).includes(l.playerId));
  if (options.since) logs = logs.filter(l => new Date(l.createdAt) >= new Date(options.since));
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// ============ SCHEDULE MANAGEMENT ============

export const createScheduleEvent = (coachId, teamId, data) => {
  forceReload();
  const id = `event_${Date.now()}`;
  const event = { id, coachId, teamId, ...data, createdAt: new Date().toISOString() };
  database.schedules[id] = event;
  saveDatabase();
  return event;
};

export const getTeamSchedule = (teamId) => {
  forceReload();
  return Object.values(database.schedules)
    .filter(e => e.teamId === teamId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const deleteScheduleEvent = (id) => {
  forceReload();
  delete database.schedules[id];
  saveDatabase();
};

// ============ MESSAGE MANAGEMENT ============

export const createMessage = (senderId, data) => {
  forceReload();
  const id = `msg_${Date.now()}`;
  const message = {
    id, senderId,
    teamId: data.teamId,
    content: data.content,
    createdAt: new Date().toISOString(),
    readBy: [senderId]
  };
  database.messages[id] = message;
  saveDatabase();
  return message;
};

export const getTeamMessages = (teamId, limit = 50) => {
  forceReload();
  return Object.values(database.messages)
    .filter(m => m.teamId === teamId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-limit);
};

export const markMessageRead = (messageId, userId) => {
  forceReload();
  const msg = database.messages[messageId];
  if (msg && !msg.readBy?.includes(userId)) {
    msg.readBy = [...(msg.readBy || []), userId];
    database.messages[messageId] = msg;
    saveDatabase();
  }
};

// ============ LIBRARY ============

export const getAllDrills = () => {
  forceReload();
  return Object.values(database.drills);
};
export const getDrill = (id) => database.drills[id];
export const getAllWorkouts = () => {
  forceReload();
  return Object.values(database.workouts);
};
export const getWorkout = (id) => database.workouts[id];

// ============ AI RECOMMENDATIONS ============

export const getTeamRecommendations = (teamId) => {
  forceReload();
  return Object.values(database.aiRecommendations).filter(r => r.teamId === teamId && !r.dismissed);
};

// ============ ANALYTICS ============

export const getPlayerStats = (playerId) => {
  const logs = getPlayerLogs(playerId);
  const shootingLogs = logs.filter(l => l.makes !== undefined && l.attempts !== undefined);
  const totalMakes = shootingLogs.reduce((sum, l) => sum + (l.makes || 0), 0);
  const totalAttempts = shootingLogs.reduce((sum, l) => sum + (l.attempts || 0), 0);
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentLogs = logs.filter(l => new Date(l.createdAt) >= weekAgo);
  const recentSoreness = recentLogs.filter(l => l.soreness === 'moderate' || l.soreness === 'severe');

  return {
    totalLogs: logs.length,
    shooting: {
      makes: totalMakes,
      attempts: totalAttempts,
      percentage: totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : null
    },
    completionRate: logs.length > 0 ? Math.round((logs.filter(l => l.completed).length / logs.length) * 100) : 100,
    soreness: { recentHighSoreness: recentSoreness.length, hasRecentSoreness: recentSoreness.length > 0 }
  };
};

export const getTeamStats = (teamId) => {
  const team = getTeam(teamId);
  if (!team) return null;
  
  const playerStats = (team.playerIds || []).map(id => ({
    playerId: id,
    player: database.users[id],
    stats: getPlayerStats(id)
  }));

  const totalLogs = playerStats.reduce((sum, p) => sum + p.stats.totalLogs, 0);
  const totalMakes = playerStats.reduce((sum, p) => sum + p.stats.shooting.makes, 0);
  const totalAttempts = playerStats.reduce((sum, p) => sum + p.stats.shooting.attempts, 0);
  const playersWithSoreness = playerStats.filter(p => p.stats.soreness.hasRecentSoreness);

  return {
    playerStats,
    teamTotals: {
      totalLogs,
      shooting: {
        makes: totalMakes,
        attempts: totalAttempts,
        percentage: totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : null
      },
      avgCompletionRate: playerStats.length > 0 
        ? Math.round(playerStats.reduce((sum, p) => sum + p.stats.completionRate, 0) / playerStats.length) 
        : 0,
      soreness: {
        playersWithHighSoreness: playersWithSoreness.length,
        playersAtRisk: playersWithSoreness.map(p => ({ player: p.player, recentHighSoreness: p.stats.soreness.recentHighSoreness }))
      }
    }
  };
};

export const resetDatabase = () => {
  localStorage.removeItem(STORAGE_KEY);
  database = createEmptyDB();
  initializeDatabase();
};
