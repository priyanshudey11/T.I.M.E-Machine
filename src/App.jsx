// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ThemeWrapper from './ThemeWrapper';
import Lobby from './components/Lobby';
import Character from './components/Character';
import Chat from './components/Chat';
import RetroComputer from './components/RetroComputer';
import './App.css';

function App() {
  return (
    <ThemeWrapper>
      <div style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#008080' // Classic Windows 95 teal background
      }}>
        <RetroComputer>
          <Router>
            <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/character/:id" element={<Character />} />
              <Route path="/chat/:id" element={<Chat />} />
            </Routes>
          </Router>
        </RetroComputer>
      </div>
    </ThemeWrapper>
  );
}

export default App;
