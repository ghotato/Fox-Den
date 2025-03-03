/**
 * Window Controls Manager
 * 
 * Handles window control buttons (minimize, maximize/restore, close)
 */
const WindowControls = {
  init() {
    // Changed IDs to match HTML elements
    const minimizeBtn = document.getElementById('minimize-button');
    const maximizeBtn = document.getElementById('maximize-button');
    const closeBtn = document.getElementById('close-button');
    if (!minimizeBtn || !maximizeBtn || !closeBtn) {
      return console.error('Window control buttons not found');
    }
    minimizeBtn.addEventListener('click', () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('window-minimize');
      } else {
        console.error('electron.ipcRenderer not available');
      }
    });
    maximizeBtn.addEventListener('click', () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('window-maximize');
      } else {
        console.error('electron.ipcRenderer not available');
      }
    });
    closeBtn.addEventListener('click', () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('window-close');
      } else {
        console.error('electron.ipcRenderer not available');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  WindowControls.init();
});

window.WindowControls = WindowControls;
