const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ghosttalk', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Network
  getLocalIP: () => ipcRenderer.invoke('get-local-ip'),
  sendMessage: (targetId, message) => ipcRenderer.invoke('send-message', { targetId, message }),

  // Event listeners
  onPeerDiscovered: (cb) => ipcRenderer.on('peer-discovered', (_, data) => cb(data)),
  onPeerLeft: (cb) => ipcRenderer.on('peer-left', (_, data) => cb(data)),
  onMessageReceived: (cb) => ipcRenderer.on('message-received', (_, data) => cb(data)),
  onKeyExchanged: (cb) => ipcRenderer.on('key-exchanged', (_, data) => cb(data)),

  // Cleanup
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
