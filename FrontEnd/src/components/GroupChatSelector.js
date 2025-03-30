import React, { useState } from 'react';
import availableAgents from '../utils/agentData';

const GroupChatSelector = ({ onStartGroupChat, onClose }) => {
  console.log('GroupChatSelector rendered');
  const [selectedAgents, setSelectedAgents] = useState([]);

  const toggleAgent = (agentId) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const handleStartChat = () => {
    if (selectedAgents.length > 0) {
      onStartGroupChat(selectedAgents);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 rounded-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4 text-white">Create Group Chat</h2>
        <p className="text-gray-400 mb-4">Select the agents you want to include in the group chat:</p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableAgents.map(agent => (
            <div
              key={agent.id}
              className={`flex items-center p-3 rounded cursor-pointer ${
                selectedAgents.includes(agent.id)
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => toggleAgent(agent.id)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl mr-3">
                {agent.avatar}
              </div>
              <div>
                <div className="font-medium text-white">{agent.name}</div>
                <div className="text-sm text-gray-400">{agent.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleStartChat}
            disabled={selectedAgents.length === 0}
            className={`px-4 py-2 rounded ${
              selectedAgents.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Start Group Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatSelector;