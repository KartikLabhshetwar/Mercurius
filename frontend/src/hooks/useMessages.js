import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket.js';
import { SOCKET_EVENTS, MESSAGE_TYPES } from '../utils/constants.js';
import { formatTimestamp } from '../utils/helpers.js';

export const useMessages = (roomId) => {
  console.log('💬 useMessages hook called with roomId:', roomId);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const { socket, on, off } = useSocket();
  const listenersRegistered = useRef(false);
  
  console.log('💬 useMessages - socket status:', { socket: !!socket, roomId });

  // Add message to list
  const addMessage = useCallback((message) => {
    console.log('➕ Adding message:', message);
    setMessages(prev => {
      const newMessage = {
        ...message,
        formattedTimestamp: formatTimestamp(message.timestamp)
      };
      console.log('➕ New message with timestamp:', newMessage);
      const updatedMessages = [...prev, newMessage];
      console.log('➕ Updated messages array:', updatedMessages);
      return updatedMessages;
    });
  }, []);

  // Update participants list
  const updateParticipants = useCallback((newParticipants) => {
    console.log('Updating participants:', newParticipants);
    setParticipants(newParticipants);
  }, []);

  // Send text message
  const sendMessage = useCallback((message, username) => {
    console.log('Sending message:', { message, username, socket: !!socket, roomId });
    if (socket && roomId && message.trim()) {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        roomId,
        message: message.trim(),
        username
      });
    } else {
      console.warn('Cannot send message:', { socket: !!socket, roomId, message: message.trim() });
    }
  }, [socket, roomId]);

  // Send media message
  const sendMedia = useCallback((mediaUrl, mediaType, username) => {
    if (socket && roomId && mediaUrl) {
      socket.emit(SOCKET_EVENTS.SEND_MEDIA, {
        roomId,
        mediaUrl,
        mediaType,
        username
      });
    }
  }, [socket, roomId]);

  // Send emoji message
  const sendEmoji = useCallback((emoji, username) => {
    if (socket && roomId && emoji) {
      socket.emit(SOCKET_EVENTS.SEND_EMOJI, {
        roomId,
        emoji,
        username
      });
    }
  }, [socket, roomId]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !roomId) {
      console.log('⚠️ Skipping event listener setup:', { socket: !!socket, roomId });
      return;
    }

    console.log('🔧 Setting up event listeners for room:', roomId);

    // Room history (when joining)
    const handleRoomHistory = (data) => {
      console.log('📜 Received room history:', data);
      console.log('📜 Room history messages count:', data.messages?.length || 0);
      console.log('📜 Handler ID:', Math.random().toString(36).substr(2, 9));
      const formattedMessages = data.messages.map(msg => ({
        ...msg,
        formattedTimestamp: formatTimestamp(msg.timestamp)
      }));
      console.log('📜 Setting messages:', formattedMessages);
      setMessages(formattedMessages);
      setParticipants(data.participants);
    };

    // New message received
    const handleReceiveMessage = (message) => {
      console.log('📨 Received message:', message);
      console.log('📨 Adding message to list');
      console.log('📨 Handler ID:', Math.random().toString(36).substr(2, 9));
      addMessage(message);
    };

    // User joined
    const handleUserJoined = (data) => {
      console.log('User joined event received:', data);
      updateParticipants(data.participants);
      // Add system message
      addMessage({
        id: `system-${Date.now()}`,
        type: 'system',
        content: `${data.username} joined the room`,
        username: 'System',
        timestamp: new Date()
      });
    };

    // User left
    const handleUserLeft = (data) => {
      updateParticipants(data.participants);
      // Add system message
      addMessage({
        id: `system-${Date.now()}`,
        type: 'system',
        content: `${data.username} left the room`,
        username: 'System',
        timestamp: new Date()
      });
    };

    // Room deleted
    const handleRoomDeleted = (data) => {
      addMessage({
        id: `system-${Date.now()}`,
        type: 'system',
        content: data.message,
        username: 'System',
        timestamp: new Date()
      });
    };

    // Error handling
    const handleError = (error) => {
      console.error('Socket error:', error);
      addMessage({
        id: `error-${Date.now()}`,
        type: 'error',
        content: error.message,
        username: 'System',
        timestamp: new Date()
      });
    };

    // Register event listeners only once
    if (!listenersRegistered.current) {
      console.log('🔗 Registering event listeners for room:', roomId);
      console.log('🔗 Socket state:', { socket: !!socket, connected: socket?.connected });
      
      on(SOCKET_EVENTS.ROOM_HISTORY, handleRoomHistory);
      on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      on(SOCKET_EVENTS.ROOM_DELETED, handleRoomDeleted);
      on(SOCKET_EVENTS.ERROR, handleError);
      
      listenersRegistered.current = true;
      console.log('🔗 Event listeners registered successfully');
    } else {
      console.log('⚠️ Event listeners already registered, skipping');
    }

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up event listeners');
      off(SOCKET_EVENTS.ROOM_HISTORY, handleRoomHistory);
      off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      off(SOCKET_EVENTS.ROOM_DELETED, handleRoomDeleted);
      off(SOCKET_EVENTS.ERROR, handleError);
      listenersRegistered.current = false;
    };
  }, [socket, roomId, on, off, addMessage, updateParticipants]);

  // Clear messages when room changes
  useEffect(() => {
    console.log('🔄 Room changed, clearing messages and resetting listeners');
    setMessages([]);
    setParticipants([]);
    listenersRegistered.current = false;
  }, [roomId]);

  return {
    messages,
    participants,
    sendMessage,
    sendMedia,
    sendEmoji,
    participantCount: participants.length
  };
};
