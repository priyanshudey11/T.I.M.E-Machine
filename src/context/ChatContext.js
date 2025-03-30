import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveConversations, loadConversations } from '../services/chatService';
import availableAgents from '../utils/agentData';

// Create context
export const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider component
export const ChatProvider = ({ children }) => {
  const [inputValue, setInputValue] = useState('');
  const [conversations, setConversations] = useState({});
  const [currentAgent, setCurrentAgent] = useState(null);
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [showHome, setShowHome] = useState(true);

  // Boot sequence text
  const bootSteps = [
    "T.I.M.E MACHINE [Version 1.0]",
    "Copyright (C) 2025 Hackathon Team. All rights reserved.",
    "Initializing system...",
    "Loading personality matrices...",
    "Connecting to historical database...",
    "System ready."
  ];

  useEffect(() => {
    // Load saved conversations or initialize new ones
    const savedConversations = loadConversations();
    
    if (savedConversations) {
      setConversations(savedConversations);
    } else {
      // Initialize empty conversations for each agent
      const initialConversations = {};
      availableAgents.forEach(agent => {
        initialConversations[agent.id] = [];
      });
      setConversations(initialConversations);
    }
  }, []);

  // Save conversations whenever they change
  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    if (bootSequence && currentAgent) {
      const timer = setTimeout(() => {
        if (bootStep < bootSteps.length) {
          setConversations(prev => {
            // Only show boot sequence if conversation is empty
            if (prev[currentAgent] && prev[currentAgent].length > 0) {
              setBootSequence(false);
              setBootStep(bootSteps.length);
              return prev;
            }
            
            return {
              ...prev,
              [currentAgent]: [...(prev[currentAgent] || []), { type: 'system', content: bootSteps[bootStep] }]
            };
          });
          setBootStep(bootStep + 1);
        } else {
          setBootSequence(false);
          const currentAgentData = availableAgents.find(a => a.id === currentAgent);
          
          setConversations(prev => {
            // Only add welcome message if conversation is just the boot sequence
            if (prev[currentAgent] && prev[currentAgent].length > bootSteps.length) {
              return prev;
            }
            
            return {
              ...prev,
              [currentAgent]: [
                ...(prev[currentAgent] || []), 
                { type: 'system', content: `Welcome to the T.I.M.E Machine Interface. You are now chatting with ${currentAgentData.name}.` }
              ]
            };
          });
        }
      }, bootStep === 0 ? 500 : 800);
      return () => clearTimeout(timer);
    }
  }, [bootStep, bootSequence, currentAgent]);

  const value = {
    inputValue,
    setInputValue,
    conversations,
    setConversations,
    currentAgent, 
    setCurrentAgent,
    bootSequence,
    setBootSequence,
    bootStep,
    setBootStep,
    showHome,
    setShowHome,
    bootSteps
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 