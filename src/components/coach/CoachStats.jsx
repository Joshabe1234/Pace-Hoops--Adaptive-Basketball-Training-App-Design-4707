import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getTeamPlayers, 
  getTeamAssignments,
  getPlayerLogs,
  getDrill,
  getWorkout,
  getAllDrills
} from '../../data/database';

const CoachStats = ({ user, team, selectedAssignment: initialAssignment }) => {
  const [activeTab, setActiveTab] = useState('team');
  const [selectedPosition, setSelectedPosition] = useState('Point Guard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [expandedDrill, setExpandedDrill] = useState(null);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  const players = team ? getTeamPlayers(team.id) : [];
  const allAssignments = team ? getTeamAssignments(team.id) : [];
  const positions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];

  // Handle initial assignment from dashboard navigation
  useEffect(() => {
    if (initialAssignment) {
      setExpandedAssignment(initialAssignment.id);
    }
  }, [initialAssignment]);

  // Get players by position
  const getPlayersByPosition = (position) => {
    return players.filter(p => p.position === position);
  };

  // Check if an assignment was assigned to a specific position
  const isAssignedToPosition = (assignment, position) => {
    if (assignment.assignedTo === 'team') return false;
    if (!Array.isArray(assignment.assignedTo)) return false;
    
    const positionPlayers = getPlayersByPosition(position);
    const positionPlayerIds = positionPlayers.map(p => p.id);
    
    const assignedToThisPosition = assignment.assignedTo.some(id => positionPlayerIds.includes(id));
    return assignedToThisPosition;
  };

  // Check if an assignment was assigned to a specific player
  const isAssignedToPlayer = (assignment, playerId) => {
    if (assignment.assignedTo === 'team') return true;
    if (Array.isArray(assignment.assignedTo)) {
      return assignment.assignedTo.includes(playerId);
    }
    return false;
  };

  // Filter assignments based on view
  const getFilteredAssignments = () => {
    if (activeTab === 'team') {
      return allAssignments.filter(a => a.assignedTo === 'team');
    } else if (activeTab === 'position') {
      return allAssignments.filter(a => {
        if (a.assignedTo === 'team') return true;
        if (isAssignedToPosition(a, selectedPosition)) return true;
        return false;
      });
    } else if (activeTab === 'individual' && selectedPlayer) {
      return allAssignments.filter(a => isAssignedToPlayer(a, selectedPlayer.id));
    }
    return [];
  };

  // Get relevant players for stats calculation
  const getRelevantPlayers = () => {
    if (activeTab === 'team') {
      return players;
    } else if (activeTab === 'position') {
      return getPlayersByPosition(selectedPosition);
    } else if (activeTab === 'individual' && selectedPlayer) {
      return [selectedPlayer];
    }
    return [];
  };

  // Calculate stats for a specific drill
  const getDrillStats = (drillId, assignmentId) => {
    const relevantPlayers = getRelevantPlayers();
    
    let totalMakes = 0;
    let totalAttempts = 0;
    let totalLogs = 0;
    let totalDifficulty = 0;
    let difficultyCount = 0;
    let sorenessCount = { none: 0, mild: 0, moderate: 0, severe: 0 };
    const playerBreakdown = [];

    relevantPlayers.forEach(player => {
      const playerLogs = getPlayerLogs(player.id).filter(
        l => l.itemId === drillId && l.assignmentId === assignmentId
      );

      if (playerLogs.length > 0) {
        const playerMakes = playerLogs.reduce((sum, l) => sum + (l.makes || 0), 0);
        const playerAttempts = playerLogs.reduce((sum, l) => sum + (l.attempts || 0), 0);
        const playerPercentage = playerAttempts > 0 ? Math.round((playerMakes / playerAttempts) * 100) : null;

        totalMakes += playerMakes;
        totalAttempts += playerAttempts;
        totalLogs += playerLogs.length;

        playerLogs.forEach(l => {
          if (l.difficulty) {
            totalDifficulty += l.difficulty;
            difficultyCount++;
          }
          if (l.soreness) {
            sorenessCount[l.soreness] = (sorenessCount[l.soreness] || 0) + 1;
          }
        });

        playerBreakdown.push({
          player,
          logs: playerLogs.length,
          makes: playerMakes,
          attempts: playerAttempts,
          percentage: playerPercentage
        });
      }
    });

    return {
      totalLogs,
      makes: totalMakes,
      attempts: totalAttempts,
      percentage: totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : null,
      avgDifficulty: difficultyCount > 0 ? (totalDifficulty / difficultyCount).toFixed(1) : null,
      soreness: sorenessCount,
      playerBreakdown,
      playersCompleted: playerBreakdown.length,
      totalPlayers: relevantPlayers.length
    };
  };

  // Calculate overall stats for current view
  const getOverallStats = () => {
    const relevantPlayers = getRelevantPlayers();
    const filteredAssignments = getFilteredAssignments();
    
    let totalLogs = 0;
    let totalMakes = 0;
    let totalAttempts = 0;

    const filteredAssignmentIds = filteredAssignments.map(a => a.id);

    relevantPlayers.forEach(player => {
      const logs = getPlayerLogs(player.id).filter(l => 
        filteredAssignmentIds.includes(l.assignmentId)
      );
      totalLogs += logs.length;
      
      logs.forEach(l => {
        if (l.makes !== undefined) totalMakes += l.makes;
        if (l.attempts !== undefined) totalAttempts += l.attempts;
      });
    });

    return {
      playerCount: relevantPlayers.length,
      totalLogs,
      shooting: {
        makes: totalMakes,
        attempts: totalAttempts,
        percentage: totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : null
      },
      assignmentCount: filteredAssignments.length
    };
  };

  // Generate AI recommendations based on team stats
  const generateAIRecommendations = () => {
    const allDrills = getAllDrills();
    const recommendations = [];
    
    // Analyze team shooting
    const overallStats = getOverallStats();
    const shootingPct = overallStats.shooting.percentage;
    
    if (shootingPct !== null && shootingPct < 50) {
      recommendations.push({
        type: 'drill',
        priority: 'high',
        title: 'Focus on Form Shooting',
        description: `Team shooting is at ${shootingPct}%. Assign form shooting drills to improve fundamentals.`,
        suggestedDrills: allDrills.filter(d => d.category === 'shooting').slice(0, 2)
      });
    }

    // Check for players with low completion
    const lowCompletionPlayers = players.filter(p => {
      const logs = getPlayerLogs(p.id);
      return logs.length < 3;
    });

    if (lowCompletionPlayers.length > 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        title: 'Low Engagement Alert',
        description: `${lowCompletionPlayers.length} player${lowCompletionPlayers.length > 1 ? 's have' : ' has'} completed fewer than 3 drills.`,
        players: lowCompletionPlayers
      });
    }

    // Position-specific recommendations
    positions.forEach(pos => {
      const posPlayers = getPlayersByPosition(pos);
      if (posPlayers.length > 0) {
        let posMakes = 0, posAttempts = 0;
        posPlayers.forEach(p => {
          const logs = getPlayerLogs(p.id);
          logs.forEach(l => {
            if (l.makes !== undefined) posMakes += l.makes;
            if (l.attempts !== undefined) posAttempts += l.attempts;
          });
        });
        const posPct = posAttempts > 0 ? Math.round((posMakes / posAttempts) * 100) : null;
        
        if (posPct !== null && posPct < 45) {
          const categoryMap = {
            'Point Guard': 'ball-handling',
            'Shooting Guard': 'shooting',
            'Small Forward': 'shooting',
            'Power Forward': 'post',
            'Center': 'post'
          };
          const category = categoryMap[pos] || 'shooting';
          recommendations.push({
            type: 'position',
            priority: 'medium',
            title: `${pos} Development`,
            description: `${pos}s are shooting ${posPct}%. Consider targeted ${category} drills.`,
            position: pos,
            suggestedDrills: allDrills.filter(d => d.category === category).slice(0, 2)
          });
        }
      }
    });

    // Workout balance check
    const hasWorkouts = allAssignments.some(a => a.type === 'workout');
    if (!hasWorkouts && allAssignments.length > 2) {
      recommendations.push({
        type: 'balance',
        priority: 'low',
        title: 'Add Conditioning',
        description: 'All assignments are skill drills. Consider adding workouts for physical development.',
        suggestedDrills: []
      });
    }

    return recommendations.length > 0 ? recommendations : [{
      type: 'success',
      priority: 'low',
      title: 'Team on Track',
      description: 'No specific recommendations at this time. Keep up the good work!',
      suggestedDrills: []
    }];
  };

  const overallStats = getOverallStats();
  const filteredAssignments = getFilteredAssignments();
  const aiRecommendations = generateAIRecommendations();

  // Get item details (drill or workout)
  const getItemDetails = (itemId, type) => {
    return type === 'drill' ? getDrill(itemId) : getWorkout(itemId);
  };

  if (!team) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <span className="text-4xl">📊</span>
          <p className="text-slate-400 mt-4">Create a team to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Track performance across your team</p>
        </div>
        <button
          onClick={() => setShowAIRecommendations(!showAIRecommendations)}
          className={`px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors ${
            showAIRecommendations 
              ? 'bg-purple-500 text-white' 
              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <span>🤖</span>
          <span>AI Insights</span>
        </button>
      </div>

      {/* AI Recommendations Section */}
      <AnimatePresence>
        {showAIRecommendations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Recommendations</span>
                </h2>
                <span className="text-xs text-slate-400">Based on team performance data</span>
              </div>
              
              <div className="space-y-3">
                {aiRecommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {rec.priority === 'high' ? '⚠️ High' : rec.priority === 'medium' ? '📌 Medium' : '✅ Info'}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">{rec.type}</span>
                        </div>
                        <h3 className="font-medium text-white mt-2">{rec.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                      </div>
                    </div>
                    
                    {rec.suggestedDrills && rec.suggestedDrills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-slate-500">Suggested:</span>
                        {rec.suggestedDrills.map(drill => (
                          <span key={drill.id} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                            {drill.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {rec.players && rec.players.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-slate-500">Players:</span>
                        {rec.players.map(player => (
                          <span key={player.id} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                            {player.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab('team'); setExpandedAssignment(null); setExpandedDrill(null); }}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'team'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          👥 Team Stats
        </button>
        <button
          onClick={() => { setActiveTab('position'); setExpandedAssignment(null); setExpandedDrill(null); }}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'position'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🏀 By Position
        </button>
        <button
          onClick={() => { setActiveTab('individual'); setExpandedAssignment(null); setExpandedDrill(null); }}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'individual'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          👤 Individual
        </button>
      </div>

      {/* Tab Description */}
      <div className="bg-slate-800/50 rounded-lg px-4 py-2 text-sm text-slate-400">
        {activeTab === 'team' && '📊 Showing stats for team-wide assignments only'}
        {activeTab === 'position' && `📊 Showing team-wide + ${selectedPosition}-specific assignments`}
        {activeTab === 'individual' && selectedPlayer && `📊 Showing all assignments for ${selectedPlayer.name}`}
        {activeTab === 'individual' && !selectedPlayer && '📊 Select a player to view their stats'}
      </div>

      {/* Position Selector */}
      {activeTab === 'position' && (
        <div className="flex flex-wrap gap-2">
          {positions.map(pos => {
            const count = getPlayersByPosition(pos).length;
            return (
              <button
                key={pos}
                onClick={() => { setSelectedPosition(pos); setExpandedAssignment(null); setExpandedDrill(null); }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedPosition === pos
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pos} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Player Selector */}
      {activeTab === 'individual' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-3">Select a player:</p>
          <div className="flex flex-wrap gap-2">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => { setSelectedPlayer(player); setExpandedAssignment(null); setExpandedDrill(null); }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedPlayer?.id === player.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {player.jerseyNumber && <span className="mr-1">#{player.jerseyNumber}</span>}
                {player.name}
                {player.position && <span className="ml-1 text-xs opacity-70">({player.position})</span>}
              </button>
            ))}
          </div>
          {players.length === 0 && (
            <p className="text-slate-500 text-center py-4">No players on team yet</p>
          )}
        </div>
      )}

      {/* Overall Stats Card */}
      {(activeTab === 'team' || activeTab === 'position' || (activeTab === 'individual' && selectedPlayer)) && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {activeTab === 'team' && 'Team Overview'}
            {activeTab === 'position' && `${selectedPosition} Overview`}
            {activeTab === 'individual' && selectedPlayer && `${selectedPlayer.name}'s Overview`}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm">
                {activeTab === 'individual' ? 'Total Logs' : 'Players'}
              </p>
              <p className="text-3xl font-bold text-white">
                {activeTab === 'individual' ? overallStats.totalLogs : overallStats.playerCount}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Shooting %</p>
              <p className={`text-3xl font-bold ${
                overallStats.shooting.percentage >= 70 ? 'text-green-400' :
                overallStats.shooting.percentage >= 50 ? 'text-yellow-400' :
                overallStats.shooting.percentage ? 'text-red-400' : 'text-white'
              }`}>
                {overallStats.shooting.percentage ?? '--'}%
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Makes / Attempts</p>
              <p className="text-3xl font-bold text-white">
                {overallStats.shooting.makes}/{overallStats.shooting.attempts}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Assignments</p>
              <p className="text-3xl font-bold text-white">{overallStats.assignmentCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {(activeTab === 'team' || activeTab === 'position' || (activeTab === 'individual' && selectedPlayer)) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {activeTab === 'team' && 'Team Assignments'}
            {activeTab === 'position' && `${selectedPosition} Assignments`}
            {activeTab === 'individual' && selectedPlayer && `${selectedPlayer.name}'s Assignments`}
          </h2>

          {filteredAssignments.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <p className="text-slate-400">No assignments found</p>
              <p className="text-slate-500 text-sm mt-1">
                {activeTab === 'team' && 'Create a team-wide assignment to see stats here'}
                {activeTab === 'position' && `No team or ${selectedPosition}-specific assignments yet`}
                {activeTab === 'individual' && 'No assignments for this player yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map(assignment => {
                const isExpanded = expandedAssignment === assignment.id;
                const items = assignment.items.map(id => getItemDetails(id, assignment.type)).filter(Boolean);
                
                const relevantPlayers = getRelevantPlayers();
                let completedCount = 0;
                relevantPlayers.forEach(player => {
                  const logs = getPlayerLogs(player.id).filter(l => l.assignmentId === assignment.id);
                  if (logs.length > 0) completedCount++;
                });

                const getAssignmentTypeLabel = () => {
                  if (assignment.assignedTo === 'team') return { text: 'Team', color: 'bg-blue-500/20 text-blue-400' };
                  return { text: 'Targeted', color: 'bg-purple-500/20 text-purple-400' };
                };
                const typeLabel = getAssignmentTypeLabel();

                return (
                  <div key={assignment.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {/* Assignment Header */}
                    <button
                      onClick={() => {
                        setExpandedAssignment(isExpanded ? null : assignment.id);
                        setExpandedDrill(null);
                      }}
                      className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h3 className="font-semibold text-white">{assignment.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${typeLabel.color}`}>
                              {typeLabel.text}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {items.length} {assignment.type}s • {completedCount}/{relevantPlayers.length} completed
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <svg 
                            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Drills List (Expanded) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-700 overflow-hidden"
                        >
                          <div className="p-4 space-y-2">
                            {items.map(item => {
                              const drillStats = getDrillStats(item.id, assignment.id);
                              const isDrillExpanded = expandedDrill === `${assignment.id}-${item.id}`;

                              return (
                                <div key={item.id} className="bg-slate-900/50 rounded-xl overflow-hidden">
                                  {/* Drill Header */}
                                  <button
                                    onClick={() => setExpandedDrill(isDrillExpanded ? null : `${assignment.id}-${item.id}`)}
                                    className="w-full p-3 text-left hover:bg-slate-700/30 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white">{item.name}</p>
                                        <p className="text-xs text-slate-400">
                                          {item.category} • {drillStats.playersCompleted}/{drillStats.totalPlayers} completed
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-3 ml-4">
                                        {drillStats.percentage !== null && (
                                          <span className={`font-bold ${
                                            drillStats.percentage >= 70 ? 'text-green-400' :
                                            drillStats.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                                          }`}>
                                            {drillStats.percentage}%
                                          </span>
                                        )}
                                        <svg 
                                          className={`w-4 h-4 text-slate-400 transition-transform ${isDrillExpanded ? 'rotate-180' : ''}`}
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </button>

                                  {/* Drill Stats (Expanded) */}
                                  <AnimatePresence>
                                    {isDrillExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-700 overflow-hidden"
                                      >
                                        <div className="p-4 space-y-4">
                                          {/* Drill Overall Stats */}
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-slate-800 rounded-lg p-3">
                                              <p className="text-xs text-slate-400">Total Logs</p>
                                              <p className="text-xl font-bold text-white">{drillStats.totalLogs}</p>
                                            </div>
                                            {drillStats.percentage !== null && (
                                              <div className="bg-slate-800 rounded-lg p-3">
                                                <p className="text-xs text-slate-400">Avg Shooting</p>
                                                <p className={`text-xl font-bold ${
                                                  drillStats.percentage >= 70 ? 'text-green-400' :
                                                  drillStats.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                  {drillStats.percentage}%
                                                </p>
                                              </div>
                                            )}
                                            <div className="bg-slate-800 rounded-lg p-3">
                                              <p className="text-xs text-slate-400">Makes / Attempts</p>
                                              <p className="text-xl font-bold text-white">
                                                {drillStats.makes}/{drillStats.attempts}
                                              </p>
                                            </div>
                                            {drillStats.avgDifficulty && (
                                              <div className="bg-slate-800 rounded-lg p-3">
                                                <p className="text-xs text-slate-400">Avg Difficulty</p>
                                                <p className="text-xl font-bold text-white">{drillStats.avgDifficulty}/5</p>
                                              </div>
                                            )}
                                          </div>

                                          {/* Soreness Summary */}
                                          {(drillStats.soreness.moderate > 0 || drillStats.soreness.severe > 0) && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                              <p className="text-sm text-red-400 font-medium">⚠️ Soreness Reports</p>
                                              <p className="text-xs text-slate-400 mt-1">
                                                {drillStats.soreness.moderate > 0 && `${drillStats.soreness.moderate} moderate`}
                                                {drillStats.soreness.moderate > 0 && drillStats.soreness.severe > 0 && ', '}
                                                {drillStats.soreness.severe > 0 && `${drillStats.soreness.severe} severe`}
                                              </p>
                                            </div>
                                          )}

                                          {/* Player Breakdown (not shown in individual view) */}
                                          {activeTab !== 'individual' && drillStats.playerBreakdown.length > 0 && (
                                            <div>
                                              <p className="text-sm font-medium text-slate-300 mb-2">Player Breakdown</p>
                                              <div className="space-y-2">
                                                {drillStats.playerBreakdown.map(pb => (
                                                  <div key={pb.player.id} className="flex items-center justify-between bg-slate-800 rounded-lg p-2">
                                                    <div className="flex items-center space-x-2">
                                                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-orange-400">
                                                          {pb.player.jerseyNumber || pb.player.name.charAt(0)}
                                                        </span>
                                                      </div>
                                                      <span className="text-white text-sm">{pb.player.name}</span>
                                                      <span className="text-slate-500 text-xs">({pb.player.position})</span>
                                                    </div>
                                                    <div className="text-right">
                                                      {pb.percentage !== null ? (
                                                        <>
                                                          <span className={`font-bold ${
                                                            pb.percentage >= 70 ? 'text-green-400' :
                                                            pb.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                                                          }`}>
                                                            {pb.percentage}%
                                                          </span>
                                                          <span className="text-slate-500 text-xs ml-2">
                                                            ({pb.makes}/{pb.attempts})
                                                          </span>
                                                        </>
                                                      ) : (
                                                        <span className="text-slate-400 text-sm">{pb.logs} logs</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {drillStats.totalLogs === 0 && (
                                            <p className="text-center text-slate-500 py-4">
                                              No one has completed this drill yet
                                            </p>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* No player selected message for individual tab */}
      {activeTab === 'individual' && !selectedPlayer && players.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👆</span>
          </div>
          <p className="text-slate-400">Select a player above to view their stats</p>
        </div>
      )}
    </div>
  );
};

export default CoachStats;
