import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getAllCoaches, getCoachDrills } from '../data/database';

const { 
  FiPlus, FiTrash2, FiCopy, FiChevronDown, FiChevronUp, FiSearch, 
  FiX, FiCheck, FiEdit2, FiVideo, FiClock, FiCalendar, FiArrowLeft,
  FiArrowRight, FiSave, FiTarget
} = FiIcons;

const CustomPlanBuilder = ({ user, onSavePlan, onBack }) => {
  const [step, setStep] = useState(1); // 1: setup, 2: build, 3: review
  const [planSetup, setPlanSetup] = useState({
    name: '',
    totalWeeks: 2,
    daysPerWeek: 3,
    minutesPerDay: 45
  });
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showDrillPicker, setShowDrillPicker] = useState(false);
  const [showCustomDrillForm, setShowCustomDrillForm] = useState(false);
  const [currentDayTarget, setCurrentDayTarget] = useState(null); // {weekIndex, dayIndex}
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCoach, setFilterCoach] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const coaches = getAllCoaches();
  
  // Get all drills from all coaches
  const getAllDrills = () => {
    let allDrills = [];
    coaches.forEach(coach => {
      const coachDrills = getCoachDrills(coach.id);
      allDrills = [...allDrills, ...coachDrills.map(d => ({ ...d, coachName: coach.name }))];
    });
    return allDrills;
  };

  const allDrills = getAllDrills();

  const filteredDrills = allDrills.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCoach = filterCoach === 'all' || drill.coachId === filterCoach;
    const matchesType = filterType === 'all' || drill.type === filterType;
    return matchesSearch && matchesCoach && matchesType;
  });

  // Generate blank skeleton based on setup
  const generateSkeleton = () => {
    const trainingDays = getTrainingDays(planSetup.daysPerWeek);
    const weeks = [];
    
    for (let w = 0; w < planSetup.totalWeeks; w++) {
      const days = [];
      for (let d = 1; d <= 7; d++) {
        const isTrainingDay = trainingDays.includes(d);
        days.push({
          dayOfWeek: d,
          dayName: getDayName(d),
          isTrainingDay,
          isRestDay: !isTrainingDay,
          focus: isTrainingDay ? '' : 'Rest & Recovery',
          drills: [],
          estimatedDuration: 0
        });
      }
      weeks.push({ week: w + 1, days });
    }
    
    setWeeklyPlan(weeks);
    setStep(2);
  };

  const getTrainingDays = (daysPerWeek) => {
    const distributions = {
      1: [3],
      2: [2, 5],
      3: [1, 3, 5],
      4: [1, 2, 4, 5],
      5: [1, 2, 3, 4, 5],
      6: [1, 2, 3, 4, 5, 6],
      7: [1, 2, 3, 4, 5, 6, 7]
    };
    return distributions[daysPerWeek] || distributions[3];
  };

  const getDayName = (dayOfWeek) => {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek];
  };

  // Add drill to a specific day
  const addDrillToDay = (drill) => {
    if (!currentDayTarget) return;
    
    const { weekIndex, dayIndex } = currentDayTarget;
    const newWeeklyPlan = [...weeklyPlan];
    const day = newWeeklyPlan[weekIndex].days[dayIndex];
    
    // Add drill with unique instance id
    day.drills.push({
      ...drill,
      instanceId: `${drill.id}_${Date.now()}`
    });
    day.estimatedDuration = day.drills.reduce((sum, d) => sum + d.duration, 0);
    
    setWeeklyPlan(newWeeklyPlan);
    setShowDrillPicker(false);
    setSearchQuery('');
  };

  // Add custom drill
  const [customDrill, setCustomDrill] = useState({
    name: '',
    category: 'skill',
    type: 'skill',
    duration: 15,
    description: '',
    videoUrl: '',
    steps: ['']
  });

  const addCustomDrill = () => {
    if (!customDrill.name || !currentDayTarget) return;
    
    const { weekIndex, dayIndex } = currentDayTarget;
    const newWeeklyPlan = [...weeklyPlan];
    const day = newWeeklyPlan[weekIndex].days[dayIndex];
    
    day.drills.push({
      ...customDrill,
      id: `custom_${Date.now()}`,
      instanceId: `custom_${Date.now()}`,
      isCustom: true,
      difficulty: 'intermediate',
      requiresAccuracyLog: customDrill.category === 'shooting',
      steps: customDrill.steps.filter(s => s.trim() !== '')
    });
    day.estimatedDuration = day.drills.reduce((sum, d) => sum + d.duration, 0);
    
    setWeeklyPlan(newWeeklyPlan);
    setShowCustomDrillForm(false);
    setCustomDrill({
      name: '',
      category: 'skill',
      type: 'skill',
      duration: 15,
      description: '',
      videoUrl: '',
      steps: ['']
    });
  };

  // Remove drill from day
  const removeDrill = (weekIndex, dayIndex, drillInstanceId) => {
    const newWeeklyPlan = [...weeklyPlan];
    const day = newWeeklyPlan[weekIndex].days[dayIndex];
    day.drills = day.drills.filter(d => d.instanceId !== drillInstanceId);
    day.estimatedDuration = day.drills.reduce((sum, d) => sum + d.duration, 0);
    setWeeklyPlan(newWeeklyPlan);
  };

  // Update day focus
  const updateDayFocus = (weekIndex, dayIndex, focus) => {
    const newWeeklyPlan = [...weeklyPlan];
    newWeeklyPlan[weekIndex].days[dayIndex].focus = focus;
    setWeeklyPlan(newWeeklyPlan);
  };

  // Toggle training day
  const toggleTrainingDay = (weekIndex, dayIndex) => {
    const newWeeklyPlan = [...weeklyPlan];
    const day = newWeeklyPlan[weekIndex].days[dayIndex];
    day.isTrainingDay = !day.isTrainingDay;
    day.isRestDay = !day.isTrainingDay;
    if (day.isRestDay) {
      day.focus = 'Rest & Recovery';
      day.drills = [];
      day.estimatedDuration = 0;
    } else {
      day.focus = '';
    }
    setWeeklyPlan(newWeeklyPlan);
  };

  // Copy week structure
  const copyWeek = (weekIndex) => {
    if (weekIndex >= weeklyPlan.length - 1) return;
    
    const newWeeklyPlan = [...weeklyPlan];
    const sourceDays = newWeeklyPlan[weekIndex].days;
    
    // Copy to next week
    newWeeklyPlan[weekIndex + 1].days = sourceDays.map(day => ({
      ...day,
      drills: day.drills.map(d => ({ ...d, instanceId: `${d.id}_${Date.now()}_${Math.random()}` }))
    }));
    
    setWeeklyPlan(newWeeklyPlan);
  };

  // Copy day
  const copyDay = (weekIndex, dayIndex) => {
    const newWeeklyPlan = [...weeklyPlan];
    const sourceDay = newWeeklyPlan[weekIndex].days[dayIndex];
    
    // Find next training day to copy to
    for (let w = weekIndex; w < newWeeklyPlan.length; w++) {
      const startDay = w === weekIndex ? dayIndex + 1 : 0;
      for (let d = startDay; d < 7; d++) {
        const targetDay = newWeeklyPlan[w].days[d];
        if (targetDay.isTrainingDay && targetDay.drills.length === 0) {
          targetDay.focus = sourceDay.focus;
          targetDay.drills = sourceDay.drills.map(drill => ({
            ...drill,
            instanceId: `${drill.id}_${Date.now()}_${Math.random()}`
          }));
          targetDay.estimatedDuration = sourceDay.estimatedDuration;
          setWeeklyPlan(newWeeklyPlan);
          return;
        }
      }
    }
  };

  // Add week
  const addWeek = () => {
    const trainingDays = getTrainingDays(planSetup.daysPerWeek);
    const newWeek = {
      week: weeklyPlan.length + 1,
      days: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i + 1,
        dayName: getDayName(i + 1),
        isTrainingDay: trainingDays.includes(i + 1),
        isRestDay: !trainingDays.includes(i + 1),
        focus: trainingDays.includes(i + 1) ? '' : 'Rest & Recovery',
        drills: [],
        estimatedDuration: 0
      }))
    };
    setWeeklyPlan([...weeklyPlan, newWeek]);
    setPlanSetup({ ...planSetup, totalWeeks: planSetup.totalWeeks + 1 });
  };

  // Remove week
  const removeWeek = (weekIndex) => {
    if (weeklyPlan.length <= 1) return;
    const newWeeklyPlan = weeklyPlan.filter((_, i) => i !== weekIndex);
    // Renumber weeks
    newWeeklyPlan.forEach((week, i) => week.week = i + 1);
    setWeeklyPlan(newWeeklyPlan);
    setPlanSetup({ ...planSetup, totalWeeks: planSetup.totalWeeks - 1 });
  };

  // Save the plan
  const handleSavePlan = () => {
    const totalSessions = weeklyPlan.reduce((sum, week) => 
      sum + week.days.filter(d => d.isTrainingDay).length, 0
    );

    // Number the days sequentially
    let dayCounter = 0;
    const numberedWeeklyPlan = weeklyPlan.map(week => ({
      ...week,
      days: week.days.map(day => {
        dayCounter++;
        return {
          ...day,
          dayNumber: dayCounter,
          sessionNumber: day.isTrainingDay ? 
            weeklyPlan.slice(0, week.week - 1).reduce((sum, w) => 
              sum + w.days.filter(d => d.isTrainingDay).length, 0
            ) + week.days.slice(0, week.days.indexOf(day) + 1).filter(d => d.isTrainingDay).length
            : null
        };
      })
    }));

    const plan = {
      isCustomPlan: true,
      name: planSetup.name || 'Custom Training Plan',
      totalSessions,
      sessionsPerWeek: planSetup.daysPerWeek,
      totalWeeks: planSetup.totalWeeks,
      weeklyPlans: numberedWeeklyPlan,
      createdAt: new Date()
    };

    onSavePlan(plan);
  };

  // Calculate totals for review
  const getTotals = () => {
    let totalSessions = 0;
    let totalDrills = 0;
    let totalMinutes = 0;

    weeklyPlan.forEach(week => {
      week.days.forEach(day => {
        if (day.isTrainingDay) {
          totalSessions++;
          totalDrills += day.drills.length;
          totalMinutes += day.estimatedDuration;
        }
      });
    });

    return { totalSessions, totalDrills, totalMinutes };
  };

  // Step 1: Setup
  const renderSetup = () => (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiEdit2} className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Custom Plan</h2>
          <p className="text-gray-500">Set up your training plan structure</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
            <input
              type="text"
              value={planSetup.name}
              onChange={(e) => setPlanSetup({ ...planSetup, name: e.target.value })}
              placeholder="e.g., Pre-Season Conditioning"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Weeks: <span className="text-blue-600 font-bold">{planSetup.totalWeeks}</span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={planSetup.totalWeeks}
              onChange={(e) => setPlanSetup({ ...planSetup, totalWeeks: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 week</span>
              <span>12 weeks</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Days per Week: <span className="text-blue-600 font-bold">{planSetup.daysPerWeek}</span>
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={planSetup.daysPerWeek}
              onChange={(e) => setPlanSetup({ ...planSetup, daysPerWeek: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 day</span>
              <span>7 days</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Minutes per Day: <span className="text-blue-600 font-bold">{planSetup.minutesPerDay} min</span>
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={planSetup.minutesPerDay}
              onChange={(e) => setPlanSetup({ ...planSetup, minutesPerDay: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 min</span>
              <span>120 min</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={generateSkeleton}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <span>Build Plan</span>
            <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Build
  const renderBuilder = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{planSetup.name || 'Custom Plan'}</h2>
            <p className="text-gray-500">{planSetup.totalWeeks} weeks • {planSetup.daysPerWeek} days/week</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Setup</span>
            </button>
            <button
              onClick={addWeek}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Week</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Review</span>
              <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Plans */}
      {weeklyPlan.map((week, weekIndex) => (
        <div key={weekIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Week Header */}
          <div
            className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setExpandedWeek(expandedWeek === weekIndex ? -1 : weekIndex)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-blue-600">{week.week}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Week {week.week}</h3>
                <p className="text-sm text-gray-500">
                  {week.days.filter(d => d.isTrainingDay).length} training days • 
                  {week.days.reduce((sum, d) => sum + d.drills.length, 0)} drills
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {weekIndex < weeklyPlan.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); copyWeek(weekIndex); }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Copy to next week"
                >
                  <SafeIcon icon={FiCopy} className="w-4 h-4" />
                </button>
              )}
              {weeklyPlan.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeWeek(weekIndex); }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove week"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              )}
              <SafeIcon 
                icon={expandedWeek === weekIndex ? FiChevronUp : FiChevronDown} 
                className="w-5 h-5 text-gray-400" 
              />
            </div>
          </div>

          {/* Week Content */}
          <AnimatePresence>
            {expandedWeek === weekIndex && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-100"
              >
                <div className="p-4 space-y-2">
                  {week.days.map((day, dayIndex) => {
                    const dayKey = `${weekIndex}-${dayIndex}`;
                    const isExpanded = expandedDay === dayKey;

                    return (
                      <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Day Header */}
                        <div
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            day.isRestDay ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleTrainingDay(weekIndex, dayIndex); }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                day.isTrainingDay 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {day.isTrainingDay ? (
                                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                              ) : (
                                <span className="text-xs">Off</span>
                              )}
                            </button>
                            <div>
                              <span className="font-medium text-gray-900">{day.dayName}</span>
                              {day.isTrainingDay && (
                                <span className="text-sm text-gray-500 ml-2">
                                  {day.drills.length} drills • {day.estimatedDuration} min
                                </span>
                              )}
                            </div>
                          </div>
                          {day.isTrainingDay && (
                            <SafeIcon 
                              icon={isExpanded ? FiChevronUp : FiChevronDown} 
                              className="w-4 h-4 text-gray-400" 
                            />
                          )}
                        </div>

                        {/* Day Content */}
                        {day.isTrainingDay && isExpanded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 border-t border-gray-200 bg-gray-50"
                          >
                            {/* Focus Input */}
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Day Focus</label>
                              <input
                                type="text"
                                value={day.focus}
                                onChange={(e) => updateDayFocus(weekIndex, dayIndex, e.target.value)}
                                placeholder="e.g., Shooting Fundamentals"
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Drills List */}
                            {day.drills.length > 0 && (
                              <div className="space-y-2 mb-4">
                                {day.drills.map((drill, drillIndex) => (
                                  <div 
                                    key={drill.instanceId} 
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                        {drillIndex + 1}
                                      </span>
                                      <div>
                                        <p className="font-medium text-gray-900 text-sm">{drill.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {drill.duration} min • {drill.type}
                                          {drill.isCustom && <span className="ml-1 text-purple-600">(custom)</span>}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeDrill(weekIndex, dayIndex, drill.instanceId)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                      <SafeIcon icon={FiX} className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Drill Buttons */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentDayTarget({ weekIndex, dayIndex });
                                  setShowDrillPicker(true);
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                              >
                                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                                <span className="text-sm font-medium">Add from Library</span>
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentDayTarget({ weekIndex, dayIndex });
                                  setShowCustomDrillForm(true);
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
                              >
                                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                                <span className="text-sm font-medium">Create Custom</span>
                              </button>
                            </div>

                            {/* Copy Day Button */}
                            <button
                              onClick={() => copyDay(weekIndex, dayIndex)}
                              className="mt-3 w-full flex items-center justify-center space-x-2 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                            >
                              <SafeIcon icon={FiCopy} className="w-4 h-4" />
                              <span>Copy to next empty training day</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  // Step 3: Review
  const renderReview = () => {
    const totals = getTotals();

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Plan</h2>
            <p className="text-gray-500">{planSetup.name || 'Custom Training Plan'}</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiCalendar} className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totals.totalSessions}</div>
              <div className="text-sm text-gray-500">Sessions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiTarget} className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totals.totalDrills}</div>
              <div className="text-sm text-gray-500">Total Drills</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiClock} className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totals.totalMinutes}</div>
              <div className="text-sm text-gray-500">Total Minutes</div>
            </div>
          </div>

          {/* Week by Week Summary */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900">Week by Week</h3>
            {weeklyPlan.map((week, index) => {
              const weekDrills = week.days.reduce((sum, d) => sum + d.drills.length, 0);
              const weekMinutes = week.days.reduce((sum, d) => sum + d.estimatedDuration, 0);
              const trainingDays = week.days.filter(d => d.isTrainingDay).length;

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Week {week.week}</span>
                  <span className="text-sm text-gray-500">
                    {trainingDays} days • {weekDrills} drills • {weekMinutes} min
                  </span>
                </div>
              );
            })}
          </div>

          {/* Warning if empty days */}
          {weeklyPlan.some(w => w.days.some(d => d.isTrainingDay && d.drills.length === 0)) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <p className="text-sm text-yellow-700">
                ⚠️ Some training days have no drills assigned. You can still save and add them later.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Edit Plan</span>
            </button>
            <button
              onClick={handleSavePlan}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>Save Plan</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Drill Picker Modal
  const renderDrillPicker = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Add Drill from Library</h3>
            <button
              onClick={() => { setShowDrillPicker(false); setSearchQuery(''); }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            <select
              value={filterCoach}
              onChange={(e) => setFilterCoach(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Coaches</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>{coach.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="skill">Skill</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>
        </div>

        {/* Drill List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredDrills.map((drill) => (
              <button
                key={drill.id}
                onClick={() => addDrillToDay(drill)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{drill.name}</h4>
                    <p className="text-sm text-gray-500">
                      {drill.coachName} • {drill.category} • {drill.duration} min
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    drill.type === 'cardio' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {drill.type}
                  </span>
                </div>
              </button>
            ))}
            {filteredDrills.length === 0 && (
              <p className="text-center text-gray-500 py-8">No drills found</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Custom Drill Form Modal
  const renderCustomDrillForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Create Custom Drill</h3>
            <button
              onClick={() => setShowCustomDrillForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drill Name *</label>
              <input
                type="text"
                value={customDrill.name}
                onChange={(e) => setCustomDrill({ ...customDrill, name: e.target.value })}
                placeholder="e.g., Corner Three Practice"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={customDrill.category}
                  onChange={(e) => setCustomDrill({ ...customDrill, category: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                >
                  <option value="shooting">Shooting</option>
                  <option value="ball-handling">Ball Handling</option>
                  <option value="defense">Defense</option>
                  <option value="passing">Passing</option>
                  <option value="footwork">Footwork</option>
                  <option value="conditioning">Conditioning</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={customDrill.type}
                  onChange={(e) => setCustomDrill({ ...customDrill, type: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                >
                  <option value="skill">Skill</option>
                  <option value="cardio">Cardio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration: {customDrill.duration} minutes
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={customDrill.duration}
                onChange={(e) => setCustomDrill({ ...customDrill, duration: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={customDrill.description}
                onChange={(e) => setCustomDrill({ ...customDrill, description: e.target.value })}
                placeholder="Brief description of the drill..."
                rows={2}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiVideo} className="w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={customDrill.videoUrl}
                  onChange={(e) => setCustomDrill({ ...customDrill, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
              {customDrill.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...customDrill.steps];
                      newSteps[index] = e.target.value;
                      setCustomDrill({ ...customDrill, steps: newSteps });
                    }}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  {customDrill.steps.length > 1 && (
                    <button
                      onClick={() => {
                        const newSteps = customDrill.steps.filter((_, i) => i !== index);
                        setCustomDrill({ ...customDrill, steps: newSteps });
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setCustomDrill({ ...customDrill, steps: [...customDrill.steps, ''] })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Step
              </button>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowCustomDrillForm(false)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addCustomDrill}
              disabled={!customDrill.name}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                customDrill.name
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add Drill
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div>
      {step === 1 && renderSetup()}
      {step === 2 && renderBuilder()}
      {step === 3 && renderReview()}

      {showDrillPicker && renderDrillPicker()}
      {showCustomDrillForm && renderCustomDrillForm()}
    </div>
  );
};

export default CustomPlanBuilder;
