// Pace Hoops Database - Full featured version
export const database = {
  users: new Map(),
  coaches: new Map(),
  drills: new Map(),
  sessions: new Map(),
  logs: new Map(),
  goals: new Map(),
  plans: new Map()
};

// Initialize with sample data
export const initializeDatabase = () => {
  // Sample coaches with CORRECT images
  const coaches = [
    {
      id: 'phil-jackson',
      name: 'Phil Jackson',
      title: 'The Zen Master',
      specialty: 'Mental Focus & Team Basketball',
      philosophy: 'Mindful basketball with emphasis on mental preparation, team chemistry, and fundamental excellence.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Phil_Jackson_2007.jpg/440px-Phil_Jackson_2007.jpg',
      methods: ['mindfulness', 'triangle-system', 'leadership-development']
    },
    {
      id: 'steve-kerr',
      name: 'Steve Kerr',
      title: 'The Innovator',
      specialty: 'Modern Offense & Shooting',
      philosophy: 'Fast-paced, three-point focused offense with emphasis on ball movement and spacing.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Steve_Kerr_Talks_to_Reporters.jpg/440px-Steve_Kerr_Talks_to_Reporters.jpg',
      methods: ['motion-offense', 'analytics-driven', 'player-empowerment']
    },
    {
      id: 'gregg-popovich',
      name: 'Gregg Popovich',
      title: 'The Fundamentalist',
      specialty: 'Defense & Fundamentals',
      philosophy: 'Disciplined approach focusing on defensive excellence, fundamentals, and basketball IQ.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gregg_Popovich_2014.jpg/440px-Gregg_Popovich_2014.jpg',
      methods: ['defensive-systems', 'fundamental-focus', 'mental-toughness']
    },
    {
      id: 'kobe-bryant',
      name: 'Kobe Bryant',
      title: 'The Mamba Mentality',
      specialty: 'Individual Excellence & Work Ethic',
      philosophy: 'Relentless pursuit of perfection through detailed skill work and mental fortitude.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kobe_Bryant_2014.jpg/440px-Kobe_Bryant_2014.jpg',
      methods: ['mamba-mentality', 'skill-obsession', 'perfectionism']
    }
  ];

  // Detailed drills with videos, steps, and cardio/skill classification
  const drills = [
    // Phil Jackson Drills
    {
      id: 'triangle-offense',
      name: 'Triangle Offense Flow',
      coachId: 'phil-jackson',
      category: 'offense',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Practice the triangle offense principles with proper spacing and reads.',
      videoUrl: 'https://www.youtube.com/watch?v=8YBnPTqoASU',
      requiresAccuracyLog: false,
      steps: [
        'Set up in triangle formation: post player on block, wing player at free throw line extended, corner player in the corner',
        'Entry pass to the wing - post player seals defender and calls for ball',
        'Wing has 3 options: entry to post, skip pass to corner, or dribble penetration',
        'After each pass, players rotate to maintain triangle shape',
        'Practice reading the defense: if defender fronts post, lob pass; if defender plays behind, direct entry',
        'Run 10 possessions from each side, focusing on crisp passes and proper footwork'
      ],
      modifications: {
        beginner: 'Stationary triangle formation practice without defense',
        injury: 'Upper body passing only - no cutting or posting'
      }
    },
    {
      id: 'meditation-focus',
      name: 'Mindfulness Shooting',
      coachId: 'phil-jackson',
      category: 'shooting',
      type: 'skill',
      difficulty: 'beginner',
      duration: 15,
      description: 'Combine meditation techniques with shooting practice for mental focus.',
      videoUrl: 'https://www.youtube.com/watch?v=Hj5hZt6rZGc',
      requiresAccuracyLog: true,
      steps: [
        'Find a quiet spot on the court. Close your eyes and take 10 deep breaths',
        'Visualize your perfect shot form: feet set, elbow aligned, smooth release, perfect arc',
        'Open your eyes. Take your first shot focusing ONLY on your follow-through',
        'After each make or miss, take one breath before the next shot',
        'Shoot 20 shots from the free throw line, logging makes/attempts',
        'End with 2 minutes of eyes-closed visualization of your best shots'
      ],
      modifications: {
        beginner: 'Start with 10 shots instead of 20',
        injury: 'Visualization only if shooting is restricted'
      }
    },
    {
      id: 'phil-cardio-mindful-runs',
      name: 'Mindful Court Runs',
      coachId: 'phil-jackson',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'beginner',
      duration: 12,
      description: 'Cardiovascular conditioning with breath awareness and mental focus.',
      videoUrl: 'https://www.youtube.com/watch?v=RzH8RjXrOLU',
      requiresAccuracyLog: false,
      steps: [
        'Start at baseline. Jog to half court while breathing in through nose',
        'Jog from half court to opposite baseline while breathing out through mouth',
        'Sprint back to start, focusing on powerful but controlled breathing',
        'Rest 30 seconds with deep breathing',
        'Repeat 6 times, maintaining awareness of your breath throughout',
        'Cool down with a slow walk around the court, letting heart rate settle'
      ],
      modifications: {
        beginner: 'Walk instead of jog, 4 reps instead of 6',
        injury: 'Upper body: stationary deep breathing only'
      }
    },
    
    // Steve Kerr Drills
    {
      id: 'three-point-shooting',
      name: 'Splash Brothers Shooting',
      coachId: 'steve-kerr',
      category: 'shooting',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 25,
      description: 'High-volume three-point shooting with game-like movement.',
      videoUrl: 'https://www.youtube.com/watch?v=YyqkYFzQ9Rk',
      requiresAccuracyLog: true,
      steps: [
        'Warm up: 10 form shots from 5 feet, focus on hand placement and release',
        'Corner 3s (right): Catch and shoot 10 shots, log makes',
        'Wing 3s (right): Catch and shoot 10 shots, log makes',
        'Top of key: Catch and shoot 10 shots, log makes',
        'Wing 3s (left): Catch and shoot 10 shots, log makes',
        'Corner 3s (left): Catch and shoot 10 shots, log makes',
        'Bonus round: 5 shots off a one-dribble pull-up from each spot',
        'Track total: aim for 35/50 (70%) as your baseline'
      ],
      modifications: {
        beginner: 'Move in to college 3-point line, 5 shots per spot',
        injury: 'Stationary shooting only, reduce volume by half'
      }
    },
    {
      id: 'ball-movement',
      name: 'Warriors Ball Movement',
      coachId: 'steve-kerr',
      category: 'passing',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Practice quick ball movement and decision making.',
      videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
      requiresAccuracyLog: false,
      steps: [
        'Set up 4 cones in a square (15 feet apart) representing teammates',
        'Start with ball at top cone. Pass and relocate to an open cone',
        'Rule: ball cannot be held more than 2 seconds',
        'Rule: no dribbling allowed - pass or shoot only',
        'Practice chest passes, bounce passes, and skip passes',
        'Add a "defender" cone in middle - passes must go around it',
        'Run for 5 minutes continuously, counting total passes completed'
      ],
      modifications: {
        beginner: '3-cone setup with slower pace, 4-second hold allowed',
        injury: 'Seated passing drill if lower body injury'
      }
    },
    {
      id: 'kerr-cardio-transition',
      name: 'Transition Sprint Series',
      coachId: 'steve-kerr',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Fast-break conditioning to build speed and stamina for up-tempo play.',
      videoUrl: 'https://www.youtube.com/watch?v=O0gQm3lT8DQ',
      requiresAccuracyLog: false,
      steps: [
        'Start under basket. Sprint to opposite 3-point line (simulating fast break)',
        'Touch the line, immediately backpedal to half court (defensive transition)',
        'Sprint forward again to the nearest 3-point line',
        'Shuffle laterally across the 3-point arc',
        'Sprint back to starting position',
        'Rest 45 seconds. That is 1 rep.',
        'Complete 6 reps total, tracking your time on each'
      ],
      modifications: {
        beginner: 'Jog instead of sprint, 4 reps, 60-second rest',
        injury: 'Walk through the pattern for active recovery'
      }
    },
    
    // Gregg Popovich Drills
    {
      id: 'defensive-stance',
      name: 'Spurs Defense Fundamentals',
      coachId: 'gregg-popovich',
      category: 'defense',
      type: 'skill',
      difficulty: 'beginner',
      duration: 15,
      description: 'Master the fundamentals of defensive positioning and movement.',
      videoUrl: 'https://www.youtube.com/watch?v=2QK4VQ5u4fA',
      requiresAccuracyLog: false,
      steps: [
        'Stance check: feet shoulder-width apart, knees bent, butt down, hands active',
        'Hold perfect defensive stance for 30 seconds without standing up',
        'Lateral slides: 10 slides right, 10 slides left, staying in stance',
        'Close-out drill: start at rim, sprint and breakdown at 3-point line, 10 reps',
        'Drop step practice: react to imaginary drive, open hips, 10 each direction',
        'Combine: close out → slide left → slide right → drop step. 5 full sequences'
      ],
      modifications: {
        beginner: 'Hold stance 15 seconds, reduce reps to 5 each',
        injury: 'Upper body positioning only while seated'
      }
    },
    {
      id: 'fundamental-shooting',
      name: 'Spurs Fundamental Shooting',
      coachId: 'gregg-popovich',
      category: 'shooting',
      type: 'skill',
      difficulty: 'beginner',
      duration: 20,
      description: 'Perfect your shooting form with disciplined, repetitive practice.',
      videoUrl: 'https://www.youtube.com/watch?v=YFJ5aI5vF6Y',
      requiresAccuracyLog: true,
      steps: [
        'Form shooting (3 feet from rim): 20 shots, one hand only, perfect arc',
        'Add guide hand: 20 shots from 5 feet, focus on straight elbow',
        'Free throws: 20 shots with full routine (3 dribbles, deep breath, shoot)',
        'Elbow jumpers: 10 shots from each elbow, catch and shoot',
        'Short corner: 10 shots from each short corner',
        'Track all makes/attempts. Goal: 70% overall'
      ],
      modifications: {
        beginner: 'Reduce to 10 shots per station',
        injury: 'Chair shooting if needed for leg injuries'
      }
    },
    {
      id: 'pop-cardio-defensive',
      name: 'Defensive Slides Conditioning',
      coachId: 'gregg-popovich',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'intermediate',
      duration: 12,
      description: 'Build defensive endurance through lateral movement conditioning.',
      videoUrl: 'https://www.youtube.com/watch?v=RzH8RjXrOLU',
      requiresAccuracyLog: false,
      steps: [
        'Start in defensive stance at sideline',
        'Defensive slide to opposite sideline (stay low, dont cross feet)',
        'Immediately slide back to start',
        'Drop into 5 push-ups',
        'Stand and repeat sequence',
        'Complete 5 rounds with 30-second rest between rounds',
        'Focus: stay in stance the ENTIRE slide, no standing up'
      ],
      modifications: {
        beginner: '3 rounds, 3 push-ups, 45-second rest',
        injury: 'Upper body: push-ups only. Lower body: seated core work'
      }
    },
    
    // Kobe Bryant Drills
    {
      id: 'footwork-mastery',
      name: 'Mamba Footwork',
      coachId: 'kobe-bryant',
      category: 'footwork',
      type: 'skill',
      difficulty: 'advanced',
      duration: 30,
      description: 'Detailed footwork patterns for offensive moves - Kobe detail work.',
      videoUrl: 'https://www.youtube.com/watch?v=YFJ5aI5vF6Y',
      requiresAccuracyLog: false,
      steps: [
        'Triple threat position: 20 reps of jab step right, jab step left',
        'Jab and go: jab right → one dribble attack left, 10 reps each side',
        'Jab and shoot: jab step → pull back into jump shot, 10 reps each side',
        'Pivot series: front pivot to face up, 10 reps; reverse pivot to face up, 10 reps',
        'Up and under: shot fake → step through, 10 reps each side',
        'Combination: jab → shot fake → one dribble pull-up, 10 reps each side',
        'All moves should be GAME SPEED after first 3 reps'
      ],
      modifications: {
        beginner: 'Slow motion practice, 5 reps per move',
        injury: 'Upper body moves only if leg injury'
      }
    },
    {
      id: 'shooting-mechanics',
      name: 'Perfect Shot Mechanics',
      coachId: 'kobe-bryant',
      category: 'shooting',
      type: 'skill',
      difficulty: 'intermediate',
      duration: 25,
      description: 'Obsessive attention to shooting form and consistency.',
      videoUrl: 'https://www.youtube.com/watch?v=Hj5hZt6rZGc',
      requiresAccuracyLog: true,
      steps: [
        'Mirror work (no ball): Check stance, elbow position, release point - 2 minutes',
        'One-hand form shots from 3 feet: 20 makes (not attempts - MAKES)',
        'Add guide hand, same distance: 20 makes',
        'Move to free throw line: 30 shots, track percentage',
        'Mid-range right elbow: 15 shots, track percentage',
        'Mid-range left elbow: 15 shots, track percentage',
        'Challenge: dont leave until you hit 5 in a row from each elbow'
      ],
      modifications: {
        beginner: 'Focus on form shots only, 10 makes requirement',
        injury: 'Chair shooting, reduced volume'
      }
    },
    {
      id: 'kobe-cardio-mamba',
      name: 'Mamba Conditioning',
      coachId: 'kobe-bryant',
      category: 'conditioning',
      type: 'cardio',
      difficulty: 'advanced',
      duration: 18,
      description: 'High-intensity conditioning inspired by Kobe work ethic.',
      videoUrl: 'https://www.youtube.com/watch?v=RzH8RjXrOLU',
      requiresAccuracyLog: false,
      steps: [
        '17s: Sideline to sideline, must complete in 17 seconds or less',
        'Rest only 30 seconds between each 17',
        'Complete 8 total 17s',
        'Immediately into: 10 burpees',
        'Then: suicide drill (baseline → free throw → half → far free throw → far baseline)',
        'Complete 3 suicides with 45-second rest between',
        'Cool down: 2-minute light jog and stretching'
      ],
      modifications: {
        beginner: 'Allow 20 seconds per 17, 5 total, skip burpees',
        injury: 'Upper body: seated boxing movements and core work'
      }
    },
    {
      id: 'ball-handling-elite',
      name: 'Elite Ball Handling',
      coachId: 'kobe-bryant',
      category: 'ball-handling',
      type: 'skill',
      difficulty: 'advanced',
      duration: 20,
      description: 'Advanced ball handling drills for complete control.',
      videoUrl: 'https://www.youtube.com/watch?v=4C3oZpM5h7k',
      requiresAccuracyLog: false,
      steps: [
        'Stationary pound dribbles: 50 right hand, 50 left hand (as hard as possible)',
        'Crossover series: 30 reps - slow, medium, game speed (10 each)',
        'Between the legs: 30 reps - alternating, same progression',
        'Behind the back: 30 reps - same progression',
        'Combo moves: cross → between → behind, 20 continuous reps',
        'Two ball dribbling: 2 minutes alternating, 2 minutes simultaneous',
        'Full court: attack with 3 dribbles max, finishing at rim, 10 reps'
      ],
      modifications: {
        beginner: 'Half the reps, skip two-ball work',
        injury: 'Stationary dribbling only'
      }
    }
  ];

  // Store coaches and drills
  coaches.forEach(coach => database.coaches.set(coach.id, coach));
  drills.forEach(drill => database.drills.set(drill.id, drill));
};

