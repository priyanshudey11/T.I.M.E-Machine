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

  // Determine the conversation key to use
  const conversationKey = isGroupChat ? 'group_chat' : (agent?.id || '');
  
  // Get messages from the correct conversation
  const messages = conversations[conversationKey] || [];
  
  // Debug logging
  console.log('Chat Component Rendering:');
  console.log('- isGroupChat:', isGroupChat);
  console.log('- conversationKey:', conversationKey);
  console.log('- groupChatAgents:', groupChatAgents);
  console.log('- messages:', messages);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get the chat title
  const getChatTitle = () => {
    if (isGroupChat) {
      const agentNames = groupChatAgents.map(id => {
        const agent = availableAgents.find(a => a.id === id);
        return agent ? agent.name : '';
      }).filter(Boolean);
      return `Group Chat: ${agentNames.join(', ')}`;
    }
    return agent?.name || 'Chat';
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Chat header */}
      <div className="bg-gray-900 p-4 shadow-md">
        <h2 className="text-xl font-semibold">{getChatTitle()}</h2>
      </div>
      
      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            {message.type === 'system' && (
              <div className="bg-gray-700 text-gray-300 p-2 rounded text-center text-sm">
                {message.content}
              </div>
            )}
            
            {message.type === 'user' && (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-3/4">
                  {message.content}
                </div>
              </div>
            )}
            
            {message.type === 'agent' && (
              <div className="flex items-start mb-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                  {getAgentAvatar(message.agent)}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">{message.agent}</div>
                  <div className="bg-gray-700 p-3 rounded-lg inline-block">
                    {message.content}
                  </div>
                </div>
              </div>
            )}
            
            {message.type === 'loading' && (
              <div className="flex items-center">
                <div className="bg-gray-700 px-4 py-2 rounded-lg">
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1"></span>
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1" style={{animationDelay: '0.2s'}}></span>
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper function to get the appropriate avatar for an agent
const getAgentAvatar = (agentName) => {
  if (!agentName) return '?';
  
  const agent = availableAgents.find(a => 
    a.realName === agentName || a.name === agentName
  );
  
  return agent ? agent.avatar : agentName.charAt(0);
};

export default Chat;