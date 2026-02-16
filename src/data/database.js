// Pace Hoops Coach Platform Database
// Uses localStorage to persist data across sessions

const STORAGE_KEY = 'paceHoopsDB';

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

// Load database from localStorage
const loadDatabase = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all required keys exist
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
    // Force a storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving database:', e);
  }
};

// The database object
export let database = loadDatabase();

// Listen for changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      database = loadDatabase();
    }
  });
  
  // Also reload periodically to catch changes
  setInterval(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Update database reference
        database.users = parsed.users || {};
        database.teams = parsed.teams || {};
        database.drills = parsed.drills || {};
        database.workouts = parsed.workouts || {};
        database.assignments = parsed.assignments || {};
        database.logs = parsed.logs || {};
        database.messages = parsed.messages || {};
        database.schedules = parsed.schedules || {};
        database.aiRecommendations = parsed.aiRecommendations || {};
      } catch (e) {}
    }
  }, 1000); // Check every second
}

// Initialize drill and workout library
export const initializeDatabase = () => {
  // Reload from localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      database.users = parsed.users || {};
      database.teams = parsed.teams || {};
      database.drills = parsed.drills || {};
      database.workouts = parsed.workouts || {};
      database.assignments = parsed.assignments || {};
      database.logs = parsed.logs || {};
      database.messages = parsed.messages || {};
      database.schedules = parsed.schedules || {};
      database.aiRecommendations = parsed.aiRecommendations || {};
    } catch (e) {}
  }

  // Only initialize drills/workouts if they don't exist
  if (Object.keys(database.drills).length > 0) {
    return;
  }

  // Basketball Skill Drills
  const drills = [
    {
      id: 'form-shooting',
      name: 'Form Shooting',
      category: 'shooting',
      type: 'skill',
      difficulty: 'beginner',
      duration: 15,
      description: 'Close-range shooting focusing on perfect form and mechanics.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Stand 3 feet from the basket',
        'Ball in shooting hand only',
        'Focus on elbow alignment and follow-through',
        'Make 10 shots before moving back'
      ]
    },
    {
      id: 'free-throws',
      name: 'Free Throw Routine',
      category: 'shooting',
      type: 'skill',
      difficulty: 'beginner',
      duration: 15,
      description: 'Consistent free throw practice.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Establish your routine',
        'Same routine every time',
        'Shoot sets of 10'
      ]
    },
    {
      id: 'spot-shooting',
      name: 'Spot Shooting (5 Spots)',
      category: 'shooting',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Catch and shoot from 5 spots.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Start in right corner',
        'Move around the arc',
        '10 shots per spot'
      ]
    },
    {
      id: 'off-dribble-shooting',
      name: 'Off-Dribble Pull-Ups',
      category: 'shooting',
      type: 'skill',
      difficulty: 'advanced',
      duration: 20,
      description: 'Game-speed pull-up jumpers.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Start at half court',
        'Attack with 2-3 dribbles',
        'Pull up at elbow'
      ]
    },
    {
      id: 'stationary-handles',
      name: 'Stationary Ball Handling',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'beginner',
      duration: 10,
      description: 'Basic ball handling drills.',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Pound dribbles',
        'Crossovers',
        'Between the legs'
      ]
    },
    {
      id: 'two-ball-dribbling',
      name: 'Two Ball Dribbling',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Advanced ball handling.',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Both balls together',
        'Alternating',
        'One high, one low'
      ]
    },
    {
      id: 'defensive-slides',
      name: 'Defensive Slide Series',
      category: 'defense',
      type: 'skill',
      difficulty: 'beginner',
      duration: 10,
      description: 'Lateral movement and positioning.',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Stance check',
        'Sideline slides',
        'Zig-zag slides'
      ]
    },
    {
      id: 'post-moves',
      name: 'Post Footwork',
      category: 'footwork',
      type: 'skill',
      difficulty: 'advanced',
      duration: 20,
      description: 'Low post offensive moves.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Drop step baseline',
        'Drop step middle',
        'Up and under'
      ]
    }
  ];

  const workouts = [
    {
      id: 'suicides',
      name: 'Suicides (Line Drills)',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Classic conditioning drill.',
      metrics: ['reps', 'time'],
      steps: ['Sprint to each line and back']
    },
    {
      id: 'court-sprints',
      name: 'Full Court Sprints',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'beginner',
      duration: 10,
      description: 'Baseline to baseline sprinting.',
      metrics: ['reps', 'time'],
      steps: ['Sprint baseline to baseline at 100%']
    },
    {
      id: 'squats',
      name: 'Squats',
      category: 'strength',
      type: 'lower-body',
      difficulty: 'beginner',
      duration: 10,
      description: 'Lower body strength.',
      metrics: ['sets', 'reps', 'weight'],
      steps: ['Feet shoulder-width', 'Lower until parallel', 'Drive through heels']
    },
    {
      id: 'lunges',
      name: 'Lunges',
      category: 'strength',
      type: 'lower-body',
      difficulty: 'beginner',
      duration: 10,
      description: 'Single-leg strength.',
      metrics: ['sets', 'reps', 'weight'],
      steps: ['Step forward', 'Both knees at 90 degrees', 'Push back']
    },
    {
      id: 'push-ups',
      name: 'Push-Ups',
      category: 'strength',
      type: 'upper-body',
      difficulty: 'beginner',
      duration: 5,
      description: 'Bodyweight pushing.',
      metrics: ['sets', 'reps'],
      steps: ['Hands shoulder-width', 'Lower chest to ground', 'Push back up']
    },
    {
      id: 'planks',
      name: 'Planks',
      category: 'strength',
      type: 'core',
      difficulty: 'beginner',
      duration: 5,
      description: 'Core stability.',
      metrics: ['sets', 'time'],
      steps: ['Forearms on ground', 'Body straight', 'Hold']
    },
    {
      id: 'box-jumps',
      name: 'Box Jumps',
      category: 'plyometrics',
      type: 'explosive',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Explosive power.',
      metrics: ['sets', 'reps'],
      steps: ['Stand facing box', 'Explode up', 'Land softly']
    },
    {
      id: 'jump-rope',
      name: 'Jump Rope',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'beginner',
      duration: 10,
      description: 'Footwork and conditioning.',
      metrics: ['time', 'reps'],
      steps: ['Basic bounce', 'Alternate feet', 'High knees']
    }
  ];

  drills.forEach(drill => database.drills[drill.id] = drill);
  workouts.forEach(workout => database.workouts[workout.id] = workout);
  saveDatabase();
};

