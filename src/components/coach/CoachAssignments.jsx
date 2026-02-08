assignedTo === 'specific'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      Specific Players
                    </button>
                  </div>

                  {newAssignment.assignedTo === 'specific' && (
                    <div className="max-h-32 overflow-y-auto space-y-2 bg-slate-900 rounded-xl p-2">
                      {players.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => togglePlayer(player.id)}
                          className={`w-full p-2 rounded-lg text-left transition-colors ${
                            newAssignment.selectedPlayers.includes(player.id)
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white">{player.name}</span>
                            {newAssignment.selectedPlayers.includes(player.id) && (
                              <span className="text-orange-400">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
