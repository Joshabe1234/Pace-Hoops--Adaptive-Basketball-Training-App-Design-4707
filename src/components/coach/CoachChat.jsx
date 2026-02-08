import React, { useState, useRef, useEffect } from 'react';
import { getTeamMessages, createMessage, getTeamPlayers, getUser } from '../../data/database';

const CoachChat = ({ user, team }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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
            <p className="text-slate-400">No messages yet</p>
            <p className="text-slate-500 text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const sender = getUser(msg.senderId);
            const isMe = msg.senderId === user.id;
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isMe ? 'order-1' : ''}`}>
                  {!isMe && (
                    <p className="text-xs text-slate-400 mb-1 ml-2">{sender?.name || 'Unknown'}</p>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    isMe 
                      ? 'bg-orange-500 text-white rounded-br-sm' 
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
            className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-400 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
