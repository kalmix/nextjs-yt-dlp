const path = require('path');
const primaryDomain = 'https://test.vostro.agency';
const coolifyDomain = 'http://k4sosgskow4scg800w040cc4.150.136.160.212.sslip.io';

const config = {
 server: {
   port: process.env.PORT || 4000,          
   wsPort: process.env.WS_PORT || 8080,     // Keep WebSocket on 8080
   host: '0.0.0.0',
   baseUrl: primaryDomain,
   wsUrl: `${primaryDomain.replace('https', 'wss')}/ws`,
   frontendUrl: primaryDomain,
   cors: {
     origin: [
       primaryDomain,
       coolifyDomain,
       'https://test.vostro.agency',
       'http://k4sosgskow4scg800w040cc4.150.136.160.212.sslip.io'
     ].filter(Boolean),
     methods: ['GET', 'POST', 'OPTIONS'],
     allowedHeaders: [
       'Content-Type', 
       'Authorization',
       'X-Requested-With',
       'Accept',
       'Origin'
     ],
     credentials: true,
     optionsSuccessStatus: 204
   }
 },
 paths: {
   downloads: path.join(__dirname, '..', 'downloads'),
   logs: path.join(__dirname, '..', 'logs'),
   temp: path.join(__dirname, '..', 'temp')
 },
 video: {
   supportedQualities: {
     '360p': 360,
     '480p': 480,
     '720p': 720,
     '1080p': 1080
   },
   defaultQuality: '720p',
   maxFileSize: 1024 * 1024 * 1024, 
   cleanupThreshold: 24 * 60 * 60 * 1000 
 },
 security: {
   rateLimiting: {
     windowMs: 15 * 60 * 1000, 
     max: 100 
   },
   maxRequestSize: '50mb'
 },
 validation: {
   allowedDomains: ['youtube.com', 'youtu.be', 'youtube']
 },
 ports: {
   express: process.env.PORT || 4000,
   websocket: process.env.WS_PORT || 8080, // Keep WebSocket on 8080
 }
};


const requiredEnvVars = [
 'PORT',
 'WS_PORT'  
];

for (const envVar of requiredEnvVars) {
 if (!process.env[envVar]) {
   throw new Error(`Missing required environment variable: ${envVar}`);
 }
}


const ensureDir = (dirPath) => {
 const fs = require('fs');
 if (!fs.existsSync(dirPath)){
   fs.mkdirSync(dirPath, { recursive: true });
 }
};

Object.values(config.paths).forEach(ensureDir);

module.exports = config;
