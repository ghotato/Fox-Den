const { contextBridge, ipcRenderer } = require('electron');

// Simple preload script without uuid dependency
contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => {
        console.log('Debug: Minimize window triggered');
        ipcRenderer.send('minimize-window');
    },
    maximizeWindow: () => {
        console.log('Debug: Maximize/restore window triggered');
        ipcRenderer.send('maximize-window');
    },
    closeWindow: () => {
        console.log('Debug: Close window triggered');
        ipcRenderer.send('close-window');
    }
});
