import React from 'react';

const Sidebar = ({ agents, currentAgentId, onSelectAgent }) => {
  // Find the current agent data
  const currentAgent = agents.find(agent => agent.id === currentAgentId);
  
  return (
    <div className="w-64 bg-gray-900 flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        T.I.M.E Machine
      </div>
      
      {!currentAgent ? (
        // Show list of agents when no agent is selected
        <div className="flex-1 overflow-y-auto">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className={`p-3 flex items-center cursor-pointer hover:bg-gray-700 ${currentAgentId === agent.id ? 'bg-gray-700' : ''}`}
              onClick={() => onSelectAgent(agent.id)}
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
            onClick={() => onSelectAgent(null)} 
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