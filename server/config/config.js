const path = require('path');

const config = {
  server: {
    port: process.env.PORT || 4000,
    wsPort: process.env.WS_PORT || 8080,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [
            process.env.ALLOWED_ORIGIN,
            'https://k4sosgskow4scg800w040cc4.150.136.160.212.sslip.io',
            'https://test.vostro.agency'
          ]
        : '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  },
  paths: {
    downloads: path.join(__dirname, '..', 'downloads'),
    logs: path.join(__dirname, '..', 'logs')
  },
  video: {
    supportedQualities: {
      '360p': 360,
      '480p': 480,
      '720p': 720,
      '1080p': 1080
    },
    defaultQuality: '720p'
  }
};

module.exports = config;
