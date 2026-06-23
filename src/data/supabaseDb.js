import { supabase } from '../lib/supabase';

const ROSTER_CAP = 12;

const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ============ USER / PROFILE MANAGEMENT ============

export const createUser = async (userData, authId) => {
  const profile = {
    auth_id: authId,
    email: userData.email.toLowerCase().trim(),
    name: userData.name,
    role: userData.role,
    organization: userData.organization || '',
    team_ids: [],
    team_id: userData.teamId || null,
    age: userData.age || null,
    position: userData.position || '',
    jersey_number: userData.jerseyNumber || ''
  };
  const { data, error } = await supabase.from('profiles').insert(profile).select().single();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
};

export const getUser = async (profileId) => {
  if (!profileId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  if (error) return null;
  return normalizeUser(data);
};

export const getUserByAuthId = async (authId) => {
  if (!authId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('auth_id', authId).single();
  if (error) return null;
  return normalizeUser(data);
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();
  if (error) return null;
  return normalizeUser(data);
};

export const updateUser = async (profileId, updates) => {
  const dbUpdates = {};
  if (updates.teamId !== undefined) dbUpdates.team_id = updates.teamId;
  if (updates.teamIds !== undefined) dbUpdates.team_ids = updates.teamIds;
  if (updates.position !== undefined) dbUpdates.position = updates.position;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.jerseyNumber !== undefined) dbUpdates.jersey_number = updates.jerseyNumber;
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', profileId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
};

// Convert snake_case DB row to camelCase app object
const normalizeUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    authId: row.auth_id,
    email: row.email,
    name: row.name,
    role: row.role,
    organization: row.organization || '',
    teamIds: row.team_ids || [],
    teamId: row.team_id || null,
    age: row.age,
    position: row.position || '',
    jerseyNumber: row.jersey_number || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// ============ TEAM MANAGEMENT ============

export const createTeam = async (coachId, teamData) => {
  let joinCode = generateJoinCode();

  const team = {
    coach_id: coachId,
    name: teamData.name,
    sport: 'basketball',
    level: teamData.level || '',
    join_code: joinCode,
    player_ids: [],
    blocked_player_ids: []
  };

  const { data, error } = await supabase.from('teams').insert(team).select().single();
  if (error) throw new Error(error.message);

  // Update coach's team_ids
  const coach = await getUser(coachId);
  if (coach) {
    await updateUser(coachId, { teamIds: [...(coach.teamIds || []), data.id] });
  }

  return normalizeTeam(data);
};

export const getTeam = async (teamId) => {
  if (!teamId) return null;
  const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
  if (error) return null;
  return normalizeTeam(data);
};

export const getTeamByJoinCode = async (code) => {
  if (!code) return null;
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('join_code', code.toUpperCase().trim())
    .single();
  if (error) return null;
  return normalizeTeam(data);
};

export const getCoachTeams = async (coachId) => {
  const { data, error } = await supabase.from('teams').select('*').eq('coach_id', coachId);
  if (error) return [];
  return (data || []).map(normalizeTeam);
};

export const getTeamPlayers = async (teamId) => {
  const team = await getTeam(teamId);
  if (!team || !team.playerIds?.length) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', team.playerIds);
  if (error) return [];
  return (data || []).map(normalizeUser);
};

export const addPlayerToTeam = async (teamId, playerId) => {
  const team = await getTeam(teamId);
  if (!team) return { error: 'Team not found' };

  if ((team.blockedPlayerIds || []).includes(playerId)) {
    return { error: 'You have been removed from this team and cannot rejoin.' };
  }

  if ((team.playerIds || []).length >= ROSTER_CAP) {
    return { error: `Team has reached maximum roster size (${ROSTER_CAP} players)` };
  }

  if ((team.playerIds || []).includes(playerId)) return team;

  const newPlayerIds = [...(team.playerIds || []), playerId];
  const { data, error } = await supabase
    .from('teams')
    .update({ player_ids: newPlayerIds })
    .eq('id', teamId)
    .select()
    .single();
  if (error) return { error: error.message };

  await updateUser(playerId, { teamId });
  return normalizeTeam(data);
};

export const removePlayerFromTeam = async (teamId, playerId) => {
  const team = await getTeam(teamId);
  if (!team) return null;

  const newPlayerIds = (team.playerIds || []).filter(id => id !== playerId);
  const newBlockedIds = [...new Set([...(team.blockedPlayerIds || []), playerId])];

  // Delete player's team messages
  await supabase.from('messages').delete().eq('team_id', teamId).eq('sender_id', playerId);

  const { data, error } = await supabase
    .from('teams')
    .update({ player_ids: newPlayerIds, blocked_player_ids: newBlockedIds })
    .eq('id', teamId)
    .select()
    .single();
  if (error) return null;

  await updateUser(playerId, { teamId: null });
  return normalizeTeam(data);
};

export const updatePlayerPosition = async (playerId, position) => {
  return updateUser(playerId, { position });
};

const normalizeTeam = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    sport: row.sport,
    level: row.level || '',
    joinCode: row.join_code,
    playerIds: row.player_ids || [],
    blockedPlayerIds: row.blocked_player_ids || [],
    createdAt: row.created_at
  };
};

