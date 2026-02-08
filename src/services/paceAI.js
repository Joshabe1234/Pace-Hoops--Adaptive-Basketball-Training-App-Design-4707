// Pace AI - Basketball Training Intelligence
// Analyzes player data and generates recommendations for coaches

import { getPlayerLogs, getPlayerStats, getDrill, getWorkout, getAllDrills } from '../data/database';

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

  analyzePlayer(playerId, teamId, options = {}) {
    const recommendations = [];
    const stats = getPlayerStats(playerId, options);
    const logs = getPlayerLogs(playerId, options);

    if (logs.length < this.thresholds.minLogsForAnalysis) {
      return [];
    }

    const shootingRecs = this.analyzeShootingPerformance(playerId, logs, stats);
    recommendations.push(...shootingRecs);

    const completionRecs = this.analyzeCompletionRate(playerId, stats);
    recommendations.push(...completionRecs);

    const trendRecs = this.analyzeTrends(playerId, logs);
    recommendations.push(...trendRecs);

    return recommendations.map(rec => ({ ...rec, teamId, playerId }));
  }

  analyzeShootingPerformance(playerId, logs, stats) {
    const recommendations = [];
    const { shooting } = stats;

    if (shooting.attempts === 0) return recommendations;

    if (shooting.percentage < this.thresholds.shootingConcern) {
      recommendations.push({
        type: 'concern',
        category: 'shooting',
        title: 'Shooting Percentage Below Target',
        description: `Overall shooting is at ${shooting.percentage}% (${shooting.makes}/${shooting.attempts}). Consider focusing on form work.`,
        suggestedActions: [
          'Assign form shooting drills',
          'Review shooting mechanics',
          'Reduce shooting distance temporarily',
          'Focus on free throw consistency'
        ],
        dataPoints: { percentage: shooting.percentage, makes: shooting.makes, attempts: shooting.attempts }
      });
    }

    return recommendations;
  }

  analyzeCompletionRate(playerId, stats) {
    const recommendations = [];

    if (stats.completionRate < this.thresholds.completionConcern) {
      recommendations.push({
        type: 'concern',
        category: 'engagement',
        title: 'Low Assignment Completion Rate',
        description: `Only ${stats.completionRate}% of assigned work is being completed.`,
        suggestedActions: [
          'Check in with player about workload',
          'Consider reducing assignment volume',
          'Discuss barriers to completion'
        ],
        dataPoints: { completionRate: stats.completionRate, totalLogs: stats.totalLogs }
      });
    }

    return recommendations;
  }

  analyzeTrends(playerId, logs) {
    const recommendations = [];
    if (logs.length < 6) return recommendations;

    const midpoint = Math.floor(logs.length / 2);
    const recentLogs = logs.slice(0, midpoint);
    const olderLogs = logs.slice(midpoint);

    const recentShooting = this.calculateShootingStats(recentLogs);
    const olderShooting = this.calculateShootingStats(olderLogs);

    if (recentShooting.attempts > 10 && olderShooting.attempts > 10) {
      const change = recentShooting.percentage - olderShooting.percentage;

      if (change <= -this.thresholds.significantDrop) {
        recommendations.push({
          type: 'concern',
          category: 'shooting',
          title: 'Shooting Performance Declining',
          description: `Shooting dropped from ${olderShooting.percentage}% to ${recentShooting.percentage}%.`,
          suggestedActions: ['Review practice footage', 'Check for fatigue', 'Return to form work'],
          dataPoints: { previousPercentage: olderShooting.percentage, currentPercentage: recentShooting.percentage, change }
        });
      } else if (change >= this.thresholds.significantImprovement) {
        recommendations.push({
          type: 'achievement',
          category: 'shooting',
          title: 'Shooting Improvement Detected',
          description: `Shooting improved from ${olderShooting.percentage}% to ${recentShooting.percentage}%!`,
          suggestedActions: ['Acknowledge improvement', 'Consider increasing difficulty'],
          dataPoints: { previousPercentage: olderShooting.percentage, currentPercentage: recentShooting.percentage, change }
        });
      }
    }

    return recommendations;
  }

  analyzeTeam(team, options = {}) {
    const recommendations = [];
    
    team.playerIds.forEach(playerId => {
      const playerRecs = this.analyzePlayer(playerId, team.id, options);
      recommendations.push(...playerRecs);
    });

    return recommendations;
  }

  calculateShootingStats(logs) {
    const shootingLogs = logs.filter(l => l.makes !== undefined && l.attempts !== undefined);
    const makes = shootingLogs.reduce((sum, l) => sum + l.makes, 0);
    const attempts = shootingLogs.reduce((sum, l) => sum + l.attempts, 0);
    
    return {
      makes,
      attempts,
      percentage: attempts > 0 ? Math.round((makes / attempts) * 100) : 0
    };
  }

  // Generate training plan from goal
  generateTrainingPlan(goal, userProfile) {
    const { description, timeframe, daysPerWeek = 3, minutesPerDay = 45 } = goal;
    const weeks = this.parseTimeframeToWeeks(timeframe);
    const category = this.categorizeGoal(description);
    const allDrills = getAllDrills();
    
    // Select drills based on category
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
