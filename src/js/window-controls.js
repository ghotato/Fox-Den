/**
 * Window Controls Manager
 * 
 * Handles window control buttons (minimize, maximize/restore, close)
 */
const WindowControls = {
  init() {
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    if (!minimizeBtn || !maximizeBtn || !closeBtn) {
      return console.error('Window control buttons not found');
    }
    minimizeBtn.addEventListener('click', () => window.electron.window.minimize());
    maximizeBtn.addEventListener('click', () => window.electron.window.maximize());
    closeBtn.addEventListener('click', () => window.electron.window.close());
  }
};

document.addEventListener('DOMContentLoaded', () => {
  WindowControls.init();
});

window.WindowControls = WindowControls;
