# 🏝️ Rinjani — Asisten Wisata Virtual NTB

<div align="center">

### ✨ [chatbot-lomboktrip.vercel.app](https://chatbot-lomboktrip.vercel.app/) ✨

**Teman perjalananmu menjelajahi Nusa Tenggara Barat**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-chatbot--lomboktrip.vercel.app-0d8a82?style=for-the-badge)](https://chatbot-lomboktrip.vercel.app/)
[![Powered by Gemini](https://img.shields.io/badge/Powered_by-Gemini_AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Deploy on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---

## 🌊 Tentang Project

**Rinjani** adalah chatbot wisata berbasis AI yang dibangun untuk [LombokTrip](https://chatbot-lomboktrip.vercel.app/) — agen perjalanan resmi di Nusa Tenggara Barat, Indonesia. Chatbot ini hadir untuk membantu wisatawan mendapatkan informasi perjalanan secara cepat, akurat, dan interaktif, mulai dari destinasi wisata, kuliner khas, transportasi, hingga tips perjalanan di NTB.

Ditenagai oleh **Google Gemini AI**, Rinjani mampu memahami pertanyaan dalam bahasa Indonesia dan memberikan respons yang hangat, informatif, dan kontekstual.

---

## 🗺️ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🤖 **AI Conversational** | Didukung Google Gemini 2.5 Flash — respons cerdas dan kontekstual |
| 🧠 **Konteks Percakapan** | Riwayat chat dipertahankan selama sesi berlangsung |
| 🔄 **Sesi Baru Otomatis** | Setiap buka tab baru = sesi bersih, tanpa campur aduk riwayat |
| 📝 **Markdown Rendering** | Respons dengan **bold**, *italic*, heading, dan list tampil rapi |
| ⚡ **Quick Chat** | Tombol pertanyaan cepat untuk mulai percakapan tanpa mengetik |
| 🌅 **Salam Pembuka** | Sapaan otomatis berdasarkan waktu (pagi/siang/sore/malam) |
| 📱 **Responsif** | Tampilan optimal di desktop maupun mobile |
| 🔒 **Aman** | Rate limiting, Helmet.js, validasi input, proteksi XSS |

---

## 🏖️ Cakupan Informasi

Rinjani siap menjawab pertanyaan seputar:

**Destinasi Lombok**
- Gili Trawangan, Gili Meno, Gili Air
- Gunung Rinjani (trek & camping)
- Pantai Pink, Pantai Selong Belanak, Pantai Kuta/Mandalika
- Pantai Senggigi, Desa Adat Sade, Air Terjun Sendang Gile

**Destinasi Sumbawa & Bima**
- Pulau Moyo, Gunung Tambora
- Pantai Maluk, Pantai Lakey (surfer's paradise)
- Pulau Kenawa, Istana Dalam Loka

**Informasi Perjalanan**
- Paket wisata & estimasi harga LombokTrip
- Tips waktu terbaik berkunjung & kondisi cuaca
- Transportasi & akomodasi
- Kuliner khas: Plecing Kangkung, Ayam Taliwang, Sate Rembiga
- Budaya lokal Sasak, Samawa, Mbojo

---

## 🛠️ Tech Stack

```
Backend    : Node.js + Express.js 5
AI         : Google Gemini 2.5 Flash (@google/genai)
Security   : Helmet.js + express-rate-limit + CORS
Frontend   : Vanilla HTML/CSS/JavaScript
Font       : Playfair Display + Inter (Google Fonts)
Deploy     : Vercel (Serverless)
```

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- Node.js v18 atau lebih baru
- Google Gemini API Key — dapatkan di [Google AI Studio](https://aistudio.google.com/)

### Instalasi

```bash
# Clone repository
git clone https://github.com/username/gemini-chatbot-api.git
cd gemini-chatbot-api

# Install dependencies
npm install
```

### Konfigurasi Environment

Buat file `.env` di root project:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
PORT=3000
```

### Jalankan

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Buka browser di `http://localhost:3000`

---

## 📁 Struktur Project

```
gemini-chatbot-api/
├── index.js          # Server Express + API endpoint /api/chat
├── vercel.json       # Konfigurasi deploy Vercel
├── package.json
├── .env              # Environment variables (jangan di-commit!)
├── .gitignore
└── public/
    ├── index.html    # UI chatbot
    ├── style.css     # Styling (tema Lombok: teal + emas + pasir)
    └── script.js     # Logic frontend + markdown parser
```

---

## 🔌 API

### `POST /api/chat`

Kirim percakapan dan dapatkan respons dari Gemini AI.

**Request Body:**
```json
{
  "conversation": [
    { "role": "user", "text": "Apa destinasi terbaik di Lombok?" },
    { "role": "model", "text": "Lombok punya banyak destinasi indah..." },
    { "role": "user", "text": "Bagaimana cara ke Gili Trawangan?" }
  ]
}
```

**Response:**
```json
{
  "result": "Untuk menuju Gili Trawangan, kamu bisa..."
}
```

**Batasan:**
- Maksimal 20 pesan per percakapan
- Maksimal 4.000 karakter per pesan
- Rate limit: 30 request/menit per IP

---

## ☁️ Deploy ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → Import repo
3. Tambahkan Environment Variables di **Settings → Environment Variables**:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `WHATSAPP_CS` *(opsional)*
4. Klik **Deploy**

---

## 📄 Lisensi

ISC License — bebas digunakan dan dimodifikasi.

---

<div align="center">

Dibuat dengan ❤️ untuk mempromosikan keindahan **Nusa Tenggara Barat**

🌊 **[Mulai Jelajahi NTB →](https://chatbot-lomboktrip.vercel.app/)** 🌊

</div>
