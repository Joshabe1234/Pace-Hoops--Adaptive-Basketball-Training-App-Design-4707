import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  createUser,
  createTeam,
  getTeamByJoinCode,
  addPlayerToTeam,
  getTeam,
  getUserByAuthId
} from '../../data/supabaseDb';

const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('select');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
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
      if (!email || !name) throw new Error('Please fill in all required fields');
      if (!formData.password || formData.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!formData.teamName.trim()) throw new Error('Please enter a team name');

      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: formData.password });
      if (authError) throw new Error(authError.message);

      const coach = await createUser({ email, name, role: 'coach', organization: formData.organization.trim() }, authData.user.id);
      const team = await createTeam(coach.id, { name: formData.teamName.trim(), level: formData.teamLevel });
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
      if (!email || !name) throw new Error('Please fill in all required fields');
      if (!formData.password || formData.password.length < 6) throw new Error('Password must be at least 6 characters');

      const joinCode = formData.joinCode.trim().toUpperCase();
      if (!joinCode) throw new Error("Please enter your coach's team code to create an account");
      if (!formData.age) throw new Error('Age is required');
      if (!formData.jerseyNumber) throw new Error('Jersey number is required');
      if (!formData.position) throw new Error('Position is required');

      const team = await getTeamByJoinCode(joinCode);
      if (!team) throw new Error('Invalid team code. Check with your coach and try again.');

      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: formData.password });
      if (authError) throw new Error(authError.message);

      const player = await createUser({
        email, name, role: 'player',
        teamId: team.id,
        age: parseInt(formData.age),
        position: formData.position,
        jerseyNumber: formData.jerseyNumber
      }, authData.user.id);

      const result = await addPlayerToTeam(team.id, player.id);
      if (result?.error) throw new Error(result.error);

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
      if (!email) throw new Error('Please enter your email');
      if (!formData.password) throw new Error('Please enter your password');

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: formData.password });
      if (authError) throw new Error('Invalid email or password');

      const user = await getUserByAuthId(data.user.id);
      if (!user) throw new Error('Account not found. Please sign up.');

      let team = null;
      if (user.role === 'coach' && user.teamIds?.length > 0) {
        team = await getTeam(user.teamIds[0]);
      } else if (user.role === 'player' && user.teamId) {
        team = await getTeam(user.teamId);
      }

      onLogin(user, team);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const backButton = (
    <button
      onClick={() => { setMode('select'); setError(''); }}
      className="flex items-center text-slate-400 hover:text-white transition-colors"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );

  const inputClass = (color = 'orange') =>
    `w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-${color}-500 focus:border-transparent`;

  const renderRoleSelect = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
        <p className="text-slate-400">Choose your role to continue</p>
      </div>
      <button
        onClick={() => setMode('coach-signup')}
        className="w-full p-4 sm:p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-center hover:from-orange-400 hover:to-orange-500 transition-all"
      >
        <h3 className="text-lg sm:text-xl font-bold text-white">I'm a Coach</h3>
        <p className="text-white/80 text-sm mt-1">Manage your team and track progress</p>
      </button>
      <button
        onClick={() => setMode('player-signup')}
        className="w-full p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-center hover:from-blue-400 hover:to-blue-500 transition-all"
      >
        <h3 className="text-lg sm:text-xl font-bold text-white">I'm a Player</h3>
        <p className="text-white/80 text-sm mt-1">Track your training and improve</p>
      </button>
      <div className="text-center pt-4">
        <button onClick={() => setMode('login')} className="text-slate-400 hover:text-white transition-colors">
          Already have an account? <span className="text-orange-500">Log in</span>
        </button>
      </div>
    </motion.div>
  );

  const renderCoachSignup = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      {backButton}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Coach Sign Up</h2>
        <p className="text-slate-400 text-sm">Create your account and team</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Name *</label>
          <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Coach Smith" className={inputClass()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="coach@example.com" className={inputClass()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
          <input type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Min. 6 characters" className={inputClass()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Team Name *</label>
          <input type="text" value={formData.teamName} onChange={(e) => handleInputChange('teamName', e.target.value)} placeholder="Lincoln Lions" className={inputClass()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Level</label>
          <select value={formData.teamLevel} onChange={(e) => handleInputChange('teamLevel', e.target.value)} className={inputClass()}>
            <option value="">Select level</option>
            <option value="youth">Youth</option>
            <option value="middle-school">Middle School</option>
            <option value="jv">JV</option>
            <option value="varsity">Varsity</option>
            <option value="aau">AAU</option>
            <option value="college">College</option>
          </select>
        </div>
        {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
        <button onClick={handleCoachSignup} disabled={isLoading} className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50">
          {isLoading ? 'Creating...' : 'Create Coach Account'}
        </button>
      </div>
    </motion.div>
  );

  const renderPlayerSignup = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      {backButton}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Player Sign Up</h2>
        <p className="text-slate-400 text-sm">Create your account</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Name *</label>
          <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="John Smith" className={inputClass('blue')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="player@example.com" className={inputClass('blue')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
          <input type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Min. 6 characters" className={inputClass('blue')} />
        </div>
        <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/50">
          <label className="block text-sm font-medium text-slate-300 mb-1">Coach's Team Code *</label>
          <input
            type="text"
            value={formData.joinCode}
            onChange={(e) => handleInputChange('joinCode', e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest font-mono"
          />
          <p className="text-slate-500 text-xs mt-2">Get this code from your coach before signing up</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Age *</label>
            <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="16" className={inputClass('blue')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Jersey # *</label>
            <input type="text" value={formData.jerseyNumber} onChange={(e) => handleInputChange('jerseyNumber', e.target.value)} placeholder="23" className={inputClass('blue')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Position *</label>
            <select value={formData.position} onChange={(e) => handleInputChange('position', e.target.value)} className={inputClass('blue')}>
              <option value="">--</option>
              <option value="PG">PG</option>
              <option value="SG">SG</option>
              <option value="SF">SF</option>
              <option value="PF">PF</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>
        {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
        <button onClick={handlePlayerSignup} disabled={isLoading} className="w-full p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50">
          {isLoading ? 'Creating...' : 'Create Player Account'}
        </button>
      </div>
    </motion.div>
  );

  const renderLogin = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      {backButton}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Log in to your account</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="your@email.com" className={inputClass()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Your password" className={inputClass()} />
        </div>
        {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
        <button onClick={handleLogin} disabled={isLoading} className="w-full p-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50">
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <img src="/favicon64.png" alt="Pace Hoops" className="w-10 h-10 rounded-xl" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Pace Hoops</h1>
          </div>
          <p className="text-slate-400 text-sm">Basketball Training Platform</p>
        </div>
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
