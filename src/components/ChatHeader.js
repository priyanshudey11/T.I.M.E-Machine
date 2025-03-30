import React from 'react';
import { useChatActions } from '../hooks/useChatActions';

const ChatHeader = ({ agent, useRetroStyle = false }) => {
  const { goToHome } = useChatActions();
  
  if (!agent) return null;
  
  if (useRetroStyle) {
    return (
      <div className="flex-1 flex items-center">
        <div className="w-5 h-5 mx-1 flex items-center justify-center">
          {agent.avatar}
        </div>
        <div className="font-bold ml-2 retro-font">
          {agent.name} - {agent.title}
        </div>
        <div className="ml-auto flex">
          <button 
            className="retro-button text-xs h-6 px-2 mx-1 min-w-0"
            onClick={goToHome}
          >🏠</button>
          <button className="retro-button text-xs h-6 px-2 mx-1 min-w-0">_</button>
          <button className="retro-button text-xs h-6 px-2 mx-1 min-w-0">□</button>
          <button className="retro-button text-xs h-6 px-2 mx-1 min-w-0">×</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-16 border-b border-gray-700 px-4 flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl mr-3">
        {agent.avatar}
      </div>
      <div>
        <div className="font-medium">{agent.name}</div>
        <div className="text-sm text-gray-400">{agent.realName || agent.title}</div>
      </div>
      <button 
        className="ml-auto px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
        onClick={goToHome}
        title="Go to home"
      >
        <span role="img" aria-label="Home">🏠</span>
      </button>
    </div>
  );
};

export default ChatHeader; 