// ============ ASSIGNMENT MANAGEMENT ============

export const createAssignment = async (coachId, teamId, data) => {
  const assignment = {
    coach_id: coachId,
    team_id: teamId,
    title: data.title,
    description: data.description || '',
    type: data.type,
    items: data.items,
    assigned_to: Array.isArray(data.assignedTo) ? JSON.stringify(data.assignedTo) : (data.assignedTo || 'team'),
    due_date: data.dueDate,
    status: 'active'
  };
  const { data: row, error } = await supabase.from('assignments').insert(assignment).select().single();
  if (error) throw new Error(error.message);
  return normalizeAssignment(row);
};

export const getTeamAssignments = async (teamId) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(normalizeAssignment);
};

export const getAllTeamAssignments = async (teamId) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(normalizeAssignment);
};

export const getPlayerAssignments = async (playerId, teamId) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'active')
    .order('due_date', { ascending: true });
  if (error) return [];

  return (data || [])
    .map(normalizeAssignment)
    .filter(a => {
      if (a.assignedTo === 'team') return true;
      if (Array.isArray(a.assignedTo)) return a.assignedTo.includes(playerId);
      return false;
    });
};

export const deleteAssignment = async (id) => {
  await supabase.from('assignments').delete().eq('id', id);
};

const normalizeAssignment = (row) => {
  if (!row) return null;
  let assignedTo = row.assigned_to;
  if (assignedTo && assignedTo !== 'team' && assignedTo.startsWith('[')) {
    try { assignedTo = JSON.parse(assignedTo); } catch (_) {}
  }
  return {
    id: row.id,
    coachId: row.coach_id,
    teamId: row.team_id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    items: row.items || [],
    assignedTo,
    dueDate: row.due_date,
    status: row.status,
    createdAt: row.created_at
  };
};

// ============ LOG MANAGEMENT ============

export const createLog = async (playerId, data) => {
  const percentage = data.attempts > 0 ? Math.round((data.makes / data.attempts) * 100) : null;
  const log = {
    player_id: playerId,
    assignment_id: data.assignmentId,
    item_id: data.itemId,
    item_type: data.itemType,
    makes: data.makes ?? null,
    attempts: data.attempts ?? null,
    percentage,
    sets: data.sets ?? null,
    reps: data.reps ?? null,
    weight: data.weight ?? null,
    time: data.time ?? null,
    difficulty: data.difficulty ?? null,
    soreness: data.soreness || 'none',
    injured: data.injured || false,
    injury_description: data.injuryDescription || null,
    notes: data.notes || null,
    completed: data.completed !== false
  };
  const { data: row, error } = await supabase.from('logs').insert(log).select().single();
  if (error) throw new Error(error.message);
  return normalizeLog(row);
};

export const getPlayerLogs = async (playerId, options = {}) => {
  let query = supabase.from('logs').select('*').eq('player_id', playerId).order('created_at', { ascending: false });
  if (options.assignmentId) query = query.eq('assignment_id', options.assignmentId);
  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(normalizeLog);
};

export const getAssignmentLogs = async (assignmentId) => {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('assignment_id', assignmentId);
  if (error) return [];
  return (data || []).map(normalizeLog);
};

export const getTeamLogs = async (teamId, options = {}) => {
  const team = await getTeam(teamId);
  if (!team || !team.playerIds?.length) return [];

  let query = supabase
    .from('logs')
    .select('*')
    .in('player_id', team.playerIds)
    .order('created_at', { ascending: false });

  if (options.since) query = query.gte('created_at', options.since);
  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(normalizeLog);
};

