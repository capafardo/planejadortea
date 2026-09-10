import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDB } from './database/index';
import { registerHandlers } from './handlers/index';

const distPath = path.join(__dirname, '../dist');
const publicPath = app.isPackaged ? distPath : path.join(__dirname, '../public');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(publicPath, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(distPath, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  initDB();
  registerHandlers();



  ipcMain.handle('set-fullscreen', async (_, flag: boolean) => {
    if (mainWindow) {
      mainWindow.setFullScreen(flag);
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