// ============ USER MANAGEMENT ============

export const createUser = (userData) => {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user = {
    id: userId,
    email: userData.email.toLowerCase().trim(),
    name: userData.name,
    role: userData.role,
    createdAt: new Date().toISOString(),
    
    ...(userData.role === 'coach' && {
      teamIds: [],
      organization: userData.organization || ''
    }),
    
    ...(userData.role === 'player' && {
      teamId: userData.teamId || null,
      age: userData.age,
      position: userData.position || '',
      height: userData.height || '',
      weight: userData.weight || '',
      jerseyNumber: userData.jerseyNumber || ''
    })
  };
  
  database.users[userId] = user;
  saveDatabase();
  return user;
};

export const getUser = (userId) => {
  // Reload from localStorage to get latest
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.users && parsed.users[userId]) {
        return parsed.users[userId];
      }
    } catch (e) {}
  }
  return database.users[userId];
};

export const getUserByEmail = (email) => {
  if (!email) return null;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Reload from localStorage to get latest
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.users) {
        const found = Object.values(parsed.users).find(u => 
          u.email && u.email.toLowerCase().trim() === normalizedEmail
        );
        if (found) return found;
      }
    } catch (e) {}
  }
  
  return Object.values(database.users).find(u => 
    u.email && u.email.toLowerCase().trim() === normalizedEmail
  );
};

export const updateUser = (userId, updates) => {
  // Reload first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      database.users = parsed.users || {};
    } catch (e) {}
  }
  
  const user = database.users[userId];
  if (user) {
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    database.users[userId] = updated;
    saveDatabase();
    return updated;
  }
  return null;
};

// ============ TEAM MANAGEMENT ============

export const createTeam = (coachId, teamData) => {
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const joinCode = generateJoinCode();
  
  const team = {
    id: teamId,
    coachId,
    name: teamData.name,
    sport: 'basketball',
    level: teamData.level || '',
    season: teamData.season || '',
    joinCode,
    playerIds: [],
    createdAt: new Date().toISOString()
  };
  
  database.teams[teamId] = team;
  
  const coach = getUser(coachId);
  if (coach) {
    updateUser(coachId, { teamIds: [...(coach.teamIds || []), teamId] });
  }
  
  saveDatabase();
  return team;
};

export const getTeam = (teamId) => {
  if (!teamId) return null;
  
  // Reload from localStorage to get latest
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.teams && parsed.teams[teamId]) {
        return parsed.teams[teamId];
      }
    } catch (e) {}
  }
  return database.teams[teamId];
};