// User management
export const createUser = (userData) => {
  const userId = `user_${Date.now()}`;
  const user = {
    id: userId,
    name: userData.name,
    age: parseInt(userData.age),
    height: userData.height,
    weight: userData.weight,
    skillLevel: userData.skillLevel,
    athleticism: userData.athleticism,
    injuries: userData.injuries || 'none',
    isPremium: false,
    createdAt: new Date(),
    lastViewedGoalId: null,
    performanceHistory: [],
    injuryHistory: []
  };
  database.users.set(userId, user);
  return user;
};

export const getUser = (userId) => {
  return database.users.get(userId);
};

export const updateUser = (userId, updates) => {
  const user = database.users.get(userId);
  if (user) {
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    database.users.set(userId, updatedUser);
    return updatedUser;
  }
  return null;
};

// Goal management with current/previous status
export const createGoal = (userId, goalData) => {
  const user = getUser(userId);
  if (!user) throw new Error('User not found');
  
  // Check goal limits
  const currentGoals = getUserGoals(userId).filter(g => g.status === 'current');
  const limit = user.isPremium ? 20 : 10;
  
  if (currentGoals.length >= limit) {
    throw new Error(`Goal limit reached. ${user.isPremium ? '' : 'Upgrade to premium for 20 goals!'}`);
  }
  
  const goalId = `goal_${Date.now()}`;
  const goal = {
    id: goalId,
    userId,
    coachId: goalData.coachId,
    description: goalData.description,
    timeframe: goalData.timeframe,
    priority: goalData.priority || 'medium',
    availability: goalData.availability || {},
    status: 'current',
    createdAt: new Date(),
    completedSessions: [],
    accuracyLogs: {}
  };
  database.goals.set(goalId, goal);
  
  // Update user's last viewed goal
  updateUser(userId, { lastViewedGoalId: goalId });
  
  return goal;
};

