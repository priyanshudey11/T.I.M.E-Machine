// src/components/ComputerFrame.jsx
import React from 'react';
import './ComputerFrame.css';

const ComputerFrame = ({ children }) => {
  return (
    <div className="computer-frame">
      {/* Container for TIME.exe UI – adjust these dimensions to match your transparent screen */}
      <div className="time-ui">
        {children}
      </div>
      {/* Full-screen overlay computer image */}
      <img src="/computer.png" alt="Computer Overlay" className="computer-overlay" />
    </div>
  );
};

export default ComputerFrame;
