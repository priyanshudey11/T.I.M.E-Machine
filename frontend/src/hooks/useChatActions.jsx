import { useRef, useState, useEffect, useCallback } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import availableAgents from '../utils/agentData.jsx';
import * as chatService from '../services/chatService.js';

export const useChatActions = () => {
  const [inputValue, setInputValue] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const { 
    addMessage,
    getCurrentChat,
    isLoading,
    setIsLoading,
    setActiveChat,
    setShowGroupChatSelector,
    showGroupChatSelector,
    toggleGroupChatSelector: contextToggleGroupChatSelector,
    createNewChat,
    setIsGroupChat,
    isGroupChat,
    chats
  } = useChat();
  
  const messagesEndRef = useRef(null);

  // Process new responses from the backend
  const handleNewResponses = useCallback((responses) => {
    console.log("Received responses to process:", responses);
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.warn("Received empty or invalid responses array");
      return;
    }
    
    // Process each response one by one
    responses.forEach(response => {
      console.log("Processing response:", response);
      
      // Ensure we have content and agent name
      if (!response.content) {
        console.warn("Response missing content:", response);
        return;
      }
      
      // Extract agent name and fix formatting if needed
      let agentName = response.agent || "Unknown";
      
      // Format content (remove trailing ellipsis if present)
      let content = response.content;
      if (content.endsWith('...')) {
        content = content.slice(0, -3); // Remove trailing ellipsis
      }
      
      // Add the message to the chat
      addMessage({
        type: 'agent',
        content: content,
        agent: agentName,
        timestamp: new Date().toISOString(),
        id: `agent_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      });
      
      console.log(`Added message from ${agentName}: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`);
    });
  }, [addMessage]);

  // Setup polling for responses when conversation ID changes
  useEffect(() => {
    // Clear existing polling if any
    setIsPolling(false);
    
    if (!currentConversationId) {
      console.log("No conversation ID to poll for");
      return;
    }
    
    // Short delay before starting to poll to prevent race conditions
    const timer = setTimeout(() => {
      console.log("Starting polling for conversation:", currentConversationId);
      setIsPolling(true);
      
      try {
        chatService.pollForResponses(
          currentConversationId,
          handleNewResponses,
          15,  // Max 15 polling attempts
          1000  // Poll every second
        );
      } catch (error) {
        console.error("Error setting up polling:", error);
        setApiError(`Failed to get responses: ${error.message}`);
        setIsPolling(false);
      }
    }, 300);
    
    return () => {
      console.log("Cleaning up polling");
      clearTimeout(timer);
      setIsPolling(false);
    };
  }, [currentConversationId, handleNewResponses]);

  // Helper to remove loading message
  const removeLoadingMessage = useCallback((loadingId) => {
    console.log(`Attempting to remove loading message with ID: ${loadingId}`);
    
    const currentChat = getCurrentChat();
    if (!currentChat) {
      console.warn("Cannot remove loading message - no current chat found");
      return;
    }
    
    console.log("Current chat messages:", currentChat.messages);
    
    // Find the loading message
    const loadingMessage = currentChat.messages.find(msg => 
      msg.id === loadingId && msg.type === 'loading'
    );
    
    if (!loadingMessage) {
      console.warn(`Loading message with ID ${loadingId} not found`);
      return;
    }
    
    console.log(`Found loading message to remove: ${loadingMessage.content}`);
    
    // Use the remove message type to remove the loading message
    addMessage({
      type: 'remove',
      id: loadingId
    });
    
    console.log(`Removed loading message with ID: ${loadingId}`);
  }, [getCurrentChat, addMessage]);

  // Add a helper function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    console.log('Manually scrolling to bottom');
    // Try different scroll methods to ensure it works
    
    // Method 1: Using messagesEndRef
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
    
    // Method 2: Using querySelector
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }
  }, [messagesEndRef]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Get message from form or state
    let message = '';
    if (e.target && e.target.elements && e.target.elements.message) {
      message = e.target.elements.message.value;
    } else {
      message = inputValue;
    }
    
    if (!message || !message.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: message
    });

    // Ensure scroll to bottom after adding user message
    setTimeout(scrollToBottom, 50);

    // Add loading indicator
    const loadingMessageId = Date.now().toString();
    addMessage({
      id: loadingMessageId,
      type: 'loading',
      content: 'Typing...'
    });

    // Ensure scroll to bottom after adding loading indicator
    setTimeout(scrollToBottom, 50);

    // Clear the input field
    setInputValue('');

    setIsLoading(true);

    try {
      const currentChat = getCurrentChat();
      console.log("Current chat:", currentChat);
      console.log("Is group chat:", isGroupChat);
      console.log("Current conversation ID:", currentConversationId);
      
      // Validate the agent ID
      const validAgentIds = ['einstein', 'monroe', 'turing', 'roosevelt', 'tesla', 'edison', 'group_chat'];
      if (!isGroupChat && !validAgentIds.includes(currentChat.id)) {
        throw new Error(`Invalid agent ID: ${currentChat.id}. Please select a valid agent.`);
      }
      
      if (isGroupChat) {
        // Group chat conversation
        let response;
        if (currentConversationId) {
          // Continue group chat
          response = await chatService.continueConversation(message, currentConversationId);
          console.log("Continued group chat:", response);
        } else {
          // Start a new group chat
          const agentNames = getSelectedAgentNames();
          console.log("Starting new group chat with agents:", agentNames);
          
          response = await chatService.startConversation(
            null,
            message,
            true,  // multi-agent
            agentNames
          );
          
          console.log("Started new group chat:", response);
          
          if (response.conversation_id) {
            setCurrentConversationId(response.conversation_id);
          }
        }
      } else {
        // Single agent chat
        if (currentConversationId) {
          // Continue conversation with agent
          console.log("Continuing conversation with agent:", currentConversationId);
          const response = await chatService.continueConversation(message, currentConversationId);
          console.log("Continued conversation:", response);
        } else {
          // Start a new conversation with this agent
          console.log("Starting new conversation with agent:", currentChat.id);
          
          const response = await chatService.startConversation(
            currentChat.id,
            message
          );
          
          console.log("Started new conversation:", response);
          
          if (response.conversation_id) {
            setCurrentConversationId(response.conversation_id);
          }
        }
      }
      
      // Remove loading message (responses will be added via polling)
      removeLoadingMessage(loadingMessageId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message
      removeLoadingMessage(loadingMessageId);
      
      // Set error state
      setApiError(`Error: ${error.message}`);
      
      // Add error message
      addMessage({
        type: 'system',
        content: `Sorry, I encountered an error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get names of selected agents for group chat
  const getSelectedAgentNames = () => {
    if (!isGroupChat) return [];
    
    // For simplicity, just return all agent names for now
    // In a real app, you'd track which agents are selected
    return availableAgents.map(agent => agent.realName);
  };

  // Switch to a specific agent chat
  const switchAgent = async (agentId) => {
    console.log(`Switching to agent: ${agentId}`);
    setApiError(null);
    
    // Handle empty string or null agentId
    if (!agentId) {
      return;
    }

    // Validate the agent ID
    const validAgentIds = ['einstein', 'monroe', 'turing', 'roosevelt', 'tesla', 'edison', 'group_chat'];
    if (!validAgentIds.includes(agentId)) {
      console.error(`Invalid agent ID: ${agentId}`);
      setApiError(`Error: Invalid agent ID: ${agentId}. Please select a valid agent.`);
      return;
    }

    setActiveChat(agentId);
    // Reset conversation ID when switching agents
    setCurrentConversationId(null);
    
    // If switching to a group chat
    if (agentId === 'group_chat') {
      setIsGroupChat(true);
    } else {
      setIsGroupChat(false);
    }
    
    // Check if we need to create initial messages for this agent
    const currentChat = getCurrentChat();
    
    if (!currentChat.messages || currentChat.messages.length === 0) {
      // Find the agent's name
      const agent = availableAgents.find(a => a.id === agentId);
      if (agent) {
        // Start a new conversation with the backend
        try {
          const response = await chatService.startConversation(
            agentId,
            '',  // Empty initial message
            false  // Not multi-agent
          );
          
          console.log("Started new conversation on agent switch:", response);
          
          if (response.conversation_id) {
            setCurrentConversationId(response.conversation_id);
          }
          
          // Add a welcome message
          addMessage({
            type: 'agent',
            content: `Hello! I'm ${agent.name}. How can I help you today?`,
            agent: agent.name
          });
        } catch (error) {
          console.error('Error starting conversation with agent:', error);
          setApiError(`Error: ${error.message}`);
          addMessage({
            type: 'system',
            content: `Sorry, I encountered an error starting the conversation: ${error.message}`
          });
        }
      }
    }
  };

  // Handle creating a new chat
  const startNewChat = () => {
    const newChatId = createNewChat();
    setCurrentConversationId(null);
    setApiError(null);
    return newChatId;
  };

  // Toggle the group chat selector
  const toggleGroupChatSelector = () => {
    contextToggleGroupChatSelector();
  };

  // Open the group chat selector
  const openGroupChatSelector = () => {
    console.log('Opening group chat selector from useChatActions');
    
    // Check if group_chat already exists, if not create it
    const existingGroupChat = chats.find(chat => chat.id === 'group_chat');
    if (!existingGroupChat) {
      console.log("No group chat found, creating one with ID: group_chat");
      createNewChat('Group Chat', 'group_chat');
    }
    
    setIsGroupChat(true);
    setShowGroupChatSelector(true);
  };

  // Close the group chat selector
  const closeGroupChatSelector = () => {
    setShowGroupChatSelector(false);
  };

  // Start a group chat with selected agents
  const startGroupChat = async (selectedAgents) => {
    console.log('Starting group chat with agents:', selectedAgents);
    setApiError(null);
    
    // Create a new chat with ID 'group_chat' to ensure it's recognized properly
    const newChatId = 'group_chat';
    
    // Get agent names for the backend
    const agentNames = selectedAgents.map(id => {
      const agent = availableAgents.find(a => a.id === id);
      return agent ? agent.realName : null;
    }).filter(Boolean);
    
    console.log("Selected agent names for backend:", agentNames);
    
    // Create a chat with a proper name showing all selected agents
    let chatName = 'Group Chat: ';
    if (agentNames.length > 0) {
      chatName += agentNames.join(', ');
    }
    
    // Check if a group chat already exists
    const existingGroupChat = chats.find(chat => chat.id === 'group_chat');
    
    if (existingGroupChat) {
      console.log("Group chat already exists, using existing chat");
      setActiveChat('group_chat');
      setIsGroupChat(true);
    } else {
      console.log("Creating new group chat with ID:", newChatId);
      createNewChat(chatName, newChatId);
      setIsGroupChat(true);
      setActiveChat(newChatId);
    }
    
    if (agentNames.length > 0) {
      try {
        // Start a multi-agent conversation on the backend
        const response = await chatService.startConversation(
          null,
          'Hello everyone! Let\'s chat.',  // Initial greeting
          true,  // Set multi-agent to true
          agentNames
        );
        
        console.log("Started group chat:", response);
        
        if (response.conversation_id) {
          setCurrentConversationId(response.conversation_id);
          
          // Add the user's initial message
          addMessage({
            type: 'user',
            content: 'Hello everyone! Let\'s chat.'
          });
          
          // Add welcome message
          addMessage({
            type: 'system',
            content: `Starting a group chat with ${agentNames.join(', ')}!`
          });
        }
      } catch (error) {
        console.error('Error starting group chat:', error);
        setApiError(`Error: ${error.message}`);
        addMessage({
          type: 'system',
          content: `Sorry, I encountered an error starting the group chat: ${error.message}`
        });
      }
    } else {
      setApiError("Please select at least one agent for the group chat.");
      addMessage({
        type: 'system',
        content: "Please select at least one agent for the group chat."
      });
    }
    
    // Close the selector
    closeGroupChatSelector();
    
    return newChatId;
  };

  return {
    handleSubmit,
    messagesEndRef,
    startNewChat,
    toggleGroupChatSelector,
    switchAgent,
    openGroupChatSelector,
    closeGroupChatSelector,
    startGroupChat,
    inputValue,
    setInputValue,
    currentConversationId,
    apiError
  };
}; 