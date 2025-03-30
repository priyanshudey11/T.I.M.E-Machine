import React from 'react';
import { useChat } from './context/ChatContext';
import App from './App';
import HomePage from './components/HomePage';

const AppWrapper = () => {
  const { showHome, setShowHome, setCurrentAgent } = useChat();

  const handleAgentSelect = (agentId) => {
    setCurrentAgent(agentId);
    setShowHome(false);
  };

  if (showHome) {
    return <HomePage onAgentSelect={handleAgentSelect} />;
  }

  return <App />;
};

export default AppWrapper; 