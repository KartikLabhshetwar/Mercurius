import { roomService } from '../services/roomService.js';
import { mediaService } from '../services/mediaService.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Test connection handler
    socket.on('test-connection', (data) => {
      console.log('🧪 Frontend test connection received:', data);
      socket.emit('test-response', { message: 'Backend received test', timestamp: new Date() });
    });

    // Join room event
    socket.on('join-room', ({ roomId, username }) => {
      console.log('🔵 Received join-room event:', { roomId, username, socketId: socket.id });
      try {
        const room = roomService.getRoomById(roomId);
        if (!room) {
          console.log('❌ Room not found:', roomId);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        console.log('✅ Room found:', roomId);

        // Add participant to room
        roomService.addParticipant(roomId, socket.id, username);
        
        // Join socket.io room for broadcasting
        socket.join(roomId);
        
        // Get updated room data
        const updatedRoom = roomService.getRoomById(roomId);
        
        // Update room creator if this is the first user and no creator is set
        if (updatedRoom.participants.size === 1 && !updatedRoom.createdBy) {
          updatedRoom.createdBy = socket.id;
          console.log(`Room ${roomId} creator set to ${socket.id}`);
        }

        // Send room history to the new user
        console.log('📤 Sending room history to user:', socket.id);
        socket.emit('room-history', {
          messages: updatedRoom.messages,
          participants: roomService.getRoomParticipants(roomId)
        });
        console.log('✅ Room history sent successfully');

        // Notify other users about new participant
        console.log('📤 Notifying other users about new participant');
        socket.to(roomId).emit('user-joined', {
          username,
          participantCount: updatedRoom.participants.size,
          participants: roomService.getRoomParticipants(roomId)
        });
        console.log('✅ User joined notification sent');

        console.log(`${username} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send text message
    socket.on('send-message', ({ roomId, message, username }) => {
      console.log('Received send-message event:', { roomId, message, username });
      try {
        const room = roomService.getRoomById(roomId);
        if (!room) {
          console.log('Room not found:', roomId);
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const messageData = {
          type: 'text',
          content: message,
          username
        };

        const savedMessage = roomService.addMessage(roomId, messageData);
        console.log('Message saved:', savedMessage);

        // Broadcast to all users in the room
        io.to(roomId).emit('receive-message', savedMessage);
        console.log(`Message broadcasted to room ${roomId}`);

        console.log(`Message sent in room ${roomId} by ${username}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Send media message
    socket.on('send-media', ({ roomId, mediaUrl, mediaType, username }) => {
      try {
        const room = roomService.getRoomById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const messageData = {
          type: 'media',
          content: mediaType === 'image' ? '📷 Image' : '🎵 Audio',
          mediaUrl,
          mediaType,
          username
        };

        const savedMessage = roomService.addMessage(roomId, messageData);

        // Broadcast to all users in the room
        io.to(roomId).emit('receive-message', savedMessage);

        console.log(`Media sent in room ${roomId} by ${username}`);
      } catch (error) {
        console.error('Error sending media:', error);
        socket.emit('error', { message: 'Failed to send media' });
      }
    });

    // Send emoji message
    socket.on('send-emoji', ({ roomId, emoji, username }) => {
      try {
        const room = roomService.getRoomById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const messageData = {
          type: 'emoji',
          content: emoji,
          username
        };

        const savedMessage = roomService.addMessage(roomId, messageData);

        // Broadcast to all users in the room
        io.to(roomId).emit('receive-message', savedMessage);

        console.log(`Emoji sent in room ${roomId} by ${username}`);
      } catch (error) {
        console.error('Error sending emoji:', error);
        socket.emit('error', { message: 'Failed to send emoji' });
      }
    });

    // Leave room event
    socket.on('leave-room', ({ roomId }) => {
      try {
        const participant = roomService.removeParticipant(roomId, socket.id);
        if (participant) {
          socket.leave(roomId);
          
          // Notify other users
          socket.to(roomId).emit('user-left', {
            username: participant.username,
            participantCount: roomService.getRoomParticipants(roomId).length,
            participants: roomService.getRoomParticipants(roomId)
          });

          console.log(`${participant.username} left room ${roomId}`);
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Delete room event (only by creator)
    socket.on('delete-room', async ({ roomId }) => {
      try {
        const room = roomService.getRoomById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is the creator
        if (room.createdBy !== socket.id) {
          socket.emit('error', { message: 'Only room creator can delete the room' });
          return;
        }

        // Extract media URLs for cleanup
        const mediaUrls = room.messages
          .filter(msg => msg.type === 'media' && msg.mediaUrl)
          .map(msg => msg.mediaUrl);

        // Delete media from Cloudinary
        if (mediaUrls.length > 0) {
          try {
            const publicIds = mediaUrls.map(url => mediaService.extractPublicId(url)).filter(Boolean);
            if (publicIds.length > 0) {
              await mediaService.deleteMultipleMedia(publicIds);
            }
          } catch (mediaError) {
            console.error('Error deleting media:', mediaError);
            // Continue with room deletion even if media cleanup fails
          }
        }

        // Delete room
        roomService.deleteRoom(roomId);

        // Notify all users in the room
        io.to(roomId).emit('room-deleted', {
          message: 'Room has been deleted by the creator'
        });

        // Disconnect all users from the room
        io.in(roomId).disconnectSockets();

        console.log(`Room ${roomId} deleted by ${socket.id}`);
      } catch (error) {
        console.error('Error deleting room:', error);
        socket.emit('error', { message: 'Failed to delete room' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from all rooms they were in
      // This is a cleanup mechanism for unexpected disconnections
      const rooms = roomService.getActiveRooms();
      rooms.forEach(room => {
        const participant = roomService.removeParticipant(room.id, socket.id);
        if (participant) {
          socket.to(room.id).emit('user-left', {
            username: participant.username,
            participantCount: roomService.getRoomParticipants(room.id).length,
            participants: roomService.getRoomParticipants(room.id)
          });
          console.log(`${participant.username} disconnected from room ${room.id}`);
        }
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