export const getTeamByJoinCode = (code) => {
  if (!code) return null;
  
  const normalizedCode = code.toUpperCase().trim();
  
  // ALWAYS reload from localStorage first to get the latest data
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.teams) {
        // Update local database reference
        database.teams = parsed.teams;
        
        const found = Object.values(parsed.teams).find(t => 
          t.joinCode && t.joinCode.toUpperCase() === normalizedCode
        );
        if (found) {
          console.log('Found team by join code:', found.name, found.joinCode);
          return found;
        }
      }
    } catch (e) {
      console.error('Error parsing stored data:', e);
    }
  }
  
  // Fallback to in-memory database
  const result = Object.values(database.teams).find(t => 
    t.joinCode && t.joinCode.toUpperCase() === normalizedCode
  );
  
  console.log('getTeamByJoinCode result:', code, '->', result?.name || 'NOT FOUND');
  console.log('Available teams:', Object.values(database.teams).map(t => ({ name: t.name, code: t.joinCode })));
  
  return result;
};

export const getCoachTeams = (coachId) => {
  return Object.values(database.teams).filter(t => t.coachId === coachId);
};

export const addPlayerToTeam = (teamId, playerId) => {
  // Reload first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      database.teams = parsed.teams || {};
      database.users = parsed.users || {};
    } catch (e) {}
  }
  
  const team = database.teams[teamId];
  if (team && !team.playerIds.includes(playerId)) {
    team.playerIds.push(playerId);
    database.teams[teamId] = team;
    updateUser(playerId, { teamId });
    saveDatabase();
    return team;
  }
  return null;
};

export const removePlayerFromTeam = (teamId, playerId) => {
  const team = database.teams[teamId];
  if (team) {
    team.playerIds = team.playerIds.filter(id => id !== playerId);
    database.teams[teamId] = team;
    updateUser(playerId, { teamId: null });
    saveDatabase();
    return team;
  }
  return null;
};

