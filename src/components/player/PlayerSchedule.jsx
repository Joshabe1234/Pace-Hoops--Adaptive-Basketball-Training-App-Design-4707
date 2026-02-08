import React from 'react';
import { getTeamSchedule } from '../../data/database';

const PlayerSchedule = ({ user, team }) => {
  const events = getTeamSchedule(team.id);

  const eventTypeColors = {
    practice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    game: 'bg-red-500/20 text-red-400 border-red-500/30',
    workout: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    other: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Schedule</h1>
        <p className="text-slate-400">Upcoming practices and games</p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
        {upcomingEvents.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400">No upcoming events</p>
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
