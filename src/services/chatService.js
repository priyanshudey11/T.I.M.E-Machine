// Chat service for handling AI responses and chat history storage
import { generateGeminiResponse } from './geminiService';

// Constants
const STORAGE_KEY = 'time_machine_conversations';

// Mock responses from characters (fallback when Gemini API is unavailable)
const getMockResponse = (agentId, question) => {
  switch (agentId) {
    case 'einstein':
      return `Well, you see, "${question}"? That's a fascinating question that relates to the relative nature of our universe. E=mc², after all, teaches us that perception is merely a construct of energy and matter.`;
    case 'monroe':
      return `Oh darling, "${question}" is such an interesting thought. In Hollywood, we always said that perception is everything, and your curiosity is simply divine.`;
    case 'roosevelt':
      return `A splendid inquiry! "${question}" reminds me of my days leading the Rough Riders. Bully! The answer requires both courage and conviction, values I have always championed.`;
    case 'curie':
      return `Your question about "${question}" is intriguing. In my research, I've found that pursuing knowledge with persistence often leads to unexpected discoveries, much like my work with radioactivity.`;
    case 'shakespeare':
      return `"${question}", you ask? To ponder such questions is the very essence of our mortal coil. What light through yonder window breaks upon this subject? 'Tis but the reflection of our shared human experience.`;
    default:
      return `I'm sorry, I don't have a specific answer to "${question}". Would you like to know more about something else?`;
  }
};

// Try to use Gemini API, with fallback to mock responses
const generateAIResponse = async (agentId, question, conversationHistory = []) => {
  try {
    // Try to use Gemini API first
    return await generateGeminiResponse(agentId, question, conversationHistory);
  } catch (error) {
    console.log('Falling back to mock responses:', error.message);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockResponse(agentId, question));
      }, 1500);
    });
  }
};

// Save conversations to localStorage
const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error('Error saving conversations:', error);
    return false;
  }
};

// Load conversations from localStorage
const loadConversations = () => {
  try {
    const storedConversations = localStorage.getItem(STORAGE_KEY);
    return storedConversations ? JSON.parse(storedConversations) : null;
  } catch (error) {
    console.error('Error loading conversations:', error);
    return null;
  }
};

// Clear all stored conversations
const clearConversations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing conversations:', error);
    return false;
  }
};

// Filter conversation history to prepare for Gemini API
const prepareConversationHistory = (messages) => {
  // Filter out system and loading messages, keep only user and agent messages
  return messages.filter(msg => ['user', 'agent'].includes(msg.type));
};

export {
  generateAIResponse,
  saveConversations,
  loadConversations,
  clearConversations,
  prepareConversationHistory
}; 