const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');
const Chat = require('../models/Chat');

router.post('/chat', chatController.handleChatMessage);
router.get('/login', authController.renderLoginPage);
router.post('/login', authController.login);
router.get('/register', authController.renderRegisterPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

router.post('/upload', 
  chatController.handleFileUpload ? chatController.handleFileUpload : (req, res, next) => next(),
  chatController.processUploadedFile ? chatController.processUploadedFile : (req, res) => res.status(501).json({ error: 'File upload not implemented' })
);

router.get('/chat', isAuthenticated, chatController.renderChatPage);

router.get('/chat/messages', async (req, res) => {
  try {
    const chat = await Chat.findOne({ username: req.session.user.username });
    res.json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat messages.' });
  }
});

router.delete('/chat/delete', isAuthenticated, chatController.deleteChat);

module.exports = router;
