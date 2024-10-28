const express = require('express');
const { body, validationResult } = require('express-validator');
const FileManager = require('../utils/fileManager');
const logger = require('../utils/logger');

const router = express.Router();

const validateUrl = body('url')
  .isURL()
  .custom(url => url.includes('you'))
  .withMessage('Please provide a valid YouTube URL');

const validateQuality = body('quality')
  .isIn(['360p', '480p', '720p', '1080p', '.mp3'])
  .withMessage('Invalid quality selection');

module.exports = (videoService) => {
  router.post('/fetch-metadata',
    validateUrl,
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const metadata = await videoService.fetchMetadata(req.body.url);
        res.json({ success: true, ...metadata });
      } catch (error) {
        logger.error('Metadata fetch error:', error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  router.post('/download',
    [validateUrl, validateQuality],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { url, quality } = req.body;
        const fileId = FileManager.generateUniqueId();
        
        const downloadedFileId = quality === '.mp3'
          ? await videoService.downloadAudio(url, fileId)
          : await videoService.downloadVideo(url, quality, fileId);

        const extension = quality === '.mp3' ? 'mp3' : 'mp4';
        const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${downloadedFileId}.${extension}`;
        
        res.json({
          success: true,
          message: `${quality === '.mp3' ? 'Audio' : 'Video'} downloaded successfully`,
          downloadUrl
        });
      } catch (error) {
        logger.error('Download error:', error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  return router;
};