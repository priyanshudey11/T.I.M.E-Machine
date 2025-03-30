import React, { useEffect } from 'react';

// Components
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import HomePage from './components/HomePage';

// Context, Hooks
import { useChat } from './context/ChatContext';
import { useChatActions } from './hooks/useChatActions';

// Utils
import availableAgents from './utils/agentData';

const DiscordStyleChatApp = () => {
  const { 
    currentAgent, 
    conversations
  } = useChat();
  
  const {
    inputValue,
    setInputValue,
    handleSubmit,
    switchAgent,
    messagesEndRef
  } = useChatActions();

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, currentAgent, messagesEndRef]);

  const currentMessages = currentAgent ? conversations[currentAgent] || [] : [];
  const currentAgentData = availableAgents.find(a => a.id === currentAgent);

  return (
    <div className="flex h-screen bg-gray-800 text-white font-sans overflow-hidden">
      {/* Sidebar with available agents */}
      <Sidebar 
        agents={availableAgents} 
        currentAgentId={currentAgent} 
        onSelectAgent={switchAgent}
      />
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <ChatHeader agent={currentAgentData} />
        
        {/* Messages area */}
        <MessageList 
          messages={currentMessages} 
          currentAgent={currentAgentData} 
          messagesEndRef={messagesEndRef} 
        />
        
        {/* Message input */}
        <MessageInput 
          inputValue={inputValue} 
          setInputValue={setInputValue} 
          handleSubmit={handleSubmit} 
          currentAgent={currentAgentData}
        />
      </div>
    </div>
  );
};

export default DiscordStyleChatApp; 