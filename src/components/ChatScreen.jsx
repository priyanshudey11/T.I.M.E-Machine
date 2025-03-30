import React, { useState } from 'react';
import { Window, WindowHeader, WindowContent, Button, ScrollView, TextField } from 'react95';
import TitleBar from './TitleBar';
import './ChatScreen.css';

const people = [
  { 
    id: 'tesla', 
    name: 'Nikola Tesla', 
    status: '⚡️ Online', 
    lastMessage: 'AC is the future!',
    avatar: 'https://via.placeholder.com/80'
  },
  { 
    id: 'edison', 
    name: 'Thomas Edison', 
    status: '💡 Online', 
    lastMessage: 'Let\'s light up the world!',
    avatar: 'https://via.placeholder.com/80'
  },
  { 
    id: 'einstein', 
    name: 'Albert Einstein', 
    status: '🌌 Online', 
    lastMessage: 'E=mc² is just the beginning',
    avatar: 'https://via.placeholder.com/80'
  },
  { 
    id: 'roosevelt', 
    name: 'Theodore Roosevelt', 
    status: '🦁 Offline', 
    lastMessage: 'Speak softly and carry a big stick',
    avatar: 'https://via.placeholder.com/80'
  }
];

const ChatScreen = () => {
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'character', text: `Hey! I'm ${selectedPerson.name}! 👋 What's up?` }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: inputMessage }]);
    
    // Simulate character response
    setTimeout(() => {
      if (isGroupChat) {
        // Group chat responses
        const responses = [
          "Everyone's talking about this!",
          "Let's discuss this together!",
          "Great topic for the group!",
          "What do you all think?",
          "Interesting perspective!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { sender: 'group', text: randomResponse }]);
      } else {
        // Individual chat responses
        const responses = [
          "Cool story!",
          "Tell me more!",
          "Interesting!",
          "Love it!",
          "Go on..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { sender: 'character', text: randomResponse }]);
      }
    }, 1000);

    setInputMessage('');
  };

  const toggleGroupChat = () => {
    setIsGroupChat(!isGroupChat);
    if (!isGroupChat) {
      setMessages([{ sender: 'group', text: "Welcome to the group chat! 🎉 Everyone's here!" }]);
    } else {
      setMessages([{ sender: 'character', text: `Hey! I'm ${selectedPerson.name}! 👋 What's up?` }]);
    }
  };

  return (
    <div className="chat-screen">
      <TitleBar />
      <div className="chat-container">
        {/* Left Avatars Panel */}
        <div className="avatars-panel">
          <Window
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <WindowContent
              style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}
            >
              <ScrollView style={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>
                <div className="avatars-list">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className={`avatar-card ${selectedPerson.id === person.id ? 'selected' : ''}`}
                      onClick={() => {
                        if (!isGroupChat) {
                          setSelectedPerson(person);
                          setMessages([{ sender: 'character', text: `Hey! I'm ${person.name}! 👋 What's up?` }]);
                        }
                      }}
                    >
                      <img src={person.avatar} alt={person.name} className="avatar-image" />
                      <div className="avatar-status">{person.status}</div>
                    </div>
                  ))}
                </div>
                <button 
                  className={`group-chat-button ${isGroupChat ? 'active' : ''}`}
                  onClick={toggleGroupChat}
                >
                  {isGroupChat ? 'Exit Group Chat' : 'Start Group Chat'}
                </button>
              </ScrollView>
            </WindowContent>
          </Window>
        </div>

        {/* Right Chat Panel */}
        <div className="chat-panel">
          <Window
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <WindowHeader>
              <span style={{ color: 'yellow' }}>
                {isGroupChat ? '👥 Group Chat' : `💬 Chat with ${selectedPerson.name}`}
              </span>
            </WindowHeader>
            <WindowContent
              style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                padding: 0,
                margin: 0
              }}
            >
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.sender}`}>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <TextField
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isGroupChat ? "Type a message for everyone..." : "Type your message..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </WindowContent>
          </Window>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen; 