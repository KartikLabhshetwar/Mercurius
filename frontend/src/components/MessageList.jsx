import { useEffect, useRef } from 'react';
import { MESSAGE_TYPES } from '../utils/constants.js';
import { formatTimestamp } from '../utils/helpers.js';
import { Image, Volume2, Smile, User, Clock } from 'lucide-react';

const MessageList = ({ messages, currentUsername }) => {
  const messagesEndRef = useRef(null);

  // Debug: Log messages
  useEffect(() => {
    console.log('MessageList received messages:', messages);
    console.log('Current username:', currentUsername);
  }, [messages, currentUsername]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessage = (message) => {
    const isOwnMessage = message.username === currentUsername;
    const isSystemMessage = message.type === 'system';
    const isErrorMessage = message.type === 'error';

    if (isSystemMessage || isErrorMessage) {
      return (
        <div key={message.id} className="flex justify-center my-2">
          <div className={`px-3 py-1 rounded-full text-xs ${
            isErrorMessage 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}>
          {/* Username */}
          <div className={`text-xs font-medium mb-1 ${
            isOwnMessage ? 'text-indigo-100' : 'text-gray-500'
          }`}>
            {message.username}
          </div>

          {/* Message Content */}
          <div className="break-words">
            {message.type === MESSAGE_TYPES.TEXT && (
              <p className="text-sm">{message.content}</p>
            )}

            {message.type === MESSAGE_TYPES.MEDIA && (
              <div className="space-y-2">
                <p className="text-sm">{message.content}</p>
                {message.mediaType === 'image' ? (
                  <div className="relative">
                    <img
                      src={message.mediaUrl}
                      alt="Shared image"
                      className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.mediaUrl, '_blank')}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                      <Image className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <audio controls className="w-full">
                      <source src={message.mediaUrl} type="audio/mpeg" />
                      <source src={message.mediaUrl} type="audio/wav" />
                      <source src={message.mediaUrl} type="audio/ogg" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="flex items-center mt-2 text-xs text-gray-600">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Audio file
                    </div>
                  </div>
                )}
              </div>
            )}

            {message.type === MESSAGE_TYPES.EMOJI && (
              <div className="text-center">
                <div className="text-4xl mb-1">{message.content}</div>
                <div className="text-xs opacity-75">Emoji</div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwnMessage ? 'text-indigo-200' : 'text-gray-400'
          }`}>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {message.formattedTimestamp || formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Smile className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      ) : (
        messages.map(renderMessage)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
