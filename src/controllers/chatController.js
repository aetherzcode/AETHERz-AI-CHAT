const aiService = require('../services/aiService');
const Chat = require('../models/Chat');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.renderChatPage = async (req, res) => {
  const username = req.session.user.username;
  let chat = await Chat.findOne({ username });
  
  if (!chat) {
    chat = new Chat({ username, messages: [] });
    await chat.save();
  }

  res.render('index', { username, messages: chat.messages });
};

exports.handleChatMessage = async (req, res) => {
  const { message } = req.body;
  const username = req.session.user.username;

  try {
    let chat = await Chat.findOne({ username });
    if (!chat) {
      chat = new Chat({ username, messages: [] });
    }

    chat.messages.push({ role: 'user', content: message });
    chat.lastAccess = Date.now();

    const reply = await aiService.getAIResponse(message, chat.messages);
    chat.messages.push({ role: 'assistant', content: reply });

    await chat.save();

    res.json({ reply });
  } catch (error) {
    console.error('Error in handleChatMessage:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan lo.' });
  }
};

exports.handleFileUpload = upload.single('file');

exports.processUploadedFile = (req, res) => {
  if (req.file) {
    // Process the uploaded file here
    // You can read the file contents and send it to the AI for analysis
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
};

exports.deleteChat = async (req, res) => {
    const username = req.session.user.username;
    try {
        await Chat.findOneAndDelete({ username });
        res.status(200).json({ message: 'Riwayat chat lo berhasil dihapus😏' });
    } catch (error) {
        console.error('Waduh sorry ngab lagi error nih hapus chat nya:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus riwayat chat lo' });
    }
};
