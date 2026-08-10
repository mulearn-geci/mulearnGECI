let app;
let initError = null;

try {
  app = require('../server/server.js');
} catch (err) {
  initError = {
    message: err.message,
    stack: err.stack,
    name: err.name
  };
  console.error('Init Error:', err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      errorType: 'InitializationError',
      message: initError.message,
      stack: initError.stack
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      errorType: 'RuntimeError',
      message: err.message,
      stack: err.stack
    });
  }
};
