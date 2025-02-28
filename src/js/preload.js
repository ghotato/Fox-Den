const { contextBridge, ipcRenderer } = require('electron');

console.log('Debug: Initializing preload script');

const api = {
    minimizeWindow: () => {
        console.log('Debug: Preload - minimize window called');
        ipcRenderer.send('minimize-window');
    },
    maximizeWindow: () => {
        console.log('Debug: Preload - maximize window called');
        ipcRenderer.send('maximize-window');
    },
    closeWindow: () => {
        console.log('Debug: Preload - close window called');
        ipcRenderer.send('close-window');
    }
};

console.log('Debug: Exposing electronAPI to renderer');
contextBridge.exposeInMainWorld('electronAPI', api);
console.log('Debug: Preload script completed');