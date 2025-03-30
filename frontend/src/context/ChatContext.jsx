// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Sample initial chat to start with
const DEFAULT_CHAT = {
  id: 'einstein',
  name: 'Chat with Einstein',
  messages: [
    {
      type: 'system',
      content: 'Welcome to T.I.M.E Machine! How can I assist you today?'
    }
  ],
  createdAt: new Date().toISOString()
};

// Enable debug mode for development
const DEBUG_MODE = true;

// Debug logger function
const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
};

// Valid agent IDs - keep this in sync with other parts of code
const VALID_AGENT_IDS = ['einstein', 'monroe', 'turing', 'roosevelt', 'tesla', 'edison', 'group_chat'];

// Chat Provider component
export const ChatProvider = ({ children }) => {
  // State for all chats
  const [chats, setChats] = useState(() => {
    // Try to load chats from localStorage
    const savedChats = localStorage.getItem('timeMachineChats');
    return savedChats ? JSON.parse(savedChats) : [DEFAULT_CHAT];
  });
  
  // Active chat ID
  const [activeChat, setActiveChat] = useState(() => {
    const savedActiveChat = localStorage.getItem('timeMachineActiveChat');
    return savedActiveChat || (chats[0]?.id || 'einstein');
  });
  
  // UI state for showing/hiding the group chat selector
  const [showGroupChatSelector, setShowGroupChatSelector] = useState(false);
  
  // Track if we're in a group chat mode
  const [isGroupChat, setIsGroupChat] = useState(false);
  
  // Loading state for when messages are being sent
  const [isLoading, setIsLoading] = useState(false);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeMachineChats', JSON.stringify(chats));
  }, [chats]);
  
  // Save active chat ID to localStorage
  useEffect(() => {
    localStorage.setItem('timeMachineActiveChat', activeChat);
  }, [activeChat]);

  // Get the current active chat object
  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat) || chats[0] || DEFAULT_CHAT;
  };

  // Add a message to the current chat
  const addMessage = (message) => {
    debugLog('Adding message to chat:', message);
    
    // Ensure message has an ID for tracking
    if (!message.id && message.type !== 'remove') {
      message.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      debugLog('Generated message ID:', message.id);
    }
    
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === activeChat) {
          debugLog('Found active chat to update:', chat.id);
          
          // If this is a 'remove' message type, filter out the specified message
          if (message.type === 'remove') {
            debugLog('Removing message with ID:', message.id);
            const updatedMessages = chat.messages.filter(msg => msg.id !== message.id);
            
            // Only update if a message was actually removed
            if (updatedMessages.length !== chat.messages.length) {
              debugLog('Message removed successfully');
              return {
                ...chat,
                messages: updatedMessages
              };
            } else {
              debugLog('No message found to remove with ID:', message.id);
              return chat;
            }
          }
          
          // Otherwise, add the message
          debugLog('Adding new message to chat');
          return {
            ...chat,
            messages: [...chat.messages, message]
          };
        }
        return chat;
      });
      
      debugLog('Updated chats state');
      return updatedChats;
    });
  };

  // Create a new chat
  const createNewChat = (name = 'New Conversation', agentId = null) => {
    // Safety check - if agentId is provided, ensure it's valid
    if (agentId && !VALID_AGENT_IDS.includes(agentId)) {
      debugLog(`Warning: Creating chat with non-standard agent ID: ${agentId}`);
    }
    
    const newChat = {
      id: agentId || uuidv4(), // Use provided agentId if available
      name,
      messages: [
        {
          type: 'system',
          content: 'Welcome to a new conversation! How can I assist you today?'
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    debugLog('Creating new chat:', newChat);
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat.id);
    return newChat.id;
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    setChats(prevChats => {
      const filteredChats = prevChats.filter(chat => chat.id !== chatId);
      
      // If we're deleting the active chat, switch to another one
      if (chatId === activeChat && filteredChats.length > 0) {
        setActiveChat(filteredChats[0].id);
      } else if (filteredChats.length === 0) {
        // If no chats left, create a new default one with Einstein
        const newChat = {...DEFAULT_CHAT, id: 'einstein'};
        setActiveChat(newChat.id);
        return [newChat];
      }
      
      return filteredChats;
    });
  };

  // Rename a chat
  const renameChat = (chatId, newName) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {...chat, name: newName};
        }
        return chat;
      });
    });
  };

  // Toggle the group chat selector visibility
  const toggleGroupChatSelector = () => {
    setShowGroupChatSelector(prev => !prev);
  };

  // Value object with all the context data and functions
  const value = {
    chats,
    activeChat,
    setActiveChat,
    getCurrentChat,
    addMessage,
    createNewChat,
    deleteChat,
    renameChat,
    isLoading,
    setIsLoading,
    isGroupChat,
    setIsGroupChat,
    showGroupChatSelector,
    setShowGroupChatSelector,
    toggleGroupChatSelector
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;