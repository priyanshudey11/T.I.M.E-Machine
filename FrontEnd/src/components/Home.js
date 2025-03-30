import React from 'react';
import { useChat } from '../context/ChatContext';
import { useChatActions } from '../hooks/useChatActions';
import availableAgents from '../utils/agentData';

const Home = () => {
  const { openGroupChatSelector } = useChat();
  const { switchAgent } = useChatActions();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to T.I.M.E Machine</h1>
      <p className="text-xl text-center max-w-2xl mb-8">
        Select a historical figure from the sidebar or create a group chat to interact with multiple figures at once.
      </p>
      
      {/* Big, visible Group Chat button */}
      <button
        onClick={openGroupChatSelector}
        className="w-full max-w-md mb-10 p-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
      >
        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
        Create Group Chat
      </button>

      {/* Test button for group chat selector */}
      <button
        onClick={openGroupChatSelector}
        className="w-full max-w-md mb-10 p-4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
      >
        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
        Test Group Chat Selector
      </button>
      
      <h2 className="text-2xl font-semibold mb-6">Or select a historical figure:</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {availableAgents.map(agent => (
          <div 
            key={agent.id}
            className="bg-gray-700 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-600 transition-colors text-center"
            onClick={() => switchAgent(agent.id)}
          >
            <div className="text-4xl mb-4">{agent.avatar}</div>
            <h2 className="text-xl font-bold mb-2">{agent.name}</h2>
            <p className="text-gray-300">{agent.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;