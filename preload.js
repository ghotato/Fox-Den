const { contextBridge, ipcRenderer } = require('electron');
console.log('[Preload] Script starting...');

const windowControls = {
    minimize: () => {
        console.log('[Preload] Sending minimize command...');
        ipcRenderer.send('minimize-window');
    },
    maximize: () => {
        console.log('[Preload] Sending maximize command...');
        ipcRenderer.send('maximize-window');
    },
    close: () => {
        console.log('[Preload] Sending close command...');
        ipcRenderer.send('close-window');
    }
};

contextBridge.exposeInMainWorld('electron', {
    window: windowControls
});
console.log('[Preload] Script completed');
