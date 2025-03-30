// src/components/Character.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Window, WindowHeader, WindowContent, Button, ScrollView, TextField } from 'react95';
import Lottie from 'lottie-react';
import TitleBar from './TitleBar';
import './Character.css';

const characterDetails = {
  tesla: { 
    name: 'Nikola Tesla', 
    bio: '⚡️ Made electricity cool before it was cool',
    image: 'https://via.placeholder.com/150',
    achievements: [
      '⚡️ AC Power',
      '🎮 Wireless Tech',
      '🔋 Tesla Coil',
      '📡 Radio'
    ]
  },
  edison: { 
    name: 'Thomas Edison', 
    bio: '💡 The OG inventor who lit up the world',
    image: 'https://via.placeholder.com/150',
    achievements: [
      '💡 Light Bulb',
      '🎵 Phonograph',
      '🎬 Movies',
      '⚡️ Power Plant'
    ]
  },
  einstein: { 
    name: 'Albert Einstein', 
    bio: '🌌 Made physics sexy with E=mc²',
    image: 'https://via.placeholder.com/150',
    achievements: [
      '🌍 Relativity',
      '🔬 Photoelectric',
      '⚛️ Atoms',
      '🎯 Nobel Prize'
    ]
  },
  roosevelt: { 
    name: 'Theodore Roosevelt', 
    bio: '🦁 President who made nature cool',
    image: 'https://via.placeholder.com/150',
    achievements: [
      '🌲 National Parks',
      '⚓️ Panama Canal',
      '🏆 Peace Prize',
      '📚 35+ Books'
    ]
  }
};

const Character = () => {
  const { id } = useParams();
  const character = characterDetails[id];
  const [einsteinAnim, setEinsteinAnim] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'character', text: `Hey! I'm ${character.name}! 👋 What's up?` }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  React.useEffect(() => {
    if (id === 'einstein') {
      fetch('/albert_idle.json')
        .then((res) => res.json())
        .then((data) => setEinsteinAnim(data));
    }
  }, [id]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: inputMessage }]);
    
    // Simulate character response
    setTimeout(() => {
      const responses = [
        "Cool story!",
        "Tell me more!",
        "Interesting!",
        "Love it!",
        "Go on..."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { sender: 'character', text: randomResponse }]);
    }, 1000);

    setInputMessage('');
  };

  if (!character) return <p>Character not found.</p>;

  return (
    <div className="character-page">
      <TitleBar />
      <div className="character-container">
        {/* Left Character Panel */}
        <div className="character-panel">
          <Window
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <WindowHeader>
              <span style={{ color: 'yellow' }}>👤 {character.name}</span>
            </WindowHeader>
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
                <div className="character-profile">
                  {id === 'einstein' && einsteinAnim ? (
                    <Lottie
                      animationData={einsteinAnim}
                      loop
                      autoplay
                      style={{ width: 150, height: 150 }}
                    />
                  ) : (
                    <img src={character.image} alt={character.name} className="character-image" />
                  )}
                  <h2>{character.name}</h2>
                  <p className="character-bio">{character.bio}</p>
                  <h3>🏆 Achievements</h3>
                  <ul className="achievements-list">
                    {character.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                </div>
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
              <span style={{ color: 'yellow' }}>💬 Chat</span>
            </WindowHeader>
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
                <div className="chat-messages">
                  {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender}`}>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollView>
              <div className="chat-input">
                <TextField
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
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

export default Character;
