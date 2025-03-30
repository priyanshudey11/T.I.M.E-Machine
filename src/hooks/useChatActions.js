import { useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { 
  sendAgentMessage, 
  startConversation,
  continueConversation,
  getResponses
} from '../services/chatService';
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
    setShowHome,
    isGroupChat,
    setIsGroupChat,
    groupChatAgents,
    setGroupChatAgents,
    showGroupChatSelector,
    setShowGroupChatSelector
  } = useChat();
  
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (isGroupChat) {
      await handleGroupChatSubmit();
    } else if (currentAgent) {
      await handleSingleAgentSubmit();
    }

    setInputValue('');
  };

  const handleSingleAgentSubmit = async () => {
    // Add user message
    setConversations(prev => ({
      ...prev,
      [currentAgent]: [...(prev[currentAgent] || []), { type: 'user', content: inputValue }]
    }));

    // Process message with AI
    await generateResponse(inputValue);
  };

  const handleGroupChatSubmit = async () => {
    // Create a unique key for the group chat
    const groupChatKey = 'group_chat';
    
    // Add user message to group chat
    setConversations(prev => ({
      ...prev,
      [groupChatKey]: [...(prev[groupChatKey] || []), { type: 'user', content: inputValue }]
    }));

    // Process message with group chat
    await generateGroupResponse(inputValue);
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
      // Find the agent's full name for filtering responses
      const currentAgentData = availableAgents.find(a => a.id === currentAgent);
      if (!currentAgentData) throw new Error(`Agent data not found for ${currentAgent}`);
      
      // Send message to backend for the specific agent (not multi-agent conversation)
      const data = await sendAgentMessage(currentAgent, question);
      
      // Get all responses
      const responses = data || [];
      
      // Remove loading message and add responses
      setConversations(prev => {
        const agentConversation = prev[currentAgent] || [];
        const filteredConversation = agentConversation.filter(msg => msg.id !== loadingId);
        
        // Filter responses to only include the current agent
        const filteredResponses = responses.filter(resp => 
          resp.agent === currentAgentData.realName
        );
        
        // If we have no responses for this agent, it might be an error
        if (filteredResponses.length === 0 && responses.length > 0) {
          console.warn(`No responses from ${currentAgentData.realName} in the received data. Responses were:`, responses);
        }
        
        // Add each agent's response
        const newMessages = filteredResponses.map(response => ({
          type: 'agent',
          content: response.content,
          agent: response.agent
        }));
        
        return {
          ...prev,
          [currentAgent]: [...filteredConversation, ...newMessages]
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

  const generateGroupResponse = async (question) => {
    const groupChatKey = 'group_chat';
    
    // Add loading message
    const loadingId = Date.now().toString();
    setConversations(prev => ({
      ...prev,
      [groupChatKey]: [...(prev[groupChatKey] || []), { id: loadingId, type: 'loading', content: 'Typing...' }]
    }));
  
    try {
      // Get the full names of the selected agents
      const agentNames = groupChatAgents.map(agentId => {
        const agent = availableAgents.find(a => a.id === agentId);
        return agent ? agent.realName : null;
      }).filter(Boolean);
  
      if (agentNames.length === 0) {
        throw new Error('No valid agents selected for group chat');
      }
  
      console.log('Continuing conversation with message:', question);
      
      // Send the message to start the conversation
      await continueConversation(question);
      
      // Remove loading message
      setConversations(prev => {
        const chatConversation = prev[groupChatKey] || [];
        return {
          ...prev,
          [groupChatKey]: chatConversation.filter(msg => msg.id !== loadingId)
        };
      });
      
      // Poll for responses with a shorter interval
      let previousResponses = [];
      const maxPolls = 20; // Maximum number of polling attempts
      let pollCount = 0;
      
      const pollForResponses = async () => {
        if (pollCount >= maxPolls) return;
        pollCount++;
        
        try {
          // Get current responses
          const data = await getResponses();
          const responses = data.responses || [];
          console.log(`Poll ${pollCount}: Received ${responses.length} responses`);
          
          // Find new responses that weren't processed before
          const newResponses = responses.filter(response => 
            !previousResponses.some(prev => 
              prev.agent === response.agent && prev.content === response.content
            )
          );
          
          if (newResponses.length > 0) {
            console.log('New responses:', newResponses);
            
            // Add each new response individually with a slight delay
            for (const response of newResponses) {
              // Add this response to the conversation
              setConversations(prev => {
                return {
                  ...prev,
                  [groupChatKey]: [
                    ...(prev[groupChatKey] || []), 
                    {
                      type: 'agent',
                      content: response.content,
                      agent: response.agent,
                      timestamp: Date.now()
                    }
                  ]
                };
              });
              
              // Wait a bit before showing the next response
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Update previous responses
            previousResponses = [...previousResponses, ...newResponses];
          }
          
          // Continue polling if we haven't reached the limit
          if (pollCount < maxPolls) {
            setTimeout(pollForResponses, 1000);
          }
        } catch (error) {
          console.error('Error polling for responses:', error);
        }
      };
      
      // Start polling
      pollForResponses();
      
    } catch (error) {
      console.error('Error generating group response:', error);
      
      // Remove loading message and add error message
      setConversations(prev => {
        const chatConversation = prev[groupChatKey] || [];
        const filteredConversation = chatConversation.filter(msg => msg.id !== loadingId);
        
        return {
          ...prev,
          [groupChatKey]: [
            ...filteredConversation, 
            { type: 'system', content: 'Sorry, I encountered an error generating responses. Please try again.' }
          ]
        };
      });
    }
  };

  const switchAgent = async (agentId) => {
    // Exit group chat mode if we're switching to a specific agent
    setIsGroupChat(false);
    
    // Handle empty string or null agentId
    if (!agentId || agentId === '') {
      setCurrentAgent(null);
      setShowHome(true);
      return;
    }

    setCurrentAgent(agentId);
    setShowHome(false);
    
    // Reset boot sequence if this agent has no messages yet
    if (!conversations[agentId] || conversations[agentId].length === 0) {
      setBootSequence(true);
      setBootStep(0);
      
      // Start a new conversation for this agent
      try {
        console.log(`Starting new conversation for ${agentId}`);
        
        // Find the agent data using availableAgents
        const agentData = availableAgents.find(a => a.id === agentId);
        if (!agentData) {
          throw new Error(`Agent data not found for ${agentId}`);
        }
        
        // Use the realName from agentData
        const fullAgentName = agentData.realName;
        
        // Start a new conversation
        const conversationId = await startConversation(
          agentId,              // Pass the agent ID
          '',                   // Empty message
          false,                // Explicitly set multi_agent to false
          [fullAgentName]       // Explicitly pass the agent_list
        );
        
        console.log(`Started new conversation for ${agentId} with ID: ${conversationId}`);
        
        // Add a welcome message from the agent
        setConversations(prev => ({
          ...prev,
          [agentId]: [
            { type: 'agent', content: `Hello! I'm ${fullAgentName}. How can I help you today?`, agent: fullAgentName }
          ]
        }));
      } catch (error) {
        console.error('Error starting conversation:', error);
        // Add error message to conversation
        setConversations(prev => ({
          ...prev,
          [agentId]: [
            { type: 'system', content: 'Sorry, I encountered an error starting the conversation. Please try again.' }
          ]
        }));
      }
    }
  };
  
  const goToHome = () => {
    setShowHome(true);
    setCurrentAgent(null);
    setIsGroupChat(false);
  };

  const openGroupChatSelector = () => {
    console.log('openGroupChatSelector called');
    console.log('Current showGroupChatSelector state:', showGroupChatSelector);
    setShowGroupChatSelector(true);
    console.log('Setting showGroupChatSelector to true');
  };

  const closeGroupChatSelector = () => {
    setShowGroupChatSelector(false);
  };

  const startGroupChat = async (selectedAgents) => {
    console.log('Starting group chat with agents:', selectedAgents);
    
    try {
      // Get the full names of the selected agents
      const agentNames = selectedAgents.map(id => {
        const agent = availableAgents.find(a => a.id === id);
        return agent ? agent.realName : null;
      }).filter(Boolean);

      if (agentNames.length === 0) {
        throw new Error('No valid agents selected for group chat');
      }

      // Start a new multi-agent conversation
      const conversationId = await startConversation(
        null,              // No single agent ID for group chat
        '',                // Empty initial message
        true,              // This is a multi-agent conversation
        agentNames         // List of agent names
      );

      console.log(`Started group chat with ID: ${conversationId}`);
      
      // Set the selected agents
      setGroupChatAgents(selectedAgents);
      
      // Set group chat mode
      setIsGroupChat(true);
      
      // Set current agent to group_chat
      setCurrentAgent('group_chat');
      
      // Hide home screen
      setShowHome(false);
      
      // Initialize group chat conversation if it doesn't exist
      if (!conversations['group_chat']) {
        setConversations(prev => ({
          ...prev,
          'group_chat': []
        }));
      }
      
      // Add welcome message
      setConversations(prev => ({
        ...prev,
        'group_chat': [
          { 
            type: 'system', 
            content: `Welcome to the group chat with ${agentNames.join(', ')}! You can now chat with all of them simultaneously.` 
          }
        ]
      }));
    } catch (error) {
      console.error('Error starting group chat:', error);
      // Add error message to conversation
      setConversations(prev => ({
        ...prev,
        'group_chat': [
          { 
            type: 'system', 
            content: 'Sorry, I encountered an error starting the group chat. Please try again.' 
          }
        ]
      }));
    }
  };

  return {
    handleSubmit,
    generateResponse,
    generateGroupResponse,
    openGroupChatSelector,
    closeGroupChatSelector,
    messagesEndRef,
    startGroupChat,
    handleSingleAgentSubmit,
    handleGroupChatSubmit
  };
};