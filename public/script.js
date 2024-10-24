console.log('Script loaded');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    console.log('Elements:', { chatMessages, userInput, sendButton, themeToggle });

    let conversationHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    let sessionId = localStorage.getItem('sessionId');

    function generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('sessionId', sessionId);
    }

    function saveHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
    }

    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isUser ? 'user-message' : 'ai-message');
        
        const textElement = document.createElement('p');
        textElement.textContent = message;
        messageElement.appendChild(textElement);

        if (!isUser) {
            // Hapus format Markdown (### dan **)
            message = message.replace(/###/g, '').replace(/\*\*/g, '');

            const parts = message.split(/(```[\s\S]*?```)/g);
            let formattedMessage = '';

            parts.forEach((part) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const [, language, code] = part.match(/```(\w+)?\n?([\s\S]*?)```/) || [null, '', part.slice(3, -3)];
                    formattedMessage += `<div class="code-block">
                        <div class="code-header">
                            <span class="code-language">${language || 'Code'}</span>
                            <button class="copy-button" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> Copy code
                            </button>
                        </div>
                        <pre><code class="${language || ''}">${escapeHtml(code.trim())}</code></pre>
                    </div>`;
                } else {
                    formattedMessage += `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`;
                }
            });

            messageElement.innerHTML = formattedMessage;

            // Tambahkan tombol copy dan speaker
            const actionButtons = document.createElement('div');
            actionButtons.classList.add('action-buttons');
            actionButtons.innerHTML = `
                <button class="copy-message" onclick="copyMessage(this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="speak-message" onclick="speakMessage(this)" aria-label="Bicara">
                    <i class="fas fa-volume-up"></i>
                </button>
            `;
            messageElement.appendChild(actionButtons);
        } else {
            messageElement.textContent = message;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!isUser) {
            messageElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    async function sendMessage() {
        console.log('sendMessage function called');
        const message = userInput.value.trim();
        console.log('Message:', message);
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': sessionId
                    },
                    body: JSON.stringify({ message, history: conversationHistory }),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.reply) {
                        setTimeout(() => {
                            addMessage(data.reply, false);
                        }, 1000);
                    } else {
                        throw new Error('Invalid response from server');
                    }
                } else {
                    throw new Error('Gagal mendapatkan respons dari server');
                }
            } catch (error) {
                console.error('Kesalahan:', error);
                addMessage('Maaf, terjadi kesalahan saat memproses permintaan Anda.', false);
            }
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.copyCode = function(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy code';
            }, 2000);
        });
    };

    function toggleTheme() {
        const body = document.body;
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateThemeIcon(isDarkMode);
    }

    function updateThemeIcon(isDarkMode) {
        const icon = document.querySelector('#theme-toggle i');
        if (isDarkMode) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    themeToggle.addEventListener('click', toggleTheme);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    function initializeChat(initialMessages) {
        chatMessages.innerHTML = '';
        initialMessages.forEach(msg => addMessage(msg.content, msg.role === 'user'));
        if (initialMessages.length === 0) {
            addMessage("Halo jing! Gue aetherz A-I nih. Ada yang bisa gue bantu?", false);
        }
    }

    try {
        const response = await fetch('/api/chat/messages');
        if (response.ok) {
            const { messages } = await response.json();
            initializeChat(messages);
        } else {
            throw new Error('Failed to fetch chat messages');
        }
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        initializeChat([]);
    }

    const deleteChatBtn = document.getElementById('delete-chat-btn');
    deleteChatBtn.addEventListener('click', deleteChat);

    async function deleteChat() {
        if (confirm('Apa lo yakin pengen hapus semua chat ini? kalo iya klik Oke aja bejir!')) {
            try {
                const response = await fetch('/api/chat/delete', {
                    method: 'DELETE',
                });
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                const text = await response.text();
                console.log('Response text:', text);
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', e);
                    throw new Error('Server returned invalid JSON');
                }
                if (response.ok) {
                    chatMessages.innerHTML = '';
                    conversationHistory = [];
                    localStorage.removeItem('chatHistory');
                    alert('Riwayat chat lo udah dihapus bejir.');
                    initializeChat([]); // Reinitialize the chat
                } else {
                    throw new Error(data.error || 'Gagal menghapus riwayat chat');
                }
            } catch (error) {
                console.error('Error deleting chat history:', error);
                alert(`Terjadi kesalahan saat menghapus riwayat chat lo: ${error.message}`);
            }
        }
    }

    // Tambahkan ini di bagian bawah file, di luar DOMContentLoaded event listener
    window.speakMessage = speakMessage;
});

document.getElementById('test-file-input').addEventListener('click', () => {
    fileInput.click();
});

window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', message, 'Source:', source, 'Line:', lineno, 'Column:', colno, 'Error object:', error);
};

function copyMessage(button) {
    const messageText = button.closest('.ai-message').querySelector('p').textContent;
    navigator.clipboard.writeText(messageText).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

let audioContext;
let oscillator;

function speakMessage(button) {
    const messageText = button.closest('.ai-message').querySelector('p').textContent;
    const speakButton = button;
    speakButton.disabled = true;
    speakButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';

    fetch('/api/tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: messageText })
    })
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        const sound = new Howl({
            src: [audioUrl],
            format: ['mp3'],
            onend: function() {
                speakButton.disabled = false;
                speakButton.innerHTML = '<i class="fas fa-volume-up"></i> Bicara';
            },
            onloaderror: function() {
                console.error('Error loading audio');
                speakButton.disabled = false;
                speakButton.innerHTML = '<i class="fas fa-volume-up"></i> Bicara';
                alert('Baca sendiri lah bejir!, malesan banget jadi manusia.');
            }
        });

        sound.play();

        speakButton.innerHTML = '<i class="fas fa-stop"></i> Berhenti';
        speakButton.onclick = () => {
            sound.stop();
            speakButton.disabled = false;
            speakButton.innerHTML = '<i class="fas fa-volume-up"></i> Bicara';
            speakButton.onclick = () => speakMessage(speakButton);
        };
    })
    .catch(error => {
        console.error('Error:', error);
        speakButton.disabled = false;
        speakButton.innerHTML = '<i class="fas fa-volume-up"></i> Bicara';
        alert('Maaf, terjadi kesalahan saat memproses audio. Silakan coba lagi nanti.');
    });
}

document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            addMessage(`File uploaded successfully: ${data.filename}`, true);
        } else {
            addMessage(`Error uploading file: ${data.error}`, true);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Error uploading file', true);
    }
});

