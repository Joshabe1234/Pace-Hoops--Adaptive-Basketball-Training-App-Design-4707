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
  const [mode, setMode] = useState('select');
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
      const email = formData.email.toLowerCase().trim();
      const name = formData.name.trim();
      
      if (!email || !name) {
        throw new Error('Please fill in all required fields');
      }
      if (!formData.teamName.trim()) {
        throw new Error('Please enter a team name');
      }

      // Check if email already exists
      const existing = getUserByEmail(email);
      if (existing) {
        throw new Error('Email already registered. Please log in instead.');
      }

      // Create coach
      const coach = createUser({
        email: email,
        name: name,
        role: 'coach',
        organization: formData.organization.trim()
      });

      // Create team
      const team = createTeam(coach.id, {
        name: formData.teamName.trim(),
        level: formData.teamLevel
      });

      console.log('Created coach:', coach);
      console.log('Created team with code:', team.joinCode);

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
      const email = formData.email.toLowerCase().trim();
      const name = formData.name.trim();
      
      if (!email || !name) {
        throw new Error('Please fill in all required fields');
      }

      // Check if email already exists
      const existing = getUserByEmail(email);
      if (existing) {
        throw new Error('Email already registered. Please log in instead.');
      }

      // Team code is OPTIONAL - check if provided
      let team = null;
      const joinCode = formData.joinCode.trim().toUpperCase();
      
      if (joinCode && joinCode.length > 0) {
        console.log('Looking for team with code:', joinCode);
        team = getTeamByJoinCode(joinCode);
        
        if (!team) {
          throw new Error('Invalid team code. Please check with your coach, or leave the code blank to join a team later.');
        }
        console.log('Found team:', team.name);
      }

      // Create player
      const player = createUser({
        email: email,
        name: name,
        role: 'player',
        teamId: team ? team.id : null,
        age: formData.age ? parseInt(formData.age) : null,
        position: formData.position,
        jerseyNumber: formData.jerseyNumber
      });

      // Add player to team if team was found
      if (team) {
        addPlayerToTeam(team.id, player.id);
      }

      console.log('Created player:', player);

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
      const email = formData.email.toLowerCase().trim();
      
      if (!email) {
        throw new Error('Please enter your email');
      }

      console.log('Looking for user with email:', email);
      
      const user = getUserByEmail(email);
      
      if (!user) {
        throw new Error('No account found with this email. Please check your email or create a new account.');
      }

      console.log('Found user:', user);

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
        className="w-full p-4 sm:p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-left hover:from-orange-400 hover:to-orange-500 transition-all"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🏀</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white">I'm a Coach</h3>
            <p className="text-white/80 text-sm">Manage your team and track progress</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => setMode('player-signup')}
        className="w-full p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-left hover:from-blue-400 hover:to-blue-500 transition-all"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💪</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white">I'm a Player</h3>
            <p className="text-white/80 text-sm">Track your training and improve</p>
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
      className="space-y-4"
    >
      <button
        onClick={() => { setMode('select'); setError(''); }}
        className="flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Coach Sign Up</h2>
        <p className="text-slate-400 text-sm">Create your account and team</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Coach Smith"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="coach@example.com"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Team Name *</label>
          <input
            type="text"
            value={formData.teamName}
            onChange={(e) => handleInputChange('teamName', e.target.value)}
            placeholder="Lincoln Lions"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Level</label>
          <select
            value={formData.teamLevel}
            onChange={(e) => handleInputChange('teamLevel', e.target.value)}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select level</option>
            <option value="youth">Youth</option>
            <option value="middle-school">Middle School</option>
            <option value="jv">JV</option>
            <option value="varsity">Varsity</option>
            <option value="aau">AAU</option>
            <option value="college">College</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCoachSignup}
          disabled={isLoading}
          className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Coach Account'}
        </button>
      </div>
    </motion.div>
  );

  const renderPlayerSignup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <button
        onClick={() => { setMode('select'); setError(''); }}
        className="flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Player Sign Up</h2>
        <p className="text-slate-400 text-sm">Create your account</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Smith"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="player@example.com"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Team Code - Optional */}
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Team Code <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.joinCode}
            onChange={(e) => handleInputChange('joinCode', e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest font-mono"
          />
          <p className="text-slate-500 text-xs mt-2">
            Got a code from your coach? Enter it here. You can also join later.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="16"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Jersey #</label>
            <input
              type="text"
              value={formData.jerseyNumber}
              onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
              placeholder="23"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Position</label>
            <select
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePlayerSignup}
          disabled={isLoading}
          className="w-full p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Player Account'}
        </button>
      </div>
    </motion.div>
  );

  const renderLogin = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <button
        onClick={() => { setMode('select'); setError(''); }}
        className="flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Log in to your account</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50"
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏀</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Pace Hoops</h1>
          </div>
          <p className="text-slate-400 text-sm">Basketball Training Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-slate-700/50">
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
