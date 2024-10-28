const WebSocket = require('ws');
const logger = require('../utils/logger');

class WebSocketManager {
  constructor(port) {
    this.wss = new WebSocket.Server({ port });
    this.setupWebSocket();
    logger.info(`WebSocket server started on port ${port}`);
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      logger.info('Client connected to WebSocket');
      
      // Send initial connection message
      ws.send(JSON.stringify({ 
        log: 'Connected to server logs...' 
      }));

      ws.on('close', () => {
        logger.info('Client disconnected from WebSocket');
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });
  }

  broadcastLog(message) {
    if (this.wss.clients.size > 0) {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] ${message.trim()}`;
      
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ log: formattedMessage }));
        }
      });
    }
  }
}

module.exports = WebSocketManager;