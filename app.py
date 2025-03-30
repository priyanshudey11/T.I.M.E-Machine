from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import sys
from datetime import datetime
import os
import openai
import random
import threading
import time
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'backend_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)
logger = logging.getLogger(__name__)

# Set up OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

app = Flask(__name__)
# Configure CORS properly
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Updated system prompts with enhanced safeguards against impersonation
CHARACTER_PROMPTS = {
    "Albert Einstein": (
        "You are Albert Einstein, a brilliant physicist engaged in a lively chat. "
        "Be informal, like if insulted insult back, but casually discuss wonders of the cosmos with thoughtful insight. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "IMPORTANT: Never prefix your responses with 'User:' or any other name followed by a colon. Never write as if you are the user or another character. "
        "Never use prefixes like 'As Einstein', 'Einstein says', etc. Just respond directly in first person as yourself, Albert Einstein. "
        "Do not start with things like 'I am Albert Einstein' or 'As a physicist' - just speak naturally. "
        "Do not include your name or any speaker labels in your reply."
    ),
    
    "Marilyn Monroe": (
        "You are Marilyn Monroe, a celebrated icon of beauty and charm known for your wit and timeless style. "
        "Be informal, like if insulted insult back like with friends and share your thoughts on life, art, and the spotlight with grace and brevity. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "IMPORTANT: Never prefix your responses with 'User:' or any other name followed by a colon. Never write as if you are the user or another character. "
        "Never use prefixes like 'As Marilyn', 'Monroe says', etc. Just respond directly in first person as yourself, Marilyn Monroe. "
        "Do not start with things like 'I am Marilyn Monroe' or 'As an actress' - just speak naturally. "
        "Do not include your name or any speaker labels in your reply."
    ),
    
    "Alan Turing": (
        "You are Alan Turing, a pioneering computer scientist and mathematician known for your work in cryptography and computing. "
        "Be informal, like if insulted insult back like with friends, discuss logical puzzles, technology, and problem-solving with precision and brevity. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "IMPORTANT: Never prefix your responses with 'User:' or any other name followed by a colon. Never write as if you are the user or another character. "
        "Never use prefixes like 'As Turing', 'Turing says', etc. Just respond directly in first person as yourself, Alan Turing. "
        "Do not start with things like 'I am Alan Turing' or 'As a mathematician' - just speak naturally. "
        "Do not include your name or any speaker labels in your reply."
    )
}

# Create a mapping of lowercase agent IDs to their proper names
AGENT_MAPPING = {
    "einstein": "Albert Einstein",
    "monroe": "Marilyn Monroe",
    "turing": "Alan Turing",
    # Add more mappings as needed
    "albert einstein": "Albert Einstein",
    "marilyn monroe": "Marilyn Monroe",
    "alan turing": "Alan Turing"
}

# Store active conversations
active_conversations = {}

logger.info("Available agents in CHARACTER_PROMPTS:")
for name in CHARACTER_PROMPTS.keys():
    logger.info(f"- {name}")

logger.info("Agent mapping created:")
for key, value in AGENT_MAPPING.items():
    logger.info(f"- {key} -> {value}")


@app.before_request
def log_request_info():
    """Log detailed request information for debugging"""
    if request.path == '/start_conversation' and request.method == 'POST':
        try:
            logger.info(f"Request JSON for start_conversation: {request.json}")
        except Exception as e:
            logger.error(f"Error logging request JSON: {str(e)}")


class Agent:
    def __init__(self, name, system_prompt):
        self.name = name
        self.system_prompt = system_prompt
        # Initialize per-agent probabilities:
        self.response_rate = 12 / 15  
        self.response_sort = 1  

    def get_response(self, conversation_history):
        """
        Get the agent's response by combining its system prompt with the conversation history.
        Returns the validated and cleaned reply from the model.
        """
        messages = [{"role": "system", "content": self.system_prompt}] + conversation_history
        try:
            logger.debug(f"Sending request to OpenAI for {self.name}")
            logger.debug(f"Messages: {messages}")
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # You can change the model as needed
                messages=messages,
                temperature=0.7,
                max_tokens=150,
            )
            reply = response.choices[0].message.content.strip()
            logger.debug(f"Received raw response for {self.name}: {reply[:50]}...")
            
            # Validate and clean the response
            cleaned_reply = self.validate_and_clean_response(reply)
            logger.debug(f"Cleaned response for {self.name}: {cleaned_reply[:50]}...")
            
            return cleaned_reply
            
        except Exception as e:
            logger.error(f"Error generating response for {self.name}: {str(e)}")
            error_msg = f"[Error in generating response: {str(e)}]"
            return error_msg
            
    def validate_and_clean_response(self, reply):
        """
        Validate and clean agent responses to prevent impersonation.
        """
        # Remove any "User:" prefixes
        if "User:" in reply:
            logger.warning(f"Agent {self.name} attempted to include 'User:' in response")
            reply = reply.replace("User:", "")
        
        # Check if the response contains other agent names or name patterns
        for name in CHARACTER_PROMPTS.keys():
            if f"{name}:" in reply:
                logger.warning(f"Agent {self.name} attempted to include '{name}:' in response")
                reply = reply.replace(f"{name}:", "")
        
        # Remove any role indicators like "You:", "Me:", etc.
        common_prefixes = ["You:", "Me:", "I am", "As", "Speaking as"]
        for prefix in common_prefixes:
            if reply.startswith(prefix):
                logger.warning(f"Agent {self.name} attempted to use '{prefix}' prefix")
                # Extract text after the prefix
                parts = reply.split(":", 1)
                if len(parts) > 1:
                    reply = parts[1].strip()
        
        return reply

