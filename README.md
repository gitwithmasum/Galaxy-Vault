# 🌌 GALAXY-VAULT // ZERO-KNOWLEDGE ENCRYPTED ENCLAVE

![Web Crypto API](https://img.shields.io/badge/Crypto-Web_Crypto_API_(crypto.subtle)-00f5d4?style=for-the-badge)
![Cipher](https://img.shields.io/badge/Cipher-AES--256--GCM-a855f7?style=for-the-badge)
![KDF](https://img.shields.io/badge/KDF-PBKDF2--SHA256_(600k_Iter)-38bdf8?style=for-the-badge)
![Storage](https://img.shields.io/badge/Storage-IndexedDB_(Client--Side)-10b981?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Stack-100%25_Vanilla_JS_%2F_HTML_%2F_CSS-f59e0b?style=for-the-badge)

**Galaxy-Vault** is a zero-knowledge, client-side encrypted personal vault browser-based web application featuring an electronic **Cyber-HUD Glassmorphism** interface. Store passwords, encrypted notes, photos, and large files locally in your browser with browser-native envelope encryption. **No vault backend. No plaintext-at-rest records. No application framework.**

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
4. **Password Manager & CSPRNG Generator:** Store credentials with custom tags, show/hide toggles, **30-second best-effort clipboard cleanup (only clears the copied secret if it is still present)**, and an optional **k-Anonymity Breach Check** (sends only the first 5 characters of the SHA-1 hash prefix).
5. **Encrypted Notes:** Full-text encrypted markdown/text notes.
6. **Chunked Encrypted File & Photo Vault:** Drag-and-drop upload with live progress telemetry, encrypted image thumbnails, built-in RAM viewer for images and PDFs, and on-the-fly decrypted downloads.
7. **In-Memory Search Index:** Instant filtering by title, folder, and tags without exposing plaintext to IndexedDB.
8. **Trash & Key Rotation:** Soft-delete with restore, permanent destruction, Master Password rotation (re-wraps `MK` without re-encrypting items), encrypted `.vault` backup export/import, and an emergency **Panic Wipe**.
9. **Bilingual Cyber-HUD UI:** Instant toggle between **English** and **বাংলা (Bangla)** with toggleable CRT scanlines and live cryptographic telemetry.

---

## 🚀 Quick Start & Deployment

Because `window.crypto.subtle` requires a **Secure Context**, run the project over `https://` (such as GitHub Pages) or `http://localhost`. The current repository entry point is a self-contained `index.html`; the modular files shown in the in-app architecture preview are illustrative and are not separate deployed source files.

```bash
# Clone the repository
git clone https://github.com/gitwithmasum/Galaxy-Vault.git
cd Galaxy-Vault

# Serve locally (using Python or VS Code Live Server)
python -m http.server 8080

---

## 🛡️ Backup & Restore Safety

- Import checks the backup format, supported vault header, encrypted item records, and encrypted file chunks before changing local data.
- The restore writes the replacement vault in a **single IndexedDB transaction**. If the transaction aborts, IndexedDB rolls it back instead of leaving a half-imported vault.
- Imports larger than **512 MB** are rejected to reduce browser memory pressure.
- A successful restore **replaces the current vault on this browser origin**. Export a fresh backup before restoring if the current vault contains anything you still need.
- Keep at least one offline copy of your `.vault` backup and Recovery Key. The app cannot recover a lost Master Password and lost Recovery Key.

## 🔎 Important Security & Deployment Notes

- **Local-first storage:** encrypted records are stored in this browser's IndexedDB. This repository does not currently provide account-based cloud sync, remote backup, or automatic multi-device synchronization. The optional breach lookup contacts the Have I Been Pwned range API using only the first five characters of a SHA-1 password hash; it is a separate third-party network request, not a vault sync service.
- **Browser boundary:** anyone with access to an unlocked browser session may be able to view vault contents. Lock the vault before leaving the device.
- **Clipboard cleanup is best-effort:** after 30 seconds the app checks whether the clipboard still contains the exact secret it copied. It clears it only when the browser grants clipboard read/write access. If access is denied, clear the clipboard manually. This prevents the timer from blindly overwriting a newer clipboard value.
- **No security certification:** use of PBKDF2 and AES-GCM does not by itself prove that an application is secure. The code has not been independently audited or penetration-tested. Do not treat this project as a certified password manager or store high-risk secrets until a qualified security review is complete.
- **PWA status:** the current repository does not yet include a deployed manifest, service worker, or installable offline application shell. The in-app architecture preview is a reference, not proof that those files are deployed.
- **Backup compatibility:** restore currently accepts the `VAULT_ENCRYPTED_BACKUP_V1` format and vault header version `1`.
