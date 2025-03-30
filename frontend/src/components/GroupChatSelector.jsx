import React, { useState, useEffect } from 'react';
import { Window, WindowHeader, WindowContent, Button, Checkbox } from 'react95';
import { useNavigate } from 'react-router-dom';
import { useChatActions } from '../hooks/useChatActions.jsx';
import availableAgents from '../utils/agentData.jsx';

const GroupChatSelector = () => {
  console.log('GroupChatSelector rendered');
  // Initialize with all agents selected by default
  const [selectedAgents, setSelectedAgents] = useState(
    availableAgents.map(agent => agent.id)
  );
  const navigate = useNavigate();
  const { startGroupChat, closeGroupChatSelector } = useChatActions();

  // Log when component is mounted
  useEffect(() => {
    console.log('GroupChatSelector mounted with selected agents:', selectedAgents);
    return () => console.log('GroupChatSelector unmounted');
  }, [selectedAgents]);

  const toggleAgent = (agentId) => {
    console.log('Toggling agent:', agentId);
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const handleStartChat = async () => {
    console.log('Start chat button clicked with agents:', selectedAgents);
    if (selectedAgents.length > 0) {
      try {
        // Start the group chat
        await startGroupChat(selectedAgents);
        
        // Close the selector
        closeGroupChatSelector();
        
        // Navigate to the group chat
        console.log("Navigating to group chat...");
        navigate('/chat/group_chat');
      } catch (error) {
        console.error('Error starting group chat:', error);
        closeGroupChatSelector();
      }
    } else {
      console.warn("No agents selected for group chat");
    }
  };

  // Super simple version - just a modal with minimal styling
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2>Create Group Chat</h2>
        <button 
          onClick={closeGroupChatSelector}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer'
          }}
        >
          X
        </button>
        
        <p>Select agents for your group chat:</p>
        
        <div style={{ marginBottom: '20px' }}>
          {availableAgents.map(agent => (
            <div 
              key={agent.id} 
              style={{ 
                margin: '10px 0', 
                padding: '10px', 
                background: selectedAgents.includes(agent.id) ? '#e6f7ff' : '#f0f0f0',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => toggleAgent(agent.id)}
            >
              <input 
                type="checkbox" 
                checked={selectedAgents.includes(agent.id)} 
                onChange={() => toggleAgent(agent.id)}
                style={{ marginRight: '10px' }}
              />
              <span>{agent.avatar} {agent.name}</span>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={closeGroupChatSelector}
            style={{
              padding: '10px 20px',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleStartChat}
            disabled={selectedAgents.length === 0}
            style={{
              padding: '10px 20px',
              background: selectedAgents.length > 0 ? '#007bff' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedAgents.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Start Group Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatSelector; 