import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamSchedule, createScheduleEvent, deleteScheduleEvent } from '../../data/database';

const CoachSchedule = ({ user, team }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'practice',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  });

  const events = getTeamSchedule(team.id);

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    createScheduleEvent(user.id, team.id, newEvent);
    setNewEvent({ title: '', type: 'practice', date: '', startTime: '', endTime: '', location: '', notes: '' });
    setShowCreateModal(false);
  };

  const eventTypeColors = {
    practice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    game: 'bg-red-500/20 text-red-400 border-red-500/30',
    workout: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    other: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule</h1>
          <p className="text-slate-400">Manage your team's calendar</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-400 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Event</span>
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📅</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Scheduled</h3>
          <p className="text-slate-400">Add practices, games, and workouts to your calendar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className={`bg-slate-800 rounded-xl border p-4 ${eventTypeColors[event.type]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full border ${eventTypeColors[event.type]}`}>
                      {event.type}
                    </span>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    {event.startTime && ` • ${event.startTime}`}
                    {event.endTime && ` - ${event.endTime}`}
                  </p>
                  {event.location && <p className="text-slate-500 text-sm">📍 {event.location}</p>}
                </div>
                <button
                  onClick={() => deleteScheduleEvent(event.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Event</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Team Practice"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(p => ({ ...p, type: e.target.value }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="practice">Practice</option>
                    <option value="game">Game</option>
                    <option value="workout">Workout</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(p => ({ ...p, startTime: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(p => ({ ...p, endTime: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., Main Gym"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>

                <button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title || !newEvent.date}
                  className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50"
                >
                  Add Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachSchedule;
