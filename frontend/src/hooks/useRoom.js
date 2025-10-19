import { useState, useCallback } from 'react';
import { useSocket } from './useSocket.js';
import { SOCKET_EVENTS } from '../utils/constants.js';
import { roomService } from '../services/roomService.js';

export const useRoom = () => {
  console.log('🏠 useRoom hook initialized');
  
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [username, setUsername] = useState('');
  const { socket, emit, socketId } = useSocket();
  
  console.log('🏠 useRoom hook - socket status:', { socket: !!socket, socketId, isConnected: socket?.connected });

  // Join room
  const joinRoom = useCallback(async (roomId, userUsername) => {
    try {
      console.log('🚀 Starting join room process:', { roomId, userUsername, socket: !!socket, isConnected: socket?.connected });
      
      if (!socket || !roomId || !userUsername) {
        throw new Error('Missing required parameters');
      }

      // Check if room exists
      console.log('🔍 Checking if room exists...');
      const roomCheck = await roomService.checkRoom(roomId);
      console.log('📋 Room check result:', roomCheck);
      
      if (!roomCheck.success) {
        throw new Error('Room not found');
      }

      // Set username and room
      console.log('👤 Setting username and room...');
      setUsername(userUsername);
      setCurrentRoom(roomId);

      // Join socket room
      console.log('📤 Emitting join-room event...');
      emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId,
        username: userUsername
      });

      console.log(`✅ Successfully initiated join for room ${roomId} as ${userUsername}`);
      return true;
    } catch (error) {
      console.error('❌ Error joining room:', error);
      throw error;
    }
  }, [socket, emit]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (socket && currentRoom) {
      emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId: currentRoom });
      console.log(`Left room ${currentRoom}`);
    }
    
    setCurrentRoom(null);
    setIsCreator(false);
    setUsername('');
  }, [socket, emit, currentRoom]);

  // Delete room (only by creator)
  const deleteRoom = useCallback(async () => {
    try {
      if (!socket || !currentRoom || !socketId) {
        throw new Error('Missing required parameters');
      }

      // Delete via API
      await roomService.deleteRoom(currentRoom, socketId);
      
      // Emit delete event
      emit(SOCKET_EVENTS.DELETE_ROOM, { roomId: currentRoom });
      
      console.log(`Deleted room ${currentRoom}`);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }, [socket, emit, currentRoom, socketId]);

  // Create room
  const createRoom = useCallback(async (userUsername) => {
    try {
      if (!userUsername) {
        throw new Error('Username is required');
      }

      const result = await roomService.createRoom();
      if (!result.success) {
        throw new Error('Failed to create room');
      }

      const roomId = result.room.id;
      
      // Set username and room
      setUsername(userUsername);
      setCurrentRoom(roomId);
      setIsCreator(true);

      // Join socket room
      emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId,
        username: userUsername
      });

      console.log(`Created and joined room ${roomId} as ${userUsername}`);
      return {
        roomId,
        shareableLink: result.room.shareableLink
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }, [emit]);

  // Check if user is creator
  const checkIsCreator = useCallback(() => {
    // This will be updated when we receive room history
    return isCreator;
  }, [isCreator]);

  return {
    currentRoom,
    isCreator,
    username,
    joinRoom,
    leaveRoom,
    deleteRoom,
    createRoom,
    checkIsCreator
  };
};
