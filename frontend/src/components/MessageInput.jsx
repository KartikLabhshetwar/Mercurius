import { useState, useRef } from 'react';
import { Send, Image, Volume2, Smile, Upload } from 'lucide-react';
import { MESSAGE_TYPES, MEDIA_TYPES } from '../utils/constants.js';
import { validateFileType, validateFileSize } from '../utils/helpers.js';
import { mediaService } from '../services/mediaService.js';
import toast from 'react-hot-toast';

const MessageInput = ({ onSendMessage, onSendMedia, onSendEmoji, roomId, username, isConnected }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim(), username);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = type === MEDIA_TYPES.IMAGE 
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      : ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];

    if (!validateFileType(file, allowedTypes)) {
      toast.error(`Invalid file type. Only ${type} files are allowed.`);
      return;
    }

    // Validate file size (10MB)
    if (!validateFileSize(file, 10 * 1024 * 1024)) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await mediaService.uploadMedia(file, roomId, type);
      if (result.success && onSendMedia) {
        onSendMedia(result.media.url, result.media.type);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, MEDIA_TYPES.IMAGE);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, MEDIA_TYPES.AUDIO);
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (onSendEmoji) {
      onSendEmoji(emoji);
    }
    setShowEmojiPicker(false);
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '👏', '🙌'];

  return (
    <div className="border-t bg-white p-4">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Choose an emoji</h3>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-2xl hover:bg-gray-200 rounded p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Upload className="h-4 w-4 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Uploading...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-2">
        {/* Media Upload Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload image"
          >
            <Image className="h-5 w-5" />
          </button>
          <button
            onClick={() => audioInputRef.current?.click()}
            disabled={!isConnected || isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload audio"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!isConnected}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        className="hidden"
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="mt-2 text-xs text-red-600 flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Disconnected - trying to reconnect...
        </div>
      )}
    </div>
  );
};

export default MessageInput;
