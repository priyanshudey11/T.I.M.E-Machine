// src/components/RetroComputer.jsx
import React, { useEffect, useState } from 'react';
import './RetroComputer.css';
import VHSOverlay from './VHSOverlay';

const RetroComputer = ({ children }) => {
  const [poweredOn, setPoweredOn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPoweredOn(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="retro-computer">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/space_bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="screen-content">
        {!poweredOn ? (
          <div className="boot-screen">
            <img src="/time_logo.png" alt="TIME Logo" className="time-logo" />
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        ) : (
          <>
            {children}
            <VHSOverlay />
          </>
        )}
      </div>
    </div>
  );
};

export default RetroComputer;
