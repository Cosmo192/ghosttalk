<<<<<<< HEAD
# 👻 GhostTalk

> Encrypted. Offline. Untraceable.

GhostTalk is a **peer-to-peer encrypted desktop messenger** that works entirely over your local network — no internet, no accounts, no servers, no logs. Just open the app and start chatting securely with anyone on the same WiFi.

![GhostTalk Screenshot](./docs/screenshot.png)

---

## ✨ Features

- 🔐 **End-to-end encrypted** — ECDH key exchange + AES-256-GCM per message
- 📡 **Zero internet required** — works entirely on LAN
- 🚫 **No accounts** — open and chat instantly
- 🔑 **Keys never leave your device** — the server (there is none) never sees plaintext
- 👻 **Auto-discovery** — finds other GhostTalk users on the network automatically via mDNS
- 🖥️ **Cross-platform** — Windows, macOS, Linux

---

## 🔐 How the Encryption Works

GhostTalk uses a **hybrid cryptography model** — the same approach used by Signal, WhatsApp, and iMessage.

### 1. Key Exchange (ECDH)
When two users connect, they perform an **Elliptic Curve Diffie-Hellman (ECDH)** handshake using the NIST P-256 curve:

```
Alice generates:  (publicKeyA, privateKeyA)
Bob generates:    (publicKeyB, privateKeyB)

Alice computes:   sharedSecret = ECDH(privateKeyA, publicKeyB)
Bob computes:     sharedSecret = ECDH(privateKeyB, publicKeyA)

Result: Both sides arrive at the SAME secret — without ever transmitting it.
```

### 2. Key Derivation (HKDF)
The raw ECDH shared secret is passed through **HKDF (SHA-256)** to derive a clean 256-bit AES key. This is standard practice to ensure the key has proper entropy.

### 3. Message Encryption (AES-256-GCM)
Every message is encrypted with **AES-256-GCM**:
- A random 96-bit **IV** is generated per message
- The message is encrypted and an **authentication tag** is produced
- If anyone tampers with the ciphertext in transit, decryption fails

### 4. Perfect Forward Secrecy
Keys are generated fresh each session and stored only in memory. If a device is compromised later, **past conversations cannot be decrypted**.

```
┌─────────────┐          LAN (TCP)         ┌─────────────┐
│    Alice    │ ──── encrypted gibberish ──▶│     Bob     │
│  🔑 KeyA   │                             │  🔑 KeyB   │
└─────────────┘                             └─────────────┘
       ↕ ECDH handshake                           ↕
  Shared Secret ◀──────────────────────────▶ Shared Secret
  (computed locally)                        (computed locally)
```

---

## 🏗️ Architecture

```
ghosttalk/
├── main.js                  # Electron main process
├── preload.js               # Secure IPC bridge (contextBridge)
├── src/
│   ├── crypto/
│   │   └── encryption.js    # ECDH + AES-256-GCM crypto module
│   ├── network/
│   │   └── p2p.js           # mDNS discovery + TCP P2P messaging
│   └── components/
│       ├── TitleBar.js      # Custom frameless window bar
│       ├── Sidebar.js       # Peer list with status indicators
│       ├── ChatWindow.js    # Main chat interface
│       └── EmptyState.js    # Landing screen
├── public/
│   └── index.html
└── package.json
```

### Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron |
| UI | React + CSS Modules |
| Peer discovery | mDNS via `bonjour-service` |
| Transport | Node.js `net` (TCP sockets) |
| Key exchange | ECDH — NIST P-256 (`crypto` built-in) |
| Key derivation | HKDF-SHA256 |
| Encryption | AES-256-GCM (`crypto` built-in) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9+

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/ghosttalk.git
cd ghosttalk

# Install dependencies
npm install

# Run in development mode
npm start
```

### Build for Distribution

```bash
# Build the React app + package with Electron Builder
npm run build
```

Outputs will be in the `dist/` folder:
- **Windows**: `.exe` installer
- **macOS**: `.dmg`
- **Linux**: `.AppImage`

---

## 🧪 Testing It Locally

To test with two instances on the same machine:

1. Run `npm start` in one terminal
2. Open a second terminal and run `BROWSER=none npm run react-start` — then manually launch a second Electron window
3. Both instances should discover each other via mDNS and connect

For a real test, install on **two computers on the same WiFi network** and open the app on both.

---

## ⚠️ Security Notes

- GhostTalk is designed for **local network use only**
- Keys are ephemeral (in-memory only) — no persistence across sessions by design
- This project is for **educational purposes** and personal use
- Not audited for production security — do not use for sensitive communications

---

## 🛣️ Roadmap

- [ ] Username customization
- [ ] Message history (encrypted local storage)
- [ ] File transfer (encrypted)
- [ ] Group chats
- [ ] Message expiry / self-destruct
- [ ] Hotspot mode (create your own network)

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🤝 Contributing

Pull requests are welcome! If you find a bug or have an idea, open an issue.

---

*Built with ❤️ and cryptography.*
=======
# ghosttalk
>>>>>>> 52ea129f58e70ea07d1454f8aa7e5235fc05d48b
