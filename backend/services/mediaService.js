import cloudinary from '../config/cloudinary.js';

export const mediaService = {
  // Upload image to Cloudinary
  async uploadImage(file) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'image',
        folder: 'mercurius-chat/images',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        type: 'image'
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  // Upload audio to Cloudinary
  async uploadAudio(file) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'video', // Cloudinary treats audio as video
        folder: 'mercurius-chat/audio',
        format: 'mp3'
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        type: 'audio'
      };
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw new Error('Failed to upload audio');
    }
  },

  // Delete media from Cloudinary
  async deleteMedia(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Media deleted: ${publicId}`, result);
      return result;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media');
    }
  },

  // Delete multiple media files
  async deleteMultipleMedia(publicIds) {
    try {
      const results = await Promise.allSettled(
        publicIds.map(publicId => this.deleteMedia(publicId))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`Media cleanup: ${successful} deleted, ${failed} failed`);
      return { successful, failed };
    } catch (error) {
      console.error('Error deleting multiple media:', error);
      throw new Error('Failed to delete multiple media');
    }
  },

  // Extract public ID from Cloudinary URL
  extractPublicId(url) {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      return `mercurius-chat/images/${publicId}` || `mercurius-chat/audio/${publicId}`;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
};