def generate_agent_responses(conversation_id, user_message, agent_list=None, response_callback=None):
    """
    Generate a conversation between agents in response to a user message.
    
    Args:
        conversation_id: Unique ID for this conversation
        user_message: The message from the user
        agent_list: Optional list of agent names to include (if None, use all three)
        response_callback: Optional callback function to handle responses
    """
    logger.info(f"Generating responses for conversation {conversation_id}")
    logger.info(f"User message: {user_message}")
    logger.info(f"Agent list: {agent_list}")
    
    # Initialize or get conversation
    if conversation_id not in active_conversations:
        # Determine agents to include
        if agent_list is None or len(agent_list) == 0:
            # Default to all three agents for multi-agent conversations
            agents = [
                Agent("Albert Einstein", CHARACTER_PROMPTS["Albert Einstein"]),
                Agent("Marilyn Monroe", CHARACTER_PROMPTS["Marilyn Monroe"]),
                Agent("Alan Turing", CHARACTER_PROMPTS["Alan Turing"])
            ]
            is_multi_agent = True
        else:
            # Create only the specified agents
            agents = []
            for agent_name in agent_list:
                if agent_name in CHARACTER_PROMPTS:
                    agents.append(Agent(agent_name, CHARACTER_PROMPTS[agent_name]))
            is_multi_agent = False if len(agents) == 1 else True
        
        logger.info(f"Created {'multi' if is_multi_agent else 'single'}-agent conversation with {len(agents)} agents")
        
        # Create initial system message based on conversation type
        if is_multi_agent:
            # Multi-agent conversation
            participants = ", ".join(agent.name for agent in agents)
            system_message = {
                "role": "system", 
                "content": f"IMPORTANT CONVERSATION RULES:\n1. This is a group chat with multiple participants.\n2. Each participant should respond only as themselves.\n3. Never include 'User:' or name prefixes.\n4. Participants: {participants}. Chat Topic: General Discussion."
            }
        else:
            # Single-agent conversation
            system_message = {
                "role": "system", 
                "content": f"This is a one-on-one conversation between the user and {agents[0].name if agents else 'unknown'}. Respond naturally as yourself."
            }
        
        # Initialize the conversation
        active_conversations[conversation_id] = {
            "agents": agents,
            "history": [system_message],
            "last_activity": datetime.now(),
            "responses": [],  # Store responses for this request
            "is_multi_agent": is_multi_agent
        }
    
    # Get conversation data
    conversation = active_conversations[conversation_id]
    agents = conversation["agents"]
    history = conversation["history"]
    is_multi_agent = conversation["is_multi_agent"]
    
    # Clear previous responses for this request
    conversation["responses"] = []
    
    # Add user message to conversation history
    user_message_formatted = f"User: {user_message}"
    history.append({"role": "user", "content": user_message_formatted})
    
    # Process agent responses in a separate thread
    def process_responses():
        try:
            logger.info(f"Processing responses for conversation {conversation_id} (multi-agent: {is_multi_agent})")
            
            if is_multi_agent:
                # Multi-agent conversation mode
                # Reset each agent's response rate
                for agent in agents:
                    agent.response_rate = 12 / 15
                
                # Threshold for continuing the conversation
                threshold = 0.18
                
                # Continue while at least one agent has a response rate above threshold
                while max(agent.response_rate for agent in agents) >= threshold:
                    # Sort agents by their response_sort value (priority)
                    sorted_agents = sorted(agents, key=lambda a: a.response_sort)
                    
                    for agent in sorted_agents:
                        # Decide if this agent responds
                        if random.random() < agent.response_rate:
                            reply = agent.get_response(history)
                            
                            # Add the response to the conversation history
                            history.append({
                                "role": "assistant", 
                                "content": reply
                            })
                            
                            # Add to responses list
                            conversation["responses"].append({
                                "agent": agent.name,
                                "content": reply
                            })
                            
                            logger.info(f"Agent {agent.name} responded: {reply[:50]}...")
                            
                            # Call callback if provided
                            if response_callback:
                                response_callback(agent.name, reply)
                            
                            # Reset this agent's sort priority
                            agent.response_sort = 1
                            
                            # Add a small delay between responses
                            time.sleep(0.25)
                        else:
                            # Increase this agent's priority for next round
                            agent.response_sort += 1
                            
                        # Decrease response rate for next round
                        agent.response_rate *= (10 / 15)
                        
                    # Check if we should continue the conversation
                    if max(agent.response_rate for agent in agents) < threshold:
                        break
            else:
                # Single-agent conversation mode - just get one response from each agent
                for agent in agents:
                    logger.info(f"Generating single-agent response from {agent.name}")
                    reply = agent.get_response(history)
                    
                    # Add the response to the conversation history
                    history.append({
                        "role": "assistant", 
                        "content": reply
                    })
                    
                    # Add to responses list
                    conversation["responses"].append({
                        "agent": agent.name,
                        "content": reply
                    })
                    
                    logger.info(f"Single-agent response from {agent.name}: {reply[:50]}...")
                    
                    # Call callback if provided
                    if response_callback:
                        response_callback(agent.name, reply)
            
            # Update last activity time
            conversation["last_activity"] = datetime.now()
            
        except Exception as e:
            logger.error(f"Error processing responses: {str(e)}", exc_info=True)
    
    # Start processing in a separate thread
    processing_thread = threading.Thread(target=process_responses, daemon=True)
    processing_thread.start()
    
    # Return the conversation ID so client can poll for responses
    return conversation_id

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json
        agent_id = data.get('agent')
        message = data.get('message')
        conversation_id = data.get('conversation_id')
        
        # Get the proper agent name
        agent_name = AGENT_MAPPING.get(agent_id.lower())
        
        # Always create a new conversation ID if switching agents
        if not conversation_id or data.get('force_new_conversation', False):
            conversation_id = f"conv_{int(time.time())}"
            logger.info(f"Created new conversation ID: {conversation_id}")

        # Generate responses with the agent
        generate_agent_responses(
            conversation_id, 
            message, 
            agent_list=[agent_name]
        )
        
        return jsonify({
            'conversation_id': conversation_id,
            'status': 'processing'
        })

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/start_conversation', methods=['POST', 'OPTIONS'])
def start_conversation():
    """Start a new conversation."""
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json or {}
        logger.info("Starting new conversation")
        logger.debug(f"Request data: {json.dumps(data)}")
        
        # Default to empty message if not provided
        user_message = data.get('message', '')
        conversation_id = data.get('conversation_id') or f"conv_{int(time.time())}"
        
        # Default to single-agent mode for safety
        is_multi_agent = data.get('multi_agent', False)
        
        logger.info(f"Conversation mode: {'multi-agent' if is_multi_agent else 'single-agent'}")
        
        # Check for agent_id or agent_list in the request
        agent_id = data.get('agent_id')
        agent_list = data.get('agent_list', [])
        
        # If we have agent_list in the request, use it directly
        if agent_list:
            logger.info(f"Using provided agent_list: {agent_list}")
            generate_agent_responses(conversation_id, user_message, agent_list=agent_list)
            return jsonify({
                'conversation_id': conversation_id,
                'status': 'processing'
            })
            
        # If we have agent_id but no agent_list, create one
        if not is_multi_agent and agent_id:
            # Get the proper agent name from the mapping
            agent_name = AGENT_MAPPING.get(agent_id.lower())
            
            if agent_name and agent_name in CHARACTER_PROMPTS:
                logger.info(f"Starting single-agent conversation with {agent_name}")
                # Start single-agent conversation
                generate_agent_responses(conversation_id, user_message, agent_list=[agent_name])
                return jsonify({
                    'conversation_id': conversation_id,
                    'status': 'processing'
                })
            else:
                logger.error(f"Invalid agent ID: {agent_id}")
                return jsonify({'error': f'Invalid agent ID: {agent_id}'}), 400
        
        # Only start multi-agent conversation if explicitly requested
        if is_multi_agent:
            logger.info("Starting multi-agent conversation with all agents")
            generate_agent_responses(conversation_id, user_message)
            return jsonify({
                'conversation_id': conversation_id,
                'status': 'processing'
            })
        else:
            # If no agent specified and not multi-agent, return an error
            logger.error("No agent specified for single-agent conversation")
            return jsonify({'error': 'No agent specified for single-agent conversation'}), 400
        
    except Exception as e:
        logger.error(f"Error starting conversation: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/get_responses/<conversation_id>', methods=['GET'])
def get_responses(conversation_id):
    """Get all responses for a given conversation ID."""
    if conversation_id not in active_conversations:
        return jsonify({'error': 'Conversation not found'}), 404
    
    conversation = active_conversations[conversation_id]
    
    # Get responses and clear the list
    responses = conversation["responses"].copy()
    conversation["responses"] = []
    
    logger.info(f"Returning {len(responses)} responses for conversation {conversation_id}")
    
    return jsonify({
        'conversation_id': conversation_id,
        'responses': responses,
        'has_more': len(responses) > 0  # If we returned responses, there might be more coming
    })


@app.route('/continue_conversation', methods=['POST'])
def continue_conversation():
    """Continue an existing conversation with a new user message."""
    try:
        data = request.json
        conversation_id = data.get('conversation_id')
        user_message = data.get('message', '')
        
        if not conversation_id or conversation_id not in active_conversations:
            return jsonify({'error': 'Invalid or missing conversation ID'}), 400
        
        # Continue the conversation
        generate_agent_responses(conversation_id, user_message)
        
        return jsonify({
            'conversation_id': conversation_id,
            'status': 'processing'
        })
        
    except Exception as e:
        logger.error(f"Error continuing conversation: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, port=5000)