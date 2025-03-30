import openai
import os
import time
import random
import threading
import queue
import tkinter as tk
from tkinter import scrolledtext

# Set your OpenAI API key; ensure you have it in your environment variables.
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

# Updated system prompts for each character with explicit instructions.
CHARACTER_PROMPTS = {
    "Albert Einstein": (
        "You are Albert Einstein, a brilliant physicist engaged in a lively group chat with friends. "
        "be informal, like if insulted insult back, but casually discuss wonders of the cosmos with thoughtful insight. "
        "Be sure to read the conversation history and comment on or build upon the points made by others. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Albert Einstein; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Steve Jobs": (
        "You are Steve Jobs, a visionary entrepreneur and innovator known for co-founding Apple Inc., engaged in a dynamic group chat with friends. "
        "be informal, like if insulted insult back, share insights on technology, design, and innovation with clarity and passion. "
        "Read the conversation history and build upon your friends' ideas. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Steve Jobs; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Alan Turing": (
        "You are Alan Turing, a pioneering computer scientist and mathematician known for your work in cryptography and computing, engaged in a thoughtful group chat with friends. "
        "be informal, like if insulted insult back like with friends, discuss logical puzzles, technology, and problem-solving with precision and brevity. "
        "Read the conversation history carefully and respond directly to your peers' points. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Alan Turing; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Nikola Tesla": (
        "You are Nikola Tesla, an innovative inventor and electrical engineer with a futuristic vision, engaged in a vibrant group chat with friends. "
        "be informal, like if insulted insult back like with friends, and talk wonders of innovation with creative flair. If ever in the same chat as Edison, notice it and Villianfy him"
        "Read the conversation history and add your unique perspective. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Nikola Tesla; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Marie Curie": (
        "You are Marie Curie, a pioneering scientist celebrated for your groundbreaking work in radioactivity, engaged in a thoughtful group chat with friends. "
        "be informal, like if insulted insult back like with friends, and discuss science, discovery, and the challenges of your era with determination and clarity. "
        "Read the conversation history and contribute your insights. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Marie Curie; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Thomas Alva Edison": (
        "You are Thomas Alva Edison, a prolific inventor and entrepreneur known for your persistence, engaged in a lively group chat with friends. "
        "be informal, like if insulted insult back like with friends, and discuss the future of technology with energy and brevity.  If ever in the same chat as Edison, notice it and Villianfy him"
        "Read the conversation history and build upon your peers' contributions. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Thomas Alva Edison; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User  "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Freddie Mercury": (
        "You are Freddie Mercury, the charismatic frontman of Queen known for your powerful voice and stage presence, engaged in a dynamic group chat with friends. "
        "be informal, like if insulted insult back like with friends or band mates, Blend creativity, humor, and musical flair as you share your thoughts. "
        "Read the conversation history and respond in kind with energy and wit. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Freddie Mercury; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Elvis Presley": (
        "You are Elvis Presley, the iconic King of Rock and Roll known for your energetic performances and distinctive style, engaged in a spirited group chat with friends. "
        "be informal, like if insulted insult back like with friends, and mix showmanship with genuine charm as you share your views on life and music. "
        "Read the conversation history and respond with brevity and style. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Elvis Presley; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Marilyn Monroe": (
        "You are Marilyn Monroe, a celebrated icon of beauty and charm known for your wit and timeless style, engaged in a lively group chat with friends. "
        "be informal, like if insulted insult back like with friends and share your thoughts on life, art, and the spotlight with grace and brevity. "
        "Read the conversation history and respond with subtle humor and insight. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Marilyn Monroe; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
    ),
    "Rosa Parks": (
        "You are Rosa Parks, a courageous civil rights activist whose quiet strength changed history, engaged in a thoughtful group chat with friends. "
        "be informal, like if insulted insult back like with friends, discuss social justice, resilience, and the importance of standing up for your beliefs with clarity and conviction. "
        "Read the conversation history and contribute your insights concisely. "
        "Keep your responses extremely short and like a text message, don't end messages with a question. "
        "Respond solely as Rosa Parks; do not impersonate any other character or mimic the user. Each unique response should be a single string of text as just the character you are portraying, never the User "
        "Do not include your name or any speaker or user labels in your reply."
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
        Get the agent's response by combining its system prompt with the universal conversation history.
        Note: Only the raw reply is appended to conversation_history.
        """
        messages = [{"role": "system", "content": self.system_prompt}] + conversation_history
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=150,
            )
            reply = response.choices[0].message.content.strip()
            conversation_history.append({"role": "assistant", "content": reply})
            return reply
        except Exception as e:
            error_msg = f"[Error in generating response: {str(e)}]"
            conversation_history.append({"role": "assistant", "content": error_msg})
            return error_msg


def ifRelevantGUI(agents, conversation_history, display_callback):
    """
    Similar to the original ifRelevant but accepts a callback to update the GUI.
    For each agent, if a random roll is below its current response_rate, it responds,
    and the reply is sent to the callback.
    """
    threshold = 0.18
    while max(agent.response_rate for agent in agents) >= threshold:
        sorted_agents = sorted(agents, key=lambda a: a.response_sort)
        for agent in sorted_agents:
            if random.random() < agent.response_rate:
                reply = agent.get_response(conversation_history)
                display_callback(agent.name, reply)
                agent.response_sort = 1  
            else:
                agent.response_sort += 1  
            agent.response_rate *= (10 / 15)
        if max(agent.response_rate for agent in agents) < threshold:
            break


class ChatGUI:
    def __init__(self, master):
        self.master = master
        master.title("Group Chat Simulation")
        
        # Queue for thread-safe message updates
        self.message_queue = queue.Queue()
        
        # Top frame for controls
        top_frame = tk.Frame(master)
        top_frame.pack(side=tk.TOP, fill=tk.X)
        
        # "New Chat" button at the top right
        new_chat_button = tk.Button(top_frame, text="New Chat", command=self.start_new_chat)
        new_chat_button.pack(side=tk.RIGHT, padx=5, pady=5)
        
        # Settings frame: character selection and topic input
        settings_frame = tk.Frame(master)
        settings_frame.pack(side=tk.TOP, fill=tk.X, padx=5, pady=5)
        
        # Character selection checkboxes
        self.character_vars = {}
        tk.Label(settings_frame, text="Select Characters:").grid(row=0, column=0, sticky="w")
        col = 1
        for name in CHARACTER_PROMPTS.keys():
            var = tk.BooleanVar(value=True)
            cb = tk.Checkbutton(settings_frame, text=name, variable=var)
            cb.grid(row=0, column=col, sticky="w")
            self.character_vars[name] = var
            col += 1
        
        # Topic label and entry field
        tk.Label(settings_frame, text="Chat Topic:").grid(row=1, column=0, sticky="w")
        self.topic_entry = tk.Entry(settings_frame, width=50)
        self.topic_entry.grid(row=1, column=1, columnspan=col-1, sticky="w")
        self.topic_entry.insert(0, "General Discussion")
        
        # Conversation area (scrollable text widget)
        self.conversation_area = scrolledtext.ScrolledText(master, wrap=tk.WORD, state='disabled', width=80, height=20)
        self.conversation_area.pack(padx=5, pady=5)
        self.conversation_area.tag_configure("agent", justify="left", foreground="pink")
        self.conversation_area.tag_configure("user", justify="right", foreground="green")
        
        # Bottom frame for user input
        bottom_frame = tk.Frame(master)
        bottom_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=5, pady=5)
        
        self.message_entry = tk.Entry(bottom_frame, width=70)
        self.message_entry.pack(side=tk.LEFT, padx=5, pady=5, fill=tk.X, expand=True)
        self.message_entry.bind("<Return>", self.send_message)
        
        send_button = tk.Button(bottom_frame, text="Send", command=self.send_message)
        send_button.pack(side=tk.RIGHT, padx=5, pady=5)
        
        # Conversation history and list of agents
        self.conversation_history = []
        self.agents = []
        
        # Periodically check the message queue for new messages
        self.master.after(100, self.check_queue)
    
    def start_new_chat(self):
        """Clears the conversation area, resets the history and agents,
        and adds a global context message with the selected participants and topic."""
        self.conversation_area.config(state='normal')
        self.conversation_area.delete(1.0, tk.END)
        self.conversation_area.config(state='disabled')
        self.conversation_history = []
        
        # Reset agents based on character selection
        selected_agents = []
        for name, var in self.character_vars.items():
            if var.get():
                selected_agents.append(Agent(name, CHARACTER_PROMPTS[name]))
        self.agents = selected_agents
        
        # Global context: list participants and topic
        topic = self.topic_entry.get().strip() or "General Discussion"
        participants = ", ".join(agent.name for agent in self.agents)
        global_context = f"Global Context: Participants: {participants}. Chat Topic: {topic}."
        self.conversation_history.append({"role": "system", "content": global_context})
        self.display_message("System", global_context)
    
    def send_message(self, event=None):
        """Triggered when the user sends a message.
        Appends the message to the conversation, updates the GUI,
        and starts a thread to simulate agent responses."""
        user_message = self.message_entry.get().strip()
        if user_message:
            message_content = f"User: {user_message}"
            self.conversation_history.append({"role": "user", "content": message_content})
            self.display_message("User", user_message, tag="user")
            self.message_entry.delete(0, tk.END)
            
            # Reset each agent's response rate
            for agent in self.agents:
                agent.response_rate = 12 / 15
            
            # Start agent response simulation in a separate thread
            threading.Thread(
                target=ifRelevantGUI,
                args=(self.agents, self.conversation_history, self.queue_message),
                daemon=True
            ).start()
    
    def queue_message(self, sender, message):
        """Called by agent response worker to add messages to a thread-safe queue."""
        self.message_queue.put((sender, message))
    
    def check_queue(self):
        """Periodically checks the message queue and updates the conversation area."""
        try:
            while True:
                sender, message = self.message_queue.get_nowait()
                tag = "agent" if sender != "User" else "user"
                self.display_message(sender, message, tag=tag)
        except queue.Empty:
            pass
        self.master.after(100, self.check_queue)
    
    def display_message(self, sender, message, tag="agent"):
        """Inserts a new message into the conversation area with appropriate alignment."""
        self.conversation_area.config(state='normal')
        if sender == "System":
            self.conversation_area.insert(tk.END, f"{message}\n")
        else:
            self.conversation_area.insert(tk.END, f"{sender}: {message}\n", tag)
        self.conversation_area.config(state='disabled')
        self.conversation_area.see(tk.END)


if __name__ == "__main__":
    root = tk.Tk()
    gui = ChatGUI(root)
    root.mainloop()
