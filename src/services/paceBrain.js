// Pace Brain - Adaptive training logic engine
export class PaceBrain {
  constructor() {
    this.adaptiveFactors = {
      age: {
        youth: { recoveryMultiplier: 0.7, intensityLimit: 0.6, sessionLimit: 3, minAge: 0, maxAge: 12 },
        teen: { recoveryMultiplier: 0.85, intensityLimit: 0.8, sessionLimit: 5, minAge: 13, maxAge: 17 },
        adult: { recoveryMultiplier: 1.0, intensityLimit: 1.0, sessionLimit: 6, minAge: 18, maxAge: 100 }
      },
      injury: {
        none: { intensityMultiplier: 1.0, modificationNeeded: false },
        mild: { intensityMultiplier: 0.7, modificationNeeded: true },
        moderate: { intensityMultiplier: 0.5, modificationNeeded: true },
        severe: { intensityMultiplier: 0.3, modificationNeeded: true }
      },
      difficulty: {
        1: { nextIntensity: 1.1, recoveryNeeded: false, label: 'Very Easy' },
        2: { nextIntensity: 1.05, recoveryNeeded: false, label: 'Easy' },
        3: { nextIntensity: 1.0, recoveryNeeded: false, label: 'Moderate' },
        4: { nextIntensity: 0.95, recoveryNeeded: false, label: 'Hard' },
        5: { nextIntensity: 0.9, recoveryNeeded: true, label: 'Very Hard' }
      }
    };
  }

  getAgeCategory(age) {
    const ageNum = parseInt(age);
    if (ageNum <= 12) return 'youth';
    if (ageNum <= 17) return 'teen';
    return 'adult';
  }

  generateTrainingPlan(user, goal, coach, drills) {
    const timeframe = this.parseTimeframe(goal.timeframe);
    const ageCategory = this.getAgeCategory(user.age);
    const sessions = this.calculateOptimalSessions(user, timeframe, goal.availability);
    
    return {
      totalSessions: sessions.total,
      sessionsPerWeek: sessions.perWeek,
      totalDays: sessions.totalDays,
      totalWeeks: Math.ceil(sessions.totalDays / 7),
      progression: this.createProgression(sessions.total),
      weeklyPlans: this.generateWeeklyPlans(user, goal, coach, drills, sessions),
      adaptiveParameters: this.getAdaptiveParameters(user, ageCategory)
    };
  }

  parseTimeframe(timeframe) {
    const timeframeLower = timeframe.toLowerCase();
    const days = timeframeLower.includes('day') ? parseInt(timeframeLower.match(/\d+/)?.[0]) || 7 : null;
    const weeks = timeframeLower.includes('week') ? parseInt(timeframeLower.match(/\d+/)?.[0]) || 1 : null;
    const months = timeframeLower.includes('month') ? parseInt(timeframeLower.match(/\d+/)?.[0]) || 1 : null;

    if (days) return { type: 'days', value: days };
    if (weeks) return { type: 'weeks', value: weeks };
    if (months) return { type: 'months', value: months };
    
    return { type: 'weeks', value: 2 }; // default
  }

