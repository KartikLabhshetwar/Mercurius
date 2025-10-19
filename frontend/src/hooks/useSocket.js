import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants.js';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    console.log('🔌 Initializing Socket.IO connection to:', SOCKET_URL);
    
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    
    console.log('🔌 Socket.IO client created:', newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully:', newSocket.id);
      console.log('🔗 Socket URL:', SOCKET_URL);
      console.log('🌐 Socket transport:', newSocket.io.engine.transport.name);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Add debugging for all events
    newSocket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event received: ${eventName}`, args);
    });

    // Test connection immediately
    console.log('🔍 Testing Socket.IO connection...');
    newSocket.emit('test-connection', { message: 'Frontend connected' });

    // Handle test response
    newSocket.on('test-response', (data) => {
      console.log('✅ Backend test response received:', data);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Emit event helper
  const emit = (event, data) => {
    if (socket && isConnected) {
      console.log(`📤 Emitting event: ${event}`, data);
      socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit event:', event, { socket: !!socket, isConnected });
    }
  };

  // Listen to event helper
  const on = (event, callback) => {
    console.log(`🔗 Registering event listener: ${event}`, { socket: !!socket, isConnected });
    if (socket) {
      socket.on(event, callback);
      console.log(`✅ Event listener registered: ${event}`);
    } else {
      console.warn(`⚠️ Cannot register event listener ${event}: socket not available`);
    }
  };

  // Remove event listener helper
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    socketId: socket?.id
  };
};
