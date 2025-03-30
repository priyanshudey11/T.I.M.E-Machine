import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useChatActions } from '../hooks/useChatActions';
import availableAgents from '../utils/agentData';

const Chat = ({ agent, isGroupChat }) => {
  const { 
    inputValue, 
    setInputValue, 
    conversations,
    groupChatAgents
  } = useChat();
  
  const { 
    handleSubmit, 
    messagesEndRef 
  } = useChatActions();

  // Get the current conversation key - either agent ID or 'group_chat'
  const conversationKey = isGroupChat ? 'group_chat' : (agent?.id || '');
  
  // Get the current conversation messages
  const messages = conversationKey ? (conversations[conversationKey] || []) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get the title for the chat
  const getChatTitle = () => {
    if (isGroupChat) {
      const agentNames = groupChatAgents.map(id => {
        const agent = availableAgents.find(a => a.id === id);
        return agent ? agent.name : id;
      });
      return `Group Chat (${agentNames.join(', ')})`;
    }
    return agent?.name || 'Chat';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h2 className="text-xl font-bold">{getChatTitle()}</h2>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}
          >
            {message.type === 'system' && (
              <div className="text-gray-400 text-center text-sm py-2">
                {message.content}
              </div>
            )}
            
            {message.type === 'user' && (
              <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg max-w-3/4">
                {message.content}
              </div>
            )}
            
            {message.type === 'agent' && (
              <div className="flex items-start mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mr-2">
                  {message.agent ? message.agent[0] : '?'}
                </div>
                <div>
                  {message.agent && (
                    <div className="text-sm text-gray-400 mb-1">
                      {message.agent}
                    </div>
                  )}
                  <div className="bg-gray-700 text-white px-4 py-2 rounded-lg inline-block max-w-3/4">
                    {message.content}
                  </div>
                </div>
              </div>
            )}
            
            {message.type === 'loading' && (
              <div className="flex items-start">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                  <span className="inline-block w-6 h-3 bg-gray-500 rounded-full animate-pulse mr-1"></span>
                  <span className="inline-block w-6 h-3 bg-gray-500 rounded-full animate-pulse delay-100 mr-1"></span>
                  <span className="inline-block w-6 h-3 bg-gray-500 rounded-full animate-pulse delay-200"></span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l-lg focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;