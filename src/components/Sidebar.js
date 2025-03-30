import React from 'react';
import { useChatActions } from '../hooks/useChatActions';

const Sidebar = ({ agents, currentAgentId, onCreateGroupChat }) => {
  const { switchAgent } = useChatActions();
  
  // Find the current agent data
  const currentAgent = agents.find(agent => agent.id === currentAgentId);

  return (
    <div className="w-64 bg-gray-900 flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        T.I.M.E Machine
      </div>
      
      {!currentAgentId ? (
        // Show list of agents when no agent is selected
        <div className="flex-1 overflow-y-auto">
          {/* Create Group Chat button */}
          <button
            onClick={onCreateGroupChat}
            className="w-full p-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            Create Group Chat
          </button>
          
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`p-3 flex items-center cursor-pointer hover:bg-gray-700 ${currentAgentId === agent.id ? 'bg-gray-700' : ''}`}
              onClick={() => switchAgent(agent.id)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl mr-3">
                {agent.avatar}
              </div>
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm text-gray-400">{agent.title}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show detailed profile when an agent is selected
        <div className="flex-1 overflow-y-auto p-4">
          {/* Character Username */}
          <div className="text-2xl font-bold mb-4 text-center">
            {currentAgent.name}
          </div>
          {/* Profile Image */}
          <div className="w-40 h-40 mx-auto bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-6xl mb-6">
            {currentAgent.avatar}
          </div>
          {/* Character Information */}
          <div className="border-t border-gray-700 pt-4">
            <div className="text-sm text-gray-400 mb-1">Real Name:</div>
            <div className="font-medium mb-3">{currentAgent.realName}</div>
            <div className="text-sm text-gray-400 mb-1">Title:</div>
            <div className="font-medium mb-3">{currentAgent.title}</div>
            <div className="text-sm text-gray-400 mb-1">About:</div>
            <div className="font-medium text-sm leading-relaxed">
              This is a simulated chat with {currentAgent.realName}, a historical figure brought to life through the T.I.M.E Machine interface. Use this chat to have conversations as if you were speaking with them directly!
            </div>
          </div>
          {/* Back button */}
          <button
            onClick={() => switchAgent('')}
            className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            Back to Character Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;