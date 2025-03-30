// src/services/chatService.js
// Service for communicating with the T.I.M.E. Machine backend

// Use direct URL to backend instead of proxy
const API_BASE_URL = 'http://localhost:8000';

// Map our frontend IDs to the backend expected format
const AGENT_ID_MAPPING = {
  'einstein': 'Albert Einstein',
  'monroe': 'Marilyn Monroe',
  'turing': 'Alan Turing',
  'roosevelt': 'Theodore Roosevelt',
  'tesla': 'Nikola Tesla',
  'edison': 'Thomas Alva Edison'
};

/**
 * Convert our frontend agent ID to the backend expected format
 * @param {string} agentId - The frontend agent ID
 * @returns {string} - The corresponding backend agent name
 */
const getAgentNameForBackend = (agentId) => {
  return AGENT_ID_MAPPING[agentId] || agentId;
};

/**
 * Start a new conversation with a specific agent or a group of agents
 * @param {string} agentId - The ID of the agent (single-agent mode)
 * @param {string} message - Initial message to send
 * @param {boolean} isMultiAgent - Whether this is a multi-agent conversation
 * @param {Array<string>} agentList - List of agent names for multi-agent mode
 * @returns {Promise<Object>} - The conversation information
 */
export const startConversation = async (agentId, message, isMultiAgent = false, agentList = []) => {
  try {
    // Validate agent ID if provided
    if (agentId && !['einstein', 'monroe', 'turing', 'roosevelt', 'tesla', 'edison', 'group_chat'].includes(agentId)) {
      throw new Error(`Invalid agent ID: ${agentId}`);
    }
    
    // Convert agent ID to backend format if it's a single agent conversation
    const backendAgentId = agentId ? getAgentNameForBackend(agentId) : null;
    
    // Make sure agent names in agent list are in the correct format
    const formattedAgentList = agentList.map(agent => 
      AGENT_ID_MAPPING[agent] || agent
    );
    
    console.log("Starting conversation with:", {
      agent_id: backendAgentId,
      message: message,
      multi_agent: isMultiAgent,
      agent_list: formattedAgentList,
    });
    
    const response = await fetch(`${API_BASE_URL}/start_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'omit', // Don't send cookies
      mode: 'cors', // Enable CORS
      body: JSON.stringify({
        agent_id: backendAgentId,
        message: message,
        multi_agent: isMultiAgent,
        agent_list: formattedAgentList,
      }),
    });

    // If the response is not OK
    if (!response.ok) {
      // Try to parse as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use text
        const text = await response.text();
        throw new Error(`Failed with status ${response.status}: ${text || 'No response'}`);
      }
      throw new Error(errorData.error || `Failed with status ${response.status}`);
    }

    // Try to parse response JSON
    try {
      return await response.json();
    } catch (e) {
      const text = await response.text();
      console.log("Response text:", text);
      // Return a valid response object anyway
      return { 
        conversation_id: `temp_${Date.now()}`,
        status: 'processing'
      };
    }
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};

/**
 * Continue an existing conversation with a new message
 * @param {string} message - The message to send
 * @param {string} conversationId - The ID of the conversation to continue
 * @returns {Promise<Object>} - The updated conversation information
 */
export const continueConversation = async (message, conversationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/continue_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'omit', // Don't send cookies
      mode: 'cors', // Enable CORS
      body: JSON.stringify({
        conversation_id: conversationId,
        message: message,
      }),
    });

    // If the response is not OK
    if (!response.ok) {
      // Try to parse as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use text
        const text = await response.text();
        throw new Error(`Failed with status ${response.status}: ${text || 'No response'}`);
      }
      throw new Error(errorData.error || `Failed with status ${response.status}`);
    }

    // Try to parse response JSON
    try {
      return await response.json();
    } catch (e) {
      console.log("Failed to parse JSON response:", e);
      // Return a valid response object anyway
      return { 
        conversation_id: conversationId,
        status: 'processing'
      };
    }
  } catch (error) {
    console.error('Error continuing conversation:', error);
    throw error;
  }
};

/**
 * Get responses for an ongoing conversation
 * @param {string} conversationId - The ID of the conversation
 * @returns {Promise<Object>} - The responses
 */
export const getResponses = async (conversationId) => {
  try {
    const url = `${API_BASE_URL}/get_responses/${conversationId}`;
    console.log(`Fetching responses from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'omit', // Don't send cookies
      mode: 'cors', // Enable CORS
    });

    console.log(`Response status: ${response.status}`);
    
    // If the response is not OK
    if (!response.ok) {
      // Try to parse as JSON
      let errorData;
      try {
        errorData = await response.json();
        console.error("Error response JSON:", errorData);
      } catch (e) {
        // If parsing fails, use text
        const text = await response.text();
        console.error("Error response text:", text);
        throw new Error(`Failed with status ${response.status}: ${text || 'No response'}`);
      }
      throw new Error(errorData.error || `Failed with status ${response.status}`);
    }

    // Try to parse response JSON
    try {
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      // Manually parse JSON to avoid issues
      const data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
      
      // Fix any potential issues with the response format
      if (!data.responses) {
        console.warn("Response missing 'responses' field, adding empty array");
        data.responses = [];
      }
      
      return data;
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      // Return empty responses as fallback
      return { 
        conversation_id: conversationId,
        responses: [],
        has_more: false
      };
    }
  } catch (error) {
    console.error('Error getting responses:', error);
    throw error;
  }
};

