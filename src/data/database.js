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

// Load database from localStorage or create new
const loadDatabase = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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
  } catch (e) {
    console.error('Error saving database:', e);
  }
};

// The database object
export let database = loadDatabase();

// Initialize drill and workout library
export const initializeDatabase = () => {
  // Only initialize drills/workouts if they don't exist
  if (Object.keys(database.drills).length > 0) {
    return; // Already initialized
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
      videoUrl: 'https://www.youtube.com/watch?v=Hj5hZt6rZGc',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Stand 3 feet from the basket, feet shoulder-width apart',
        'Ball in shooting hand only, elbow under the ball',
        'Focus on straight elbow, flick of the wrist, hold follow-through',
        'Make 10 shots before moving back to 5 feet',
        'Make 10 more, then move to 8 feet',
        'Track makes/attempts at each distance'
      ]
    },
    {
      id: 'free-throws',
      name: 'Free Throw Routine',
      category: 'shooting',
      type: 'skill',
      difficulty: 'beginner',
      duration: 15,
      description: 'Consistent free throw practice with pre-shot routine.',
      videoUrl: 'https://www.youtube.com/watch?v=YFJ5aI5vF6Y',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Establish your routine: dribbles, breath, focus point',
        'Same routine every single time',
        'Shoot sets of 10, track percentage',
        'Goal: 70%+ consistency',
        'Add pressure: must make 2 in a row to finish'
      ]
    },
    {
      id: 'spot-shooting',
      name: 'Spot Shooting (5 Spots)',
      category: 'shooting',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Catch and shoot from 5 spots around the arc.',
      videoUrl: 'https://www.youtube.com/watch?v=YyqkYFzQ9Rk',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Start in right corner, catch and shoot 10 shots',
        'Move to right wing, 10 shots',
        'Top of key, 10 shots',
        'Left wing, 10 shots',
        'Left corner, 10 shots',
        'Track makes/attempts per spot and total'
      ]
    },
    {
      id: 'off-dribble-shooting',
      name: 'Off-Dribble Pull-Ups',
      category: 'shooting',
      type: 'skill',
      difficulty: 'advanced',
      duration: 20,
      description: 'Game-speed pull-up jumpers off the dribble.',
      videoUrl: 'https://www.youtube.com/watch?v=YyqkYFzQ9Rk',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Start at half court, attack with 2-3 dribbles',
        'Pull up at elbow for mid-range jumper',
        '10 from right side, 10 from left side',
        'Add crossover into pull-up: 10 each side',
        'Track total makes/attempts'
      ]
    },
    {
      id: 'stationary-handles',
      name: 'Stationary Ball Handling',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'beginner',
      duration: 10,
      description: 'Basic ball handling drills in place.',
      videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Pound dribbles: 30 seconds each hand, as hard as possible',
        'Crossovers: 30 seconds, low and tight',
        'Between the legs: 30 seconds each direction',
        'Behind the back: 30 seconds each direction',
        'Combo: cross-between-behind, 1 minute continuous'
      ]
    },
    {
      id: 'two-ball-dribbling',
      name: 'Two Ball Dribbling',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Advanced ball handling with two basketballs.',
      videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Both balls together: 30 seconds',
        'Alternating: 30 seconds',
        'One high, one low: 30 seconds',
        'Both crossover together: 30 seconds',
        'Walking forward with alternating: length of court x 4'
      ]
    },
    {
      id: 'full-court-handles',
      name: 'Full Court Ball Handling',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Ball handling while moving full court.',
      videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Right hand only down, left hand back',
        'Crossover at each free throw line and half court',
        'Between legs at each line',
        'Behind back at each line',
        'Speed dribble: baseline to baseline under 4 seconds',
        'Repeat sequence 4 times'
      ]
    },
    {
      id: 'defensive-slides',
      name: 'Defensive Slide Series',
      category: 'defense',
      type: 'skill',
      difficulty: 'beginner',
      duration: 10,
      description: 'Lateral movement and defensive positioning.',
      videoUrl: 'https://www.youtube.com/watch?v=2QK4VQ5u4fA',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Stance check: low, wide, hands active',
        'Sideline to sideline slides, stay low, 5 reps',
        'Zig-zag slides: baseline to half court, 4 reps',
        'Close-out drill: sprint, breakdown, slide, 10 reps',
        'Drop step reaction: 10 each direction'
      ]
    },
    {
      id: 'one-on-one-defense',
      name: '1-on-1 Defensive Shell',
      category: 'defense',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Positioning and footwork against offensive player.',
      videoUrl: 'https://www.youtube.com/watch?v=2QK4VQ5u4fA',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Partner or cone as offensive player',
        'Maintain arm-length distance',
        'Mirror movements: 2 minutes',
        'React to drives: cut off without reaching, 10 reps',
        'Contest shots without fouling: 10 reps'
      ]
    },
    {
      id: 'wall-passing',
      name: 'Wall Passing Series',
      category: 'passing',
      type: 'skill',
      difficulty: 'beginner',
      duration: 10,
      description: 'Passing accuracy and speed against a wall.',
      videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Chest passes: 50 reps, hit same spot on wall',
        'Bounce passes: 50 reps, ball should hit 2/3 distance',
        'One-hand push passes: 25 each hand',
        'Overhead passes: 25 reps',
        'Speed round: as many chest passes in 30 seconds'
      ]
    },
    {
      id: 'triple-threat',
      name: 'Triple Threat Moves',
      category: 'footwork',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Offensive footwork from triple threat position.',
      videoUrl: 'https://www.youtube.com/watch?v=YFJ5aI5vF6Y',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Triple threat stance: ball protected, knees bent',
        'Jab step right, jab step left: 20 total',
        'Jab and go: attack opposite direction, 10 each way',
        'Jab and shoot: pull back into shot, 10 each way',
        'Shot fake to drive: 10 each direction',
        'Combine all moves in random sequence: 3 minutes'
      ]
    },
    {
      id: 'post-moves',
      name: 'Post Footwork',
      category: 'footwork',
      type: 'skill',
      difficulty: 'advanced',
      duration: 20,
      description: 'Low post offensive moves and counters.',
      videoUrl: 'https://www.youtube.com/watch?v=YFJ5aI5vF6Y',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Drop step baseline: 10 each side',
        'Drop step middle: 10 each side',
        'Up and under: 10 each side',
        'Hook shot: 10 each side',
        'Face-up jumper from post: 10 attempts',
        'Track makes on finishing moves'
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
      description: 'Classic basketball conditioning drill.',
      metrics: ['reps', 'time'],
      steps: [
        'Start at baseline',
        'Sprint to free throw line and back',
        'Sprint to half court and back',
        'Sprint to far free throw line and back',
        'Sprint to far baseline and back',
        'That is 1 rep. Rest 45 seconds. Repeat.'
      ]
    },
    {
      id: 'seventeens',
      name: '17s (Sideline to Sideline)',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'advanced',
      duration: 10,
      description: 'Sideline sprints for conditioning.',
      metrics: ['reps', 'time'],
      steps: [
        'Start at sideline',
        'Sprint to opposite sideline and back',
        'Must complete 17 touches in under set time',
        'Typical goal: 17 touches in 60-70 seconds',
        'Rest 1-2 minutes between sets'
      ]
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
      steps: [
        'Sprint baseline to baseline at 100%',
        'Walk back to start line',
        'Repeat for set number of reps',
        'Track time on each sprint'
      ]
    },
    {
      id: 'squats',
      name: 'Squats',
      category: 'strength',
      type: 'lower-body',
      difficulty: 'beginner',
      duration: 10,
      description: 'Fundamental lower body strength exercise.',
      metrics: ['sets', 'reps', 'weight'],
      steps: [
        'Feet shoulder-width apart, toes slightly out',
        'Keep chest up, core tight',
        'Lower until thighs parallel to ground',
        'Drive through heels to stand',
        'Can be bodyweight, goblet, or barbell'
      ]
    },
    {
      id: 'lunges',
      name: 'Lunges',
      category: 'strength',
      type: 'lower-body',
      difficulty: 'beginner',
      duration: 10,
      description: 'Single-leg strength and balance.',
      metrics: ['sets', 'reps', 'weight'],
      steps: [
        'Step forward into lunge position',
        'Both knees at 90 degrees',
        'Push back to starting position',
        'Alternate legs or do all one side first',
        'Can be walking, stationary, or reverse'
      ]
    },
    {
      id: 'deadlifts',
      name: 'Deadlifts',
      category: 'strength',
      type: 'lower-body',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Posterior chain strength builder.',
      metrics: ['sets', 'reps', 'weight'],
      steps: [
        'Bar over mid-foot, feet hip-width',
        'Hinge at hips, grip bar outside knees',
        'Flat back, chest up, shoulders back',
        'Drive through floor, extend hips',
        'Control descent back to floor'
      ]
    },
    {
      id: 'bench-press',
      name: 'Bench Press',
      category: 'strength',
      type: 'upper-body',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Upper body pushing strength.',
      metrics: ['sets', 'reps', 'weight'],
      steps: [
        'Lie flat, eyes under bar',
        'Grip slightly wider than shoulders',
        'Unrack, lower to chest with control',
        'Press up explosively',
        'Keep feet flat, back slightly arched'
      ]
    },
    {
      id: 'pull-ups',
      name: 'Pull-Ups',
      category: 'strength',
      type: 'upper-body',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Upper body pulling strength.',
      metrics: ['sets', 'reps'],
      steps: [
        'Hang with arms fully extended',
        'Pull until chin over bar',
        'Lower with control',
        'Can use band assistance if needed',
        'Vary grip: wide, close, underhand'
      ]
    },
    {
      id: 'push-ups',
      name: 'Push-Ups',
      category: 'strength',
      type: 'upper-body',
      difficulty: 'beginner',
      duration: 5,
      description: 'Bodyweight pushing exercise.',
      metrics: ['sets', 'reps'],
      steps: [
        'Hands shoulder-width, body straight line',
        'Lower chest to ground',
        'Push back up to start',
        'Keep core tight throughout',
        'Modify on knees if needed'
      ]
    },
    {
      id: 'planks',
      name: 'Planks',
      category: 'strength',
      type: 'core',
      difficulty: 'beginner',
      duration: 5,
      description: 'Core stability exercise.',
      metrics: ['sets', 'time'],
      steps: [
        'Forearms on ground, elbows under shoulders',
        'Body in straight line from head to heels',
        'Squeeze glutes and core',
        'Hold for prescribed time',
        'Add side planks for obliques'
      ]
    },
    {
      id: 'box-jumps',
      name: 'Box Jumps',
      category: 'plyometrics',
      type: 'explosive',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Explosive lower body power.',
      metrics: ['sets', 'reps'],
      steps: [
        'Stand facing box, feet shoulder-width',
        'Swing arms and explode onto box',
        'Land softly with knees bent',
        'Stand fully, then step down',
        'Start with lower box, progress height'
      ]
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
      steps: [
        'Basic bounce: 1 minute',
        'Alternate feet: 1 minute',
        'High knees: 30 seconds',
        'Double unders (if able): 30 seconds',
        'Rest 30 seconds, repeat circuit'
      ]
    }
  ];

  drills.forEach(drill => database.drills[drill.id] = drill);
  workouts.forEach(workout => database.workouts[workout.id] = workout);
  saveDatabase();
};

