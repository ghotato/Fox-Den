const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

console.log('Debug: Main process starting');

function createWindow() {
    console.log('Debug: Creating main window');
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload.js') // now using the project root preload.js
        }
    });

    // Window control handlers
    ipcMain.on('minimize-window', () => {
        console.log('Debug: Main - minimize window received');
        mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        console.log('Debug: Main - maximize window received');
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('close-window', () => {
        console.log('Debug: Main - close window received');
        mainWindow.close();
    });

    console.log('Debug: Loading index.html');
    mainWindow.loadFile('index.html');

    // Debug: Log when window is ready
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Debug: Window content loaded');
    });

    // Debug: Log any errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Debug: Failed to load:', errorCode, errorDescription);
    });
}

app.whenReady().then(() => {
    console.log('Debug: App is ready');
    createWindow();
});

// ...rest of your main.js code...
