/**
 * GhostTalk P2P Network Module
 *
 * Uses mDNS (Bonjour) to discover other GhostTalk instances on the LAN.
 * Establishes direct TCP connections between peers.
 * Performs ECDH key exchange on connect, then all messages are AES-256 encrypted.
 */

const net = require('net');
const os = require('os');
const { Bonjour } = require('bonjour-service');
const { generateKeyPair, computeSharedKey, encrypt, decrypt } = require('../crypto/encryption');

const SERVICE_TYPE = 'ghosttalk';
const PORT = 47432;

let bonjour = null;
let server = null;
let broadcast = null; // callback to send events to renderer

// Our identity for this session
const { publicKey, privateKey, ecdhInstance } = generateKeyPair();
const myId = require('crypto').randomBytes(4).toString('hex');
const myUsername = `Ghost_${myId}`;

// Active peers: id -> { socket, sharedKey, username, ip }
const peers = new Map();
// Pending key exchanges: ip -> { resolve, reject }
const pendingExchanges = new Map();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

function sendRaw(socket, obj) {
  try {
    socket.write(JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error('sendRaw error:', e.message);
  }
}

// ─── Connection Handler ───────────────────────────────────────────────────────

function handleConnection(socket) {
  let peerId = null;
  let buffer = '';

  socket.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        handleMessage(socket, msg, (id) => { peerId = id; });
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    }
  });

  socket.on('close', () => {
    if (peerId && peers.has(peerId)) {
      const peer = peers.get(peerId);
      peers.delete(peerId);
      broadcast('peer-left', { id: peerId, username: peer.username });
    }
  });

  socket.on('error', (err) => console.error('Socket error:', err.message));

  // Initiate key exchange
  sendRaw(socket, {
    type: 'hello',
    id: myId,
    username: myUsername,
    publicKey,
  });
}

function handleMessage(socket, msg, setPeerId) {
  switch (msg.type) {
    case 'hello': {
      // They introduced themselves, send our hello back if we haven't
      const sharedKey = computeSharedKey(ecdhInstance, msg.publicKey);
      peers.set(msg.id, {
        socket,
        sharedKey,
        username: msg.username,
        ip: socket.remoteAddress,
      });
      setPeerId(msg.id);

      // Confirm key exchange
      sendRaw(socket, {
        type: 'hello-ack',
        id: myId,
        username: myUsername,
        publicKey,
      });

      broadcast('peer-discovered', { id: msg.id, username: msg.username });
      broadcast('key-exchanged', { id: msg.id });
      break;
    }

    case 'hello-ack': {
      // They acknowledged our hello
      if (!peers.has(msg.id)) {
        const sharedKey = computeSharedKey(ecdhInstance, msg.publicKey);
        peers.set(msg.id, {
          socket,
          sharedKey,
          username: msg.username,
          ip: socket.remoteAddress,
        });
        setPeerId(msg.id);
        broadcast('peer-discovered', { id: msg.id, username: msg.username });
        broadcast('key-exchanged', { id: msg.id });
      }
      break;
    }

    case 'message': {
      const peer = peers.get(msg.from);
      if (!peer) return;
      try {
        const plaintext = decrypt(msg.payload, peer.sharedKey);
        broadcast('message-received', {
          from: msg.from,
          username: peer.username,
          text: plaintext,
          timestamp: msg.timestamp,
        });
      } catch (e) {
        console.error('Decryption failed:', e.message);
      }
      break;
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

function startNetwork(broadcastFn) {
  broadcast = broadcastFn;
  bonjour = new Bonjour();

  // Start TCP server
  server = net.createServer(handleConnection);
  server.listen(PORT, () => {
    console.log(`GhostTalk listening on port ${PORT}`);

    // Advertise on mDNS
    bonjour.publish({
      name: myUsername,
      type: SERVICE_TYPE,
      port: PORT,
      txt: { id: myId },
    });

    // Discover peers
    const browser = bonjour.find({ type: SERVICE_TYPE });
    browser.on('up', (service) => {
      if (service.txt?.id === myId) return; // ignore ourselves
      const ip = service.addresses?.find(a => !a.includes(':')) || service.host;
      if (!ip) return;

      // Connect to them
      setTimeout(() => {
        const socket = net.createConnection({ host: ip, port: PORT }, () => {
          handleConnection(socket);
        });
        socket.on('error', (e) => console.error('Connect error:', e.message));
      }, 500);
    });
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
  });
}

function stopNetwork() {
  peers.forEach(({ socket }) => socket.destroy());
  peers.clear();
  if (server) server.close();
  if (bonjour) bonjour.destroy();
}

function sendMessage(targetId, plaintext) {
  const peer = peers.get(targetId);
  if (!peer) return { success: false, error: 'Peer not found' };

  try {
    const payload = encrypt(plaintext, peer.sharedKey);
    sendRaw(peer.socket, {
      type: 'message',
      from: myId,
      payload,
      timestamp: Date.now(),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = { startNetwork, stopNetwork, sendMessage, getLocalIP };
