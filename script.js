const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Inisialisasi riwayat chat dari sessionStorage atau buat array kosong jika belum ada
let chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];

// Fungsi untuk memperbarui tampilan chat
function updateChatDisplay() {
    chatMessages.innerHTML = '';
    chatHistory.forEach(msg => {
        addMessage(msg.sender, msg.message);
    });
}

// Panggil fungsi ini saat halaman dimuat
updateChatDisplay();

sendButton.addEventListener('click', () => {
    console.log('Send button clicked');
    sendMessage();
});
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    console.log('sendMessage function called');
    const message = userInput.value.trim();
    if (message) {
        addMessageToHistory('user', message);
        userInput.value = '';
        fetchAIResponse(message);
    }
}

function addMessageToHistory(sender, message) {
    chatHistory.push({ sender, message });
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    addMessage(sender, message);
}

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function fetchAIResponse(message) {
    try {
        const response = await fetch('https://rest-api.aetherss.xyz/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        addMessageToHistory('ai', data.response);
    } catch (error) {
        console.error('Error:', error);
        addMessageToHistory('ai', 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.');
    }
}

// Tambahkan tombol untuk mereset chat
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset Chat';
resetButton.id = 'resetButton';
document.querySelector('.chat-header').appendChild(resetButton);

resetButton.addEventListener('click', function() {
    chatHistory = [];
    sessionStorage.removeItem('chatHistory');
    updateChatDisplay();
});

document.addEventListener('DOMContentLoaded', () => {
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

    }

    // Pastikan event listener terpasang dengan benar
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
        console.log('Click event listener added to send button');
    } else {
        console.error('Send button not found');
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        console.log('Keypress event listener added to user input');
    } else {
        console.error('User input not found');
    }

    // ... (kode lainnya tetap sama)
});

console.log('Script loaded');

window.onerror = function(message, source, lineno, colno, error) {
    console.error('Error caught:', message, 'Source:', source, 'Line:', lineno, 'Column:', colno, 'Error object:', error);
};

function saveHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}