export const getTeamInjuries = async (teamId) => {
  const team = await getTeam(teamId);
  if (!team || !team.playerIds?.length) return [];

  const { data: logs, error } = await supabase
    .from('logs')
    .select('*')
    .in('player_id', team.playerIds)
    .eq('injured', true)
    .order('created_at', { ascending: false });
  if (error) return [];

  const { data: players } = await supabase.from('profiles').select('*').in('id', team.playerIds);
  const playerMap = {};
  (players || []).forEach(p => { playerMap[p.id] = normalizeUser(p); });

  return (logs || []).map(log => ({
    id: log.id,
    player: playerMap[log.player_id],
    log: normalizeLog(log),
    injuryDescription: log.injury_description,
    date: log.created_at,
    assignmentId: log.assignment_id
  }));
};

const normalizeLog = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    playerId: row.player_id,
    assignmentId: row.assignment_id,
    itemId: row.item_id,
    itemType: row.item_type,
    makes: row.makes,
    attempts: row.attempts,
    percentage: row.percentage,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight,
    time: row.time,
    difficulty: row.difficulty,
    soreness: row.soreness || 'none',
    injured: row.injured || false,
    injuryDescription: row.injury_description,
    notes: row.notes,
    completed: row.completed !== false,
    createdAt: row.created_at
  };
};

// ============ SCHEDULE MANAGEMENT ============

export const createScheduleEvent = async (coachId, teamId, data) => {
  const event = {
    coach_id: coachId,
    team_id: teamId,
    title: data.title,
    type: data.type || 'practice',
    date: data.date,
    time: data.time || null,
    duration: data.duration || 60,
    location: data.location || null,
    notes: data.notes || null
  };
  const { data: row, error } = await supabase.from('schedules').insert(event).select().single();
  if (error) throw new Error(error.message);
  return normalizeEvent(row);
};

export const getTeamSchedule = async (teamId) => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('team_id', teamId)
    .order('date', { ascending: true });
  if (error) return [];
  return (data || []).map(normalizeEvent);
};

export const deleteScheduleEvent = async (id) => {
  await supabase.from('schedules').delete().eq('id', id);
};

const normalizeEvent = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    coachId: row.coach_id,
    teamId: row.team_id,
    title: row.title,
    type: row.type,
    date: row.date,
    time: row.time,
    duration: row.duration,
    location: row.location,
    notes: row.notes,
    createdAt: row.created_at
  };
};

// ============ TEAM CHAT MESSAGES ============

export const createMessage = async (senderId, data) => {
  const { data: row, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, team_id: data.teamId, content: data.content, read_by: [senderId] })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeMessage(row);
};

export const getTeamMessages = async (teamId, limit = 50) => {
  const team = await getTeam(teamId);
  const blockedIds = team?.blockedPlayerIds || [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];

  return (data || [])
    .filter(m => !blockedIds.includes(m.sender_id))
    .map(normalizeMessage);
};

export const markMessageRead = async (messageId, userId) => {
  const { data: msg } = await supabase.from('messages').select('read_by').eq('id', messageId).single();
  if (!msg) return;
  const readBy = msg.read_by || [];
  if (readBy.includes(userId)) return;
  await supabase.from('messages').update({ read_by: [...readBy, userId] }).eq('id', messageId);
};

const normalizeMessage = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    senderId: row.sender_id,
    teamId: row.team_id,
    content: row.content,
    readBy: row.read_by || [],
    createdAt: row.created_at
  };
};

// ============ DIRECT MESSAGES ============

const getConversationId = (userId1, userId2) => [userId1, userId2].sort().join('_');

const normalizeDM = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    content: row.content,
    read: row.read || false,
    createdAt: row.created_at
  };
};

export const createDirectMessage = async (senderId, recipientId, content) => {
  const conversationId = getConversationId(senderId, recipientId);
  const { data: row, error } = await supabase
    .from('direct_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, recipient_id: recipientId, content, read: false })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeDM(row);
};

export const getDirectMessages = async (userId1, userId2, limit = 100) => {
  const conversationId = getConversationId(userId1, userId2);
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data || []).map(normalizeDM);
};

