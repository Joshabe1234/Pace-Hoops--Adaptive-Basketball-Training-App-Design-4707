import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamPlayers, removePlayerFromTeam, getPlayerStats } from '../../data/database';

const CoachRoster = ({ user, team, refreshTeam }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  const players = getTeamPlayers(team.id);

  const handleRemovePlayer = (playerId) => {
    removePlayerFromTeam(team.id, playerId);
    refreshTeam();
    setShowRemoveConfirm(null);
    setSelectedPlayer(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Roster</h1>
          <p className="text-slate-400">{players.length} players on {team.name}</p>
        </div>
        
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Share this code:</p>
          <p className="font-mono font-bold text-orange-400">{team.joinCode}</p>
        </div>
      </div>

      {/* Players Grid */}
      {players.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
          <p className="text-slate-400 mb-4">Share your team code with players to add them to your roster</p>
          <div className="inline-block bg-slate-700 px-6 py-3 rounded-xl">
            <p className="text-2xl font-mono font-bold text-white tracking-widest">{team.joinCode}</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const stats = getPlayerStats(player.id);
            
            return (
              <motion.div
                key={player.id}
                layoutId={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {player.jerseyNumber || player.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{player.name}</h3>
                      <p className="text-sm text-slate-400">{player.position || 'No position'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-white">{stats.totalLogs}</p>
                    <p className="text-xs text-slate-400">Logs</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-white">
                      {stats.shooting.percentage || '--'}%
                    </p>
                    <p className="text-xs text-slate-400">Shooting</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-white">{stats.completionRate}%</p>
                    <p className="text-xs text-slate-400">Complete</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {selectedPlayer.jerseyNumber || selectedPlayer.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
                    <p className="text-white/80">
                      {selectedPlayer.position || 'No position'} 
                      {selectedPlayer.age && ` • ${selectedPlayer.age} years old`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6">
                {(() => {
                  const stats = getPlayerStats(selectedPlayer.id);
                  return (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.totalLogs}</p>
                        <p className="text-sm text-slate-400">Total Logs</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                        <p className="text-sm text-slate-400">Completion Rate</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.shooting.percentage || '--'}%
                        </p>
                        <p className="text-sm text-slate-400">Shooting %</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.shooting.makes}/{stats.shooting.attempts}
                        </p>
                        <p className="text-sm text-slate-400">Makes/Attempts</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="w-full p-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowRemoveConfirm(selectedPlayer.id)}
                    className="w-full p-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Remove from Team
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Confirmation */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-white mb-2">Remove Player?</h3>
              <p className="text-slate-400 mb-6">This will remove the player from your team. They can rejoin with the team code.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRemoveConfirm(null)}
                  className="flex-1 p-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemovePlayer(showRemoveConfirm)}
                  className="flex-1 p-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachRoster;
