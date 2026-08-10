let app;
let initError = null;

try {
  app = require('../server/server.js');
} catch (error) {
  initError = error;
  console.error('Failed to initialize Express server in api/index.js:', error);
}

module.exports = async (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      error: 'Vercel Serverless Initialization Error',
      message: initError.message,
      stack: initError.stack
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Vercel Request Handling Error',
      message: err.message,
      stack: err.stack
    });
  }
};
