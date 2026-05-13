import { getAllDrills } from '../data/drillLibrary';

class PaceAI {
  constructor() {
    this.thresholds = {
      shootingConcern: 50,
      shootingGood: 70,
      completionConcern: 70,
      minLogsForAnalysis: 3,
      significantDrop: 10,
      significantImprovement: 10
    };
  }

  generateTrainingPlan(goal, userProfile) {
    const { description, timeframe, daysPerWeek = 3, minutesPerDay = 45 } = goal;
    const weeks = this.parseTimeframeToWeeks(timeframe);
    const category = this.categorizeGoal(description);
    const allDrills = getAllDrills();

    const relevantDrills = allDrills.filter(d => {
      if (category === 'shooting') return d.category === 'shooting';
      if (category === 'ball-handling') return d.category === 'ball-handling';
      if (category === 'defense') return d.category === 'defense';
      if (category === 'footwork') return d.category === 'footwork';
      return true;
    });

    const weeklyPlans = [];
    const trainingDays = this.getTrainingDays(daysPerWeek);

    for (let w = 0; w < weeks; w++) {
      const days = [];
      for (let d = 1; d <= 7; d++) {
        const isTrainingDay = trainingDays.includes(d);
        days.push({
          dayOfWeek: d,
          dayName: this.getDayName(d),
          isTrainingDay,
          isRestDay: !isTrainingDay,
          focus: isTrainingDay ? this.getFocusForDay(category, w, d) : 'Rest & Recovery',
          drills: isTrainingDay ? this.selectDrillsForSession(relevantDrills, minutesPerDay) : [],
          estimatedDuration: isTrainingDay ? minutesPerDay : 0
        });
      }
      weeklyPlans.push({ week: w + 1, days });
    }

    return {
      totalWeeks: weeks,
      totalSessions: weeks * daysPerWeek,
      sessionsPerWeek: daysPerWeek,
      category,
      weeklyPlans
    };
  }

  parseTimeframeToWeeks(timeframe) {
    const lower = (timeframe || '4 weeks').toLowerCase();
    if (lower.includes('week')) {
      const match = lower.match(/(\d+)/);
      return match ? parseInt(match[1]) : 4;
    }
    if (lower.includes('month')) {
      const match = lower.match(/(\d+)/);
      return match ? parseInt(match[1]) * 4 : 4;
    }
    return 4;
  }

  categorizeGoal(description) {
    const lower = (description || '').toLowerCase();
    if (lower.includes('shoot') || lower.includes('shot') || lower.includes('three')) return 'shooting';
    if (lower.includes('handle') || lower.includes('dribbl')) return 'ball-handling';
    if (lower.includes('defen')) return 'defense';
    if (lower.includes('footwork') || lower.includes('post')) return 'footwork';
    return 'general';
  }

  getTrainingDays(daysPerWeek) {
    const distributions = {
      1: [3], 2: [2, 5], 3: [1, 3, 5], 4: [1, 2, 4, 5],
      5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [1, 2, 3, 4, 5, 6, 7]
    };
    return distributions[daysPerWeek] || distributions[3];
  }

  getDayName(dayOfWeek) {
    return ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOfWeek];
  }

  getFocusForDay(category, week, day) {
    const focuses = {
      shooting: ['Form & Fundamentals', 'Volume Shooting', 'Game-Speed Shooting'],
      'ball-handling': ['Stationary Handles', 'Moving Handles', 'Combo Moves'],
      defense: ['Stance & Slides', 'Close-outs', 'Help Defense'],
      footwork: ['Triple Threat', 'Pivots', 'Post Moves'],
      general: ['Skill Development', 'Conditioning', 'Full Court Work']
    };
    const options = focuses[category] || focuses.general;
    return options[(week + day) % options.length];
  }

  selectDrillsForSession(drills, targetMinutes) {
    const selected = [];
    let totalTime = 0;
    const shuffled = [...drills].sort(() => Math.random() - 0.5);

    for (const drill of shuffled) {
      if (totalTime + drill.duration <= targetMinutes) {
        selected.push(drill);
        totalTime += drill.duration;
      }
      if (totalTime >= targetMinutes * 0.8) break;
    }

    return selected;
  }
}

export const paceAI = new PaceAI();
export default paceAI;
