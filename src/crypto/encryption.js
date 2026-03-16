/**
 * GhostTalk Crypto Module
 * 
 * Uses ECDH (Elliptic Curve Diffie-Hellman) for key exchange.
 * Each session gets a unique AES-256-GCM key derived from the ECDH shared secret.
 * This provides Perfect Forward Secrecy - even if a key is compromised,
 * past messages cannot be decrypted.
 */

const crypto = require('crypto');

// ─── Key Generation ───────────────────────────────────────────────────────────

/**
 * Generate a new ECDH key pair for this session
 * @returns {{ publicKey: string, privateKey: string }} Base64 encoded keys
 */
function generateKeyPair() {
  const ecdh = crypto.createECDH('prime256v1'); // NIST P-256 curve
  ecdh.generateKeys();
  return {
    publicKey: ecdh.getPublicKey('base64'),
    privateKey: ecdh.getPrivateKey('base64'),
    ecdhInstance: ecdh,
  };
}

/**
 * Compute the shared secret from our private key and their public key
 * Then derive an AES-256 key from it using HKDF
 * @param {object} ecdhInstance - Our ECDH instance
 * @param {string} theirPublicKey - Their public key (base64)
 * @returns {Buffer} 32-byte AES key
 */
function computeSharedKey(ecdhInstance, theirPublicKey) {
  const sharedSecret = ecdhInstance.computeSecret(
    Buffer.from(theirPublicKey, 'base64')
  );
  // Derive a proper AES key using HKDF
  return crypto.hkdfSync('sha256', sharedSecret, '', 'GhostTalk-AES-Key', 32);
}

// ─── Encryption / Decryption ──────────────────────────────────────────────────

/**
 * Encrypt a message with AES-256-GCM
 * @param {string} plaintext - The message to encrypt
 * @param {Buffer} key - 32-byte AES key
 * @returns {string} JSON string containing iv, ciphertext, and authTag
 */
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  
  return JSON.stringify({
    iv: iv.toString('base64'),
    ciphertext: encrypted.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  });
}

/**
 * Decrypt a message with AES-256-GCM
 * @param {string} payload - JSON string from encrypt()
 * @param {Buffer} key - 32-byte AES key
 * @returns {string} Decrypted plaintext
 */
function decrypt(payload, key) {
  const { iv, ciphertext, authTag } = JSON.parse(payload);
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = { generateKeyPair, computeSharedKey, encrypt, decrypt };
