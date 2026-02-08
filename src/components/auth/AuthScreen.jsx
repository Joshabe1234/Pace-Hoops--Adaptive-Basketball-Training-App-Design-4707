import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createUser, 
  getUserByEmail, 
  createTeam, 
  getTeamByJoinCode, 
  addPlayerToTeam,
  getTeam 
} from '../../data/database';

const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('select'); // 'select', 'coach-signup', 'player-signup', 'login'
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    organization: '',
    teamName: '',
    teamLevel: '',
    joinCode: '',
    age: '',
    position: '',
    jerseyNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCoachSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.name) {
        throw new Error('Please fill in all required fields');
      }
      if (!formData.teamName) {
        throw new Error('Please enter a team name');
      }

      const existing = getUserByEmail(formData.email);
      if (existing) {
        throw new Error('Email already registered. Please log in.');
      }

      const coach = createUser({
        email: formData.email,
        name: formData.name,
        role: 'coach',
        organization: formData.organization
      });

      const team = createTeam(coach.id, {
        name: formData.teamName,
        level: formData.teamLevel
      });

      onLogin(coach, team);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.name) {
        throw new Error('Please fill in all required fields');
      }

      const existing = getUserByEmail(formData.email);
      if (existing) {
        throw new Error('Email already registered. Please log in.');
      }

      // Team code is OPTIONAL
      let team = null;
      if (formData.joinCode && formData.joinCode.trim().length > 0) {
        team = getTeamByJoinCode(formData.joinCode);
        if (!team) {
          throw new Error('Invalid team code. Please check with your coach, or leave blank to join later.');
        }
      }

      // Create player user
      const player = createUser({
        email: formData.email,
        name: formData.name,
        role: 'player',
        teamId: team ? team.id : null,
        age: formData.age ? parseInt(formData.age) : null,
        position: formData.position,
        jerseyNumber: formData.jerseyNumber
      });

      // Add player to team if team was provided
      if (team) {
        addPlayerToTeam(team.id, player.id);
      }

      onLogin(player, team);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email) {
        throw new Error('Please enter your email');
      }

      const user = getUserByEmail(formData.email);
      if (!user) {
        throw new Error('No account found with this email');
      }

      let team = null;
      if (user.role === 'coach' && user.teamIds?.length > 0) {
        team = getTeam(user.teamIds[0]);
      } else if (user.role === 'player' && user.teamId) {
        team = getTeam(user.teamId);
      }

      onLogin(user, team);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSelect = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
        <p className="text-slate-400">Choose your role to continue</p>
      </div>

      <button
        onClick={() => setMode('coach-signup')}
        className="w-full p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-left hover:from-orange-400 hover:to-orange-500 transition-all group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">I'm a Coach</h3>
            <p className="text-white/80 text-sm">Manage your team and track player progress</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => setMode('player-signup')}
        className="w-full p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-left hover:from-blue-400 hover:to-blue-500 transition-all group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">I'm a Player</h3>
            <p className="text-white/80 text-sm">Track your training and improve your game</p>
          </div>
        </div>
      </button>

      <div className="text-center pt-4">
        <button
          onClick={() => setMode('login')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Already have an account? <span className="text-orange-500">Log in</span>
        </button>
      </div>
    </motion.div>
  );

  const renderCoachSignup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <button
        onClick={() => setMode('select')}
        className="flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Coach Sign Up</h2>
        <p className="text-slate-400">Create your account and team</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Your Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Coach Smith"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="coach@example.com"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => handleInputChange('organization', e.target.value)}
            placeholder="Lincoln High School"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Create Your Team</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team Name *</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => handleInputChange('teamName', e.target.value)}
                placeholder="Lincoln Lions"
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
              <select
                value={formData.teamLevel}
                onChange={(e) => handleInputChange('teamLevel', e.target.value)}
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="youth">Youth</option>
                <option value="middle-school">Middle School</option>
                <option value="jv">JV</option>
                <option value="varsity">Varsity</option>
                <option value="aau">AAU</option>
                <option value="club">Club</option>
                <option value="college">College</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCoachSignup}
          disabled={isLoading}
          className="w-full p-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Coach Account'}
        </button>
      </div>
    </motion.div>
  );

  const renderPlayerSignup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <button
        onClick={() => setMode('select')}
        className="flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Player Sign Up</h2>
        <p className="text-slate-400">Create your account and start training</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Your Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Smith"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="player@example.com"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Team Code - OPTIONAL */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Team Code <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.joinCode}
            onChange={(e) => handleInputChange('joinCode', e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
          />
          <p className="text-slate-500 text-sm mt-2">
            Have a team code from your coach? Enter it here. You can also join a team later.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="16"
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Jersey #</label>
            <input
              type="text"
              value={formData.jerseyNumber}
              onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
              placeholder="23"
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
            <select
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">--</option>
              <option value="PG">PG</option>
              <option value="SG">SG</option>
              <option value="SF">SF</option>
              <option value="PF">PF</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePlayerSignup}
          disabled={isLoading}
          className="w-full p-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Player Account'}
        </button>
      </div>
    </motion.div>
  );

  const renderLogin = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <button
        onClick={() => setMode('select')}
        className="flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400">Log in to your account</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full p-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏀</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Pace Hoops</h1>
          </div>
          <p className="text-slate-400">Basketball Training Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
          <AnimatePresence mode="wait">
            {mode === 'select' && renderRoleSelect()}
            {mode === 'coach-signup' && renderCoachSignup()}
            {mode === 'player-signup' && renderPlayerSignup()}
            {mode === 'login' && renderLogin()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
