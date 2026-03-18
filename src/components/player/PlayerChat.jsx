import React, { useState, useEffect, useRef } from 'react';
import {
  getTeamMessages,
  createMessage,
  markMessageRead,
  getTeamPlayers,
  getUser,
  getTeam,
  createDirectMessage,
  getDirectMessages,
  getConversations,
  markConversationRead,
  getUnreadDMCount
} from '../../data/database';

const PlayerChat = ({ user, team }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatMode, setChatMode] = useState('team'); // 'team', 'dm-list', 'dm-chat'
  const [dmRecipient, setDmRecipient] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadDMCount, setUnreadDMCount] = useState(0);
  const messagesEndRef = useRef(null);

  const players = team ? getTeamPlayers(team.id) : [];
  const teamData = team ? getTeam(team.id) : null;
  const coach = teamData ? getUser(teamData.coachId) : null;

  // All people this player can DM (teammates + coach)
  const dmContacts = [
    ...(coach ? [{ ...coach, isCoach: true }] : []),
    ...players.filter(p => p.id !== user.id)
  ];

  const loadData = () => {
    if (team) {
      // Team messages
      const teamMsgs = getTeamMessages(team.id);
      setMessages(teamMsgs);
      teamMsgs.forEach(m => {
        if (!m.readBy?.includes(user.id)) {
          markMessageRead(m.id, user.id);
        }
      });

      // DM conversations
      const convs = getConversations(user.id);
      setConversations(convs);
      setUnreadDMCount(getUnreadDMCount(user.id));

      // Current DM chat
      if (dmRecipient) {
        const dms = getDirectMessages(user.id, dmRecipient.id);
        setDmMessages(dms);
        markConversationRead(user.id, dmRecipient.id);
      }
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [team?.id, user.id, dmRecipient?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, dmMessages]);

  const handleSendTeamMessage = () => {
    if (!newMessage.trim() || !team) return;
    createMessage(user.id, { teamId: team.id, content: newMessage.trim() });
    setNewMessage('');
    loadData();
  };

  const handleSendDM = () => {
    if (!newMessage.trim() || !dmRecipient) return;
    createDirectMessage(user.id, dmRecipient.id, newMessage.trim());
    setNewMessage('');
    loadData();
  };

  const openDMChat = (contact) => {
    setDmRecipient(contact);
    setChatMode('dm-chat');
    markConversationRead(user.id, contact.id);
    const dms = getDirectMessages(user.id, contact.id);
    setDmMessages(dms);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!team) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <span className="text-4xl">💬</span>
          <h3 className="text-lg font-semibold text-white mt-4">Join a Team</h3>
          <p className="text-slate-400 mt-2">Join a team using your coach's team code to access chat</p>
        </div>
      </div>
    );
  }

  // DM Chat View
  if (chatMode === 'dm-chat' && dmRecipient) {
    const isCoach = dmRecipient.role === 'coach';
    return (
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* DM Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center space-x-3">
          <button
            onClick={() => {
              setChatMode('dm-list');
              setDmRecipient(null);
            }}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className={`w-10 h-10 ${isCoach ? 'bg-orange-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white font-semibold`}>
            {dmRecipient.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{dmRecipient.name}</h3>
            <p className="text-xs text-slate-400">
              {isCoach ? 'Coach' : dmRecipient.position && `#${dmRecipient.jerseyNumber} • ${dmRecipient.position}`}
            </p>
          </div>
        </div>

        {/* DM Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {dmMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No messages yet</p>
              <p className="text-slate-600 text-sm">Start the conversation!</p>
            </div>
          ) : (
            dmMessages.map((msg) => {
              const isMe = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-slate-700 text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-slate-500 mt-1 ${isMe ? 'text-right' : ''}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* DM Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendDM()}
              placeholder={`Message ${dmRecipient.name}...`}
              className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
            />
            <button
              onClick={handleSendDM}
              disabled={!newMessage.trim()}
              className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DM List View
  if (chatMode === 'dm-list') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Direct Messages</h1>
            <p className="text-slate-400">Private conversations</p>
          </div>
          <button
            onClick={() => setChatMode('team')}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            Team Chat
          </button>
        </div>

        {/* Contact list for new DM */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Start new conversation</h3>
          
          {/* Coach (featured) */}
          {coach && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">COACH</p>
              <button
                onClick={() => openDMChat(coach)}
                className="w-full flex items-center space-x-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg hover:bg-orange-500/20 text-left"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {coach.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{coach.name}</p>
                  <p className="text-orange-400 text-xs">Coach</p>
                </div>
              </button>
            </div>
          )}

          {/* Teammates */}
          {players.filter(p => p.id !== user.id).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">TEAMMATES</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {players.filter(p => p.id !== user.id).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => openDMChat(player)}
                    className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 text-left"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {player.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{player.name}</p>
                      <p className="text-slate-400 text-xs">
                        {player.position && `${player.position}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {dmContacts.length === 0 && (
            <p className="text-slate-500 text-center py-4">No contacts available</p>
          )}
        </div>

        {/* Recent conversations */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <h3 className="text-sm font-medium text-slate-400 p-4 border-b border-slate-700">Recent conversations</h3>
          {conversations.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No conversations yet</p>
          ) : (
            <div className="divide-y divide-slate-700">
              {conversations.map((conv) => {
                const isCoachConv = conv.otherUser?.role === 'coach';
                return (
                  <button
                    key={conv.oderId}
                    onClick={() => conv.otherUser && openDMChat(conv.otherUser)}
                    className="w-full p-4 hover:bg-slate-700 flex items-center space-x-3 text-left"
                  >
                    <div className={`w-10 h-10 ${isCoachConv ? 'bg-orange-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {conv.otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white truncate">
                          {conv.otherUser?.name || 'Unknown'}
                          {isCoachConv && <span className="text-orange-400 text-xs ml-2">Coach</span>}
                        </p>
                        <span className="text-xs text-slate-500">{formatTime(conv.lastMessage.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-400 truncate">
                        {conv.lastMessage.senderId === user.id ? 'You: ' : ''}
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Team Chat View (default)
  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{team.name} Chat</h1>
          <p className="text-sm text-slate-400">Team group chat</p>
        </div>
        <button
          onClick={() => setChatMode('dm-list')}
          className="relative px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>DMs</span>
          {unreadDMCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {unreadDMCount}
            </span>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">💬</span>
            <p className="text-slate-400 mt-4">No messages yet</p>
            <p className="text-slate-500 text-sm">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const sender = getUser(msg.senderId);
            const isMe = msg.senderId === user.id;
            const isCoachMsg = sender?.role === 'coach';
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className={`w-8 h-8 ${isCoachMsg ? 'bg-orange-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0`}>
                    {sender?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className={`max-w-[75%]`}>
                  {!isMe && (
                    <p className="text-xs text-slate-400 mb-1">
                      {sender?.name || 'Unknown'}
                      {isCoachMsg && <span className="text-orange-400 ml-1">• Coach</span>}
                    </p>
                  )}
                  <div
                    className={`p-3 rounded-2xl ${
                      isMe
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-slate-700 text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-slate-500 mt-1 ${isMe ? 'text-right' : ''}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendTeamMessage()}
            placeholder="Message your team..."
            className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
          />
          <button
            onClick={handleSendTeamMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerChat;