export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) return [];

  const convMap = {};
  (data || []).forEach(dm => {
    const otherId = dm.sender_id === userId ? dm.recipient_id : dm.sender_id;
    if (!convMap[otherId]) convMap[otherId] = { lastMessage: dm, unreadCount: 0 };
    if (dm.sender_id !== userId && !dm.read) convMap[otherId].unreadCount++;
  });

  const otherIds = Object.keys(convMap);
  if (!otherIds.length) return [];

  const { data: profiles } = await supabase.from('profiles').select('*').in('id', otherIds);
  const profileMap = {};
  (profiles || []).forEach(p => { profileMap[p.id] = normalizeUser(p); });

  return Object.entries(convMap).map(([otherId, conv]) => ({
    otherId,
    otherUser: profileMap[otherId] || null,
    lastMessage: normalizeDM(conv.lastMessage),
    unreadCount: conv.unreadCount
  })).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
};

export const markDirectMessageRead = async (messageId) => {
  await supabase.from('direct_messages').update({ read: true }).eq('id', messageId);
};

export const markConversationRead = async (currentUserId, otherUserId) => {
  const conversationId = getConversationId(currentUserId, otherUserId);
  await supabase
    .from('direct_messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('recipient_id', currentUserId)
    .eq('read', false);
};

export const getUnreadDMCount = async (userId) => {
  const { count, error } = await supabase
    .from('direct_messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('read', false);
  if (error) return 0;
  return count || 0;
};

// ============ ANALYTICS (computed in JS) ============

export const getPlayerStats = async (playerId) => {
  const logs = await getPlayerLogs(playerId);
  const shootingLogs = logs.filter(l => l.makes !== undefined && l.makes !== null && l.attempts !== undefined && l.attempts !== null);
  const totalMakes = shootingLogs.reduce((sum, l) => sum + (l.makes || 0), 0);
  const totalAttempts = shootingLogs.reduce((sum, l) => sum + (l.attempts || 0), 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentLogs = logs.filter(l => new Date(l.createdAt) >= weekAgo);
  const recentSoreness = recentLogs.filter(l => l.soreness === 'moderate' || l.soreness === 'severe');

  // Completion = assignments the coach gave this player that they've fully logged
  // (every item has a matching log). The raw counts are exposed so getTeamStats can
  // roll them up into a true team-wide rate. completionRate is null when the player
  // has no assignments yet, so the UI can show "—" instead of a misleading 0%/100%.
  const player = await getUser(playerId);
  const assignments = player?.teamId ? await getPlayerAssignments(playerId, player.teamId) : [];
  const isAssignmentCompleted = (a) =>
    Array.isArray(a.items) && a.items.length > 0 &&
    a.items.every(itemId => logs.some(l => l.assignmentId === a.id && l.itemId === itemId));
  const completedAssignments = assignments.filter(isAssignmentCompleted).length;

  return {
    totalLogs: logs.length,
    shooting: {
      makes: totalMakes,
      attempts: totalAttempts,
      percentage: totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : null
    },
    assignedAssignments: assignments.length,
    completedAssignments,
    completionRate: assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : null,
    soreness: { recentHighSoreness: recentSoreness.length, hasRecentSoreness: recentSoreness.length > 0 }
  };
};

export const getTeamStats = async (teamId) => {
  const team = await getTeam(teamId);
  if (!team) return null;

  const players = await getTeamPlayers(teamId);
  const playerStats = await Promise.all(
    players.map(async (player) => ({
      playerId: player.id,
      player,
      stats: await getPlayerStats(player.id)
    }))
  );

  const totalLogs = playerStats.reduce((sum, p) => sum + p.stats.totalLogs, 0);
  const totalMakes = playerStats.reduce((sum, p) => sum + p.stats.shooting.makes, 0);
  const totalAttempts = playerStats.reduce((sum, p) => sum + p.stats.shooting.attempts, 0);
  const playersWithSoreness = playerStats.filter(p => p.stats.soreness.hasRecentSoreness);
  // True team completion: total assignments finished across players ÷ total assigned.
  const totalAssigned = playerStats.reduce((sum, p) => sum + p.stats.assignedAssignments, 0);
  const totalCompleted = playerStats.reduce((sum, p) => sum + p.stats.completedAssignments, 0);

  return {
    playerStats,
    teamTotals: {
      totalLogs,
      shooting: {
        makes: totalMakes,
        attempts: totalAttempts,
        percentage: totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : null
      },
      avgCompletionRate: totalAssigned > 0
        ? Math.round((totalCompleted / totalAssigned) * 100)
        : 0,
      soreness: {
        playersWithHighSoreness: playersWithSoreness.length,
        playersAtRisk: playersWithSoreness.map(p => ({ player: p.player, recentHighSoreness: p.stats.soreness.recentHighSoreness }))
      }
    }
  };
};
