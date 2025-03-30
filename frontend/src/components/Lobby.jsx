// src/components/Lobby.jsx

import React, { useEffect, useState } from 'react';

import { Window, WindowHeader, WindowContent, Button, ScrollView } from 'react95';

import Lottie from 'lottie-react';

import { useNavigate } from 'react-router-dom';

import { useChat } from '../context/ChatContext.jsx';

import { useChatActions } from '../hooks/useChatActions.jsx';

import availableAgents from '../utils/agentData.jsx';

import './Lobby.css';



const Lobby = () => {

  const navigate = useNavigate();

  const { chats, showGroupChatSelector, createNewChat, setActiveChat } = useChat();

  const { switchAgent, openGroupChatSelector } = useChatActions();

  

  const [einsteinAnim, setEinsteinAnim] = useState(null);

  const [marilynAnim, setMarilynAnim] = useState(null);

  const [rooseveltAnim, setRooseveltAnim] = useState(null);

  const [teslaAnim, setTeslaAnim] = useState(null);

  const [edisonAnim, setEdisonAnim] = useState(null);

  const [animationsLoaded, setAnimationsLoaded] = useState(false);



  // Log when Lobby is mounted

  useEffect(() => {

    console.log('Lobby component mounted');

    return () => console.log('Lobby component unmounted');

  }, []);



  // Log when showGroupChatSelector changes

  useEffect(() => {

    console.log('showGroupChatSelector changed in Lobby:', showGroupChatSelector);

  }, [showGroupChatSelector]);



  useEffect(() => {

    try {

      // Load animations

      fetch('/albert_idle.json')

        .then((res) => res.json())

        .then((data) => setEinsteinAnim(data))

        .catch(err => console.error('Error loading einstein animation:', err));

        

      fetch('/marilyn_idle.json')

        .then((res) => res.json())

        .then((data) => setMarilynAnim(data))

        .catch(err => console.error('Error loading marilyn animation:', err));

      

      // Try to load Roosevelt animation if available

      fetch('/teddy_idle.json')

        .then((res) => res.json())

        .then((data) => setRooseveltAnim(data))

        .catch(err => console.error('Error loading roosevelt animation:', err));

      fetch('/tesla_idle.json')

        .then((res) => res.json())

        .then((data) => setTeslaAnim(data))

        .catch(err => console.error('Error loading tesla animation:', err));
      
      fetch('/edison_idle.json')

        .then((res) => res.json())

        .then((data) => setEdisonAnim(data))

        .catch(err => console.error('Error loading edison animation:', err));
      

      setAnimationsLoaded(true);

    } catch (error) {

      console.error('Failed to load animations:', error);

    }

  }, []);



  // Initialize agent chats if they don't exist
  useEffect(() => {
    // Make sure we have chats for each agent
    const validAgentIds = ['einstein', 'monroe', 'turing', 'roosevelt', 'tesla', 'edison'];
    
    validAgentIds.forEach(agentId => {
      const agentChat = chats.find(chat => chat.id === agentId);
      if (!agentChat) {
        // Get agent name
        const agent = availableAgents.find(a => a.id === agentId);
        if (agent) {
          // Create the chat with the proper ID
          createNewChat(agent.name, agentId);
          console.log(`Created chat for agent: ${agent.name}`);
        }
      }
    });
  }, [chats, createNewChat, availableAgents]); // Include dependencies



  const handleMemberClick = (agent) => {
    // Validate that this is a proper agent ID
    const validAgentIds = ['einstein', 'monroe', 'turing', 'roosevelt', 'tesla', 'edison'];
    if (!validAgentIds.includes(agent.id)) {
      console.error(`Invalid agent ID: ${agent.id}`);
      return;
    }
    
    // First check if this chat already exists
    const existingChat = chats.find(chat => chat.id === agent.id);
    
    // If no chat exists for this agent, create one
    if (!existingChat) {
      // Create a new chat with the agent's ID as the chat ID
      createNewChat(agent.name, agent.id);
      switchAgent(agent.id);
      navigate(`/chat/${agent.id}`);
    } else {
      // Otherwise just use the existing chat
      switchAgent(agent.id);
      navigate(`/chat/${agent.id}`);
    }
  };



  const handleNewChat = () => {

    console.log('Opening group chat selector');

    openGroupChatSelector();

  };



  const handleChatClick = (agentId) => {

    switchAgent(agentId);

    navigate(`/chat/${agentId}`);

  };



  // Return the correct animation for each member:

  const getAnimationForMember = (member) => {

    if (!animationsLoaded) return null;

    if (member.id === 'einstein') return einsteinAnim;

    if (member.id === 'monroe') return marilynAnim;

    if (member.id === 'roosevelt') return rooseveltAnim;

    if (member.id === 'tesla') return teslaAnim;

    if (member.id === 'edison') return edisonAnim;

    return null;

  };



  // Map our agent data to the format expected by the UI
  const mappedAgents = availableAgents.map(agent => ({
    ...agent,
    online: true,
    anim: agent.id,
    daysOnline: Math.floor(Math.random() * 10) + 1,
    // Add a unique key suffix to ensure uniqueness
    uniqueKey: `agent_${agent.id}_${Date.now()}`
  }));



  // Create a list of chats from the conversations state with improved organization
  const organizedChatList = () => {
    if (!chats || !Array.isArray(chats)) return [];
    
    // First, deduplicate chats by agent ID - keep only one entry per agent
    const uniqueChats = {};
    
    // Process regular chats first
    chats.forEach(chat => {
      if (!chat || chat.id === 'group_chat') return;
      
      const agent = availableAgents.find(a => a.id === chat.id);
      if (!agent) return;
      
      // Skip chats without messages
      if (!chat.messages || chat.messages.length === 0) return;
      
      // Find user messages to use as preview
      const userMessages = chat.messages.filter(msg => msg.type === 'user');
      const lastUserMessage = userMessages.length > 0 ? 
        userMessages[userMessages.length - 1] : null;
      
      // Find the latest message overall
      const lastMessage = chat.messages[chat.messages.length - 1];
      
      // Set the preview to the last user message if available, otherwise use the last message
      const previewContent = lastUserMessage ? lastUserMessage.content : (lastMessage ? lastMessage.content : '');
      const preview = previewContent && previewContent.length > 28 ? 
        previewContent.substring(0, 28) + '...' : previewContent;
      
      // Only add if we don't already have this chat, or if this chat is newer
      if (!uniqueChats[chat.id] || new Date(chat.createdAt) > new Date(uniqueChats[chat.id].createdAt)) {
        uniqueChats[chat.id] = {
          id: chat.id,
          name: agent.name,
          avatar: agent.avatar || '👤',
          preview: preview,
          uniqueKey: `chat_${chat.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: chat.createdAt,
          isStarted: preview.length > 0
        };
      }
    });
    
    // Process group chat separately
    const groupChat = chats.find(chat => chat && chat.id === 'group_chat');
    if (groupChat && groupChat.messages && groupChat.messages.length > 0) {
      const lastMessage = groupChat.messages[groupChat.messages.length - 1];
      uniqueChats['group_chat'] = {
        id: 'group_chat',
        name: 'Group Chat',
        avatar: '👥',
        preview: lastMessage?.content ? 
          (lastMessage.content.length > 28 ? lastMessage.content.substring(0, 28) + '...' : lastMessage.content) : 
          'Multi-agent conversation',
        uniqueKey: `chat_group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: groupChat.createdAt,
        isGroupChat: true,
        isStarted: true
      };
    }
    
    // Convert to array and sort - most recent first
    return Object.values(uniqueChats).sort((a, b) => {
      // Show started chats first, then most recently created
      if (a.isStarted && !b.isStarted) return -1;
      if (!a.isStarted && b.isStarted) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };
  
  // Get the organized chat list
  const chatList = organizedChatList();

  // Render the chat list section of the UI
  const renderChatList = () => {
    return (
      <div className="chat-list">
        {/* New Group Chat button */}
        <Button
          className="new-chat-button"
          onClick={handleNewChat}
        >
          ➕ New Group Chat
        </Button>
        
        {/* Display empty state if no chats */}
        {chatList.length === 0 && (
          <div className="empty-chats">
            No conversations yet. Click on an agent to start chatting.
          </div>
        )}
        
        {/* List all chats with better styling */}
        {chatList.map(chat => (
          <Button
            key={chat.uniqueKey}
            style={{
              width: '100%',
              marginBottom: '0.5rem',
              backgroundColor: chat.isGroupChat ? '#4CAF50' : '#f8f8f8',
              color: chat.isGroupChat ? '#fff' : '#000',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '16px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              minHeight: '80px'
            }}
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="chat-info">
              <div className="chat-header">
                <span className="avatar">{chat.avatar}</span>
                <h4 className="name">
                  {chat.isGroupChat ? 'Group Chat' : `Chat with ${chat.name}`}
                </h4>
              </div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                {chat.preview ? (
                  <p className="chat-preview">
                    {chat.preview}
                  </p>
                ) : (
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '0.9em', 
                    fontStyle: 'italic',
                    opacity: 0.6,
                    textAlign: 'center'
                  }}>
                    Start a conversation
                  </p>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    );
  };



  console.log('Render Lobby - showGroupChatSelector:', showGroupChatSelector);



  return (

    <div className="lobby-page">

      <div className="lobby-container">

        {/* Left Members Panel */}

        <div className="members-panel">

          <Window style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: 0, border: 'none' }}>

            <WindowHeader className="lobby-headers" style={{ 

              display: 'flex', 

              alignItems: 'center', 

              padding: '6px 8px'

            }}>

              <span className="title">👥 Members</span>

            </WindowHeader>

            <WindowContent style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, padding: '8px' }}>

              <ScrollView style={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>

                <div className="members-grid">

                  {mappedAgents.map((agent) => (

                    <button

                      key={agent.uniqueKey}

                      type="button"

                      className="member-card"

                      onClick={() => handleMemberClick(agent)}

                    >

                      <div className="member-name">{agent.name}</div>

                      <div className="avatar-animation">

                        {getAnimationForMember(agent) ? (

                          <Lottie

                            animationData={getAnimationForMember(agent)}

                            loop

                            autoplay

                            style={{ width: '100%', height: '100%' }}

                          />

                        ) : (

                          <div className="avatar-placeholder">

                            {agent.avatar || '👤'}

                          </div>

                        )}

                      </div>

                      <div className="member-status-container">

                        <span className="status-circle online"></span>

                        <div className="member-status">Online</div>

                      </div>

                      <div className="last-seen">For {agent.daysOnline} days</div>

                    </button>

                  ))}

                </div>

              </ScrollView>

            </WindowContent>

          </Window>

        </div>



        {/* Right Chats Panel */}

        <div className="chats-panel">

          <Window style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: 0, border: 'none' }}>

            <WindowHeader className="lobby-headers" style={{ 

              display: 'flex', 

              alignItems: 'center', 

              padding: '6px 8px'

            }}>

              <span className="title">💬 Chats</span>

            </WindowHeader>

            <WindowContent style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, padding: '8px' }}>

              <ScrollView style={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>

                {renderChatList()}

              </ScrollView>

            </WindowContent>

          </Window>

        </div>

      </div>

    </div>

  );

};



export default Lobby;
