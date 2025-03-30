import React from 'react';

const MessageList = ({ messages, currentAgent, messagesEndRef, useRetroStyle = false }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-4 ${useRetroStyle ? 'retro-bg retro-scrollbar' : 'bg-gray-700'}`}>
      {messages.map((message, index) => (
        <div key={index} className={`mb-4 ${useRetroStyle ? 'retro-font' : ''}`}>
          {message.type === 'user' && (
            <div className="flex justify-end">
              <div className={`py-3 px-4 max-w-md rounded-2xl ${
                useRetroStyle 
                  ? 'retro-message-user' 
                  : 'bg-blue-600 text-white shadow-md'
              }`}>
                {message.content}
              </div>
            </div>
          )}
          
          {message.type === 'system' && (
            <div className="text-center my-4">
              <span className={`py-1 px-3 text-sm ${
                useRetroStyle 
                  ? 'bg-white text-black retro-window' 
                  : 'bg-gray-600 text-gray-300 rounded-md'
              }`}>
                {message.content}
              </span>
            </div>
          )}
          
          {message.type === 'loading' && (
            <div className="flex items-start mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 
                ${useRetroStyle ? 'retro-window' : 'bg-gray-600'}`}>
                {currentAgent?.avatar}
              </div>
              <div className="flex flex-col">
                {!useRetroStyle && <div className="text-xs text-gray-400 mb-1 ml-1">{currentAgent?.name}</div>}
                <div className={`py-2 px-4 rounded-2xl ${
                  useRetroStyle 
                    ? 'loading-dots retro-message-agent' 
                    : 'bg-gray-600 text-white animate-pulse'
                }`}>
                  {useRetroStyle ? 'Typing' : message.content}
                </div>
              </div>
            </div>
          )}
          
          {message.type === 'agent' && (
            <div className="flex items-start mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 
                ${useRetroStyle ? 'retro-window' : 'bg-gray-600'}`}>
                {currentAgent?.avatar}
              </div>
              <div className="flex flex-col max-w-[75%]">
                {!useRetroStyle && <div className="text-xs text-gray-400 mb-1 ml-1">{currentAgent?.name}</div>}
                <div className={`py-3 px-4 rounded-2xl ${
                  useRetroStyle 
                    ? 'retro-message-agent' 
                    : 'bg-gray-600 text-white shadow-md'
                }`}>
                  {message.content}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 