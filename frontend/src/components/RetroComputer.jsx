// src/components/RetroComputer.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './RetroComputer.css';
import VHSOverlay from './VHSOverlay';

const RetroComputer = ({ children }) => {
  const [poweredOn, setPoweredOn] = useState(false);
  const screenContentRef = useRef(null);
  const location = useLocation();
  const scrollKey = `scroll_${location.pathname}`;

  // Boot sequence
  useEffect(() => {
    const timer = setTimeout(() => setPoweredOn(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Restore scroll position when component mounts
  useEffect(() => {
    // Allow time for ref to be connected
    const timer = setTimeout(() => {
      if (screenContentRef.current) {
        try {
          const savedScrollY = localStorage.getItem(scrollKey);
          if (savedScrollY) {
            screenContentRef.current.scrollTop = parseInt(savedScrollY, 10);
          }
        } catch (e) {
          console.error("Error restoring scroll:", e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, scrollKey]);

  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (screenContentRef.current) {
          localStorage.setItem(scrollKey, screenContentRef.current.scrollTop.toString());
        }
      } catch (e) {
        console.error("Error saving scroll:", e);
      }
    };
  }, [scrollKey]);

  return (
    <div className="retro-computer">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/space_bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div ref={screenContentRef} className="screen-content">
        {children}
        <VHSOverlay />
      </div>
    </div>
  );
};

export default RetroComputer;