export const getGoal = (goalId) => {
  return database.goals.get(goalId);
};

export const getUserGoals = (userId) => {
  return Array.from(database.goals.values()).filter(goal => goal.userId === userId);
};

export const getCurrentGoals = (userId) => {
  return getUserGoals(userId).filter(goal => goal.status === 'current');
};

export const getPreviousGoals = (userId) => {
  return getUserGoals(userId).filter(goal => goal.status === 'previous');
};

export const updateGoalStatus = (goalId, status) => {
  const goal = database.goals.get(goalId);
  if (goal) {
    goal.status = status;
    goal.updatedAt = new Date();
    database.goals.set(goalId, goal);
    return goal;
  }
  return null;
};

export const markGoalComplete = (goalId) => {
  return updateGoalStatus(goalId, 'previous');
};

export const reactivateGoal = (goalId, userId) => {
  const user = getUser(userId);
  const currentGoals = getCurrentGoals(userId);
  const limit = user.isPremium ? 20 : 10;
  
  if (currentGoals.length >= limit) {
    throw new Error(`Cannot reactivate. Goal limit reached.`);
  }
  
  return updateGoalStatus(goalId, 'current');
};

// Plan management
export const createTrainingPlan = (userId, goalId, coachId, planData) => {
  const planId = `plan_${Date.now()}`;
  const plan = {
    id: planId,
    userId,
    goalId,
    coachId,
    ...planData,
    createdAt: new Date(),
    version: 1,
    status: 'active'
  };
  database.plans.set(planId, plan);
  
  // Update user's current plan
  updateUser(userId, { currentPlan: planId });
  
  return plan;
};

