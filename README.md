# AETHERz AI CHAT

AETHERz AI CHAT adalah aplikasi chat AI interaktif yang dikembangkan oleh AETHER. Aplikasi ini menggunakan teknologi AI untuk memberikan respons yang cerdas dan natural kepada pengguna.

## Fitur

- Chat interaktif dengan AI
- Dukungan untuk bahasa Indonesia dan Inggris
- Kemampuan Text-to-Speech (TTS)
- Mode gelap/terang
- Kemampuan untuk menyalin kode yang dihasilkan AI
- Manajemen riwayat chat

## Teknologi yang Digunakan

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS (Embedded JavaScript templating)
- Axios
- Howler.js
- Font Awesome
- Highlight.js

## Instalasi

1. Clone repositori ini:
   ```
   git clone https://github.com/aetherzcode/AETHERz-AI-CHAT.git
   ```

2. Masuk ke direktori proyek:
   ```
   cd AETHERz-AI-CHAT
   ```

3. Install dependensi:
   ```
   npm install
   ```

4.  Jika kamu ingin ganti API AI setting di `src/config/config.js`
    
    Ganti
    ```
     https://rest-api.aetherss.xyz/api/ai
    ```
    dengan API milik kamu sendiri.


5. Buat file `.env` di root direktori proyek dan isi dengan konfigurasi yang diperlukan:
   ```
   AI_API_URL=https://your-ai-api-url.com
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
   SESSION_SECRET=your_session_secret
   ```
   
   Pastikan untuk mengganti `username`, `password`, `your-cluster`, dan `your-database` dengan informasi MongoDB Anda sendiri.

6. Jalankan aplikasi:
   ```
   npm start
   ```

7. Buka browser dan akses `http://localhost:3000`

## Penggunaan

1. Masuk dengan nama pengguna.
2. Ketik pesan Anda di kotak input di bagian bawah halaman.
3. Tekan tombol kirim atau tekan Enter untuk mengirim pesan.
4. AI akan merespons pesan Anda.
5. Gunakan tombol "Bicara" untuk mendengarkan respons AI.
6. Gunakan tombol tema untuk beralih antara mode terang dan gelap.
7. Gunakan tombol "Hapus Chat" untuk menghapus riwayat chat Anda.

## Pengembangan

Untuk menjalankan aplikasi dalam mode pengembangan dengan auto-restart:

## Kontribusi

Kontribusi selalu diterima. Silakan buat pull request atau buka issue jika Anda memiliki saran atau menemukan bug.

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detailnya.

## Kontak

AETHER - [GitHub](https://github.com/aetherzcode)

Link Proyek: [https://github.com/aetherzcode/AETHERz-AI-CHAT](https://github.com/aetherzcode/AETHERz-AI-CHAT)
