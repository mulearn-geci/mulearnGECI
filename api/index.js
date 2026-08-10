module.exports = (req, res) => {
  try {
    const app = require('../server/server.js');
    return app(req, res);
  } catch (err) {
    return res.status(200).json({
      success: false,
      diagnosticError: true,
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack
    });
  }
};
