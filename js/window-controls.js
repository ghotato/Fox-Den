/**
 * Window Controls Manager
 */
const WindowControls = {
  init: function() {
    console.log('Initializing window controls...'); // Debug log

    // Get control buttons with correct IDs
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');

    if (!minimizeBtn || !maximizeBtn || !closeBtn) {
      console.error('Window control buttons not found');
      return;
    }

    // Check if electron bridge is available
    if (!window.electron) {
      console.error('Electron bridge not found');
      return;
    }

    // Add click handlers with debug logs
    minimizeBtn.addEventListener('click', () => {
      console.log('Minimize clicked');
      this.minimize();
    });

    maximizeBtn.addEventListener('click', () => {
      console.log('Maximize clicked');
      this.toggleMaximize();
    });

    closeBtn.addEventListener('click', () => {
      console.log('Close clicked');
      this.close();
    });

    // Update maximize icon on window state change
    window.electron.onWindowStateChange((isMaximized) => {
      console.log('Window state changed:', isMaximized);
      this.updateMaximizeIcon(isMaximized);
    });

    console.log('Window controls initialized');
  },

  minimize: function() {
    if (window.electron?.minimizeWindow) {
      window.electron.minimizeWindow();
    }
  },

  toggleMaximize: function() {
    if (window.electron?.toggleMaximizeWindow) {
      window.electron.toggleMaximizeWindow();
    }
  },

  close: function() {
    if (window.electron?.closeWindow) {
      window.electron.closeWindow();
    }
  },

  updateMaximizeIcon: function(isMaximized) {
    const maximizeBtn = document.getElementById('maximize-btn');
    if (!maximizeBtn) return;

    if (isMaximized) {
      maximizeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M3 12h10v1H3v-1zM3 3v1h10V3H3zm10 6H9V5H7v4H3v2h4v4h2v-4h4V9z"/>
        </svg>
      `;
      maximizeBtn.setAttribute('title', 'Restore Down');
    } else {
      maximizeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/>
        </svg>
      `;
      maximizeBtn.setAttribute('title', 'Maximize');
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  WindowControls.init();
});

// Export for use in other modules
window.WindowControls = WindowControls;
