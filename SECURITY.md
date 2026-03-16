# Security Policy

## Cryptographic Design

GhostTalk uses the following cryptographic primitives, all via Node.js's built-in `crypto` module (based on OpenSSL):

| Primitive | Algorithm | Purpose |
|---|---|---|
| Key Exchange | ECDH P-256 | Establish shared secret without transmitting it |
| Key Derivation | HKDF-SHA256 | Derive AES key from ECDH shared secret |
| Encryption | AES-256-GCM | Authenticated encryption of messages |
| IV | CSPRNG 96-bit | Unique per message, prevents replay attacks |

## Threat Model

GhostTalk protects against:
- ✅ Passive eavesdropping on the local network
- ✅ Message tampering (GCM auth tag)
- ✅ Replay attacks (unique IV per message)
- ✅ Server-side compromise (there is no server)
- ✅ Future key compromise (ephemeral keys, perfect forward secrecy)

GhostTalk does NOT protect against:
- ❌ Compromised endpoints (if someone has access to your device)
- ❌ Traffic analysis (an observer can see that two IPs are communicating, just not what)
- ❌ A malicious router (though message contents remain encrypted)

## Reporting a Vulnerability

If you discover a security vulnerability, please open a GitHub issue marked `[SECURITY]`.
