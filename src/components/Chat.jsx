// src/components/Chat.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Window, WindowHeader, WindowContent, TextField, Button } from 'react95';

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { sender: 'user', text: input }]);
    // Here you would add your logic to process the message with the AI agent
    setInput('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Window style={{ width: 500, height: 400 }}>
        <WindowHeader active>
          <span>Chat with {id.charAt(0).toUpperCase() + id.slice(1)}</span>
        </WindowHeader>
        <WindowContent style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
            {messages.map((msg, index) => (
              <p key={index} style={{ fontFamily: '"Courier New", monospace' }}>
                {msg.sender}: {msg.text}
              </p>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1 }}
              placeholder="Type your message..."
            />
            <Button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>
              Send
            </Button>
          </div>
        </WindowContent>
      </Window>
    </div>
  );
};

export default Chat;
