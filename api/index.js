let app;
let initError = null;

try {
  app = require('../server/server.js');
} catch (err) {
  initError = err;
  console.error('Initialization error:', err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      stage: 'init',
      error: initError.message,
      stack: initError.stack
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      stage: 'handler',
      error: err.message,
      stack: err.stack
    });
  }
};
