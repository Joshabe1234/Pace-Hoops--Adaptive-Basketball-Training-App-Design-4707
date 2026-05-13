import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { getUserByAuthId, getUser, getTeam } from './data/supabaseDb';

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
import CoachHealth from './components/coach/CoachHealth';

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
  const [navState, setNavState] = useState({});

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getUserByAuthId(session.user.id);
        if (profile) {
          let userTeam = null;
          if (profile.role === 'coach' && profile.teamIds?.length > 0) {
            userTeam = await getTeam(profile.teamIds[0]);
          } else if (profile.role === 'player' && profile.teamId) {
            userTeam = await getTeam(profile.teamId);
          }
          setUser(profile);
          setTeam(userTeam);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const handleLogin = (loggedInUser, userTeam) => {
    setUser(loggedInUser);
    setTeam(userTeam || null);
    setCurrentView('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTeam(null);
    setCurrentView('home');
    setNavState({});
  };

  const handleTeamJoined = (newTeam) => setTeam(newTeam);
  const handleTeamCreated = (newTeam) => setTeam(newTeam);

  const refreshUser = async () => {
    if (!user) return;
    const refreshed = await getUser(user.id);
    if (refreshed) {
      setUser(refreshed);
      if (refreshed.teamId) {
        setTeam(await getTeam(refreshed.teamId));
      } else {
        setTeam(null);
      }
    }
  };

  const refreshTeam = async () => {
    if (!team) return;
    const refreshed = await getTeam(team.id);
    if (refreshed) setTeam(refreshed);
  };

  // Detect when a player is removed from their team by the coach
  useEffect(() => {
    if (!user || user.role === 'coach' || !team) return;
    let active = true;
    const interval = setInterval(async () => {
      const freshUser = await getUser(user.id);
      if (active && freshUser && !freshUser.teamId) {
        setUser(freshUser);
        setTeam(null);
      }
    }, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.id, user?.role, team?.id]);

  const handleNavigate = (view, state = {}) => {
    setNavState(state);
    setCurrentView(view);
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

  const renderContent = () => {
    if (isCoach) {
      switch (currentView) {
        case 'home':
          return <CoachDashboard user={user} team={team} onTeamCreated={handleTeamCreated} refreshTeam={refreshTeam} onNavigate={handleNavigate} />;
        case 'roster':
          return <CoachRoster user={user} team={team} refreshTeam={refreshTeam} />;
        case 'assignments':
          return <CoachAssignments user={user} team={team} refreshTeam={refreshTeam} />;
        case 'stats':
          return <CoachStats user={user} team={team} selectedAssignment={navState.selectedAssignment} />;
        case 'schedule':
          return <CoachSchedule user={user} team={team} />;
        case 'chat':
          return <CoachChat user={user} team={team} />;
        case 'health':
          return <CoachHealth user={user} team={team} />;
        default:
          return <CoachDashboard user={user} team={team} onTeamCreated={handleTeamCreated} refreshTeam={refreshTeam} onNavigate={handleNavigate} />;
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
        setCurrentView={(view) => {
          setNavState({});
          setCurrentView(view);
        }}
        onLogout={handleLogout}
        isCoach={isCoach}
      />
      <main className="flex-1 md:ml-64 min-h-screen overflow-x-hidden main-content">
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
