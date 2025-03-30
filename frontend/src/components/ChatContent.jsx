// src/components/ChatContent.jsx
import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext.jsx';

const ChatContent = ({ id, messages }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Prevent scroll issues when component mounts
  useEffect(() => {
    // Fix scroll position to the top when component mounts
    window.scrollTo(0, 0);
    
    // Fix parent containers' scroll positions
    const retro = document.querySelector('.retro-computer');
    const screenContent = document.querySelector('.screen-content');
    
    if (retro) retro.scrollTop = 0;
    if (screenContent) screenContent.scrollTop = 0;
  }, []);

  // Save scroll position in container
  useEffect(() => {
    const saveScrollPosition = () => {
      if (chatContainerRef.current) {
        const { scrollTop } = chatContainerRef.current;
        chatContainerRef.current.dataset.scrollPosition = scrollTop;
      }
    };

    // Restore the scroll position after DOM updates
    const restoreScrollPosition = () => {
      if (chatContainerRef.current && chatContainerRef.current.dataset.scrollPosition) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.dataset.scrollPosition;
      }
    };

    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Restore scroll when component mounts
    restoreScrollPosition();
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  return (
    <div 
      ref={chatContainerRef}
      className="messages-container"
      style={{ 
        flex: 1, 
        overflowY: 'auto', 
        background: '#ffffff', 
        padding: '8px', 
        fontFamily: '"Courier New", monospace',
        border: '2px inset #dfdfdf',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.map((msg, index) => {
        let messageClass = 'message';
        
        if (msg.type === 'user') {
          messageClass += ' user';
        } else if (msg.type === 'agent') {
          messageClass += ' agent';
        } else if (msg.type === 'system') {
          messageClass += ' system';
        } else if (msg.type === 'loading') {
          messageClass += ' loading';
        }
        
        // Add extra margin if next message is from a different sender
        const extraMargin = index < messages.length - 1 && 
              messages[index + 1].type !== msg.type;
        
        return (
          <div key={index} className={messageClass} style={extraMargin ? { marginBottom: '8px' } : {}}>
            {msg.type === 'agent' && (
              <div className="agent-name">
                {msg.agent}:
              </div>
            )}
            <div>
              {msg.content}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

export default ChatContent; 