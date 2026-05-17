// backend/routers/chatRoutes.js

const express = require('express');
const router = express.Router();
const {
  getChatRooms,
  getChatMessages,
  sendChatMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Base path: /api/chat

router.get('/rooms', protect, getChatRooms);
router.get('/messages/:chatRoomId', protect, getChatMessages);
router.post('/send', protect, sendChatMessage);

module.exports = router;