export const getPlan = (planId) => {
  return database.plans.get(planId);
};

export const getPlanByGoal = (goalId) => {
  return Array.from(database.plans.values()).find(plan => plan.goalId === goalId);
};

export const updatePlan = (planId, updates) => {
  const plan = database.plans.get(planId);
  if (plan) {
    const updatedPlan = { ...plan, ...updates, updatedAt: new Date(), version: plan.version + 1 };
    database.plans.set(planId, updatedPlan);
    return updatedPlan;
  }
  return null;
};

// Session logging
export const createLog = (logData) => {
  const logId = `log_${Date.now()}`;
  const log = {
    id: logId,
    ...logData,
    createdAt: new Date()
  };
  database.logs.set(logId, log);
  
  // Mark session as complete in goal
  const goal = database.goals.get(logData.goalId);
  if (goal && !goal.completedSessions.includes(logData.sessionIndex)) {
    goal.completedSessions.push(logData.sessionIndex);
    database.goals.set(goal.id, goal);
  }
  
  return log;
};

export const getLogsByGoal = (goalId) => {
  return Array.from(database.logs.values())
    .filter(log => log.goalId === goalId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getLogsByUser = (userId) => {
  return Array.from(database.logs.values())
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Accuracy tracking for shooting drills
export const logAccuracy = (goalId, drillId, sessionIndex, makes, attempts) => {
  const goal = database.goals.get(goalId);
  if (goal) {
    if (!goal.accuracyLogs) goal.accuracyLogs = {};
    if (!goal.accuracyLogs[drillId]) goal.accuracyLogs[drillId] = [];
    
    goal.accuracyLogs[drillId].push({
      sessionIndex,
      makes,
      attempts,
      percentage: Math.round((makes / attempts) * 100),
      date: new Date()
    });
    
    database.goals.set(goalId, goal);
    return goal.accuracyLogs[drillId];
  }
  return null;
};

export const getAccuracyProgress = (goalId, drillId) => {
  const goal = database.goals.get(goalId);
  if (goal && goal.accuracyLogs && goal.accuracyLogs[drillId]) {
    return goal.accuracyLogs[drillId];
  }
  return [];
};

// Get data functions
export const getAllCoaches = () => {
  return Array.from(database.coaches.values());
};

export const getCoach = (coachId) => {
  return database.coaches.get(coachId);
};

export const getDrill = (drillId) => {
  return database.drills.get(drillId);
};

export const getCoachDrills = (coachId) => {
  return Array.from(database.drills.values()).filter(drill => drill.coachId === coachId);
};

export const getSkillDrills = (coachId) => {
  return getCoachDrills(coachId).filter(drill => drill.type === 'skill');
};

export const getCardioDrills = (coachId) => {
  return getCoachDrills(coachId).filter(drill => drill.type === 'cardio');
};

// Premium upgrade
export const upgradeToPremium = (userId) => {
  return updateUser(userId, { isPremium: true });
};

// Set last viewed goal
export const setLastViewedGoal = (userId, goalId) => {
  return updateUser(userId, { lastViewedGoalId: goalId });
};
