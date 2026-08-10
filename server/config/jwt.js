const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mulearn-geci-secret-key-2026-fallback';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};