// backend/controllers/chatController.js

const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/* ---------------------------------------------------------
   @desc    Get all active chat rooms/conversations for user
   @route   GET /api/chat/rooms
   @access  Private
--------------------------------------------------------- */
const getChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all messages involving the logged-in user, sorted by newest
  const messages = await Message.find({
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  })
  .sort({ createdAt: -1 })
  .populate('sender', 'name email userType pharmacyName')
  .populate('receiver', 'name email userType pharmacyName');

  // Group by unique chatRoomId
  const roomsMap = {};
  messages.forEach(msg => {
    if (!roomsMap[msg.chatRoomId]) {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      if (otherUser) {
        // Format time nicely
        const date = new Date(msg.createdAt);
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        
        roomsMap[msg.chatRoomId] = {
          id: msg.chatRoomId,
          name: otherUser.userType === 'pharmacist' && otherUser.pharmacyName 
            ? otherUser.pharmacyName 
            : otherUser.name,
          pharmacistName: otherUser.name,
          avatar: otherUser.userType === 'pharmacist' ? '🏥' : '👤',
          lastMessage: msg.text || (msg.image ? '📷 Sent a photo' : ''),
          time: timeStr,
          rawTime: msg.createdAt,
          online: true, // Default display online
          role: otherUser.userType,
          otherUserId: otherUser._id
        };
      }
    }
  });

  // Sort rooms by latest message time
  const sortedRooms = Object.values(roomsMap).sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));

  res.status(200).json(sortedRooms);
});

/* ---------------------------------------------------------
   @desc    Get all messages inside a specific room
   @route   GET /api/chat/messages/:chatRoomId
   @access  Private
--------------------------------------------------------- */
const getChatMessages = asyncHandler(async (req, res) => {
  const { chatRoomId } = req.params;

  const messages = await Message.find({ chatRoomId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email userType')
    .populate('receiver', 'name email userType');

  // Format response for the frontend Message component
  const formattedMessages = messages.map(msg => ({
    id: msg._id,
    sender: msg.sender._id.toString() === req.user._id.toString() ? 'user' : msg.sender.userType,
    text: msg.text,
    image: msg.image || null,
    time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: 'read'
  }));

  res.status(200).json(formattedMessages);
});

/* ---------------------------------------------------------
   @desc    Send a new chat message
   @route   POST /api/chat/send
   @access  Private
--------------------------------------------------------- */
const sendChatMessage = asyncHandler(async (req, res) => {
  const { chatRoomId, receiverId, text, image } = req.body;

  if (!chatRoomId || !receiverId) {
    res.status(400);
    throw new Error("chatRoomId and receiverId are required");
  }

  const message = await Message.create({
    chatRoomId,
    sender: req.user._id,
    receiver: receiverId,
    text: text || '',
    image: image || null
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name email userType')
    .populate('receiver', 'name email userType');

  const formattedMessage = {
    id: populated._id,
    sender: 'user',
    text: populated.text,
    image: populated.image || null,
    time: new Date(populated.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: 'sent'
  };

  res.status(201).json(formattedMessage);
});

module.exports = {
  getChatRooms,
  getChatMessages,
  sendChatMessage
};
