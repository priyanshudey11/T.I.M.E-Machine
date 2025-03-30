// src/components/Chat.jsx

import React, { useEffect, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { Window, WindowHeader, WindowContent, TextField, Button } from 'react95';

import { useChat } from '../context/ChatContext.jsx';

import { useChatActions } from '../hooks/useChatActions.jsx';

import availableAgents from '../utils/agentData.jsx';



const Chat = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  

  const { 

    chats, 

    isGroupChat,

    setActiveChat

  } = useChat();

  

  const { 

    handleSubmit,

    messagesEndRef: actionMessagesEndRef,

    inputValue,

    setInputValue,

    apiError

  } = useChatActions();



  // Find the current chat and its messages - MOVED UP to fix reference error
  const currentChat = chats.find(chat => chat.id === id) || null;
  const messages = currentChat?.messages || [];

  // Set the active chat when the component loads
  useEffect(() => {
    if (id) {
      setActiveChat(id);
    }
  }, [id, setActiveChat]);



  // Set reference to the messages end for auto-scrolling
  useEffect(() => {
    console.log('Messages updated, scrolling to bottom');
    // Use a small timeout to ensure DOM is updated before scrolling
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);  // Listen to messages changes

  // Alternate scrolling method to handle special cases
  useEffect(() => {
    // Find the messages container
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages.length]);  // Only run when message count changes



  // Get agent data if it's a single agent chat

  const agent = !isGroupChat && id !== 'group_chat' 

    ? availableAgents.find(a => a.id === id) 

    : null;



  // Debug helper

  useEffect(() => {

    console.log(`Chat component for ID: ${id}, isGroupChat: ${isGroupChat}`);

    console.log("Current messages:", messages);

  }, [id, isGroupChat, messages]);

  // A simpler approach for Chat.jsx
  // Add this to your Chat component
  useEffect(() => {
    // Fix scroll position to the top when component mounts
    window.scrollTo(0, 0);
    
    // Fix parent containers' scroll positions
    const retro = document.querySelector('.retro-computer');
    const screenContent = document.querySelector('.screen-content');
    
    if (retro) retro.scrollTop = 0;
    if (screenContent) screenContent.scrollTop = 0;
  }, []);



  const handleGoBack = () => {

    navigate('/');

  };



  const handleKeyDown = (e) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();

      handleSubmit(e);

    }

  };



  // Add this helper function to get a different color for each agent

  const getAgentColor = (agentName) => {

    if (!agentName) return '#000080'; // Default blue

    

    // Use different colors for each agent to make them visually distinguishable

    if (agentName.includes('Einstein')) return '#004d00'; // Dark green

    if (agentName.includes('Monroe')) return '#990000';  // Dark red

    if (agentName.includes('Turing')) return '#000099';  // Dark blue

    

    return '#000080'; // Default for unknown agents

  };



  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'  /* Prevent scrolling issues */
    }}>
      {/* Back button positioned at the top-right corner of the screen */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '20px', 
        zIndex: 2000  // Make sure this is higher than other elements
      }}>
        <Button 
          onClick={handleGoBack}
          style={{ 
            fontSize: '14px',
            padding: '4px 12px',
            backgroundColor: '#c3c3c3',
            border: '2px outset #fff',
            fontWeight: 'bold'
          }}
        >
          ← Back to Home
        </Button>
      </div>

      {/* Main chat window */}
      <Window style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        marginTop: '10px', // Add a bit of space at the top for the back button
        overflow: 'hidden'  /* Prevent scrolling issues */
      }}>
        <WindowHeader 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '6px 8px',
            background: '#000080',
            color: 'white'
          }}
        >
          <span style={{ fontWeight: 'bold' }}>
            {isGroupChat || id === 'group_chat' 
              ? '👥 Group Chat' 
              : `${agent?.avatar || '👤'} Chat with ${agent?.name || 'Unknown'}`}
          </span>
          
          {/* Loading indicator in header */}
          {messages.some(msg => msg.type === 'loading') && (
            <span style={{ 
              marginLeft: 'auto', 
              color: 'yellow', 
              fontSize: '0.8rem'
            }} className="blink">
              ● Processing...
            </span>
          )}
        </WindowHeader>
        <WindowContent style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100% - 30px)', 
          padding: '8px',
          gap: '8px',
          overflow: 'hidden'
        }}>
          {/* API Error display */}
          {apiError && (
            <div style={{
              padding: '8px',
              backgroundColor: '#ffcccc',
              color: '#aa0000',
              border: '1px solid #aa0000',
              borderRadius: '4px',
              marginBottom: '8px',
              fontSize: '0.9rem'
            }}>
              {apiError}
            </div>
          )}
          
          {/* Messages container with scrolling */}
          <div 
            className="messages-container"
            style={{ 
              flex: '1 1 auto', 
              overflowY: 'auto', 
              background: '#ffffff', 
              padding: '0', /* Remove padding from outer container */
              fontFamily: '"Courier New", monospace',
              border: '2px inset #dfdfdf',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100% - 80px)',
              position: 'relative',
              marginBottom: '5px'
            }}
          >
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              padding: '8px',
              minHeight: 'min-content', /* Only take up as much space as needed */
              paddingBottom: '20px' /* Add extra padding at bottom */
            }}>
              {messages.map((msg, index) => {
                let style = {
                  padding: '8px',
                  marginBottom: '4px',
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                  border: '1px solid #dfdfdf',
                  background: '#ffffff'
                };
                
                if (msg.type === 'user') {
                  style = {
                    ...style,
                    marginLeft: 'auto',
                    borderColor: '#a8d7a8',
                    background: '#e8f8e8'
                  };
                } else if (msg.type === 'agent') {
                  style = {
                    ...style,
                    marginRight: 'auto',
                    borderColor: '#d7d7d7',
                    background: '#f8f8f8'
                  };
                } else if (msg.type === 'system') {
                  style = {
                    ...style,
                    margin: '4px auto',
                    borderColor: '#d7a8a8',
                    background: '#f8e8e8',
                    color: '#666',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  };
                } else if (msg.type === 'loading') {
                  style = {
                    ...style,
                    margin: '4px auto',
                    border: 'none',
                    background: 'transparent',
                    color: '#666',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  };
                }
                
                // Add extra margin if next message is from a different sender
                if (index < messages.length - 1 && messages[index + 1].type !== msg.type) {
                  style.marginBottom = '8px';
                }
                
                return (
                  <div key={`msg_${index}_${msg.id || Date.now()}`} style={style}>
                    {msg.type === 'agent' && (
                      <div style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '4px',
                        color: isGroupChat ? getAgentColor(msg.agent) : '#000080',
                        fontSize: '0.9em'
                      }}>
                        {msg.agent}:
                      </div>
                    )}
                    {msg.type === 'loading' ? (
                      <div className="loading-animation" style={{ 
                        lineHeight: '1.4',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.content}
                      </div>
                    ) : (
                      <div style={{ 
                        lineHeight: '1.4',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Add extra space at bottom to ensure visibility when scrolled */}
              <div ref={messagesEndRef} style={{ height: '40px' }} /> 
            </div>
          </div>
          
          {/* Message input form - fixed position at bottom */}
          <div className="message-input-container" style={{ 
            flexShrink: 0, 
            height: '70px', 
            zIndex: 1000,
            marginTop: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ 
              display: 'flex', 
              gap: '8px', 
              width: '100%',
              height: '100%'
            }}>
              <TextField
                multiline
                rows={2}
                name="message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ 
                  flex: 1, 
                  resize: 'none',
                  fontFamily: '"Courier New", monospace',
                  backgroundColor: 'white',
                  border: '2px inset #dfdfdf',
                  padding: '5px',
                  zIndex: 1001
                }}
                placeholder="Type your message here..."
              />
              <Button 
                type="submit"
                style={{ 
                  alignSelf: 'flex-end',
                  height: '2.5rem',
                  minWidth: '80px',
                  backgroundColor: '#c3c3c3',
                  border: '2px outset #fff',
                  zIndex: 1001
                }}
              >
                Send
              </Button>
            </form>
          </div>
        </WindowContent>
      </Window>
    </div>
  );
};



export default Chat;