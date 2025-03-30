// src/components/Character.jsx

import React from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { Window, WindowHeader, WindowContent, Button } from 'react95';

import { useChat } from '../context/ChatContext.jsx';

import { useChatActions } from '../hooks/useChatActions.jsx';

import availableAgents from '../utils/agentData.jsx';



const Character = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const { switchAgent } = useChatActions();

  

  // Find the agent data

  const agent = availableAgents.find(a => a.id === id);



  if (!agent) return (

    <div style={{ padding: '2rem' }}>

      <Window>

        <WindowHeader>Error</WindowHeader>

        <WindowContent>

          <p>Character not found.</p>

          <Button onClick={() => navigate('/')}>Back to Lobby</Button>

        </WindowContent>

      </Window>

    </div>

  );



  const handleStartChat = () => {

    switchAgent(id);

    navigate(`/chat/${id}`);

  };



  return (

    <div style={{ padding: '2rem' }}>

      <Window style={{ width: 400 }}>

        <WindowHeader active>

          <span>{agent.name}</span>

        </WindowHeader>

        <WindowContent>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>

            <div 

              style={{ 

                fontSize: '3rem', 

                marginRight: '1rem',

                width: '80px',

                height: '80px',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                background: '#f0f0f0',

                borderRadius: '4px'

              }}

            >

              {agent.avatar}

            </div>

            <div>

              <h3 style={{ margin: '0 0 0.5rem 0' }}>{agent.name}</h3>

              <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>{agent.title}</p>

            </div>

          </div>

          <p>{agent.description || 'A historical figure brought to life through the T.I.M.E Machine interface. Use the chat to have conversations as if you were speaking with them directly!'}</p>

          <p style={{ animation: 'blink 1s step-start infinite' }}>Click below to start chatting!</p>

          <Button onClick={handleStartChat} style={{ width: '100%' }}>

            Start Chat

          </Button>

        </WindowContent>

      </Window>

    </div>

  );

};



export default Character;

