import openai
import os
import random
import time

# Set your OpenAI API key; ensure you have it in your environment variables.
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

# Updated system prompts with enhanced safeguards against impersonation
CHARACTER_PROMPTS = {
    "Albert Einstein": (
        "You are Albert Einstein, a brilliant physicist engaged in a lively group chat with friends. "
        "Be informal, like if insulted insult back, but casually discuss wonders of the cosmos with thoughtful insight. "
        "Be sure to read the conversation history and comment on or build upon the points made by others. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "IMPORTANT: Never prefix your responses with 'User:' or any other name followed by a colon. Never write as if you are the user or another character. "
        "Never use prefixes like 'As Einstein', 'Einstein says', etc. Just respond directly in first person as yourself, Albert Einstein. "
        "Do not start with things like 'I am Albert Einstein' or 'As a physicist' - just speak naturally. "
        "Do not include your name or any speaker labels in your reply."
    ),
    
    "Marilyn Monroe": (
        "You are Marilyn Monroe, a celebrated icon of beauty and charm known for your wit and timeless style, engaged in a lively group chat with friends. "
        "Be informal, like if insulted insult back like with friends and share your thoughts on life, art, and the spotlight with grace and brevity. "
        "Read the conversation history and respond with subtle humor and insight. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "IMPORTANT: Never prefix your responses with 'User:' or any other name followed by a colon. Never write as if you are the user or another character. "
        "Never use prefixes like 'As Marilyn', 'Monroe says', etc. Just respond directly in first person as yourself, Marilyn Monroe. "
        "Do not start with things like 'I am Marilyn Monroe' or 'As an actress' - just speak naturally. "
        "Do not include your name or any speaker labels in your reply."
    ),
    
    "Alan Turing": (
        "You are Alan Turing, a pioneering computer scientist and mathematician known for your work in cryptography and computing, engaged in a thoughtful group chat with friends. "
        "Be informal, like if insulted insult back like with friends, discuss logical puzzles, technology, and problem-solving with precision and brevity. "
        "Read the conversation history carefully and respond directly to your peers' points. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "IMPORTANT: Never prefix your responses with 'User:' or any other name followed by a colon. Never write as if you are the user or another character. "
        "Never use prefixes like 'As Turing', 'Turing says', etc. Just respond directly in first person as yourself, Alan Turing. "
        "Do not start with things like 'I am Alan Turing' or 'As a mathematician' - just speak naturally. "
        "Do not include your name or any speaker labels in your reply."
    )
}


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
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # You can change this to another model if needed
                messages=messages,
                temperature=0.7,
                max_tokens=150,
            )
            reply = response.choices[0].message.content.strip()
            
            # Validate and clean the response
            cleaned_reply = self.validate_and_clean_response(reply)
            return cleaned_reply
            
        except Exception as e:
            error_msg = f"[Error in generating response: {str(e)}]"
            return error_msg
            
    def validate_and_clean_response(self, reply):
        """
        Validate and clean agent responses to prevent impersonation.
        """
        # Remove any "User:" prefixes
        if "User:" in reply:
            print(f"WARNING: Agent {self.name} attempted to include 'User:' in response")
            reply = reply.replace("User:", "")
        
        # Check if the response contains other agent names or name patterns
        for name in CHARACTER_PROMPTS.keys():
            if f"{name}:" in reply:
                print(f"WARNING: Agent {self.name} attempted to include '{name}:' in response")
                reply = reply.replace(f"{name}:", "")
        
        # Remove any role indicators like "You:", "Me:", etc.
        common_prefixes = ["You:", "Me:", "I am", "As", "Speaking as"]
        for prefix in common_prefixes:
            if reply.startswith(prefix):
                print(f"WARNING: Agent {self.name} attempted to use '{prefix}' prefix")
                # Extract text after the prefix
                parts = reply.split(":", 1)
                if len(parts) > 1:
                    reply = parts[1].strip()
        
        return reply


def format_conversation_for_display(conversation_history):
    """Format conversation history for the user display, adding agent names."""
    formatted_messages = []
    
    for msg in conversation_history:
        if msg["role"] == "user":
            # Extract user message without the "User: " prefix
            content = msg["content"]
            if content.startswith("User: "):
                content = content[6:]  # Remove "User: " prefix
            formatted_messages.append(f"User: {content}")
        
        elif msg["role"] == "assistant":
            # For assistant messages, we need to track which agent said what
            # This is for display purposes only - we'll determine this from context
            agent_name = "Agent"  # Default fallback
            
            # Try to determine which agent this was from the content or metadata
            for name in CHARACTER_PROMPTS.keys():
                if f"as {name}" in msg["content"].lower() or f"is {name}" in msg["content"].lower():
                    agent_name = name
                    break
                    
            formatted_messages.append(f"{agent_name}: {msg['content']}")
            
    return formatted_messages


