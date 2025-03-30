// src/ThemeWrapper.jsx
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';
import { createGlobalStyle } from 'styled-components';
import coldGray from 'react95/dist/themes/coldGray';

const ResetStyles = createGlobalStyle`
  ${styleReset}
  body {
    font-family: 'Press Start 2P', monospace;
    background: teal;
    font-size: 12px;
  }
`;

const ThemeWrapper = ({ children }) => (
  <ThemeProvider theme={coldGray}>
    <ResetStyles />
    {children}
  </ThemeProvider>
);

export default ThemeWrapper;