// ============ USER MANAGEMENT ============

export const createUser = (userData) => {
  const userId = `user_${Date.now()}`;
  const user = {
    id: userId,
    email: userData.email,
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

export const getUser = (userId) => database.users[userId];

export const getUserByEmail = (email) => {
  return Object.values(database.users).find(u => u.email === email);
};

export const updateUser = (userId, updates) => {
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
  const teamId = `team_${Date.now()}`;
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

export const getTeam = (teamId) => database.teams[teamId];

export const getTeamByJoinCode = (code) => {
  const normalizedCode = code.toUpperCase().trim();
  return Object.values(database.teams).find(t => t.joinCode === normalizedCode);
};

export const getCoachTeams = (coachId) => {
  return Object.values(database.teams).filter(t => t.coachId === coachId);
};

export const addPlayerToTeam = (teamId, playerId) => {
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
  const team = database.teams[teamId];
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

export const updateAssignment = (assignmentId, updates) => {
  const assignment = database.assignments[assignmentId];
  if (assignment) {
    const updated = { ...assignment, ...updates, updatedAt: new Date().toISOString() };
    database.assignments[assignmentId] = updated;
    saveDatabase();
    return updated;
  }
  return null;
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
    
    ...(logData.itemType === 'drill' && {
      makes: logData.makes,
      attempts: logData.attempts,
      percentage: logData.attempts > 0 ? Math.round((logData.makes / logData.attempts) * 100) : null,
      completed: logData.completed
    }),
    
    ...(logData.itemType === 'workout' && {
      sets: logData.sets,
      reps: logData.reps,
      weight: logData.weight,
      time: logData.time
    }),
    
    difficulty: logData.difficulty,
    soreness: logData.soreness || 'none', // none, mild, moderate, severe
    notes: logData.notes
  };
  
  database.logs[logId] = log;
  saveDatabase();
  return log;
};

export const getLog = (logId) => database.logs[logId];

export const getPlayerLogs = (playerId, options = {}) => {
  let logs = Object.values(database.logs).filter(l => l.playerId === playerId);
  
  if (options.assignmentId) {
    logs = logs.filter(l => l.assignmentId === options.assignmentId);
  }
  if (options.itemId) {
    logs = logs.filter(l => l.itemId === options.itemId);
  }
  if (options.since) {
    logs = logs.filter(l => new Date(l.createdAt) >= new Date(options.since));
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
  if (options.to) {
    events = events.filter(e => new Date(e.date) <= new Date(options.to));
  }
  
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const updateScheduleEvent = (eventId, updates) => {
  const event = database.schedules[eventId];
  if (event) {
    const updated = { ...event, ...updates, updatedAt: new Date().toISOString() };
    database.schedules[eventId] = updated;
    saveDatabase();
    return updated;
  }
  return null;
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

export const getDirectMessages = (userId1, userId2, teamId, limit = 50) => {
  return Object.values(database.messages)
    .filter(m => {
      if (m.teamId !== teamId) return false;
      return (m.senderId === userId1 && m.recipientId === userId2) ||
             (m.senderId === userId2 && m.recipientId === userId1);
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-limit);
};

export const markMessageRead = (messageId, userId) => {
  const message = database.messages[messageId];
  if (message && !message.readBy.includes(userId)) {
    message.readBy.push(userId);
    database.messages[messageId] = message;
    saveDatabase();
  }
};

// ============ DRILL/WORKOUT LIBRARY ============

export const getAllDrills = () => Object.values(database.drills);

export const getDrill = (drillId) => database.drills[drillId];

export const getDrillsByCategory = (category) => {
  return Object.values(database.drills).filter(d => d.category === category);
};

export const getAllWorkouts = () => Object.values(database.workouts);

export const getWorkout = (workoutId) => database.workouts[workoutId];

export const getWorkoutsByCategory = (category) => {
  return Object.values(database.workouts).filter(w => w.category === category);
};

// ============ AI RECOMMENDATIONS ============

export const saveRecommendation = (teamId, playerId, recommendation) => {
  const recId = `rec_${Date.now()}`;
  
  const rec = {
    id: recId,
    teamId,
    playerId,
    type: recommendation.type,
    category: recommendation.category,
    title: recommendation.title,
    description: recommendation.description,
    suggestedActions: recommendation.suggestedActions || [],
    dataPoints: recommendation.dataPoints || {},
    createdAt: new Date().toISOString(),
    dismissed: false,
    actedOn: false
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
  if (options.playerId) {
    recs = recs.filter(r => r.playerId === options.playerId);
  }
  
  return recs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const dismissRecommendation = (recId) => {
  const rec = database.aiRecommendations[recId];
  if (rec) {
    rec.dismissed = true;
    rec.dismissedAt = new Date().toISOString();
    database.aiRecommendations[recId] = rec;
    saveDatabase();
  }
};

export const markRecommendationActedOn = (recId) => {
  const rec = database.aiRecommendations[recId];
  if (rec) {
    rec.actedOn = true;
    rec.actedOnAt = new Date().toISOString();
    database.aiRecommendations[recId] = rec;
    saveDatabase();
  }
};

// ============ ANALYTICS HELPERS ============

export const getPlayerStats = (playerId, options = {}) => {
  const logs = getPlayerLogs(playerId, options);
  
  const shootingLogs = logs.filter(l => l.makes !== undefined && l.attempts !== undefined);
  const totalMakes = shootingLogs.reduce((sum, l) => sum + (l.makes || 0), 0);
  const totalAttempts = shootingLogs.reduce((sum, l) => sum + (l.attempts || 0), 0);
  
  const workoutLogs = logs.filter(l => l.itemType === 'workout');
  const completedLogs = logs.filter(l => l.completed !== false);
  
  // Soreness tracking
  const sorenessLogs = logs.filter(l => l.soreness && l.soreness !== 'none');
  const sorenessCounts = {
    none: logs.filter(l => !l.soreness || l.soreness === 'none').length,
    mild: logs.filter(l => l.soreness === 'mild').length,
    moderate: logs.filter(l => l.soreness === 'moderate').length,
    severe: logs.filter(l => l.soreness === 'severe').length
  };
  
  // Recent soreness (last 7 days)
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
    workouts: {
      total: workoutLogs.length
    },
    completionRate: logs.length > 0 ? Math.round((completedLogs.length / logs.length) * 100) : 100,
    averageDifficulty: logs.length > 0 
      ? Math.round(logs.filter(l => l.difficulty).reduce((sum, l) => sum + l.difficulty, 0) / logs.filter(l => l.difficulty).length * 10) / 10
      : null,
    soreness: {
      counts: sorenessCounts,
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
  
  // Team soreness analysis
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

// ============ DATABASE RESET (for testing) ============
export const resetDatabase = () => {
  localStorage.removeItem(STORAGE_KEY);
  database = createEmptyDB();
  initializeDatabase();
};
