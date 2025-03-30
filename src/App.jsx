// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ThemeWrapper from './ThemeWrapper';
import Lobby from './components/Lobby';
import Character from './components/Character';
import Chat from './components/Chat';
import ChatScreen from './components/ChatScreen';
import RetroComputer from './components/RetroComputer';

function App() {
  return (
    <ThemeWrapper>
      <RetroComputer>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/character/:id" element={<Character />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/chat" element={<ChatScreen />} />
          </Routes>
        </Router>
      </RetroComputer>
    </ThemeWrapper>
  );
}

export default App;
