const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class FileManager {
  static generateUniqueId() {
    return crypto.randomBytes(8).toString('hex');
  }

  static async createDownloadPath(fileId, extension) {
    const filename = `${fileId}.${extension}`;
    const filepath = path.join(config.paths.downloads, filename);
    
    try {
      await fs.access(config.paths.downloads);
    } catch {
      await fs.mkdir(config.paths.downloads, { recursive: true });
    }
    
    return filepath;
  }

  static async cleanOldDownloads(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const files = await fs.readdir(config.paths.downloads);
      const now = Date.now();

      for (const file of files) {
        const filepath = path.join(config.paths.downloads, file);
        const stats = await fs.stat(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filepath);
          logger.info(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning old downloads:', error);
    }
  }
}

module.exports = FileManager;
