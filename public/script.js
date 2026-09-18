const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const welcome = document.getElementById("welcome");
const quickChat = document.getElementById("quick-chat");
const clearChatButton = document.getElementById("clear-chat");
const submitButton = form.querySelector('button[type="submit"]');

// Gunakan sessionStorage agar setiap buka tab/browser = sesi baru.
// Riwayat tidak tersimpan lintas sesi.
const storageKey = "lomboktrip-conversation";
const conversation = loadConversation();

// Pulihkan pesan dari sesi saat ini (jika halaman di-refresh)
conversation.forEach(({ role, text }) =>
  appendMessage(role === "user" ? "user" : "bot", text),
);

if (conversation.length > 0) {
  // Sesi sudah ada (refresh) — sembunyikan welcome, tidak perlu salam ulang
  welcome.hidden = true;
} else {
  // Sesi baru — tampilkan salam pembuka setelah jeda singkat
  setTimeout(() => showGreeting(), 600);
}

/**
 * Tampilkan pesan salam otomatis dari Rinjani.
 * Tidak disimpan ke conversation history agar tidak mempengaruhi
 * konteks percakapan AI, tapi menyambut pengguna dengan hangat.
 */
function showGreeting() {
  const hour = new Date().getHours();
  let waktu = "Selamat pagi";
  if (hour >= 11 && hour < 15) waktu = "Selamat siang";
  else if (hour >= 15 && hour < 19) waktu = "Selamat sore";
  else if (hour >= 19 || hour < 5) waktu = "Selamat malam";

  const salam =
    `${waktu}! 🌊 Saya **Rinjani**, asisten wisata virtual dari **LombokTrip**.\n\n` +
    `Saya siap membantu kamu menjelajahi keindahan **Nusa Tenggara Barat** — ` +
    `dari pantai Gili yang jernih, puncak Rinjani yang megah, hingga kuliner khas Sasak yang menggugah selera.\n\n` +
    `Ada yang bisa saya bantu hari ini? ✨`;

  welcome.hidden = true;
  appendMessage("bot", salam);
}

// ── Event listeners ──────────────────────────────────────────────

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;
  await sendMessage(userMessage);
});

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    hideQuickChat();
    sendMessage(button.textContent.trim());
  });
});

clearChatButton.addEventListener("click", () => {
  conversation.length = 0;
  sessionStorage.removeItem(storageKey);
  chatBox.querySelectorAll(".message").forEach((msg) => msg.remove());
  welcome.hidden = false;
  quickChat.hidden = false;
  // Munculkan salam lagi setelah reset
  setTimeout(() => showGreeting(), 400);
  input.focus();
});

// ── Core chat function ───────────────────────────────────────────

async function sendMessage(userMessage) {
  welcome.hidden = true;
  hideQuickChat();

  // Tampilkan pesan user & simpan ke history
  appendMessage("user", userMessage);
  conversation.push({ role: "user", text: userMessage });
  saveConversation();

  input.value = "";
  const thinkingMessage = appendMessage("bot", "Mengetik…");
  setFormDisabled(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  // Simpan panjang conversation sebelum push user message
  // agar bisa rollback jika request gagal
  const rollbackLength = conversation.length - 1;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Kirim seluruh conversation (termasuk pesan user terbaru)
      // sehingga model memiliki konteks lengkap
      body: JSON.stringify({ conversation }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Request gagal (status ${response.status})`);
    }

    const data = await response.json();
    const result = typeof data.result === "string" ? data.result.trim() : "";
    const botMessage = result || "Maaf, tidak ada respons yang diterima.";

    // Render markdown untuk respons bot
    thinkingMessage.innerHTML = parseMarkdown(botMessage);
    conversation.push({ role: "model", text: botMessage });
    saveConversation();
  } catch (error) {
    console.error("Gagal mendapat respons:", error);

    // Rollback: hapus pesan user yang gagal agar tidak tercampur di konteks
    conversation.length = rollbackLength;
    saveConversation();

    thinkingMessage.textContent =
      error.name === "AbortError"
        ? "Waktu tunggu habis. Silakan coba lagi."
        : error.message || "Gagal terhubung ke server. Silakan coba lagi.";
    thinkingMessage.classList.add("error");
  } finally {
    clearTimeout(timeoutId);
    setFormDisabled(false);
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function hideQuickChat() {
  if (quickChat && !quickChat.hidden) {
    quickChat.hidden = true;
  }
}

function setFormDisabled(disabled) {
  input.disabled = disabled;
  submitButton.disabled = disabled;
  submitButton.textContent = disabled ? "…" : "Kirim";
}

function appendMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add("message", sender);

  if (sender === "bot") {
    // Render markdown ringan khusus untuk respons bot
    message.classList.add("md");
    message.innerHTML = parseMarkdown(text);
  } else {
    // Pesan user: textContent agar aman dari XSS
    message.textContent = text;
  }

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

/**
 * Parse subset markdown yang umum dihasilkan Gemini:
 *   ### / ## / #   → heading
 *   **text**       → bold
 *   *text*         → italic
 *   `code`         → inline code
 *   - item         → unordered list
 *   baris kosong   → paragraf baru
 *
 * Teks user TIDAK diproses di sini — hanya respons bot.
 * Keamanan: semua teks di-escape dulu sebelum tag HTML disisipkan.
 */
function parseMarkdown(text) {
  // 1. Escape HTML terlebih dahulu agar input tidak bisa inject tag
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const html = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // ── Heading ──────────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      if (inList) { html.push("</ul>"); inList = false; }
      const level = Math.min(headingMatch[1].length + 2, 6); // h3–h5
      html.push(`<h${level} class="md-heading">${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // ── List item ─────────────────────────────────────────────────
    const listMatch = line.match(/^[-*]\s+(.+)/);
    if (listMatch) {
      if (!inList) { html.push('<ul class="md-list">'); inList = true; }
      html.push(`<li>${inlineFormat(listMatch[1])}</li>`);
      continue;
    }

    // Tutup list jika baris bukan list item
    if (inList) { html.push("</ul>"); inList = false; }

    // ── Baris kosong → pemisah paragraf ──────────────────────────
    if (line.trim() === "") {
      html.push('<div class="md-spacer"></div>');
      continue;
    }

    // ── Baris biasa ───────────────────────────────────────────────
    html.push(`<p class="md-p">${inlineFormat(line)}</p>`);
  }

  if (inList) html.push("</ul>");

  return html.join("");
}

/**
 * Format inline: bold, italic, inline code.
 * Menerima teks yang sudah di-escape HTML.
 */
function inlineFormat(text) {
  return text
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // *italic* — hanya jika bukan bagian dari **bold**
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // `inline code`
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
}

function saveConversation() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(conversation));
  } catch {
    // sessionStorage penuh — tidak kritis, lanjutkan tanpa simpan
  }
}

function loadConversation() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved)
      ? saved
          .filter(
            (msg) =>
              msg &&
              ["user", "model"].includes(msg.role) &&
              typeof msg.text === "string" &&
              msg.text.trim().length > 0,
          )
          .slice(-20)
      : [];
  } catch {
    return [];
  }
}
