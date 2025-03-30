// Chat service for handling AI responses and chat history storage

// Constants
const STORAGE_KEY = 'time_machine_conversations';
const BACKEND_URL = 'http://localhost:5000'; // Python backend URL

// Map frontend agent IDs to backend agent names (exactly as they appear in Chat_main.py)
const AGENT_MAPPING = {
  'einstein': 'Albert Einstein',
  'monroe': 'Marilyn Monroe',
  'turing': 'Alan Turing'
};

// Logging utility
const log = {
  info: (message, data = null) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  debug: (message, data = null) => {
    console.debug(`[DEBUG] ${message}`, data || '');
  }
};

// API status tracking
let apiStatus = 'unknown'; // 'online', 'offline', 'unknown'
let currentConversationId = null;

// Check API connectivity
const checkApiStatus = async () => {
  try {
    log.info('Checking API status');
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    apiStatus = response.ok ? 'online' : 'offline';
    log.info(`API status: ${apiStatus}`);
    return apiStatus;
  } catch (error) {
    log.error('API check failed:', error);
    apiStatus = 'offline';
    return apiStatus;
  }
};

// Get current API status
const getApiStatus = () => {
  return apiStatus;
};

// Start a new conversation - can be single or multi-agent
const startConversation = async (agentId = null, message = '', isMultiAgent = false, agentList = null) => {
  try {
    log.info(`Starting new ${isMultiAgent ? 'multi-agent' : 'single-agent'} conversation`);
    
    // Build the payload
    const payload = {
      multi_agent: isMultiAgent,
      message: message || '' // Ensure message is never null
    };
    
    // If agentList is provided, use it directly
    if (agentList && Array.isArray(agentList) && agentList.length > 0) {
      payload.agent_list = agentList;
      log.debug(`Using explicit agent_list: ${agentList}`);
    }
    // Otherwise, add agent_id if this is a single-agent conversation
    else if (!isMultiAgent && agentId) {
      const fullAgentName = AGENT_MAPPING[agentId.toLowerCase()];
      if (!fullAgentName) {
        throw new Error(`Invalid agent ID: ${agentId}`);
      }
      payload.agent_id = fullAgentName;
      
      // Also add the agent_list for redundancy
      payload.agent_list = [fullAgentName];
    }
    
    log.debug('Start conversation payload:', payload);
    
    const response = await fetch(`${BACKEND_URL}/start_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Backend error: ${response.status}`, errorText);
      throw new Error(`Failed to start conversation: ${response.status}`);
    }

    const data = await response.json();
    currentConversationId = data.conversation_id;
    log.info(`Started conversation with ID: ${currentConversationId}`);
    return currentConversationId;
  } catch (error) {
    log.error('Error starting conversation:', error);
    throw error;
  }
};

// Get responses for the current conversation
const getResponses = async (conversationId = null) => {
  const convId = conversationId || currentConversationId;
  
  if (!convId) {
    throw new Error('No active conversation');
  }

  try {
    log.info(`Fetching responses for conversation: ${convId}`);
    const response = await fetch(`${BACKEND_URL}/get_responses/${convId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Failed to get responses: ${response.status}`);
    }

    const data = await response.json();
    log.debug('Received responses:', data);
    return data;
  } catch (error) {
    log.error('Error getting responses:', error);
    throw error;
  }
};

