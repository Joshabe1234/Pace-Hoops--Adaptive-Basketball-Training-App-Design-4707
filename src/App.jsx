import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeDatabase, getUser, getTeam } from './data/database';

// Auth Components
import AuthScreen from './components/auth/AuthScreen';

// Coach Components
import CoachDashboard from './components/coach/CoachDashboard';
import CoachRoster from './components/coach/CoachRoster';
import CoachAssignments from './components/coach/CoachAssignments';
import CoachStats from './components/coach/CoachStats';
import CoachSchedule from './components/coach/CoachSchedule';
import CoachChat from './components/coach/CoachChat';

// Player Components
import PlayerDashboard from './components/player/PlayerDashboard';
import PlayerAssignments from './components/player/PlayerAssignments';
import PlayerStats from './components/player/PlayerStats';
import PlayerSchedule from './components/player/PlayerSchedule';
import PlayerChat from './components/player/PlayerChat';

// Common Components
import Navigation from './components/common/Navigation';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize database
    initializeDatabase();

    // Check for existing session
    const storedUserId = localStorage.getItem('paceHoopsUserId');
    if (storedUserId) {
      const existingUser = getUser(storedUserId);
      if (existingUser) {
        setUser(existingUser);
        
        // Load team
        if (existingUser.role === 'coach' && existingUser.teamIds?.length > 0) {
          setCurrentTeam(getTeam(existingUser.teamIds[0]));
        } else if (existingUser.role === 'player' && existingUser.teamId) {
          setCurrentTeam(getTeam(existingUser.teamId));
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser, team) => {
    setUser(loggedInUser);
    setCurrentTeam(team);
    localStorage.setItem('paceHoopsUserId', loggedInUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTeam(null);
    setCurrentView('dashboard');
    localStorage.removeItem('paceHoopsUserId');
  };

  const handleTeamChange = (team) => {
    setCurrentTeam(team);
  };

  const refreshUser = () => {
    if (user) {
      const updated = getUser(user.id);
      setUser(updated);
    }
  };

  const refreshTeam = () => {
    if (currentTeam) {
      const updated = getTeam(currentTeam.id);
      setCurrentTeam(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Pace Hoops...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderCoachView = () => {
    if (!currentTeam) {
      return (
        <CoachDashboard 
          user={user} 
          onTeamCreated={(team) => setCurrentTeam(team)}
          refreshUser={refreshUser}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <CoachDashboard 
            user={user} 
            team={currentTeam}
            onTeamChange={handleTeamChange}
            refreshUser={refreshUser}
            refreshTeam={refreshTeam}
          />
        );
      case 'roster':
        return (
          <CoachRoster 
            user={user} 
            team={currentTeam}
            refreshTeam={refreshTeam}
          />
        );
      case 'assignments':
        return (
          <CoachAssignments 
            user={user} 
            team={currentTeam}
            refreshTeam={refreshTeam}
          />
        );
      case 'stats':
        return (
          <CoachStats 
            user={user} 
            team={currentTeam}
          />
        );
      case 'schedule':
        return (
          <CoachSchedule 
            user={user} 
            team={currentTeam}
          />
        );
      case 'chat':
        return (
          <CoachChat 
            user={user} 
            team={currentTeam}
          />
        );
      default:
        return (
          <CoachDashboard 
            user={user} 
            team={currentTeam}
            onTeamChange={handleTeamChange}
            refreshUser={refreshUser}
            refreshTeam={refreshTeam}
          />
        );
    }
  };

  const renderPlayerView = () => {
    if (!currentTeam) {
      return (
        <PlayerDashboard 
          user={user}
          onTeamJoined={(team) => {
            setCurrentTeam(team);
            refreshUser();
          }}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <PlayerDashboard 
            user={user} 
            team={currentTeam}
            refreshUser={refreshUser}
          />
        );
      case 'assignments':
        return (
          <PlayerAssignments 
            user={user} 
            team={currentTeam}
          />
        );
      case 'stats':
        return (
          <PlayerStats 
            user={user} 
            team={currentTeam}
          />
        );
      case 'schedule':
        return (
          <PlayerSchedule 
            user={user} 
            team={currentTeam}
          />
        );
      case 'chat':
        return (
          <PlayerChat 
            user={user} 
            team={currentTeam}
          />
        );
      default:
        return (
          <PlayerDashboard 
            user={user} 
            team={currentTeam}
            refreshUser={refreshUser}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <Navigation 
        user={user}
        team={currentTeam}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pb-20 md:pb-0 md:pl-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {user.role === 'coach' ? renderCoachView() : renderPlayerView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
