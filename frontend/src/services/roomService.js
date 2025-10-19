import api from './api.js';

export const roomService = {
  // Create a new room
  async createRoom() {
    try {
      const response = await api.post('/api/room/create');
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error(error.response?.data?.error || 'Failed to create room');
    }
  },

  // Check if room exists
  async checkRoom(roomId) {
    try {
      const response = await api.get(`/api/room/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking room:', error);
      throw new Error(error.response?.data?.error || 'Failed to check room');
    }
  },

  // Delete room (only by creator)
  async deleteRoom(roomId, socketId) {
    try {
      const response = await api.delete(`/api/room/${roomId}`, {
        data: { socketId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete room');
    }
  },

  // Get room participants (for debugging)
  async getRoomParticipants(roomId) {
    try {
      const response = await api.get(`/api/room/${roomId}/participants`);
      return response.data;
    } catch (error) {
      console.error('Error getting participants:', error);
      throw new Error(error.response?.data?.error || 'Failed to get participants');
    }
  },

  // Get all active rooms (for debugging)
  async getActiveRooms() {
    try {
      const response = await api.get('/api/room/admin/rooms');
      return response.data;
    } catch (error) {
      console.error('Error getting active rooms:', error);
      throw new Error(error.response?.data?.error || 'Failed to get active rooms');
    }
  }
};
