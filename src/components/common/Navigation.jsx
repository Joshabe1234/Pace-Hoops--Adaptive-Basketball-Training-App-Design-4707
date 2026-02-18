import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTeamMessages, getUser } from '../../data/database';

const Navigation = ({ user, team, currentView, setCurrentView, onLogout, isCoach }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check for unread messages
  useEffect(() => {
    const checkUnread = () => {
      if (team) {
        const messages = getTeamMessages(team.id);
        // Count messages not sent by current user that are "new" (last 24 hours and not read)
        const recentMessages = messages.filter(m => {
          const isRecent = new Date(m.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
          const notFromMe = m.senderId !== user.id;
          const notRead = !m.readBy?.includes(user.id);
          return isRecent && notFromMe && notRead;
        });
        setUnreadCount(recentMessages.length);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 3000);
    return () => clearInterval(interval);
  }, [team, user.id]);

  // Clear unread when viewing chat
  useEffect(() => {
    if (currentView === 'chat') {
      setUnreadCount(0);
    }
  }, [currentView]);

  const coachNavItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'roster', label: 'Roster', icon: '👥' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'stats', label: 'Analytics', icon: '📊' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'chat', label: 'Chat', icon: '💬', badge: unreadCount }
  ];

  const playerNavItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'training', label: 'Training', icon: '🏋️' },
    { id: 'stats', label: 'My Stats', icon: '📊' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'chat', label: 'Chat', icon: '💬', badge: unreadCount }
  ];

  const navItems = isCoach ? coachNavItems : playerNavItems;
  const mobileNavItems = navItems.slice(0, 5);

  const NavBadge = ({ count }) => {
    if (!count || count === 0) return null;
    return (
      <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 flex-col z-40">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🏀</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-white text-lg truncate">Pace Hoops</h1>
              <p className="text-xs text-slate-400 truncate">{isCoach ? 'Coach' : 'Player'}</p>
            </div>
          </div>
        </div>

        {/* Team Info */}
        {team && (
          <div className="p-4 border-b border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Team</p>
            <p className="font-medium text-white truncate">{team.name}</p>
            {isCoach && team.joinCode && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400">Join Code</p>
                <p className="font-mono text-orange-400 text-lg tracking-wider">{team.joinCode}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors relative ${
                    currentView === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl flex-shrink-0 relative">
                    {item.icon}
                    {item.badge > 0 && currentView !== item.id && (
                      <span className="absolute -top-2 -right-2 min-w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </span>
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700 mt-auto">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white">
                {user?.name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 min-w-0 flex-1 relative ${
                currentView === item.id
                  ? 'text-orange-500'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-xl relative">
                {item.icon}
                {item.badge > 0 && currentView !== item.id && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              <span className="text-xs mt-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Header with Menu */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 z-40 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🏀</span>
            </div>
            <span className="font-bold text-white truncate">Pace Hoops</span>
          </div>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-slate-400 hover:text-white flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-slate-800 border-b border-slate-700 shadow-lg max-h-[70vh] overflow-y-auto"
          >
            {/* User Info */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-white">{user?.name?.charAt(0) || '?'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Team Info */}
            {team && (
              <div className="p-4 border-b border-slate-700">
                <p className="text-sm text-slate-400">Team: <span className="text-white">{team.name}</span></p>
                {isCoach && team.joinCode && (
                  <p className="text-sm text-slate-400 mt-1">
                    Join Code: <span className="font-mono text-orange-400">{team.joinCode}</span>
                  </p>
                )}
              </div>
            )}

            {/* All Nav Items */}
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl relative">
                    {item.icon}
                    {item.badge > 0 && currentView !== item.id && (
                      <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-14"></div>
    </>
  );
};

export default Navigation;
