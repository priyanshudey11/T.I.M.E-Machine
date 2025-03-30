import React from 'react';
import { useChat } from './context/ChatContext';
import { useChatActions } from './hooks/useChatActions';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Home from './components/Home';
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
    switchAgent,
    openGroupChatSelector
  } = useChatActions();

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Sidebar with available agents */}
      <Sidebar 
        agents={availableAgents} 
        currentAgentId={currentAgent} 
        onSelectAgent={switchAgent}
        onCreateGroupChat={openGroupChatSelector}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {showHome ? (
          <Home />
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