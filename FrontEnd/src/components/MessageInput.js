import React from 'react';

const MessageInput = ({ inputValue, setInputValue, handleSubmit, currentAgent, useRetroStyle = false }) => {
  if (!currentAgent) return null;
  
  return (
    <div className={`p-4 border-t ${useRetroStyle ? 'retro-window' : 'bg-gray-800 border-gray-700'}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Message ${currentAgent.name}...`}
          className={`flex-1 px-4 py-3 ${
            useRetroStyle 
              ? 'retro-input text-black mr-2' 
              : 'bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
          autoFocus
        />
        <button 
          type="submit" 
          className={
            useRetroStyle
              ? 'retro-button'
              : 'bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center ml-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
          }
        >
          {useRetroStyle ? 'Send' : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput; 