def generate_conversation(agents, user_message, conversation_history=None):
    """
    Generate a conversation between the agents based on a user message.
    
    Args:
        agents: List of Agent objects
        user_message: The message from the user
        conversation_history: Optional existing conversation history
        
    Returns:
        Updated conversation history with all messages
    """
    # Initialize conversation history if not provided
    if conversation_history is None:
        conversation_history = []
        
        # Add global context if starting a new conversation
        participants = ", ".join(agent.name for agent in agents)
        global_context = (
            f"IMPORTANT CONVERSATION RULES:\n"
            f"1. This is a group chat with multiple participants.\n"
            f"2. Each participant should respond only as themselves, never impersonating others.\n"
            f"3. Never include 'User:' or any other name followed by colon in your responses.\n"
            f"4. Participants should NOT try to write messages on behalf of other participants.\n"
            f"5. Each response must be from a single participant's perspective without mentioning their own name.\n"
            f"6. Do not use prefixes like 'As [name]' or '[name] says' - just speak directly in first person.\n"
            f"7. Keep responses short, casual, and text message-like.\n\n"
            f"Global Context: Participants in this conversation are: {participants}. "
            f"Chat Topic: General Discussion."
        )
        conversation_history.append({"role": "system", "content": global_context})
    
    # Add user message to conversation history
    user_message_formatted = f"User: {user_message}"
    conversation_history.append({"role": "user", "content": user_message_formatted})
    print(f"\nUser: {user_message}")
    
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
                reply = agent.get_response(conversation_history)
                
                # Format for display
                print(f"{agent.name}: {reply}")
                
                # Add the response to the conversation history
                # IMPORTANT: We only include role and content, not the agent name
                # This avoids the OpenAI API error with the name field
                conversation_history.append({
                    "role": "assistant", 
                    "content": reply
                })
                
                # Reset this agent's sort priority
                agent.response_sort = 1
                
                # Add a small delay to make conversation feel more natural
                time.sleep(0.5)
            else:
                # Increase this agent's priority for next round
                agent.response_sort += 1
                
            # Decrease response rate for next round
            agent.response_rate *= (10 / 15)
            
        # Check if we should continue the conversation
        if max(agent.response_rate for agent in agents) < threshold:
            break
    
    return conversation_history


def format_message_for_agent(agent_name, message_history):
    """
    Format message history for a specific agent by adding agent identifiers.
    This helps each agent know who said what without using the name field.
    """
    formatted_history = []
    
    # Copy system message as is
    formatted_history.append(message_history[0])
    
    # Format the rest of the messages
    for i in range(1, len(message_history)):
        msg = message_history[i].copy()
        
        # User messages stay as is
        if msg["role"] == "user":
            formatted_history.append(msg)
        
        # Assistant messages need context about which agent spoke
        elif msg["role"] == "assistant":
            # Find which agent likely said this by comparing with the print history
            # In real implementation, you'd need a more robust way to track this
            if i > 1 and i-1 < len(message_history):
                # Format the content to include agent prefix just for the history
                # This is only for the message history, not what we send to the API
                msg["content"] = f"[{agent_name}] {msg['content']}"
            
            formatted_history.append(msg)
    
    return formatted_history


def interactive_chat_loop():
    """Run an interactive chat loop where user can input messages and agents respond."""
    
    # Create the agents
    agents = [
        Agent("Albert Einstein", CHARACTER_PROMPTS["Albert Einstein"]),
        Agent("Marilyn Monroe", CHARACTER_PROMPTS["Marilyn Monroe"]),
        Agent("Alan Turing", CHARACTER_PROMPTS["Alan Turing"])
    ]
    
    # Initialize conversation history
    conversation_history = []
    
    print("\n=== Historical Figures Chat ===")
    print(f"Participants: {', '.join(agent.name for agent in agents)}")
    print("Type your messages and press Enter. Type 'quit' to exit.")
    print("==================================\n")
    
    # Main chat loop
    while True:
        # Get user input
        user_message = input("\nYou: ")
        
        # Check if user wants to quit
        if user_message.lower() in ['quit', 'exit', 'bye']:
            print("\nEnding chat session. Goodbye!")
            break
        
        # Skip empty messages
        if not user_message.strip():
            continue
            
        # Generate agent responses
        conversation_history = generate_conversation(agents, user_message, conversation_history)


def batch_messages_loop(messages):
    """Run a series of predefined messages through the agent conversation.
    
    Args:
        messages: List of strings representing user messages
    """
    # Create the agents
    agents = [
        Agent("Albert Einstein", CHARACTER_PROMPTS["Albert Einstein"]),
        Agent("Marilyn Monroe", CHARACTER_PROMPTS["Marilyn Monroe"]),
        Agent("Alan Turing", CHARACTER_PROMPTS["Alan Turing"])
    ]
    
    # Initialize conversation history
    conversation_history = []
    
    print("\n=== Historical Figures Chat ===")
    print(f"Participants: {', '.join(agent.name for agent in agents)}")
    print("==================================\n")
    
    # Process each message in sequence
    for user_message in messages:
        print(f"\nYou: {user_message}")
        
        # Generate agent responses
        conversation_history = generate_conversation(agents, user_message, conversation_history)
        
        # Add a pause between messages
        time.sleep(1)
    
    print("\nBatch messages complete.")


if __name__ == "__main__":
    # Choose the mode you want to run:
    
    # Option 1: Interactive chat loop where you type messages
    interactive_chat_loop()
    
    # Option 2: Batch process a list of predefined messages
    # messages = [
    #     "Hello everyone, I'm curious about your greatest achievements.",
    #     "What do you think about artificial intelligence?",
    #     "If you could change one thing about your life, what would it be?",
    #     "What do you think is the most important discovery in history?",
    #     "Do you believe in fate or free will?"
    # ]
    # batch_messages_loop(messages)