  calculateOptimalSessions(user, timeframe, availability = {}) {
    const ageCategory = this.getAgeCategory(user.age);
    const ageFactor = this.adaptiveFactors.age[ageCategory];
    const injuryFactor = this.adaptiveFactors.injury[user.injuries || 'none'];
    
    let totalDays;
    switch (timeframe.type) {
      case 'days':
        totalDays = timeframe.value;
        break;
      case 'weeks':
        totalDays = timeframe.value * 7;
        break;
      case 'months':
        totalDays = timeframe.value * 30;
        break;
      default:
        totalDays = 14;
    }

    // Use availability if provided, otherwise auto-calculate
    let sessionsPerWeek;
    let minutesPerDay;
    
    if (availability.daysPerWeek) {
      sessionsPerWeek = parseInt(availability.daysPerWeek);
    } else {
      // Auto-calculate based on age and injury
      const baseSessionsPerWeek = Math.min(ageFactor.sessionLimit, 5);
      const urgencyMultiplier = totalDays <= 7 ? 1.2 : totalDays <= 14 ? 1.0 : 0.8;
      sessionsPerWeek = Math.round(baseSessionsPerWeek * urgencyMultiplier * injuryFactor.intensityMultiplier);
    }
    
    minutesPerDay = availability.minutesPerDay ? parseInt(availability.minutesPerDay) : 45;

    const totalSessions = Math.round((totalDays / 7) * sessionsPerWeek);

    return {
      total: Math.max(1, totalSessions),
      perWeek: Math.max(1, Math.min(sessionsPerWeek, 7)),
      totalDays,
      minutesPerDay
    };
  }

  createProgression(totalSessions) {
    const progression = [];
    
    for (let i = 0; i < totalSessions; i++) {
      const sessionNumber = i + 1;
      const progressionPhase = sessionNumber / totalSessions;
      
      let phase;
      if (progressionPhase <= 0.3) {
        phase = 'build-up';
      } else if (progressionPhase <= 0.85) {
        phase = 'peak';
      } else {
        phase = 'taper';
      }
      
      progression.push({
        session: sessionNumber,
        phase
      });
    }
    
    return progression;
  }

  generateWeeklyPlans(user, goal, coach, drills, sessions) {
    const coachDrills = drills.filter(drill => drill.coachId === coach.id);
    const goalCategory = this.categorizeGoal(goal.description);
    const relevantDrills = this.selectRelevantDrills(coachDrills, goalCategory, user);
    
    const skillDrills = relevantDrills.filter(d => d.type === 'skill');
    const cardioDrills = relevantDrills.filter(d => d.type === 'cardio');
    
    const weeklyPlans = [];
    const totalWeeks = Math.ceil(sessions.totalDays / 7);
    let sessionCounter = 0;
    let globalDayCounter = 0;
    
    // Distribute sessions across the week
    const trainingDays = this.getTrainingDays(sessions.perWeek);
    
    for (let week = 0; week < totalWeeks; week++) {
      const weekPlan = {
        week: week + 1,
        days: []
      };
      
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        globalDayCounter++;
        const isTrainingDay = trainingDays.includes(dayOfWeek) && sessionCounter < sessions.total;
        
        if (isTrainingDay) {
          sessionCounter++;
          const sessionDrills = this.selectSessionDrills(skillDrills, cardioDrills, sessionCounter, sessions.total, user, sessions.minutesPerDay);
          const modifiedDrills = this.applyModifications(sessionDrills, user);
          
          weekPlan.days.push({
            dayNumber: globalDayCounter,
            dayOfWeek,
            dayName: this.getDayName(dayOfWeek),
            sessionNumber: sessionCounter,
            isTrainingDay: true,
            isRestDay: false,
            focus: this.getDayFocus(goalCategory, sessionCounter, sessions.total),
            drills: modifiedDrills,
            estimatedDuration: modifiedDrills.reduce((total, drill) => total + drill.duration, 0),
            phase: this.getSessionPhase(sessionCounter, sessions.total),
            completed: false
          });
        } else {
          weekPlan.days.push({
            dayNumber: globalDayCounter,
            dayOfWeek,
            dayName: this.getDayName(dayOfWeek),
            isTrainingDay: false,
            isRestDay: true,
            focus: 'Rest & Recovery',
            drills: [],
            estimatedDuration: 0,
            completed: false
          });
        }
      }
      
      weeklyPlans.push(weekPlan);
    }
    