// Send a message to a specific agent (single-agent mode)
const sendAgentMessage = async (agentId, message, conversationId = null, forceNewConversation = true) => {
  try {
    // Get the full agent name
    const fullAgentName = AGENT_MAPPING[agentId.toLowerCase()];
    if (!fullAgentName) {
      throw new Error(`Invalid agent ID: ${agentId}`);
    }
    
    log.info(`Sending message to agent: ${fullAgentName}`);
    
    // Prepare the request body
    const body = {
      agent: fullAgentName,
      message: message,
      multi_agent: false,
      agent_list: [fullAgentName],
      force_new_conversation: forceNewConversation
    };
    
    // Only include conversation_id if we have one and aren't forcing a new one
    if (conversationId && !forceNewConversation) {
      body.conversation_id = conversationId;
    }
    
    log.debug('Request body:', body);
    
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Backend error: ${response.status}`, errorText);
      throw new Error(`Failed to send message: ${response.status}`);
    }

    // Update API status on successful response
    apiStatus = 'online';
    
    // Get the conversation ID from the response
    const data = await response.json();
    currentConversationId = data.conversation_id;
    
    // Start polling for responses
    return pollResponses(currentConversationId);
  } catch (error) {
    log.error('Error sending message:', error);
    apiStatus = 'offline';
    throw error;
  }
};

// Continue an existing multi-agent conversation
const continueConversation = async (message, conversationId = null) => {
  const convId = conversationId || currentConversationId;
  
  if (!convId) {
    throw new Error('No active conversation');
  }

  try {
    log.info(`Continuing conversation: ${convId}`);
    const response = await fetch(`${BACKEND_URL}/continue_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: convId,
        message: message
      }),
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Backend error: ${response.status}`, errorText);
      throw new Error(`Failed to continue conversation: ${response.status}`);
    }

    // Update API status on successful response
    apiStatus = 'online';
    
    // Start polling for responses
    return pollResponses(convId);
  } catch (error) {
    log.error('Error continuing conversation:', error);
    apiStatus = 'offline';
    throw error;
  }
};

// Poll for new responses
const pollResponses = async (conversationId = null, maxAttempts = 10) => {
  const convId = conversationId || currentConversationId;
  
  if (!convId) {
    throw new Error('No active conversation ID for polling');
  }
  
  let attempts = 0;
  const pollInterval = 500; // 0.5 second
  let allResponses = [];

  const poll = async () => {
    try {
      const data = await getResponses(convId);
      
      // Check if we have any responses
      if (data.responses && data.responses.length > 0) {
        // Add these responses to our collection
        allResponses = [...allResponses, ...data.responses];
        return allResponses; // Return immediately if we have responses
      }
      
      // Continue polling if there might be more responses
      if (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        return poll();
      }
      
      return allResponses;
    } catch (error) {
      log.error('Error polling responses:', error);
      throw error;
    }
  };

  return poll();
};

// Save conversations to localStorage
const saveConversations = (conversations) => {
  try {
    log.info('Saving conversations to localStorage');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return true;
  } catch (error) {
    log.error('Error saving conversations:', error);
    return false;
  }
};

// Load conversations from localStorage
const loadConversations = () => {
  try {
    log.info('Loading conversations from localStorage');
    const saved = localStorage.getItem(STORAGE_KEY);
    const conversations = saved ? JSON.parse(saved) : {};
    
    // Filter out conversations for agents that no longer exist
    const filteredConversations = {};
    Object.keys(AGENT_MAPPING).forEach(agentId => {
      if (conversations[agentId]) {
        filteredConversations[agentId] = conversations[agentId];
      }
    });
    
    log.debug('Filtered conversations:', filteredConversations);
    return filteredConversations;
  } catch (error) {
    log.error('Error loading conversations:', error);
    return {};
  }
};

// Clear all conversations
const clearConversations = () => {
  try {
    log.info('Clearing all conversations');
    localStorage.removeItem(STORAGE_KEY);
    currentConversationId = null;
    return true;
  } catch (error) {
    log.error('Error clearing conversations:', error);
    return false;
  }
};

// Initialize by checking API status
const initialize = async () => {
  await checkApiStatus();
  return apiStatus;
};

// Reset the current conversation ID
const resetConversationId = () => {
  currentConversationId = null;
};

export {
  sendAgentMessage,
  getResponses,
  startConversation,
  continueConversation,
  saveConversations,
  loadConversations,
  clearConversations,
  checkApiStatus,
  getApiStatus,
  initialize,
  resetConversationId
};