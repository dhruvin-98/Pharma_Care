// Replace your authMiddleware.js with this fixed version:

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401);
        throw new Error('Not authorized, token missing');
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      const message = error?.name === 'TokenExpiredError'
        ? 'Not authorized, token expired'
        : 'Not authorized, invalid token';
      console.warn(`JWT auth failed: ${error?.name || 'UnknownError'}`);
      res.status(401);
      throw new Error(message);
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };