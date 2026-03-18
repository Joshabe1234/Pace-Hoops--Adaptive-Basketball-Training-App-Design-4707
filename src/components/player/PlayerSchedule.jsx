import React, { useState, useEffect } from 'react';
import { getTeamSchedule } from '../../data/database';

const PlayerSchedule = ({ user, team }) => {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (team) {
      loadEvents();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadEvents, 30000);
      return () => clearInterval(interval);
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
      weekday: 'long', 
      month: 'long', 
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

  const todayStr = getTodayString();

  // Get events relative to today
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const todaysEvents = events.filter(e => e.date === todayStr);
  const nextEvent = upcomingEvents[0];

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

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

  const getEventTypeStyle = (type) => {
    switch (type) {
      case 'practice': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'game': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'meeting': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'scrimmage': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getEventEmoji = (type) => {
    switch (type) {
      case 'practice': return '🏀';
      case 'game': return '🏆';
      case 'meeting': return '📋';
      case 'scrimmage': return '⚔️';
      default: return '📅';
    }
  };

  // Calculate time until next event
  const getTimeUntilEvent = (event) => {
    const eventDate = parseLocalDate(event.date);
    const [hours, minutes] = event.time.split(':').map(Number);
    eventDate.setHours(hours, minutes);
    
    const now = new Date();
    const diff = eventDate - now;
    
    if (diff < 0) return 'Now';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `in ${days}d ${hrs}h`;
    if (hrs > 0) return `in ${hrs}h`;
    
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `in ${mins}m`;
  };

  if (!team) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <span className="text-4xl">📅</span>
          <h3 className="text-lg font-semibold text-white mt-4">Join a Team</h3>
          <p className="text-slate-400 mt-2">Join a team to see the schedule</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Schedule</h1>
        <p className="text-slate-400">Team events and practices</p>
      </div>

      {/* Next Event Card */}
      {nextEvent && (
        <div className={`p-4 rounded-xl border ${getEventTypeStyle(nextEvent.type)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getEventEmoji(nextEvent.type)}</span>
            <span className="text-sm font-medium text-slate-400">NEXT UP</span>
            <span className="text-sm text-slate-500">{getTimeUntilEvent(nextEvent)}</span>
          </div>
          <h3 className="text-xl font-bold text-white">{nextEvent.title}</h3>
          <p className="text-slate-300 mt-1">
            {formatDate(nextEvent.date)} at {formatTime(nextEvent.time)}
          </p>
          {nextEvent.location && (
            <p className="text-slate-400 mt-1">📍 {nextEvent.location}</p>
          )}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'upcoming' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Calendar
        </button>
      </div>

      {/* Today's Events */}
      {todaysEvents.length > 0 && viewMode === 'upcoming' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">📆 Today</h3>
          <div className="space-y-3">
            {todaysEvents.map((event) => (
              <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeStyle(event.type)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white">{event.title}</h4>
                    <p className="text-sm text-slate-400">{formatTime(event.time)} • {event.duration} min</p>
                    {event.location && (
                      <p className="text-sm text-slate-500 mt-1">📍 {event.location}</p>
                    )}
                  </div>
                  <span className="text-2xl">{getEventEmoji(event.type)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events List */}
      {viewMode === 'upcoming' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <h3 className="text-lg font-semibold text-white p-4 border-b border-slate-700">
            Coming Up
          </h3>
          {upcomingEvents.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-3xl">📅</span>
              <p className="text-slate-400 mt-4">No upcoming events</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-center space-x-4">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-slate-500 uppercase">
                      {parseLocalDate(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {parseLocalDate(event.date).getDate()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {parseLocalDate(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-white">{event.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getEventTypeStyle(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {formatTime(event.time)} • {event.duration} min
                    </p>
                    {event.location && (
                      <p className="text-sm text-slate-500">📍 {event.location}</p>
                    )}
                  </div>
                  <span className="text-2xl">{getEventEmoji(event.type)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
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
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <div key={idx} className="text-center text-xs text-slate-500 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((date, idx) => {
              if (!date) {
                return <div key={idx} className="p-1" />;
              }

              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  className={`p-1 min-h-[50px] md:min-h-[70px] rounded-lg ${
                    isToday ? 'bg-blue-500/20 border border-blue-500/50' : ''
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[10px] px-1 rounded mb-0.5 truncate ${
                            event.type === 'game' ? 'bg-green-500/30 text-green-400' :
                            event.type === 'practice' ? 'bg-blue-500/30 text-blue-400' :
                            'bg-purple-500/30 text-purple-400'
                          }`}
                          title={`${event.title} - ${formatTime(event.time)}`}
                        >
                          {getEventEmoji(event.type)}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-slate-500">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-4 mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center space-x-1">
              <span className="text-sm">🏀</span>
              <span className="text-xs text-slate-400">Practice</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm">🏆</span>
              <span className="text-xs text-slate-400">Game</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm">📋</span>
              <span className="text-xs text-slate-400">Meeting</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSchedule;
