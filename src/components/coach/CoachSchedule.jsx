import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamSchedule, createScheduleEvent, deleteScheduleEvent } from '../../data/database';

const CoachSchedule = ({ user, team }) => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'practice',
    date: '',
    time: '',
    duration: 60,
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (team) {
      loadEvents();
    }
  }, [team?.id]);

  const loadEvents = () => {
    const teamEvents = getTeamSchedule(team.id);
    setEvents(teamEvents);
  };

  // Parse date string as local date (YYYY-MM-DD)
  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time to 12-hour format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get today's date as YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    createScheduleEvent(user.id, team.id, {
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date, // Already YYYY-MM-DD format
      time: newEvent.time,
      duration: newEvent.duration,
      location: newEvent.location,
      notes: newEvent.notes
    });

    setNewEvent({
      title: '',
      type: 'practice',
      date: '',
      time: '',
      duration: 60,
      location: '',
      notes: ''
    });
    setShowModal(false);
    loadEvents();
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('Delete this event?')) {
      deleteScheduleEvent(eventId);
      loadEvents();
    }
  };

  const openModalForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setNewEvent(prev => ({ ...prev, date: dateStr }));
    setShowModal(true);
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const todayStr = getTodayString();
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  const getEventTypeStyle = (type) => {
    switch (type) {
      case 'practice': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'game': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'meeting': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'scrimmage': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (!team) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <span className="text-4xl">📅</span>
          <p className="text-slate-400 mt-4">Create a team to manage your schedule</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule</h1>
          <p className="text-slate-400">Manage team practices and games</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Event</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'month' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          List
        </button>
      </div>

      {/* Upcoming Events */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming</h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-slate-500">No upcoming events</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${getEventTypeStyle(event.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white">{event.title}</h4>
                    <p className="text-sm text-slate-400">
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </p>
                    {event.location && (
                      <p className="text-sm text-slate-500">📍 {event.location}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 capitalize">
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar View */}
      {viewMode === 'month' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs text-slate-500 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((date, idx) => {
              if (!date) {
                return <div key={idx} className="p-2" />;
              }

              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={idx}
                  onClick={() => openModalForDate(date)}
                  className={`p-2 min-h-[60px] md:min-h-[80px] rounded-lg text-left transition-colors ${
                    isToday 
                      ? 'bg-orange-500/20 border border-orange-500/50' 
                      : 'hover:bg-slate-700'
                  }`}
                >
                  <span className={`text-sm ${isToday ? 'text-orange-400 font-bold' : 'text-slate-300'}`}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            event.type === 'game' ? 'bg-green-500/30 text-green-400' :
                            event.type === 'practice' ? 'bg-blue-500/30 text-blue-400' :
                            'bg-purple-500/30 text-purple-400'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-xs text-slate-500">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-3xl">📅</span>
              <p className="text-slate-400 mt-4">No events scheduled</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {events
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .map((event) => {
                  const isPast = event.date < todayStr;
                  return (
                    <div
                      key={event.id}
                      className={`p-4 flex items-center justify-between ${isPast ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">
                            {parseLocalDate(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                          <p className="text-xl font-bold text-white">
                            {parseLocalDate(event.date).getDate()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {parseLocalDate(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{event.title}</h4>
                          <p className="text-sm text-slate-400">
                            {formatTime(event.time)} • {event.duration} min
                          </p>
                          {event.location && (
                            <p className="text-sm text-slate-500">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getEventTypeStyle(event.type)}`}>
                          {event.type}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Event</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Practice, Game vs. Tigers"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(p => ({ ...p, type: e.target.value }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="practice">Practice</option>
                    <option value="game">Game</option>
                    <option value="scrimmage">Scrimmage</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(p => ({ ...p, time: e.target.value }))}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                  <select
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent(p => ({ ...p, duration: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location (optional)</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., Main Gym, Away at Lincoln HS"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional details..."
                    rows={2}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 p-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    disabled={!newEvent.title || !newEvent.date || !newEvent.time}
                    className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 disabled:opacity-50"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachSchedule;
