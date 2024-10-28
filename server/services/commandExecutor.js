const { spawn } = require('child_process');
const logger = require('../utils/logger');

class CommandExecutor {
  static async execute(command, args, wsManager) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args);
      let stdoutData = '';
      let stderrData = '';

      process.stdout.on('data', (data) => {
        stdoutData += data.toString();
        wsManager.broadcastLog(data.toString());
      });

      process.stderr.on('data', (data) => {
        stderrData += data.toString();
        wsManager.broadcastLog(data.toString());
      });

      process.on('error', (error) => {
        logger.error(`Command execution error: ${error.message}`);
        reject(error);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout: stdoutData, stderr: stderrData });
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }
}

module.exports = CommandExecutor;