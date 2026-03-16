const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startNetwork, stopNetwork, sendMessage, getLocalIP } = require('./src/network/p2p');

let mainWindow;
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'public', 'icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // Start P2P network layer
  startNetwork((event, data) => {
    if (mainWindow) mainWindow.webContents.send(event, data);
  });

  // IPC handlers
  ipcMain.handle('get-local-ip', () => getLocalIP());
  ipcMain.handle('send-message', (_, { targetId, message }) => {
    return sendMessage(targetId, message);
  });
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('window-close', () => {
    stopNetwork();
    app.quit();
  });
});

app.on('window-all-closed', () => {
  stopNetwork();
  if (process.platform !== 'darwin') app.quit();
});
