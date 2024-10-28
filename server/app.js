const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const WebSocketManager = require('./services/websocketManager');
const VideoService = require('./services/videoService');
const logger = require('./utils/logger');
const FileManager = require('./utils/fileManager');


const app = express();
const wsManager = new WebSocketManager(config.server.wsPort);
const videoService = new VideoService(wsManager);

// Middleware
app.use(cors(config.server.cors));
app.use(express.json());

// Direct routes instead of using router
app.post("/fetch-metadata", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.includes("you")) {
      return res.status(400).json({ error: "Please provide a valid YouTube URL" });
    }

    const metadata = await videoService.fetchMetadata(url);
    res.json({ 
      success: true, 
      ...metadata 
    });
  } catch (error) {
    logger.error('Metadata fetch error:', error);
    res.status(500).json({ error: "Failed to fetch video metadata." });
  }
});

app.post("/download", async (req, res) => {
  try {
    const { url, quality } = req.body;
    
    if (!url || !url.includes("you")) {
      return res.status(400).json({ error: "Please provide a valid YouTube URL" });
    }

    const fileId = FileManager.generateUniqueId();
    let downloadedFileId;

    if (quality === '.mp3') {
      downloadedFileId = await videoService.downloadAudio(url, fileId);
    } else {
      downloadedFileId = await videoService.downloadVideo(url, quality, fileId);
    }

    const extension = quality === '.mp3' ? 'mp3' : 'mp4';
    const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${downloadedFileId}.${extension}`;
    
    res.json({
      success: true,
      message: `${quality === '.mp3' ? 'Audio' : 'Video'} downloaded successfully.`,
      downloadUrl
    });
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.use('/downloads', express.static(config.paths.downloads));

// Health check
app.get('/ping', (req, res) => res.json({ success: true }));

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`Server running at http://localhost:${config.server.port}`);
});

// Cleanup old downloads periodically
setInterval(() => {
  FileManager.cleanOldDownloads();
}, 60 * 60 * 1000); // Every hour

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;