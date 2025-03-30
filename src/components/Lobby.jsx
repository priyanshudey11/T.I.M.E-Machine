// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import { Window, WindowHeader, WindowContent, Button, ScrollView } from 'react95';
import Lottie from 'lottie-react';
import TitleBar from './TitleBar';
import './Lobby.css';

const historicalFigures = [
  { id: 'tesla', name: 'Nikola Tesla', online: true },
  { id: 'edison', name: 'Thomas Edison', online: false },
  { id: 'einstein', name: 'Albert Einstein', online: true },
  { id: 'monroe', name: 'Marilyn Monroe', online: true },
  { id: 'roosevelt', name: 'Theodore Roosevelt', online: false },
];

const placeholderImage = 'https://via.placeholder.com/80';

const Lobby = () => {
  const [einsteinAnim, setEinsteinAnim] = useState(null);

  useEffect(() => {
    fetch('/albert_idle.json')
      .then((res) => res.json())
      .then((data) => setEinsteinAnim(data));
  }, []);

  return (
    <div className="lobby-page">
      <TitleBar />
      <div className="lobby-container">
        {/* Left Members Panel */}
        <div className="members-panel">
          <Window
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <WindowHeader>
              <span style={{ color: 'yellow' }}>👥 Members</span>
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
                <div className="members-grid">
                  {historicalFigures.map((member) => (
                    <div key={member.id} className="member-card">
                      <div className="member-name">{member.name}</div>
                      {member.id === 'einstein' && einsteinAnim ? (
                        <Lottie
                          animationData={einsteinAnim}
                          loop
                          autoplay
                          style={{ width: 80, height: 80 }}
                        />
                      ) : (
                        <img src={placeholderImage} alt={member.name} />
                      )}
                      <div className="member-status-container">
                        <span
                          className={`status-circle ${member.online ? 'online' : 'offline'}`}
                        ></span>
                        <div className="member-status">
                          {member.online ? 'Online' : 'Offline'}
                        </div>
                      </div>
                      {!member.online && (
                        <div className="last-seen">Last seen in 1492</div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollView>
            </WindowContent>
          </Window>
        </div>

        {/* Right Chats Panel */}
        <div className="chats-panel">
          <Window
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <WindowHeader>
              <span style={{ color: 'yellow' }}>💬 Chats</span>
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
                <Button
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    backgroundColor: '#00aaff',
                    color: '#fff'
                  }}
                >
                  New Chat
                </Button>
                <div className="chat-list">
                  <Button
                    style={{
                      width: '100%',
                      marginBottom: '0.5rem',
                      backgroundColor: '#ff9900',
                      color: '#fff',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <div className="chat-info">
                      <h4>Chat with Tesla</h4>
                      <p>See you soon!</p>
                    </div>
                  </Button>
                  <Button
                    style={{
                      width: '100%',
                      marginBottom: '0.5rem',
                      backgroundColor: '#ff9900',
                      color: '#fff',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <div className="chat-info">
                      <h4>Chat with Edison</h4>
                      <p>Let’s innovate.</p>
                    </div>
                  </Button>
                </div>
              </ScrollView>
            </WindowContent>
          </Window>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
