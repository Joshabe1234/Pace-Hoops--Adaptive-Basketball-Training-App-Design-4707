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
  directMessages: {},
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
        directMessages: parsed.directMessages || {},
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
  database.directMessages = fresh.directMessages;
  database.schedules = fresh.schedules;
  database.aiRecommendations = fresh.aiRecommendations;
};

// The database object
export let database = loadDatabase();

// Initialize drill and workout library with DETAILED STEPS
export const initializeDatabase = () => {
  forceReload();

  if (Object.keys(database.drills).length > 0) {
    return;
  }

  const drills = [
    { 
      id: 'form-shooting', 
      name: 'Form Shooting', 
      category: 'shooting', 
      type: 'skill', 
      difficulty: 'beginner', 
      duration: 15, 
      description: 'Close-range shooting focusing on form.', 
      requiresAccuracyLog: true, 
      metrics: ['makes', 'attempts'], 
      steps: [
        'Stand 3 feet from the basket, directly in front',
        'Hold the ball with your shooting hand under the ball, guide hand on the side',
        'Keep your elbow tucked in and aligned with the basket',
        'Bend your knees slightly for power',
        'Focus on your target - the back of the rim or a spot on the backboard',
        'Push up through your legs as you extend your shooting arm',
        'Snap your wrist at the top, creating backspin on the ball',
        'Hold your follow-through with your wrist relaxed and fingers pointing down',
        'Shoot 10 shots, then take one step back',
        'Repeat until you reach the free throw line'
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
        'Stand at the free throw line with your dominant foot slightly forward',
        'Establish YOUR pre-shot routine (dribbles, deep breath, etc.)',
        'Find your target point on the rim',
        'Hold the ball in your shooting pocket',
        'Bend your knees and prepare to shoot',
        'Shoot in one fluid motion - legs, arm, wrist',
        'Hold your follow-through until the ball hits the rim',
        'Shoot sets of 10 free throws',
        'Track your makes and misses',
        'Goal: Make 7/10 before moving on'
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
        'Set up at 5 spots: both corners, both wings, and top of key',
        'Start in the right corner with the ball',
        'Simulate catching a pass - hop into your shot',
        'Square your feet to the basket on the catch',
        'Shoot with proper form - don\'t rush',
        'Shoot 10 shots from each spot before moving',
        'Focus on footwork consistency at each spot',
        'Track makes/attempts at each location',
        'Identify your weakest spot for extra work',
        'Complete all 5 spots (50 total shots minimum)'
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
        'Start at half court with the ball',
        'Attack toward the basket with 2-3 hard dribbles',
        'Plant your inside foot firmly to stop your momentum',
        'Gather the ball as you plant',
        'Jump straight up, not forward',
        'Shoot at the peak of your jump',
        'Land in the same spot you jumped from',
        'Alternate sides - go left, then right',
        'Practice from different angles (wing, top, elbow)',
        'Aim for 5 makes from each side before switching'
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
        'Stand in athletic stance with knees bent',
        'Pound dribble - right hand for 30 seconds, stay low',
        'Pound dribble - left hand for 30 seconds',
        'Crossover dribbles - 20 reps, keep ball low',
        'Between the legs - 20 reps each direction',
        'Behind the back - 20 reps',
        'Figure 8 around your legs - 30 seconds',
        'Spider dribble (front-back-front-back) - 30 seconds',
        'Combo: crossover to between legs to behind back',
        'Keep your eyes up throughout all drills'
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
        'Hold one ball in each hand',
        'Pound both balls together - 30 seconds',
        'Pound alternating (one up, one down) - 30 seconds',
        'Crossover both balls at the same time - 20 reps',
        'Crossover alternating - 20 reps',
        'Walk forward while dribbling both - full court',
        'Walk backward while dribbling both - full court',
        'Inside-out moves with both balls',
        'Low dribbles with both balls (ankle height)',
        'Challenge: Try between the legs with two balls'
      ]
    },
    { 
      id: 'defensive-slides', 
      name: 'Defensive Slide Series', 
      category: 'defense', 
      type: 'skill', 
      difficulty: 'beginner', 
      duration: 10, 
      description: 'Lateral movement drills.', 
      requiresAccuracyLog: false, 
      metrics: ['completed'], 
      steps: [
        'Start in defensive stance - butt down, hands active',
        'Slide baseline to baseline, stay low the entire time',
        'Focus on pushing off the trailing foot, not crossing feet',
        'Zig-zag slides: 3 slides right, 3 slides left across court',
        'Closeout drill: sprint to cone, breakdown into slides',
        'Drop step practice: slide, drop step, slide opposite direction',
        'Lane slides: slide across the lane, touch each block',
        'Mirror drill: react to imaginary offensive player',
        'Defensive stance holds: hold for 30 seconds',
        'Combine with hand movements (high hands, low hands)'
      ]
    },
    { 
      id: 'post-moves', 
      name: 'Post Footwork', 
      category: 'footwork', 
      type: 'skill', 
      difficulty: 'advanced', 
      duration: 20, 
      description: 'Low post moves.', 
      requiresAccuracyLog: true, 
      metrics: ['makes', 'attempts'], 
      steps: [
        'Start on the block with your back to the basket',
        'Drop step baseline: pivot on inside foot, step to basket',
        'Shoot a power layup off the drop step',
        'Drop step middle: same move but toward the lane',
        'Up and under: shot fake, step through opposite direction',
        'Hook shot: pivot, protect ball, extend arm, flip wrist',
        'Practice both shoulders (left block and right block)',
        'Add counter moves: fake baseline, go middle',
        'Jump hook: similar to hook but jump off both feet',
        'Shoot 10 of each move from both blocks'
      ]
    },
    {
      id: 'cone-dribbling',
      name: 'Cone Dribbling Course',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Navigate through cones with the ball.',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Set up 5-8 cones in a line, 3 feet apart',
        'Dribble through with right hand only - 3 times',
        'Dribble through with left hand only - 3 times',
        'Crossover at each cone - 3 times',
        'Between the legs at each cone - 3 times',
        'Behind the back at each cone - 3 times',
        'Speed run: as fast as possible without losing control',
        'Backward dribbling through the cones',
        'Add a finish at the end (layup or pull-up)',
        'Time yourself and try to beat your record'
      ]
    },
    {
      id: 'closeout-drill',
      name: 'Closeout Drill',
      category: 'defense',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Practice closing out on shooters.',
      requiresAccuracyLog: false,
      metrics: ['completed'],
      steps: [
        'Start under the basket in defensive stance',
        'Coach/partner holds ball at three-point line',
        'Sprint to close out with choppy steps at the end',
        'Get a hand up without fouling',
        'Break down into defensive slide position',
        'Trace the ball with your hand',
        'Practice from all 5 spots around the arc',
        'Add shot contest: partner shoots, you contest',
        'Recover if they drive: drop step and slide',
        'Complete 5 closeouts from each spot'
      ]
    },
    {
      id: 'mikan-drill',
      name: 'Mikan Drill',
      category: 'shooting',
      type: 'skill',
      difficulty: 'beginner',
      duration: 10,
      description: 'Finishing around the rim with both hands.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Stand on the right block facing the basket',
        'Shoot a right-hand layup off the backboard',
        'Catch the ball out of the net',
        'Immediately shoot a left-hand layup from the left side',
        'Continue alternating without stopping',
        'Focus on soft touch off the backboard',
        'Keep the ball high - don\'t bring it down',
        'Use proper footwork: inside foot takes off',
        'Goal: Make 20 in a row without missing',
        'Variation: Add baby hooks instead of layups'
      ]
    },
    {
      id: 'floater-practice',
      name: 'Floater Practice',
      category: 'shooting',
      type: 'skill',
      difficulty: 'advanced',
      duration: 15,
      description: 'Developing a soft floater in the lane.',
      requiresAccuracyLog: true,
      metrics: ['makes', 'attempts'],
      steps: [
        'Start at the three-point line with the ball',
        'Attack the basket with 2-3 dribbles',
        'Pick up the ball around the free throw line',
        'Jump off one foot (opposite of shooting hand)',
        'Extend arm and push ball high with soft touch',
        'Aim for the ball to barely clear defender\'s reach',
        'Practice from both sides of the lane',
        'Vary your release point - closer and farther',
        'Add a defender for game simulation',
        'Goal: 7/10 from each side before moving on'
      ]
    }
  ];

  const workouts = [
    { 
      id: 'suicides', 
      name: 'Suicides', 
      category: 'conditioning', 
      type: 'cardio', 
      difficulty: 'intermediate', 
      duration: 10, 
      description: 'Line drill conditioning.', 
      metrics: ['reps', 'time'], 
      steps: [
        'Start on the baseline',
        'Sprint to free throw line, touch line, sprint back',
        'Sprint to half court, touch line, sprint back',
        'Sprint to far free throw line, touch line, sprint back',
        'Sprint to far baseline, touch line, sprint back',
        'That\'s 1 rep - rest 30-45 seconds',
        'Focus on quick turns at each line',
        'Stay low when changing direction',
        'Complete 5-8 reps total',
        'Try to finish each rep under 30 seconds'
      ]
    },
    { 
      id: 'court-sprints', 
      name: 'Full Court Sprints', 
      category: 'conditioning', 
      type: 'cardio', 
      difficulty: 'beginner', 
      duration: 10, 
      description: 'Baseline to baseline.', 
      metrics: ['reps', 'time'], 
      steps: [
        'Start on the baseline in sprinter stance',
        'Sprint at 100% to the opposite baseline',
        'Touch the line with your hand',
        'Walk back to recover',
        'Rest until heart rate comes down slightly',
        'Sprint again at 100%',
        'Complete 10-15 sprints total',
        'Focus on driving your knees',
        'Pump your arms for speed',
        'Try to maintain same speed on each sprint'
      ]
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
      steps: [
        'Stand with feet shoulder-width apart',
        'Point toes slightly outward',
        'Keep chest up and core engaged',
        'Lower down like sitting in a chair',
        'Go until thighs are parallel to ground',
        'Keep knees tracking over toes',
        'Drive through your heels to stand up',
        'Squeeze glutes at the top',
        'Complete 3 sets of 15 reps',
        'Add weight (dumbbells) as you get stronger'
      ]
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
      steps: [
        'Stand tall with feet hip-width apart',
        'Step forward with right leg',
        'Lower until both knees are at 90 degrees',
        'Keep front knee behind your toes',
        'Push through front heel to return to start',
        'Alternate legs each rep',
        'Keep your torso upright throughout',
        'Complete 3 sets of 12 reps each leg',
        'Try walking lunges for variation',
        'Add dumbbells to increase difficulty'
      ]
    },
    { 
      id: 'push-ups', 
      name: 'Push-Ups', 
      category: 'strength', 
      type: 'upper-body', 
      difficulty: 'beginner', 
      duration: 5, 
      description: 'Upper body pushing.', 
      metrics: ['sets', 'reps'], 
      steps: [
        'Start in plank position, hands shoulder-width apart',
        'Keep body in straight line from head to heels',
        'Lower chest toward the floor',
        'Go until chest nearly touches ground',
        'Push up to starting position',
        'Keep elbows at 45-degree angle',
        'Don\'t let hips sag or pike up',
        'Breathe in on the way down, out on the way up',
        'Complete 3 sets of 15-20 reps',
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
      description: 'Core stability.', 
      metrics: ['sets', 'time'], 
      steps: [
        'Start on forearms and toes',
        'Align elbows directly under shoulders',
        'Keep body in straight line',
        'Engage core - pull belly button to spine',
        'Don\'t let hips drop or rise',
        'Keep neck neutral, look at floor',
        'Hold for 30-60 seconds',
        'Rest 30 seconds between sets',
        'Complete 3-4 sets',
        'Try side planks for obliques'
      ]
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
      steps: [
        'Stand facing a sturdy box or platform',
        'Feet shoulder-width apart, arms ready',
        'Bend knees and swing arms back',
        'Explode up, swinging arms forward',
        'Land softly on the box with both feet',
        'Stand fully upright on the box',
        'Step down carefully (don\'t jump down)',
        'Reset and repeat',
        'Complete 3 sets of 8-10 reps',
        'Increase box height as you improve'
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
        'Hold rope handles at hip height',
        'Keep elbows close to body',
        'Rotate rope with wrists, not arms',
        'Jump just high enough to clear rope',
        'Land softly on balls of feet',
        'Start with basic two-foot jumps - 1 minute',
        'Try single leg hops - 30 seconds each',
        'Alternate feet (like running) - 1 minute',
        'High knees while jumping - 30 seconds',
        'Double unders if advanced - as many as possible'
      ]
    },
    {
      id: 'wall-sits',
      name: 'Wall Sits',
      category: 'strength',
      type: 'lower-body',
      difficulty: 'beginner',
      duration: 5,
      description: 'Isometric leg strength.',
      metrics: ['sets', 'time'],
      steps: [
        'Stand with back against a wall',
        'Slide down until thighs are parallel to floor',
        'Keep knees at 90-degree angle',
        'Keep back flat against the wall',
        'Hold position - don\'t let legs shake out',
        'Keep hands off your thighs',
        'Hold for 30-60 seconds',
        'Rest 30 seconds, repeat',
        'Complete 3-4 sets',
        'Add a basketball hold for extra challenge'
      ]
    },
    {
      id: 'lateral-bounds',
      name: 'Lateral Bounds',
      category: 'plyometrics',
      type: 'explosive',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Lateral explosiveness.',
      metrics: ['sets', 'reps'],
      steps: [
        'Stand on your right leg, knee slightly bent',
        'Bound laterally to your left',
        'Land softly on left foot only',
        'Stick the landing for 1-2 seconds',
        'Bound back to the right',
        'Focus on power and control',
        'Swing arms for momentum',
        'Keep chest up throughout',
        'Complete 3 sets of 10 each direction',
        'Increase distance as you improve'
      ]
    }
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
  forceReload();
  const normalizedCode = code.toUpperCase().trim();
  return Object.values(database.teams).find(t => 
    t.joinCode && t.joinCode.toUpperCase().trim() === normalizedCode
  ) || null;
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

export const updatePlayerPosition = (playerId, position) => {
  forceReload();
  const player = database.users[playerId];
  if (player) {
    database.users[playerId] = { ...player, position };
    saveDatabase();
    return database.users[playerId];
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

// Get ALL assignments including past due (for coach dashboard past section)
export const getAllTeamAssignments = (teamId) => {
  forceReload();
  return Object.values(database.assignments)
    .filter(a => a.teamId === teamId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getPlayerAssignments = (playerId, teamId) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      database.assignments = parsed.assignments || {};
    } catch (e) {
      console.error('Error reloading assignments:', e);
    }
  }
  
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
    injured: data.injured || false,
    injuryDescription: data.injuryDescription || null,
    notes: data.notes,
    completed: data.completed !== false
  };
  database.logs[id] = log;
  saveDatabase();
  return log;
};

// Get all injury reports for a team
export const getTeamInjuries = (teamId) => {
  forceReload();
  const team = database.teams[teamId];
  if (!team) return [];
  
  const playerIds = team.playerIds || [];
  const injuries = [];
  
  playerIds.forEach(playerId => {
    const player = database.users[playerId];
    const playerLogs = Object.values(database.logs).filter(l => 
      l.playerId === playerId && l.injured === true
    );
    
    playerLogs.forEach(log => {
      const drill = database.drills[log.itemId] || database.workouts[log.itemId];
      injuries.push({
        id: log.id,
        player,
        log,
        drillName: drill?.name || 'Unknown Exercise',
        drillCategory: drill?.category || 'unknown',
        injuryDescription: log.injuryDescription,
        date: log.createdAt,
        assignmentId: log.assignmentId
      });
    });
  });
  
  return injuries.sort((a, b) => new Date(b.date) - new Date(a.date));
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
  // Store date as YYYY-MM-DD string to avoid timezone issues
  const event = { 
    id, 
    coachId, 
    teamId, 
    ...data, 
    // Ensure date is stored as simple string
    date: data.date,
    createdAt: new Date().toISOString() 
  };
  database.schedules[id] = event;
  saveDatabase();
  return event;
};

export const getTeamSchedule = (teamId) => {
  forceReload();
  return Object.values(database.schedules)
    .filter(e => e.teamId === teamId)
    .sort((a, b) => {
      // Compare as strings to avoid timezone issues
      return a.date.localeCompare(b.date);
    });
};

export const deleteScheduleEvent = (id) => {
  forceReload();
  delete database.schedules[id];
  saveDatabase();
};

// ============ MESSAGE MANAGEMENT (Team Chat) ============

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

// ============ DIRECT MESSAGE MANAGEMENT ============

// Create conversation ID from two user IDs (sorted for consistency)
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

export const createDirectMessage = (senderId, recipientId, content) => {
  forceReload();
  const id = `dm_${Date.now()}`;
  const conversationId = getConversationId(senderId, recipientId);
  const dm = {
    id,
    conversationId,
    senderId,
    recipientId,
    content,
    createdAt: new Date().toISOString(),
    read: false
  };
  database.directMessages[id] = dm;
  saveDatabase();
  return dm;
};

export const getDirectMessages = (userId1, userId2, limit = 100) => {
  forceReload();
  const conversationId = getConversationId(userId1, userId2);
  return Object.values(database.directMessages)
    .filter(dm => dm.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-limit);
};

export const getConversations = (userId) => {
  forceReload();
  const dms = Object.values(database.directMessages)
    .filter(dm => dm.senderId === userId || dm.recipientId === userId);
  
  // Group by conversation
  const convMap = {};
  dms.forEach(dm => {
    const otherId = dm.senderId === userId ? dm.recipientId : dm.senderId;
    if (!convMap[otherId] || new Date(dm.createdAt) > new Date(convMap[otherId].createdAt)) {
      convMap[otherId] = dm;
    }
  });
  
  // Convert to array with user info and unread count
  return Object.entries(convMap).map(([otherId, lastMessage]) => {
    const otherUser = database.users[otherId];
    const unreadCount = dms.filter(dm => 
      dm.senderId === otherId && dm.recipientId === userId && !dm.read
    ).length;
    
    return {
      oderId: otherId,
      otherUser,
      lastMessage,
      unreadCount
    };
  }).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
};

export const markDirectMessageRead = (messageId, userId) => {
  forceReload();
  const dm = database.directMessages[messageId];
  if (dm && dm.recipientId === userId && !dm.read) {
    dm.read = true;
    database.directMessages[messageId] = dm;
    saveDatabase();
  }
};

export const markConversationRead = (currentUserId, otherUserId) => {
  forceReload();
  const conversationId = getConversationId(currentUserId, otherUserId);
  Object.values(database.directMessages)
    .filter(dm => dm.conversationId === conversationId && dm.recipientId === currentUserId && !dm.read)
    .forEach(dm => {
      dm.read = true;
      database.directMessages[dm.id] = dm;
    });
  saveDatabase();
};

export const getUnreadDMCount = (userId) => {
  forceReload();
  return Object.values(database.directMessages)
    .filter(dm => dm.recipientId === userId && !dm.read)
    .length;
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
