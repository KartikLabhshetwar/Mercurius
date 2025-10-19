// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Socket Events
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_ROOM: 'join-room',
  SEND_MESSAGE: 'send-message',
  SEND_MEDIA: 'send-media',
  SEND_EMOJI: 'send-emoji',
  LEAVE_ROOM: 'leave-room',
  DELETE_ROOM: 'delete-room',
  
  // Server to Client
  ROOM_HISTORY: 'room-history',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  RECEIVE_MESSAGE: 'receive-message',
  ROOM_DELETED: 'room-deleted',
  ERROR: 'error'
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  MEDIA: 'media',
  EMOJI: 'emoji'
};

// Media Types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio'
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']
};
