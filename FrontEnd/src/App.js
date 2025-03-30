import React from 'react';
import { useChat } from './context/ChatContext';
import { useChatActions } from './hooks/useChatActions';
import HomePage from './components/HomePage';
import Chat from './components/Chat';
import GroupChatSelector from './components/GroupChatSelector';
import availableAgents from './utils/agentData';

function App() {
  const { 
    currentAgent, 
    showHome, 
    isGroupChat,
    showGroupChatSelector
  } = useChat();
  
  const { 
    closeGroupChatSelector, 
    startGroupChat,
    switchAgent
  } = useChatActions();

  console.log('App render - showGroupChatSelector:', showGroupChatSelector);

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {showHome ? (
          <HomePage onAgentSelect={switchAgent} />
        ) : (
          <Chat 
            agent={currentAgent ? availableAgents.find(a => a.id === currentAgent) : null} 
            isGroupChat={isGroupChat}
          />
        )}
      </div>
      
      {/* Group Chat Selector Modal */}
      {showGroupChatSelector && (
        <GroupChatSelector 
          onStartGroupChat={startGroupChat} 
          onClose={closeGroupChatSelector} 
        />
      )}
    </div>
  );
}

export default App;