export const getTeamPlayers = (teamId) => {
  const team = getTeam(teamId);
  if (!team) return [];
  return team.playerIds.map(id => getUser(id)).filter(Boolean);
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

export const createAssignment = (coachId, teamId, assignmentData) => {
  const assignmentId = `assign_${Date.now()}`;
  
  const assignment = {
    id: assignmentId,
    coachId,
    teamId,
    title: assignmentData.title,
    description: assignmentData.description || '',
    type: assignmentData.type,
    items: assignmentData.items,
    assignedTo: assignmentData.assignedTo || 'team',
    dueDate: assignmentData.dueDate,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  database.assignments[assignmentId] = assignment;
  saveDatabase();
  return assignment;
};

export const getAssignment = (assignmentId) => database.assignments[assignmentId];

export const getTeamAssignments = (teamId) => {
  return Object.values(database.assignments)
    .filter(a => a.teamId === teamId && a.status === 'active')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getPlayerAssignments = (playerId, teamId) => {
  return Object.values(database.assignments)
    .filter(a => {
      if (a.teamId !== teamId || a.status !== 'active') return false;
      if (a.assignedTo === 'team') return true;
      if (Array.isArray(a.assignedTo)) return a.assignedTo.includes(playerId);
      return false;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

export const deleteAssignment = (assignmentId) => {
  delete database.assignments[assignmentId];
  saveDatabase();
  return true;
};

// ============ LOG MANAGEMENT ============

export const createLog = (playerId, logData) => {
  const logId = `log_${Date.now()}`;
  
  const log = {
    id: logId,
    playerId,
    assignmentId: logData.assignmentId,
    itemId: logData.itemId,
    itemType: logData.itemType,
    createdAt: new Date().toISOString(),
    makes: logData.makes,
    attempts: logData.attempts,
    percentage: logData.attempts > 0 ? Math.round((logData.makes / logData.attempts) * 100) : null,
    sets: logData.sets,
    reps: logData.reps,
    weight: logData.weight,
    time: logData.time,
    difficulty: logData.difficulty,
    soreness: logData.soreness || 'none',
    notes: logData.notes,
    completed: logData.completed !== false
  };
  
  database.logs[logId] = log;
  saveDatabase();
  return log;
};

export const getPlayerLogs = (playerId, options = {}) => {
  let logs = Object.values(database.logs).filter(l => l.playerId === playerId);
  
  if (options.assignmentId) {
    logs = logs.filter(l => l.assignmentId === options.assignmentId);
  }
  
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAssignmentLogs = (assignmentId) => {
  return Object.values(database.logs)
    .filter(l => l.assignmentId === assignmentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getTeamLogs = (teamId, options = {}) => {
  const team = getTeam(teamId);
  if (!team) return [];
  
  let logs = Object.values(database.logs)
    .filter(l => team.playerIds.includes(l.playerId));
  
  if (options.since) {
    logs = logs.filter(l => new Date(l.createdAt) >= new Date(options.since));
  }
  
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// ============ SCHEDULE MANAGEMENT ============

export const createScheduleEvent = (coachId, teamId, eventData) => {
  const eventId = `event_${Date.now()}`;
  
  const event = {
    id: eventId,
    coachId,
    teamId,
    title: eventData.title,
    type: eventData.type,
    date: eventData.date,
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    location: eventData.location || '',
    notes: eventData.notes || '',
    createdAt: new Date().toISOString()
  };
  
  database.schedules[eventId] = event;
  saveDatabase();
  return event;
};

export const getTeamSchedule = (teamId, options = {}) => {
  let events = Object.values(database.schedules).filter(e => e.teamId === teamId);
  
  if (options.from) {
    events = events.filter(e => new Date(e.date) >= new Date(options.from));
  }
  
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const deleteScheduleEvent = (eventId) => {
  delete database.schedules[eventId];
  saveDatabase();
  return true;
};

// ============ MESSAGE MANAGEMENT ============

export const createMessage = (senderId, messageData) => {
  const messageId = `msg_${Date.now()}`;
  
  const message = {
    id: messageId,
    senderId,
    teamId: messageData.teamId,
    recipientId: messageData.recipientId || null,
    content: messageData.content,
    createdAt: new Date().toISOString(),
    readBy: [senderId]
  };
  
  database.messages[messageId] = message;
  saveDatabase();
  return message;
};

export const getTeamMessages = (teamId, limit = 50) => {
  return Object.values(database.messages)
    .filter(m => m.teamId === teamId && !m.recipientId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-limit);
};

// ============ DRILL/WORKOUT LIBRARY ============

export const getAllDrills = () => Object.values(database.drills);
export const getDrill = (drillId) => database.drills[drillId];
export const getAllWorkouts = () => Object.values(database.workouts);
export const getWorkout = (workoutId) => database.workouts[workoutId];

// ============ AI RECOMMENDATIONS ============

export const saveRecommendation = (teamId, playerId, recommendation) => {
  const recId = `rec_${Date.now()}`;
  const rec = {
    id: recId,
    teamId,
    playerId,
    ...recommendation,
    createdAt: new Date().toISOString(),
    dismissed: false
  };
  database.aiRecommendations[recId] = rec;
  saveDatabase();
  return rec;
};

export const getTeamRecommendations = (teamId, options = {}) => {
  let recs = Object.values(database.aiRecommendations).filter(r => r.teamId === teamId);
  if (!options.includeDismissed) {
    recs = recs.filter(r => !r.dismissed);
  }
  return recs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const dismissRecommendation = (recId) => {
  if (database.aiRecommendations[recId]) {
    database.aiRecommendations[recId].dismissed = true;
    saveDatabase();
  }
};

// ============ ANALYTICS HELPERS ============

export const getPlayerStats = (playerId, options = {}) => {
  const logs = getPlayerLogs(playerId, options);
  
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
    soreness: {
      recentHighSoreness: recentSoreness.length,
      hasRecentSoreness: recentSoreness.length > 0
    }
  };
};

export const getTeamStats = (teamId, options = {}) => {
  const team = getTeam(teamId);
  if (!team) return null;
  
  const playerStats = team.playerIds.map(playerId => ({
    playerId,
    player: getUser(playerId),
    stats: getPlayerStats(playerId, options)
  }));
  
  const totalLogs = playerStats.reduce((sum, p) => sum + p.stats.totalLogs, 0);
  const totalMakes = playerStats.reduce((sum, p) => sum + p.stats.shooting.makes, 0);
  const totalAttempts = playerStats.reduce((sum, p) => sum + p.stats.shooting.attempts, 0);
  const playersWithHighSoreness = playerStats.filter(p => p.stats.soreness.hasRecentSoreness);
  
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
        playersWithHighSoreness: playersWithHighSoreness.length,
        playersAtRisk: playersWithHighSoreness.map(p => ({
          player: p.player,
          recentHighSoreness: p.stats.soreness.recentHighSoreness
        }))
      }
    }
  };
};

// ============ DATABASE RESET ============
export const resetDatabase = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('paceHoops_session');
  database = createEmptyDB();
  initializeDatabase();
};
