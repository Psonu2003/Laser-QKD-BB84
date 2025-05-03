const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let fastapiProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  // Start FastAPI server
  fastapiProcess = spawn('uvicorn', ['main:app', '--host', '127.0.0.1', '--port', '8000'], {
    shell: true,
    stdio: 'inherit'
  });

  fastapiProcess.on('error', (err) => {
    console.error('Failed to start FastAPI server:', err);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (fastapiProcess) {
      fastapiProcess.kill('SIGTERM');
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (fastapiProcess) {
    fastapiProcess.kill('SIGTERM');
  }
});
