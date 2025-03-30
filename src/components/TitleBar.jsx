// src/components/TitleBar.jsx
import React from 'react';
import './TitleBar.css';

const TitleBar = () => {
  return (
    <div className="title-bar">
      <div className="title-left">
        <span className="app-title">TIME.exe</span>
      </div>
      <div className="title-right">
        <button className="title-button">_</button>
        <button className="title-button">▢</button>
        <button className="title-button">X</button>
      </div>
    </div>
  );
};

export default TitleBar;
