import { v4 as uuidv4 } from 'uuid';

// In-memory storage for rooms
const rooms = new Map();

// Room structure:
// {
//   id: string,
//   messages: Array<{id, type, content, username, timestamp, mediaUrl?, mediaType?}>,
//   participants: Map<socketId, {username, joinedAt}>,
//   createdAt: Date,
//   createdBy: string (socketId)
// }

export const roomService = {
  // Create a new room
  createRoom(creatorSocketId) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      messages: [],
      participants: new Map(),
      createdAt: new Date(),
      createdBy: creatorSocketId || null // Allow null initially
    };
    
    rooms.set(roomId, room);
    console.log(`Room created: ${roomId}`);
    return room;
  },

  // Get room by ID
  getRoomById(roomId) {
    return rooms.get(roomId);
  },

  // Add participant to room
  addParticipant(roomId, socketId, username) {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.participants.set(socketId, {
      username,
      joinedAt: new Date()
    });

    console.log(`User ${username} joined room ${roomId}`);
    return room;
  },

  // Remove participant from room
  removeParticipant(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) {
      return null;
    }

    const participant = room.participants.get(socketId);
    room.participants.delete(socketId);

    if (participant) {
      console.log(`User ${participant.username} left room ${roomId}`);
    }

    return participant;
  },

  // Add message to room
  addMessage(roomId, message) {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const messageWithId = {
      id: uuidv4(),
      timestamp: new Date(),
      ...message
    };

    room.messages.push(messageWithId);
    console.log(`Message added to room ${roomId}: ${message.type}`);
    
    return messageWithId;
  },

  // Delete room and all its data
  deleteRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Extract all media URLs for cleanup
    const mediaUrls = room.messages
      .filter(msg => msg.type === 'media' && msg.mediaUrl)
      .map(msg => msg.mediaUrl);

    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted with ${mediaUrls.length} media files`);
    
    return { room, mediaUrls };
  },

  // Get all active rooms (for debugging)
  getActiveRooms() {
    return Array.from(rooms.values()).map(room => ({
      id: room.id,
      participantCount: room.participants.size,
      messageCount: room.messages.length,
      createdAt: room.createdAt,
      createdBy: room.createdBy
    }));
  },

  // Check if user is room creator
  isRoomCreator(roomId, socketId) {
    const room = rooms.get(roomId);
    return room && room.createdBy === socketId;
  },

  // Get room participants
  getRoomParticipants(roomId) {
    const room = rooms.get(roomId);
    if (!room) {
      return [];
    }

    return Array.from(room.participants.entries()).map(([socketId, data]) => ({
      socketId,
      ...data
    }));
  }
};
