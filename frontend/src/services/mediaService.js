import api from './api.js';
import { FILE_LIMITS } from '../utils/constants.js';
import { validateFileType, validateFileSize } from '../utils/helpers.js';

export const mediaService = {
  // Upload media file
  async uploadMedia(file, roomId, type) {
    try {
      // Validate file type
      const allowedTypes = type === 'image' 
        ? FILE_LIMITS.ALLOWED_IMAGE_TYPES 
        : FILE_LIMITS.ALLOWED_AUDIO_TYPES;
      
      if (!validateFileType(file, allowedTypes)) {
        throw new Error(`Invalid file type. Only ${type} files are allowed.`);
      }

      // Validate file size
      if (!validateFileSize(file, FILE_LIMITS.MAX_SIZE)) {
        throw new Error(`File too large. Maximum size is ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB.`);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);
      formData.append('type', type);

      // Upload file
      const response = await api.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to upload media');
    }
  },

  // Delete media file
  async deleteMedia(publicId) {
    try {
      const response = await api.delete('/api/media/delete', {
        data: { publicId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete media');
    }
  },

  // Upload image
  async uploadImage(file, roomId) {
    return this.uploadMedia(file, roomId, 'image');
  },

  // Upload audio
  async uploadAudio(file, roomId) {
    return this.uploadMedia(file, roomId, 'audio');
  }
};
