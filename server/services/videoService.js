const CommandExecutor = require('./commandExecutor');
const FileManager = require('../utils/fileManager');
const config = require('../config/config');
const logger = require('../utils/logger');

class VideoService {
  constructor(wsManager) {
    this.wsManager = wsManager;
  }

  async fetchMetadata(url) {
    try {
      const { stdout } = await CommandExecutor.execute(
        'yt-dlp',
        ['--get-title', '--get-thumbnail', url],
        this.wsManager
      );

      const [title, thumbnailUrl] = stdout.split('\n').filter(line => line);
      return { title, thumbnailUrl };
    } catch (error) {
      logger.error('Error fetching metadata:', error);
      throw new Error('Failed to fetch video metadata');
    }
  }

  async downloadAudio(url, fileId) {
    try {
      const outputPath = await FileManager.createDownloadPath(fileId, 'mp3');
      await CommandExecutor.execute(
        'yt-dlp',
        ['-x', '--audio-format', 'mp3', '-o', outputPath, url, '--embed-thumbnail'],
        this.wsManager
      );
      return fileId;
    } catch (error) {
      logger.error('Error downloading audio:', error);
      throw new Error('Failed to download audio');
    }
  }

  async downloadVideo(url, quality, fileId) {
    try {
      const { stdout: formatsOutput } = await CommandExecutor.execute(
        'yt-dlp',
        ['-F', url],
        this.wsManager
      );

      const format = this.selectVideoFormat(formatsOutput, quality);
      if (!format) {
        throw new Error(`Requested quality (${quality}) is not available`);
      }

      const outputPath = await FileManager.createDownloadPath(fileId, 'mp4');
      await CommandExecutor.execute(
        'yt-dlp',
        [
          '-f', `${format}+bestaudio/best`,
          '-o', outputPath,
          '-S', 'ext:mp4:m4a',
          '--recode', 'mp4',
          url
        ],
        this.wsManager
      );

      return fileId;
    } catch (error) {
      logger.error('Error downloading video:', error);
      throw new Error('Failed to download video');
    }
  }

  selectVideoFormat(formatsOutput, requestedQuality) {
    const formats = this.parseFormats(formatsOutput);
    const targetHeight = config.video.supportedQualities[requestedQuality];

    if (!targetHeight) return null;

    const relevantFormats = formats
      .filter(format => format.extension === 'mp4' && format.resolution.includes('x'))
      .sort((a, b) => {
        const heightA = parseInt(a.resolution.split('x')[1]);
        const heightB = parseInt(b.resolution.split('x')[1]);
        return Math.abs(heightA - targetHeight) - Math.abs(heightB - targetHeight);
      });

    return relevantFormats.length > 0 ? relevantFormats[0].formatCode : null;
  }

  parseFormats(output) {
    const formats = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(\w+)\s+(\d+x\d+)\s+(.+)$/);
      if (match) {
        formats.push({
          formatCode: match[1],
          extension: match[2],
          resolution: match[3],
          note: match[4]
        });
      }
    }

    return formats;
  }
}

module.exports = VideoService;