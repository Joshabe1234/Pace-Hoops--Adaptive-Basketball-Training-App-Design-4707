import React from 'react';
import { getTeamSchedule } from '../../data/database';

const PlayerSchedule = ({ user, team }) => {
  const eventTypeColors = {
    practice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    game: 'bg-red-500/20 text-red-400 border-red-500/30',
    workout: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    other: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  // No team - show empty state with proper UI
  if (!team) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule</h1>
          <p className="text-slate-400">Team practices, games, and events</p>
        </div>

        {/* Calendar-like UI placeholder */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">This Week</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-slate-500 cursor-not-allowed">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 text-slate-500 cursor-not-allowed">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days row placeholder */}
          <div className="grid grid-cols-7 border-b border-slate-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center border-r border-slate-700 last:border-r-0">
                <p className="text-xs text-slate-500">{day}</p>
                <div className="w-8 h-8 mx-auto mt-1 rounded-full bg-slate-700/50"></div>
              </div>
            ))}
          </div>

          {/* Empty state message */}
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Schedule Yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              When you join a team, your coach's scheduled practices, games, and workouts will appear here.
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-white">How Schedule Works</h4>
              <p className="text-slate-400 text-sm mt-1">
                Your coach will add team events like practices, games, and workout sessions. 
                You'll also see personalized training schedules assigned specifically to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has team - show actual schedule
  const events = getTeamSchedule(team.id);
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Schedule</h1>
        <p className="text-slate-400">{team.name} - Upcoming events</p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
        {upcomingEvents.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400">No upcoming events scheduled</p>
            <p className="text-slate-500 text-sm mt-1">Check back later for updates from your coach</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`bg-slate-800 rounded-xl border p-4 ${eventTypeColors[event.type]}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-white">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded-full border ${eventTypeColors[event.type]}`}>
                        {event.type}
                      </span>
                      <h3 className="font-semibold text-white">{event.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      {event.startTime && ` • ${event.startTime}`}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                    {event.location && <p className="text-slate-500 text-sm">📍 {event.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-400 mb-4">Past</h2>
          <div className="space-y-2 opacity-60">
            {pastEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSchedule;
