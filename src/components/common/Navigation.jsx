import React from 'react';
import { motion } from 'framer-motion';

const Navigation = ({ user, team, currentView, onViewChange, onLogout }) => {
  const coachNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'roster', label: 'Roster', icon: '👥' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'stats', label: 'Analytics', icon: '📈' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'chat', label: 'Chat', icon: '💬' }
  ];

  const playerNavItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'assignments', label: 'Training', icon: '🏋️' },
    { id: 'stats', label: 'My Stats', icon: '📈' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'chat', label: 'Chat', icon: '💬' }
  ];

  const navItems = user?.role === 'coach' ? coachNavItems : playerNavItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 flex-col z-50">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏀</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Pace Hoops</h1>
              <p className="text-xs text-slate-400">
                {user?.role === 'coach' ? 'Coach' : 'Player'}
              </p>
            </div>
          </div>
        </div>

        {/* Team Info */}
        {team && (
          <div className="p-4 border-b border-slate-700">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-sm font-semibold text-white">{team.name}</p>
              {team.level && (
                <p className="text-xs text-slate-400 capitalize">{team.level}</p>
              )}
              {user?.role === 'coach' && (
                <p className="text-xs text-orange-400 mt-1 font-mono">
                  Code: {team.joinCode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {user?.name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                currentView === item.id
                  ? 'text-orange-500'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