/**
 * Send a message to a specific agent (convenience method)
 * @param {string} agentId - The ID of the agent
 * @param {string} message - The message to send
 * @param {string} conversationId - Optional conversation ID for existing conversations
 * @returns {Promise<Object>} - The conversation information
 */
export const sendAgentMessage = async (agentId, message, conversationId = null) => {
  try {
    if (!conversationId) {
      // Start a new conversation
      return await startConversation(agentId, message);
    } else {
      // Continue existing conversation
      return await continueConversation(message, conversationId);
    }
  } catch (error) {
    console.error('Error sending message to agent:', error);
    throw error;
  }
};

/**
 * Poll for responses until there are no more
 * @param {string} conversationId - The ID of the conversation
 * @param {function} onNewResponses - Callback for when new responses are received
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 10)
 * @param {number} interval - Interval between polls in ms (default: 1000)
 */
export const pollForResponses = async (
  conversationId,
  onNewResponses,
  maxAttempts = 10,
  interval = 1000
) => {
  let attempts = 0;
  let emptyResponseCount = 0;
  
  const poll = async () => {
    if (attempts >= maxAttempts) {
      console.log(`Reached max polling attempts (${maxAttempts}), stopping poll.`);
      return;
    }
    
    try {
      console.log(`Polling for responses (attempt ${attempts+1}/${maxAttempts})...`);
      const data = await getResponses(conversationId);
      console.log("Got response data:", data);
      
      if (data.responses && data.responses.length > 0) {
        console.log(`Received ${data.responses.length} responses`);
        // Call the callback with new responses
        onNewResponses(data.responses);
        
        // Reset empty response counter since we got responses
        emptyResponseCount = 0;
        
        // Continue polling for more responses
        setTimeout(poll, interval);
      } else {
        attempts++;
        emptyResponseCount++;
        console.log(`No responses received, empty count: ${emptyResponseCount}`);
        
        // Continue polling for a while even with empty responses
        // This is important because the backend might still be generating
        if (emptyResponseCount < 10) {
          setTimeout(poll, interval);
        } else {
          console.log("Too many empty responses, stopping poll.");
        }
      }
    } catch (error) {
      console.error('Error polling for responses:', error);
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, interval * 2); // Increase interval on error
      }
    }
  };
  
  // Start polling
  poll();
};

export default {
  startConversation,
  continueConversation,
  getResponses,
  sendAgentMessage,
  pollForResponses
}; 