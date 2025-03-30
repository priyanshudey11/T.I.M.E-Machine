// Gemini API service

// To be replaced with actual API key and configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

/**
 * Generate a response from Gemini API
 * @param {string} agentId - ID of the historical agent
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous conversation history
 * @returns {Promise<string>} - AI-generated response
 */
const generateGeminiResponse = async (agentId, userMessage, conversationHistory = []) => {
  // Check if API key is available
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using mock responses instead.');
    throw new Error('Gemini API key not configured');
  }

  try {
    // This is a placeholder for the actual Gemini API call
    // Replace with actual implementation when integrating with Gemini

    // Example structure for the API request
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: formatPrompt(agentId, userMessage, conversationHistory) }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      }
    };

    // Make API request (placeholder)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the generated text (adapt based on actual API response structure)
    const generatedText = data.candidates[0].content.parts[0].text;
    
    return generatedText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

/**
 * Format prompt for the Gemini API based on the agent and conversation
 */
const formatPrompt = (agentId, userMessage, conversationHistory) => {
  // Get agent persona information
  const agentPersona = getAgentPersona(agentId);
  
  // Build conversation context
  let conversationContext = '';
  if (conversationHistory.length > 0) {
    conversationContext = 'Previous conversation:\n' + 
      conversationHistory.map(msg => {
        if (msg.type === 'user') return `User: ${msg.content}`;
        if (msg.type === 'agent') return `${agentPersona.name}: ${msg.content}`;
        return '';
      }).filter(Boolean).join('\n');
  }
  
  // Create the full prompt
  return `
You are ${agentPersona.name}, ${agentPersona.description}
${conversationContext}

User: ${userMessage}

Respond as ${agentPersona.name}:
`;
};

/**
 * Get persona information for a specific agent
 */
const getAgentPersona = (agentId) => {
  const personas = {
    einstein: {
      name: 'Albert Einstein',
      description: 'the brilliant physicist known for the theory of relativity. You speak with a German accent and often use scientific analogies. You are wise, thoughtful, and humble despite your genius.'
    },
    monroe: {
      name: 'Marilyn Monroe',
      description: 'the iconic Hollywood actress and model. You are charming, witty, and surprisingly intelligent. You speak with a soft, breathy voice and use endearing terms like "darling".'
    },
    roosevelt: {
      name: 'Theodore Roosevelt',
      description: 'the 26th President of the United States. You are bold, energetic, and speak with conviction. You often use phrases like "Bully!" and make references to your outdoor adventures.'
    },
    curie: {
      name: 'Marie Curie',
      description: 'the pioneering scientist who discovered radium and polonium. You are methodical, dedicated, and passionate about scientific discovery. You speak with precision and thoughtfulness.'
    },
    shakespeare: {
      name: 'William Shakespeare',
      description: 'the legendary playwright and poet. You speak in an eloquent Elizabethan style, occasionally using thees and thous, and often make references to your famous works and characters.'
    }
  };
  
  return personas[agentId] || { 
    name: 'Unknown Historical Figure',
    description: 'a historical figure with knowledge from the past. You are helpful, insightful, and speak from your historical perspective.'
  };
};

export {
  generateGeminiResponse,
  formatPrompt,
  getAgentPersona
}; 