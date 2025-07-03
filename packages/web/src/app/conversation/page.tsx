import React from 'react';

const ConversationPlaceholderPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
      <h2 className="text-xl font-semibold">Select a conversation to start chatting</h2>
      <p className="text-sm">Choose a conversation from the sidebar to view messages.</p>
    </div>
  );
};

export default ConversationPlaceholderPage;
