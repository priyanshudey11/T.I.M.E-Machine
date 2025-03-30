import { useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { generateAIResponse, prepareConversationHistory } from '../services/chatService';
import availableAgents from '../utils/agentData';

export const useChatActions = () => {
  const { 
    inputValue, 
    setInputValue, 
    conversations, 
    setConversations, 
    currentAgent, 
    setCurrentAgent,
    setBootSequence,
    setBootStep,
    setShowHome
  } = useChat();
  
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentAgent) return;

    // Add user message
    setConversations(prev => ({
      ...prev,
      [currentAgent]: [...(prev[currentAgent] || []), { type: 'user', content: inputValue }]
    }));

    // Process message with AI
    await generateResponse(inputValue);

    setInputValue('');
  };

  const generateResponse = async (question) => {
    if (!currentAgent) return;
    
    // Add loading message
    const loadingId = Date.now().toString();
    setConversations(prev => ({
      ...prev,
      [currentAgent]: [...(prev[currentAgent] || []), { id: loadingId, type: 'loading', content: 'Typing...' }]
    }));

    try {
      // Prepare conversation history for AI context
      const currentConversation = conversations[currentAgent] || [];
      const conversationHistory = prepareConversationHistory(currentConversation);
      
      // Call AI service with conversation history
      const response = await generateAIResponse(currentAgent, question, conversationHistory);
      
      // Remove loading message and add response
      setConversations(prev => {
        const agentConversation = prev[currentAgent] || [];
        const filteredConversation = agentConversation.filter(msg => msg.id !== loadingId);
        
        const currentAgentData = availableAgents.find(a => a.id === currentAgent);
        
        return {
          ...prev,
          [currentAgent]: [
            ...filteredConversation, 
            { type: 'agent', content: response, agent: currentAgentData.name }
          ]
        };
      });
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Remove loading message and add error message
      setConversations(prev => {
        const agentConversation = prev[currentAgent] || [];
        const filteredConversation = agentConversation.filter(msg => msg.id !== loadingId);
        
        return {
          ...prev,
          [currentAgent]: [
            ...filteredConversation, 
            { type: 'system', content: 'Sorry, I encountered an error generating a response. Please try again.' }
          ]
        };
      });
    }
  };

  const switchAgent = (agentId) => {
    setCurrentAgent(agentId);
    setShowHome(false);
    
    // Reset boot sequence if this agent has no messages yet
    if (!conversations[agentId] || conversations[agentId].length === 0) {
      setBootSequence(true);
      setBootStep(0);
    }
  };
  
  const goToHome = () => {
    setShowHome(true);
    setCurrentAgent(null);
  };

  return {
    inputValue,
    setInputValue,
    handleSubmit,
    generateResponse,
    switchAgent,
    goToHome,
    messagesEndRef
  };
}; 