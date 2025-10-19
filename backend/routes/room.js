import express from 'express';
import { roomService } from '../services/roomService.js';

const router = express.Router();

// Create a new room
router.post('/create', (req, res) => {
  try {
    const room = roomService.createRoom(null); // Will be updated when socket connects
    
    res.json({
      success: true,
      room: {
        id: room.id,
        createdAt: room.createdAt,
        shareableLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/room/${room.id}`
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room'
    });
  }
});

// Check if room exists
router.get('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = roomService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      room: {
        id: room.id,
        participantCount: room.participants.size,
        messageCount: room.messages.length,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Error checking room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check room'
    });
  }
});

// Delete room (only by creator)
router.delete('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const { socketId } = req.body; // Socket ID of the requester
    
    const room = roomService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    // Check if requester is the creator
    if (room.createdBy !== socketId) {
      return res.status(403).json({
        success: false,
        error: 'Only room creator can delete the room'
      });
    }
    
    const { room: deletedRoom, mediaUrls } = roomService.deleteRoom(roomId);
    
    res.json({
      success: true,
      message: 'Room deleted successfully',
      mediaUrls // For cleanup on frontend
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room'
    });
  }
});

// Get room participants (for debugging/admin)
router.get('/:roomId/participants', (req, res) => {
  try {
    const { roomId } = req.params;
    const participants = roomService.getRoomParticipants(roomId);
    
    res.json({
      success: true,
      participants
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get participants'
    });
  }
});

// Get all active rooms (for debugging/admin)
router.get('/admin/rooms', (req, res) => {
  try {
    const rooms = roomService.getActiveRooms();
    
    res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rooms'
    });
  }
});

export default router;
