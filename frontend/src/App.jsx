// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import ThemeWrapper from './ThemeWrapper.jsx';
import Lobby from './components/Lobby.jsx';
import Character from './components/Character.jsx';
import Chat from './components/Chat.jsx';
import RetroComputer from './components/RetroComputer.jsx';
import GroupChatSelector from './components/GroupChatSelector.jsx';
import { ChatProvider, useChat } from './context/ChatContext.jsx';
import './App.css';

// Remove scroll bars
const GlobalStyles = createGlobalStyle`
  body::-webkit-scrollbar {
    display: none;
  }
  body {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Component wrapper to access context
function AppContent() {
  const { showGroupChatSelector } = useChat();
  
  return (
    <ThemeWrapper>
      <GlobalStyles />
      <Router>
        <div style={{ 
          minHeight: '100vh', 
          width: '100vw', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#008080',
          position: 'relative'
        }}>
          {/* Group chat selector */}
          {showGroupChatSelector && <GroupChatSelector />}
          
          {/* Routes */}
          <Routes>
            <Route path="/" element={
              <RetroComputer>
                <Lobby />
              </RetroComputer>
            } />
            <Route path="/character/:id" element={
              <RetroComputer>
                <Character />
              </RetroComputer>
            } />
            <Route path="/chat/:id" element={
              <RetroComputer>
                <Chat />
              </RetroComputer>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeWrapper>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
