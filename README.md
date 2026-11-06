# 🌌 GALAXY-VAULT // ZERO-KNOWLEDGE ENCRYPTED ENCLAVE

![Web Crypto API](https://img.shields.io/badge/Crypto-Web_Crypto_API_(crypto.subtle)-00f5d4?style=for-the-badge)
![Cipher](https://img.shields.io/badge/Cipher-AES--256--GCM-a855f7?style=for-the-badge)
![KDF](https://img.shields.io/badge/KDF-PBKDF2--SHA256_(600k_Iter)-38bdf8?style=for-the-badge)
![Storage](https://img.shields.io/badge/Storage-IndexedDB_(Client--Side)-10b981?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Stack-100%25_Vanilla_JS_%2F_HTML_%2F_CSS-f59e0b?style=for-the-badge)

**Galaxy-Vault** is a zero-knowledge, client-side encrypted personal vault Progressive Web App (PWA) featuring an electronic **Cyber-HUD Glassmorphism** interface. Store passwords, encrypted notes, photos, and large files locally in your browser with military-grade envelope encryption. **Zero servers. Zero plaintext storage. Zero frameworks.**

🔗 **Live Enclave:** [https://gitwithmasum.github.io/Galaxy-Vault/](https://gitwithmasum.github.io/Galaxy-Vault/)

---

## 🔐 Cryptographic Architecture (`crypto.subtle`)

- **Zero Custom Crypto:** Built exclusively on the native browser **Web Crypto API (`window.crypto.subtle`)**.
- **Key Derivation (KDF):** `PBKDF2-HMAC-SHA256` with **600,000 iterations** and a cryptographically random **16-byte salt** to derive a 256-bit Key-Encryption-Key (`KEK`).
- **Envelope Encryption:**
  - A random 256-bit **Master Key (`MK`)** is wrapped by the password-derived `KEK`.
  - Every individual vault item (password, note, or file) generates its own isolated **256-bit Data Key (`DK`)**, which is wrapped by `MK`.
- **Authenticated Encryption:** `AES-256-GCM` with a fresh 96-bit (**12-byte**) random Initialization Vector (`IV`) per operation and a 128-bit authentication tag. IVs are never reused.
- **256-Bit Emergency Recovery Key:** Generated once during initialization via `crypto.getRandomValues()`. Stores a secondary wrapped copy of the Master Key (`wrappedMasterKeyByRecovery`) for zero-server password recovery and key rotation.
- **4 MB Stream Chunking:** Large files are sliced into `4,194,304`-byte chunks, each encrypted independently with a fresh 12-byte IV to prevent memory exhaustion.
- **RAM Hygiene:** Locking the vault zeroes temporary `Uint8Array` buffers, revokes active object URLs, clears the in-memory search index, and drops all `CryptoKey` references.

---

## ⚡ Core Capabilities

1. **First-Time Cryptographic Setup:** Real-time password entropy meter + one-time 256-bit Recovery Key generation with mandatory save verification.
2. **Brute-Force Protection:** Unlock screen enforces **Exponential Backoff** delays after consecutive failed attempts.
3. **Multi-Trigger Auto-Lock:** Automatically locks and wipes RAM after **5 minutes of inactivity**, **2 minutes when the tab is hidden**, or immediately via the manual Lock button.
4. **Password Manager & CSPRNG Generator:** Store credentials with custom tags, show/hide toggles, **30-second clipboard auto-wipe timer**, and an optional **k-Anonymity Breach Check** (sends only the first 5 characters of the SHA-1 hash prefix).
5. **Encrypted Notes:** Full-text encrypted markdown/text notes.
6. **Chunked Encrypted File & Photo Vault:** Drag-and-drop upload with live progress telemetry, encrypted image thumbnails, built-in RAM viewer for images and PDFs, and on-the-fly decrypted downloads.
7. **In-Memory Search Index:** Instant filtering by title, folder, and tags without exposing plaintext to IndexedDB.
8. **Trash & Key Rotation:** Soft-delete with restore, permanent destruction, Master Password rotation (re-wraps `MK` without re-encrypting items), encrypted `.vault` backup export/import, and an emergency **Panic Wipe**.
9. **Bilingual Cyber-HUD UI:** Instant toggle between **English** and **বাংলা (Bangla)** with toggleable CRT scanlines and live cryptographic telemetry.

---

## 🚀 Quick Start & Deployment

Because `window.crypto.subtle` and Service Workers require a **Secure Context**, run the project over `https://` (such as GitHub Pages) or `http://localhost`.

```bash
# Clone the repository
git clone [https://github.com/gitwithmasum/Galaxy-Vault.git](https://github.com/gitwithmasum/Galaxy-Vault.git)
cd Galaxy-Vault

# Serve locally (using Python or VS Code Live Server)
python -m http.server 8080
