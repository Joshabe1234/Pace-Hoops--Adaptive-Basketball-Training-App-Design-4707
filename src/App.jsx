import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeDatabase, getUser, getTeam } from './data/database';

// Auth
import AuthScreen from './components/auth/AuthScreen';

// Common
import Navigation from './components/common/Navigation';

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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    initializeDatabase();
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser, userTeam) => {
    console.log('handleLogin called with:', loggedInUser, userTeam);
    setUser(loggedInUser);
    setTeam(userTeam || null);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setTeam(null);
    setCurrentView('home');
  };

  const handleTeamJoined = (newTeam) => {
    console.log('handleTeamJoined:', newTeam);
    setTeam(newTeam);
  };

  const handleTeamCreated = (newTeam) => {
    console.log('handleTeamCreated:', newTeam);
    setTeam(newTeam);
  };

  const refreshUser = () => {
    if (user) {
      const refreshedUser = getUser(user.id);
      if (refreshedUser) {
        setUser(refreshedUser);
        if (refreshedUser.teamId) {
          setTeam(getTeam(refreshedUser.teamId));
        }
      }
    }
  };

  const refreshTeam = () => {
    if (team) {
      const refreshedTeam = getTeam(team.id);
      if (refreshedTeam) {
        setTeam(refreshedTeam);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🏀</span>
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const isCoach = user.role === 'coach';

  // Debug log
  console.log('Rendering app with user:', user?.name, 'team:', team?.name);

  const renderContent = () => {
    if (isCoach) {
      switch (currentView) {
        case 'home':
          return <CoachDashboard user={user} team={team} onTeamCreated={handleTeamCreated} refreshTeam={refreshTeam} />;
        case 'roster':
          return <CoachRoster user={user} team={team} refreshTeam={refreshTeam} />;
        case 'assignments':
          return <CoachAssignments user={user} team={team} refreshTeam={refreshTeam} />;
        case 'stats':
          return <CoachStats user={user} team={team} />;
        case 'schedule':
          return <CoachSchedule user={user} team={team} />;
        case 'chat':
          return <CoachChat user={user} team={team} />;
        default:
          return <CoachDashboard user={user} team={team} onTeamCreated={handleTeamCreated} refreshTeam={refreshTeam} />;
      }
    } else {
      switch (currentView) {
        case 'home':
          return <PlayerDashboard user={user} team={team} onTeamJoined={handleTeamJoined} refreshUser={refreshUser} setCurrentView={setCurrentView} />;
        case 'training':
          return <PlayerAssignments user={user} team={team} />;
        case 'stats':
          return <PlayerStats user={user} team={team} />;
        case 'schedule':
          return <PlayerSchedule user={user} team={team} />;
        case 'chat':
          return <PlayerChat user={user} team={team} />;
        default:
          return <PlayerDashboard user={user} team={team} onTeamJoined={handleTeamJoined} refreshUser={refreshUser} setCurrentView={setCurrentView} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Navigation
        user={user}
        team={team}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
        isCoach={isCoach}
      />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
