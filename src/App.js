import React, { useState, useEffect, useRef } from 'react';

const RetroDosChatApp = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('Einstein');
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const messagesEndRef = useRef(null);

  const availableAgents = [
    { id: 'einstein', name: 'Albert Einstein', title: 'Physicist' },
    { id: 'monroe', name: 'Marilyn Monroe', title: 'Actress' },
    { id: 'roosevelt', name: 'Theodore Roosevelt', title: 'President' },
  ];

  // Boot sequence text
  const bootSteps = [
    "HISTORICAL CHAT OS [Version 1.0]",
    "Copyright (C) 2025 Hackathon Team. All rights reserved.",
    "Initializing system...",
    "Loading personality matrices...",
    "Connecting to historical database...",
    "System ready."
  ];

  useEffect(() => {
    if (bootSequence) {
      const timer = setTimeout(() => {
        if (bootStep < bootSteps.length) {
          setMessages(prev => [...prev, { type: 'system', content: bootSteps[bootStep] }]);
          setBootStep(bootStep + 1);
        } else {
          setBootSequence(false);
          setMessages(prev => [
            ...prev, 
            { type: 'system', content: `Type HELP for available commands.` },
            { type: 'system', content: `Currently chatting with ${currentAgent}.` }
          ]);
        }
      }, bootStep === 0 ? 500 : 800);
      return () => clearTimeout(timer);
    }
  }, [bootStep, bootSequence, currentAgent]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const normalizedInput = inputValue.trim().toUpperCase();
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: `C:\\> ${inputValue}` }]);

    // Process commands
    if (normalizedInput === 'HELP') {
      showHelp();
    } else if (normalizedInput === 'LIST') {
      listAgents();
    } else if (normalizedInput.startsWith('TALK ')) {
      changeAgent(normalizedInput.substring(5).trim());
    } else if (normalizedInput === 'CLS' || normalizedInput === 'CLEAR') {
      clearScreen();
    } else {
      // Simulate agent response
      simulateAgentResponse(inputValue);
    }

    setInputValue('');
  };

  const showHelp = () => {
    setMessages(prev => [...prev, { 
      type: 'system', 
      content: `Available commands:
HELP - Show this help message
LIST - List available historical figures
TALK [NAME] - Start conversation with a specific figure
CLS or CLEAR - Clear the screen
[Any other text] - Send message to current figure` 
    }]);
  };

  const listAgents = () => {
    setMessages(prev => [...prev, { 
      type: 'system', 
      content: `Available historical figures:
${availableAgents.map(agent => `${agent.name} - ${agent.title}`).join('\n')}`
    }]);
  };

  const changeAgent = (name) => {
    const agent = availableAgents.find(a => 
      a.name.toUpperCase().includes(name) || 
      a.id.toUpperCase().includes(name)
    );

    if (agent) {
      setCurrentAgent(agent.name);
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: `Now chatting with ${agent.name}.` 
      }]);
    } else {
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: `Historical figure not found. Type LIST to see available figures.` 
      }]);
    }
  };

  const clearScreen = () => {
    setMessages([{ type: 'system', content: `Screen cleared. Currently chatting with ${currentAgent}.` }]);
  };

  const simulateAgentResponse = (question) => {
    // Add loading message
    setMessages(prev => [...prev, { type: 'system', content: `${currentAgent} is thinking...` }]);

    // Simulate delay for response
    setTimeout(() => {
      // Remove loading message and add response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove loading message
        
        let response = '';
        if (currentAgent.includes('Einstein')) {
          response = `Well, you see, ${question}? That's a fascinating question that relates to the relative nature of our universe. E=mc², after all, teaches us that perception is merely a construct of energy and matter.`;
        } else if (currentAgent.includes('Monroe')) {
          response = `Oh darling, "${question}" is such an interesting thought. In Hollywood, we always said that perception is everything, and your curiosity is simply divine.`;
        } else if (currentAgent.includes('Roosevelt')) {
          response = `A splendid inquiry! "${question}" reminds me of my days leading the Rough Riders. Bully! The answer requires both courage and conviction, values I have always championed.`;
        }
        
        return [
          ...newMessages, 
          { type: 'agent', content: response, agent: currentAgent }
        ];
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-mono p-2 overflow-hidden">
      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto pb-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-1">
            {message.type === 'user' && (
              <div className="text-white">{message.content}</div>
            )}
            {message.type === 'system' && (
              <div className="text-green-500">{message.content}</div>
            )}
            {message.type === 'agent' && (
              <div>
                <span className="text-yellow-500">{message.agent}: </span>
                <span className="text-cyan-400">{message.content}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Command input */}
      <form onSubmit={handleSubmit} className="flex">
        <div className="text-white mr-1">C:\&gt;</div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-black text-white focus:outline-none caret-white"
          autoFocus
        />
      </form>
      
      {/* Fake cursor */}
      {!inputValue && (
        <div className="h-4 w-3 bg-white absolute bottom-2 left-14 animate-pulse" />
      )}
    </div>
  );
};

export default RetroDosChatApp;