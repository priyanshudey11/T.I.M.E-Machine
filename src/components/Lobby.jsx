// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import { Window, WindowHeader, WindowContent, Button, ScrollView } from 'react95';
import Lottie from 'lottie-react';
import TitleBar from './TitleBar';
import './Lobby.css';

const historicalFigures = [
  { id: 'einstein', name: 'Albert Einstein', online: true, anim: 'einstein', daysOnline: 5 },
  { id: 'marilyn', name: 'Marilyn Monroe', online: true, anim: 'marilyn', daysOnline: 3 },
  { id: 'teddy', name: 'Teddy Roosevelt', online: true, anim: 'teddy', daysOnline: 7 },
  { id: 'tesla', name: 'Nikola Tesla', online: true, anim: 'tesla', daysOnline: 4 },
  { id: 'edison', name: 'Thomas Edison', online: true, anim: 'edison', daysOnline: 6 },
  { id: 'napoleon', name: 'Napoleon Bonaparte', online: false, deathYear: 1821 },
  { id: 'lincoln', name: 'Abraham Lincoln', online: false, deathYear: 1865 },
  { id: 'cleopatra', name: 'Cleopatra VII', online: false, deathYear: "30 BC" },
  { id: 'socrates', name: 'Socrates', online: false, deathYear: "399 BC" },
];

const placeholderImage = 'https://via.placeholder.com/120';

const Lobby = () => {
  const [einsteinAnim, setEinsteinAnim] = useState(null);
  const [marilynAnim, setMarilynAnim] = useState(null);
  const [teddyAnim, setTeddyAnim] = useState(null);
  const [teslaAnim, setTeslaAnim] = useState(null);
  const [edisonAnim, setEdisonAnim] = useState(null);
  const [offlineAnim, setOfflineAnim] = useState(null);

  useEffect(() => {
    // Fetch online animations
    fetch('/albert_idle.json')
      .then((res) => res.json())
      .then((data) => setEinsteinAnim(data));
    fetch('/marilyn_idle.json')
      .then((res) => res.json())
      .then((data) => setMarilynAnim(data));
    fetch('/teddy_idle.json')
      .then((res) => res.json())
      .then((data) => setTeddyAnim(data));
    fetch('/tesla_idle.json')
      .then((res) => res.json())
      .then((data) => setTeslaAnim(data));
    fetch('/edison_idle.json')
      .then((res) => res.json())
      .then((data) => setEdisonAnim(data));
    // Fetch the offline animation for offline members
    fetch('/offline_idle.json')
      .then((res) => res.json())
      .then((data) => setOfflineAnim(data));
  }, []);

  const handleMemberClick = (member) => {
    console.log(`Clicked on ${member.name}`);
  };

  // Return the correct animation for each member:
  const getAnimationForMember = (member) => {
    if (member.online) {
      if (member.anim === 'einstein') return einsteinAnim;
      if (member.anim === 'marilyn') return marilynAnim;
      if (member.anim === 'teddy') return teddyAnim;
      if (member.anim === 'tesla') return teslaAnim;
      if (member.anim === 'edison') return edisonAnim;
    } else {
      return offlineAnim;
    }
    return null;
  };

  return (
    <div className="lobby-page">
      <TitleBar />
      <div className="lobby-container">
        {/* Left Members Panel */}
        <div className="members-panel">
          <Window style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <WindowHeader>
              <span style={{ color: 'yellow' }}>👥 Members</span>
            </WindowHeader>
            <WindowContent style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <ScrollView style={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>
                <div className="members-grid">
                  {historicalFigures.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className="member-card"
                      onClick={() => handleMemberClick(member)}
                    >
                      <div className="member-name">{member.name}</div>
                      <div className="avatar-animation">
                        {getAnimationForMember(member) ? (
                          <Lottie
                            animationData={getAnimationForMember(member)}
                            loop
                            autoplay
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <img src={placeholderImage} alt={member.name} style={{ width: '100%', height: '100%' }} />
                        )}
                      </div>
                      <div className="member-status-container">
                        <span className={`status-circle ${member.online ? 'online' : 'offline'}`}></span>
                        <div className="member-status">{member.online ? 'Online' : 'Offline'}</div>
                      </div>
                      {member.online ? (
                        <div className="last-seen">For {member.daysOnline} days</div>
                      ) : (
                        <div className="last-seen">Last seen in {member.deathYear}</div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollView>
            </WindowContent>
          </Window>
        </div>

        {/* Right Chats Panel (unchanged) */}
        <div className="chats-panel">
          <Window style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <WindowHeader>
              <span style={{ color: 'yellow' }}>💬 Chats</span>
            </WindowHeader>
            <WindowContent style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <ScrollView style={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>
                <Button
                  className="new-chat-button"
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
