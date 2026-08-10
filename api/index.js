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

  // Prepend /api if Vercel stripped /api prefix from req.url
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
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
