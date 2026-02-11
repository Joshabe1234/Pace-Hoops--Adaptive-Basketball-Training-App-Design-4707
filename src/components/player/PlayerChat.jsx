import React, { useState, useRef, useEffect } from 'react';
import { getTeamMessages, createMessage, getUser, getTeamPlayers } from '../../data/database';

const PlayerChat = ({ user, team }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // No team - show empty state with chat UI preview
  if (!team) {
    return (
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-32px)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <h1 className="text-xl font-bold text-white">Team Chat</h1>
          <p className="text-slate-400 text-sm">Connect with your team</p>
        </div>

        {/* Chat preview area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {/* Fake message bubbles to show what it will look like */}
          <div className="space-y-4 opacity-30">
            <div className="flex justify-start">
              <div className="max-w-[70%]">
                <p className="text-xs text-slate-500 mb-1 ml-2">Coach Smith</p>
                <div className="p-3 rounded-2xl bg-orange-500 rounded-bl-sm">
                  <div className="h-4 w-48 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[70%]">
                <div className="p-3 rounded-2xl bg-blue-500 rounded-br-sm">
                  <div className="h-4 w-32 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[70%]">
                <p className="text-xs text-slate-500 mb-1 ml-2">Teammate</p>
                <div className="p-3 rounded-2xl bg-slate-700 rounded-bl-sm">
                  <div className="h-4 w-40 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty state overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="text-center p-6 max-w-sm">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Team Chat</h3>
              <p className="text-slate-400">
                When you join a team, you'll be able to chat with your coach and teammates here. 
                Share updates, ask questions, and stay connected.
              </p>
            </div>
          </div>
        </div>

        {/* Disabled input */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex space-x-2">
            <input
              type="text"
              disabled
              placeholder="Join a team to start chatting..."
              className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-500 placeholder-slate-500 cursor-not-allowed"
            />
            <button
              disabled
              className="px-6 py-3 bg-slate-600 text-slate-400 rounded-xl font-medium cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Has team - show actual chat
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [team.id]);

  const loadMessages = () => {
    const msgs = getTeamMessages(team.id);
    setMessages(msgs);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    createMessage(user.id, {
      teamId: team.id,
      content: message.trim()
    });
    
    setMessage('');
    loadMessages();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const players = getTeamPlayers(team.id);
  const coach = getUser(team.coachId);

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-32px)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <h1 className="text-xl font-bold text-white">{team.name} Chat</h1>
        <p className="text-slate-400 text-sm">{players.length + 1} members</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-slate-400">No messages yet</p>
            <p className="text-slate-500 text-sm">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const sender = getUser(msg.senderId);
            const isMe = msg.senderId === user.id;
            const isCoach = sender?.role === 'coach';
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isMe ? 'order-1' : ''}`}>
                  {!isMe && (
                    <p className="text-xs text-slate-400 mb-1 ml-2">
                      {sender?.name || 'Unknown'} {isCoach && <span className="text-orange-400">(Coach)</span>}
                    </p>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    isMe 
                      ? 'bg-blue-500 text-white rounded-br-sm' 
                      : isCoach
                      ? 'bg-orange-500 text-white rounded-bl-sm'
                      : 'bg-slate-700 text-white rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                  </div>
                  <p className={`text-xs text-slate-500 mt-1 ${isMe ? 'text-right mr-2' : 'ml-2'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-400 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerChat;
