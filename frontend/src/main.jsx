import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { StyleSheetManager } from 'styled-components';

// Custom shouldForwardProp to handle React95 props
const shouldForwardProp = (prop) => {
  // List of React95 props that shouldn't be forwarded to DOM
  const react95Props = [
    'active', 'shadow', 'fullWidth', 'primary', 
    'square', 'variant', 'multiline'
  ];
  
  return !react95Props.includes(prop);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <App />
    </StyleSheetManager>
  </StrictMode>,
);
