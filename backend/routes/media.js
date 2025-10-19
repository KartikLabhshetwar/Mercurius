import express from 'express';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { mediaService } from '../services/mediaService.js';

const router = express.Router();

// Upload media file
router.post('/upload', uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { roomId, type } = req.body;
    
    if (!roomId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Room ID and media type are required'
      });
    }

    if (!['image', 'audio'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid media type. Must be "image" or "audio"'
      });
    }

    // Convert buffer to base64 for Cloudinary
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    let uploadResult;
    if (type === 'image') {
      uploadResult = await mediaService.uploadImage(base64File);
    } else if (type === 'audio') {
      uploadResult = await mediaService.uploadAudio(base64File);
    }

    res.json({
      success: true,
      media: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        type: uploadResult.type,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media'
    });
  }
});

// Delete media file
router.delete('/delete', async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Public ID is required'
      });
    }

    await mediaService.deleteMedia(publicId);
    
    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete media'
    });
  }
});

export default router;
