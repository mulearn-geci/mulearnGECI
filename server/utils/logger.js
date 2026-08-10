const fs = require('fs');
const path = require('path');

// Ensure logs directory exists (only if not in serverless environment)
const logsDir = path.join(__dirname, '../logs');
if (!process.env.VERCEL) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (err) {
    // Ignore read-only filesystem errors
  }
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const writeLog = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  };

  const logString = JSON.stringify(logEntry) + '\n';
  
  // Always log to console (captured by Vercel logs)
  console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`);
  
  // Write to log files only when running as standalone server
  if (!process.env.VERCEL) {
    try {
      const logFile = path.join(logsDir, `${level}.log`);
      fs.appendFileSync(logFile, logString);
      
      const combinedLogFile = path.join(logsDir, 'combined.log');
      fs.appendFileSync(combinedLogFile, logString);
    } catch (err) {
      // Ignore filesystem errors in serverless
    }
  }
};

const logger = {
  info: (message, meta = {}) => writeLog('info', message, meta),
  warn: (message, meta = {}) => writeLog('warn', message, meta),
  error: (message, meta = {}) => writeLog('error', message, meta),
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('debug', message, meta);
    }
  }
};

module.exports = logger;