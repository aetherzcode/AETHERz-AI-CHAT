const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  messages: [{
    role: String,
    content: String,
  }],
  lastAccess: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
