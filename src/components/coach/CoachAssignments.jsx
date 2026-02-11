import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getTeamAssignments, 
  createAssignment, 
  getAllDrills, 
  getAllWorkouts,
  getTeamPlayers,
  deleteAssignment,
  getAssignmentLogs
} from '../../data/database';

const CoachAssignments = ({ user, team, refreshTeam }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    type: 'drill',
    items: [],
    assignedTo: 'team',
    assignmentMode: 'team', // 'team', 'position', 'individual'
    selectedPositions: [],
    selectedPlayers: [],
    dueDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const assignments = getTeamAssignments(team.id);
  const allDrills = getAllDrills();
  const allWorkouts = getAllWorkouts();
  const players = getTeamPlayers(team.id);

  const itemsToShow = newAssignment.type === 'drill' ? allDrills : allWorkouts;
  const filteredItems = itemsToShow.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(itemsToShow.map(i => i.category))];
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];

  const getAssignedPlayers = () => {
    if (newAssignment.assignmentMode === 'team') return 'team';
    if (newAssignment.assignmentMode === 'position') {
      return players
        .filter(p => newAssignment.selectedPositions.includes(p.position))
        .map(p => p.id);
    }
    return newAssignment.selectedPlayers;
  };

  const handleCreateAssignment = () => {
    if (!newAssignment.title || newAssignment.items.length === 0 || !newAssignment.dueDate) {
      return;
    }

    const assignedTo = getAssignedPlayers();

    createAssignment(user.id, team.id, {
      title: newAssignment.title,
      description: newAssignment.description,
      type: newAssignment.type,
      items: newAssignment.items,
      assignedTo,
      dueDate: new Date(newAssignment.dueDate)
    });

    setNewAssignment({
      title: '',
      description: '',
      type: 'drill',
      items: [],
      assignedTo: 'team',
      assignmentMode: 'team',
      selectedPositions: [],
      selectedPlayers: [],
      dueDate: ''
    });
    setShowCreateModal(false);
    refreshTeam();
  };

  const toggleItem = (itemId) => {
    setNewAssignment(prev => ({
      ...prev,
      items: prev.items.includes(itemId)
        ? prev.items.filter(id => id !== itemId)
        : [...prev.items, itemId]
    }));
  };

  const togglePlayer = (playerId) => {
    setNewAssignment(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerId)
        ? prev.selectedPlayers.filter(id => id !== playerId)
        : [...prev.selectedPlayers, playerId]
    }));
  };

  const togglePosition = (position) => {
    setNewAssignment(prev => ({
      ...prev,
      selectedPositions: prev.selectedPositions.includes(position)
        ? prev.selectedPositions.filter(p => p !== position)
        : [...prev.selectedPositions, position]
    }));
  };

  const getAssignedToLabel = (assignment) => {
    if (assignment.assignedTo === 'team') return 'Entire Team';
    if (Array.isArray(assignment.assignedTo)) {
      const assignedPlayers = assignment.assignedTo
        .map(id => players.find(p => p.id === id))
        .filter(Boolean);
      if (assignedPlayers.length <= 2) {
        return assignedPlayers.map(p => p.name).join(', ');
      }
      return `${assignedPlayers.length} players`;
    }
    return 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-slate-400">Assign drills and workouts to your team or specific players</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-400 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Assignment</span>
        </button>
      </div>

      {/* Quick assign buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setNewAssignment(prev => ({ ...prev, assignmentMode: 'team' }));
            setShowCreateModal(true);
          }}
          className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-orange-500 transition-colors text-left"
        >
          <span className="text-2xl">👥</span>
          <p className="font-medium text-white mt-2">Team-Wide</p>
          <p className="text-xs text-slate-400">Assign to everyone</p>
        </button>
        <button
          onClick={() => {
            setNewAssignment(prev => ({ ...prev, assignmentMode: 'position' }));
            setShowCreateModal(true);
          }}
          className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-orange-500 transition-colors text-left"
        >
          <span className="text-2xl">🏀</span>
          <p className="font-medium text-white mt-2">By Position</p>
          <p className="text-xs text-slate-400">Guards, forwards, centers</p>
        </button>
        <button
          onClick={() => {
            setNewAssignment(prev => ({ ...prev, assignmentMode: 'individual' }));
            setShowCreateModal(true);
          }}
          className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-orange-500 transition-colors text-left"
        >
          <span className="text-2xl">👤</span>
          <p className="font-medium text-white mt-2">Individual</p>
          <p className="text-xs text-slate-400">Specific players</p>
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-orange-500 transition-colors text-left"
        >
          <span className="text-2xl">🤖</span>
          <p className="font-medium text-white mt-2">AI Suggested</p>
          <p className="text-xs text-slate-400">Based on stats</p>
        </button>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Assignments Yet</h3>
          <p className="text-slate-400 mb-4">Create your first assignment to get your team training</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const isPast = new Date(assignment.dueDate) < new Date();
            const itemList = assignment.type === 'drill' 
              ? assignment.items.map(id => allDrills.find(d => d.id === id)).filter(Boolean)
              : assignment.items.map(id => allWorkouts.find(w => w.id === id)).filter(Boolean);
            const logs = getAssignmentLogs(assignment.id);

            return (
              <div 
                key={assignment.id} 
                className={`bg-slate-800 rounded-xl border ${isPast ? 'border-slate-700 opacity-60' : 'border-slate-700'} overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-white text-lg">{assignment.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          assignment.assignedTo === 'team' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {getAssignedToLabel(assignment)}
                        </span>
                      </div>
                      {assignment.description && (
                        <p className="text-slate-400 text-sm">{assignment.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        assignment.type === 'drill' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {assignment.type}
                      </span>
                      <button
                        onClick={() => {
                          deleteAssignment(assignment.id);
                          refreshTeam();
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {itemList.map((item) => (
                      <span key={item.id} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-lg">
                        {item.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {logs.length} logs submitted
                    </span>
                    <span className={isPast ? 'text-red-400' : 'text-slate-400'}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Create Assignment</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Weekly Shooting Drill"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional notes for players..."
                    rows={2}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                  />
                </div>

                {/* Assignment Mode */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Assign To</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setNewAssignment(prev => ({ ...prev, assignmentMode: 'team' }))}
                      className={`p-3 rounded-xl font-medium transition-colors ${
                        newAssignment.assignmentMode === 'team'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      👥 Team
                    </button>
                    <button
                      onClick={() => setNewAssignment(prev => ({ ...prev, assignmentMode: 'position' }))}
                      className={`p-3 rounded-xl font-medium transition-colors ${
                        newAssignment.assignmentMode === 'position'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏀 Position
                    </button>
                    <button
                      onClick={() => setNewAssignment(prev => ({ ...prev, assignmentMode: 'individual' }))}
                      className={`p-3 rounded-xl font-medium transition-colors ${
                        newAssignment.assignmentMode === 'individual'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 Individual
                    </button>
                  </div>
                </div>

                {/* Position Selection */}
                {newAssignment.assignmentMode === 'position' && (
                  <div className="bg-slate-900 rounded-xl p-3">
                    <p className="text-sm text-slate-400 mb-2">Select positions:</p>
                    <div className="flex flex-wrap gap-2">
                      {positions.map((pos) => {
                        const playersInPosition = players.filter(p => p.position === pos);
                        return (
                          <button
                            key={pos}
                            onClick={() => togglePosition(pos)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              newAssignment.selectedPositions.includes(pos)
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {pos} ({playersInPosition.length})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Individual Selection */}
                {newAssignment.assignmentMode === 'individual' && (
                  <div className="bg-slate-900 rounded-xl p-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-slate-400 mb-2">Select players:</p>
                    <div className="space-y-2">
                      {players.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => togglePlayer(player.id)}
                          className={`w-full p-2 rounded-lg text-left transition-colors flex items-center justify-between ${
                            newAssignment.selectedPlayers.includes(player.id)
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          <span className="text-white">{player.name}</span>
                          <span className="text-slate-400 text-sm">{player.position || '--'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setNewAssignment(prev => ({ ...prev, type: 'drill', items: [] }))}
                      className={`flex-1 p-3 rounded-xl font-medium transition-colors ${
                        newAssignment.type === 'drill'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏀 Skill Drills
                    </button>
                    <button
                      onClick={() => setNewAssignment(prev => ({ ...prev, type: 'workout', items: [] }))}
                      className={`flex-1 p-3 rounded-xl font-medium transition-colors ${
                        newAssignment.type === 'workout'
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏋️ Workouts
                    </button>
                  </div>
                </div>

                {/* Item Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select {newAssignment.type === 'drill' ? 'Drills' : 'Workouts'} *
                  </label>
                  
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm"
                    />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="all">All</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-900 rounded-xl p-2">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          newAssignment.items.includes(item.id)
                            ? 'bg-orange-500/20 border border-orange-500/50'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.category} • {item.duration} min</p>
                          </div>
                          {newAssignment.items.includes(item.id) && (
                            <span className="text-orange-400">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {newAssignment.items.length > 0 && (
                    <p className="text-sm text-orange-400 mt-2">{newAssignment.items.length} selected</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={handleCreateAssignment}
                  disabled={!newAssignment.title || newAssignment.items.length === 0 || !newAssignment.dueDate}
                  className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Assignment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachAssignments;
