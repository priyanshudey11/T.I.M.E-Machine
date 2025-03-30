import React from 'react';
import { useChat } from '../context/ChatContext';
import { useChatActions } from '../hooks/useChatActions';
import availableAgents from '../utils/agentData';

const HomePage = ({ onAgentSelect }) => {
  const { conversations } = useChat();
  const { openGroupChatSelector } = useChatActions();
  const agents = availableAgents;
  
  // Get the most recent message from each conversation
  const getLastMessage = (messages) => {
    if (!messages || messages.length === 0) return null;
    
    // Filter for user or agent messages only (ignore system messages)
    const userAgentMessages = messages.filter(msg => 
      msg.type === 'user' || msg.type === 'agent'
    );
    
    return userAgentMessages.length > 0 
      ? userAgentMessages[userAgentMessages.length - 1] 
      : null;
  };

  // Format the timestamp (simulated here)
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
    return `${hours}:${minutes} ${ampm}`;
  };

  // Simulated historical "last seen" dates for agents
  const getHistoricalDate = (agentId) => {
    const dates = {
      'einstein': '1955',
      'napoleon': '1821',
      'cleopatra': '30 BCE',
      'davinci': '1519'
    };
    return dates[agentId] || '19th century';
  };

  // Get online/offline status (randomly assigned for demo)
  const getAgentStatus = (agentId) => {
    // For demo purposes, assign random online status
    // In real app, this would be determined by actual agent availability
    return Math.random() > 0.5 ? 'online' : 'offline';
  };

  const handleGroupChatClick = () => {
    console.log('Group chat button clicked');
    openGroupChatSelector();
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white font-sans overflow-hidden">
      {/* Left Sidebar: Members List */}
      <div className="w-64 border-r border-gray-700 flex flex-col">
        {/* Sidebar header */}
        <div className="h-16 border-b border-gray-700 px-4 flex items-center justify-between">
          <div className="font-bold text-xl">Members:</div>
          <button
            onClick={handleGroupChatClick}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="Create Group Chat"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </button>
        </div>
        
        {/* Members list with scrollbar */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          {/* Group Chat Option */}
          <div 
            className="bg-gray-750 rounded-lg p-3 mb-3 cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={handleGroupChatClick}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl mr-3">
                👥
              </div>
              <div className="flex-1">
                <div className="font-medium">Group Chat</div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                  <div className="text-green-400">Create new group chat</div>
                </div>
              </div>
            </div>
          </div>

          {agents.map(agent => {
            const status = getAgentStatus(agent.id);
            
            return (
              <div 
                key={agent.id}
                className="bg-gray-750 rounded-lg p-3 mb-3 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onAgentSelect(agent.id)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-2xl mr-3">
                    {agent.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{agent.name}</div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className={status === 'online' ? 'text-green-400' : 'text-gray-400'}>
                        {status === 'online' ? 'Online' : `Last seen ${getHistoricalDate(agent.id)}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Main Content: Chats */}
      <div className="flex-1 flex flex-col">
        {/* Main header */}
        <div className="h-16 border-b border-gray-700 px-4 flex items-center">
          <div className="font-bold text-xl">Chats:</div>
        </div>
        
        {/* Chat list area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-700">
          <div className="max-w-4xl mx-auto flex flex-col">
            {/* New Chat button */}
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg mb-4 flex items-center justify-center"
              onClick={() => {
                // Select a random agent for a new chat
                const randomAgent = agents[Math.floor(Math.random() * agents.length)];
                onAgentSelect(randomAgent.id);
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
              </svg>
              New Chat
            </button>
            
            {/* Chat history */}
            {Object.entries(conversations).map(([agentId, messages]) => {
              // Skip empty conversations
              if (messages.filter(m => m.type === 'user' || m.type === 'agent').length === 0) return null;
              
              const agent = agents.find(a => a.id === agentId);
              const lastMessage = getLastMessage(messages);
              
              if (!agent || !lastMessage) return null;
              
              return (
                <div 
                  key={agentId}
                  className="bg-gray-800 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => onAgentSelect(agentId)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl mr-3">
                      {agent.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Chat with {agent.name}</span>
                        <span className="text-gray-400 text-xs">{getRandomTime()}</span>
                      </div>
                      <div className="text-gray-400 text-sm truncate">
                        {lastMessage.type === 'user' 
                          ? <span className="text-blue-300">You: </span> 
                          : <span className="text-yellow-300">{agent.name}: </span>}
                        {lastMessage.content.length > 60 
                          ? lastMessage.content.substring(0, 60) + '...' 
                          : lastMessage.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
            
            {/* Example static chat entries if no real conversations */}
            {Object.values(conversations).filter(msgs => msgs.filter(m => m.type === 'user' || m.type === 'agent').length > 0).length === 0 && (
              <>
                <div className="text-center text-gray-500 mb-6 mt-4">No chats yet. Start a new conversation!</div>
                
                {Array.from({length: 3}).map((_, i) => (
                  <div 
                    key={i}
                    className="bg-gray-750 border border-gray-700 rounded-lg p-4 mb-3 cursor-pointer opacity-50 hover:opacity-70 transition-opacity"
                    onClick={() => {
                      // Select a random agent when clicking on example chat
                      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
                      onAgentSelect(randomAgent.id);
                    }}
                  >
                    <div className="font-medium">Chat {i + 1}</div>
                    <div className="text-gray-400 text-sm">Click to start a conversation</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 