    return weeklyPlans;
  }

  getTrainingDays(sessionsPerWeek) {
    // Distribute training days evenly through the week
    const distributions = {
      1: [3], // Wednesday
      2: [2, 5], // Tuesday, Friday
      3: [1, 3, 5], // Monday, Wednesday, Friday
      4: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
      5: [1, 2, 3, 4, 5], // Mon-Fri
      6: [1, 2, 3, 4, 5, 6], // Mon-Sat
      7: [1, 2, 3, 4, 5, 6, 7] // Every day
    };
    
    return distributions[sessionsPerWeek] || distributions[3];
  }

  getDayName(dayOfWeek) {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek] || '';
  }

  getSessionPhase(sessionNumber, totalSessions) {
    const progress = sessionNumber / totalSessions;
    if (progress <= 0.3) return 'build-up';
    if (progress <= 0.85) return 'peak';
    return 'taper';
  }

  categorizeGoal(description) {
    const descLower = description.toLowerCase();
    
    if (descLower.includes('shoot') || descLower.includes('shot') || descLower.includes('three') || descLower.includes('3-point')) return 'shooting';
    if (descLower.includes('dribbl') || descLower.includes('handle') || descLower.includes('ball handling')) return 'ball-handling';
    if (descLower.includes('defense') || descLower.includes('defend') || descLower.includes('defensive')) return 'defense';
    if (descLower.includes('pass') || descLower.includes('assist')) return 'passing';
    if (descLower.includes('rebound')) return 'rebounding';
    if (descLower.includes('footwork') || descLower.includes('move') || descLower.includes('post')) return 'footwork';
    if (descLower.includes('conditioning') || descLower.includes('stamina') || descLower.includes('endurance')) return 'conditioning';
    
    return 'general';
  }

  selectRelevantDrills(drills, category, user) {
    return drills.filter(drill => {
      const categoryMatch = 
        drill.category === category || 
        drill.category === 'conditioning' || 
        category === 'general';
      const levelMatch = this.isDrillAppropriate(drill, user);
      return categoryMatch && levelMatch;
    });
  }

  isDrillAppropriate(drill, user) {
    const userAge = parseInt(user.age);
    const drillDifficulty = drill.difficulty;
    
    if (userAge <= 12) {
      return drillDifficulty === 'beginner';
    } else if (userAge <= 15) {
      return drillDifficulty === 'beginner' || drillDifficulty === 'intermediate';
    }
    return true; // teens 16+ and adults can do all levels
  }

  selectSessionDrills(skillDrills, cardioDrills, sessionIndex, totalSessions, user, targetMinutes) {
    const selectedDrills = [];
    let totalDuration = 0;
    
    // Always include 1-2 skill drills
    const numSkillDrills = Math.min(2, skillDrills.length);
    for (let i = 0; i < numSkillDrills; i++) {
      const drillIndex = (sessionIndex + i) % skillDrills.length;
      const drill = { ...skillDrills[drillIndex] };
      selectedDrills.push(drill);
      totalDuration += drill.duration;
    }
    
    // Add cardio if time allows and we have cardio drills
    if (cardioDrills.length > 0 && totalDuration < targetMinutes - 10) {
      const cardioIndex = sessionIndex % cardioDrills.length;
      const cardioDrill = { ...cardioDrills[cardioIndex] };
      selectedDrills.push(cardioDrill);
    }
    
    return selectedDrills;
  }

  applyModifications(drills, user) {
    const ageCategory = this.getAgeCategory(user.age);
    
    return drills.map(drill => {
      const modifiedDrill = { ...drill };
      
      // Apply injury modifications
      if (user.injuries && user.injuries !== 'none' && drill.modifications?.injury) {
        modifiedDrill.modification = drill.modifications.injury;
        modifiedDrill.duration = Math.round(drill.duration * 0.8);
      }
      
      // Apply beginner modifications for youth
      if (ageCategory === 'youth' && drill.modifications?.beginner) {
        modifiedDrill.modification = drill.modifications.beginner;
      }
      
      return modifiedDrill;
    });
  }

  getDayFocus(category, sessionIndex, totalSessions) {
    const focuses = {
      shooting: ['Form Development', 'Accuracy Training', 'Range Extension', 'Game Speed Shots', 'Consistency Work', 'Pressure Shooting'],
      'ball-handling': ['Basic Control', 'Weak Hand Work', 'Advanced Moves', 'Game Application', 'Pressure Situations', 'Full Court Control'],
      defense: ['Stance & Position', 'Lateral Movement', 'Close-Out Technique', 'Help Defense', 'On-Ball Pressure', 'Team Defense'],
      passing: ['Basic Passes', 'Entry Passes', 'Skip Passes', 'Decision Making', 'Pressure Passing', 'Game Situations'],
      footwork: ['Basic Steps', 'Pivot Work', 'Triple Threat', 'Post Moves', 'Perimeter Moves', 'Advanced Combinations'],
      conditioning: ['Base Building', 'Speed Work', 'Endurance', 'Game Simulation', 'Recovery', 'Peak Performance'],
      general: ['Fundamentals', 'Skill Building', 'Integration', 'Application', 'Game Readiness', 'Peak Performance']
    };
    
    const categoryFocuses = focuses[category] || focuses.general;
    const focusIndex = Math.floor((sessionIndex / totalSessions) * categoryFocuses.length);
    return categoryFocuses[Math.min(focusIndex, categoryFocuses.length - 1)];
  }

  adaptPlan(currentPlan, userFeedback, user) {
    const adaptedPlan = JSON.parse(JSON.stringify(currentPlan)); // Deep clone
    
    // Adapt based on difficulty feedback
    if (userFeedback.difficulty) {
      const difficultyAdjustment = this.adaptiveFactors.difficulty[userFeedback.difficulty];
      if (difficultyAdjustment && difficultyAdjustment.recoveryNeeded) {
        adaptedPlan.adaptiveParameters.needsRecovery = true;
      }
    }
    
    // Adapt based on injury updates
    if (userFeedback.newInjury || userFeedback.soreness === 'severe') {
      adaptedPlan.weeklyPlans = adaptedPlan.weeklyPlans.map(week => ({
        ...week,
        days: week.days.map(day => ({
          ...day,
          drills: day.drills ? this.applyModifications(day.drills, { ...user, injuries: 'mild' }) : []
        }))
      }));
    }
    
    return adaptedPlan;
  }

  getAdaptiveParameters(user, ageCategory) {
    return {
      ageCategory,
      injuryStatus: user.injuries || 'none',
      recoveryMultiplier: this.adaptiveFactors.age[ageCategory].recoveryMultiplier,
      needsRecovery: false,
      lastAdaptation: new Date()
    };
  }

  // Calculate overall progress based on completed sessions and accuracy
  calculateProgress(goal, plan) {
    if (!plan || !plan.weeklyPlans) return { sessions: 0, accuracy: null };
    
    let totalSessions = 0;
    let completedSessions = goal.completedSessions?.length || 0;
    
    plan.weeklyPlans.forEach(week => {
      week.days.forEach(day => {
        if (day.isTrainingDay) totalSessions++;
      });
    });
    
    const sessionProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    
    // Calculate accuracy progress if available
    let accuracyProgress = null;
    if (goal.accuracyLogs && Object.keys(goal.accuracyLogs).length > 0) {
      let totalMakes = 0;
      let totalAttempts = 0;
      
      Object.values(goal.accuracyLogs).forEach(drillLogs => {
        drillLogs.forEach(log => {
          totalMakes += log.makes;
          totalAttempts += log.attempts;
        });
      });
      
      if (totalAttempts > 0) {
        accuracyProgress = Math.round((totalMakes / totalAttempts) * 100);
      }
    }
    
    return {
      sessions: sessionProgress,
      completedCount: completedSessions,
      totalCount: totalSessions,
      accuracy: accuracyProgress
    };
  }
}

export const paceBrain = new PaceBrain();
