/**
 * FoxDen Main Application
 * 
 * Initializes and ties together all components of the application
 */

const App = {
  // Track initialization state
  initialized: false,
  
  /**
   * Initialize the application
   */
  init: async function() {
    if (this.initialized) return;
    
    // Show loading state if needed
    this._showLoading();
    
    try {
      // Initialize app state first
      await AppState.init();
      
      // Set up basic event listeners
      this._setupEventListeners();
      
      // Initialize all managers
      DenManager.init();
      ChannelManager.init();
      ChatManager.init();
      VoiceManager.init();
      UserManager.init();
      SettingsManager.init();
      
      // Set up keyboard shortcuts
      this._setupKeyboardShortcuts();
      
      // Handle window resize
      this._handleWindowResize();
      window.addEventListener('resize', this._handleWindowResize.bind(this));
      
      // Add window controls for Electron
      this._setupWindowControls();
      
      this.initialized = true;
      
      // Hide loading screen
      this._hideLoading();
      
      console.log('FoxDen application initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
      this._showError(error);
    }
  },
  
  /**
   * Show loading screen
   * @private
   */
  _showLoading: function() {
    // Check if loading screen already exists
    let loadingScreen = document.getElementById('app-loading');
    
    if (!loadingScreen) {
      loadingScreen = document.createElement('div');
      loadingScreen.id = 'app-loading';
      loadingScreen.innerHTML = `
        <div class="loading-content">
          <div class="loading-logo">🦊</div>
          <div class="loading-text">Loading FoxDen...</div>
          <div class="loading-spinner"></div>
        </div>
      `;
      
      // Add CSS
      const style = document.createElement('style');
      style.textContent = `
        #app-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-primary, #121212);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-content {
          text-align: center;
        }
        
        .loading-logo {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .loading-text {
          color: var(--text-primary, #ffffff);
          font-size: 18px;
          margin-bottom: 24px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--accent, #ff7518);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(loadingScreen);
    }
  },
  
  /**
   * Hide loading screen
   * @private
   */
  _hideLoading: function() {
    const loadingScreen = document.getElementById('app-loading');
    
    if (loadingScreen) {
      // Add fade-out animation
      loadingScreen.style.transition = 'opacity 0.5s';
      loadingScreen.style.opacity = '0';
      
      // Remove after animation
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }
  },
  
  /**
   * Show error screen
   * @param {Error} error - The error that occurred
   * @private
   */
  _showError: function(error) {
    // Hide loading screen
    this._hideLoading();
    
    // Create error screen
    const errorScreen = document.createElement('div');
    errorScreen.id = 'app-error';
    errorScreen.innerHTML = `
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Something went wrong</div>
        <div class="error-message">${error.message || 'Could not initialize the application'}</div>
        <button class="error-retry">Retry</button>
      </div>
    `;
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
      #app-error {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--bg-primary, #121212);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      
      .error-content {
        text-align: center;
        padding: 24px;
        background-color: var(--bg-secondary, #1e1e1e);
        border-radius: 8px;
        max-width: 400px;
      }
      
      .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .error-title {
        color: var(--text-primary, #ffffff);
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
      }
      
      .error-message {
        color: var(--text-secondary, #8e9297);
        font-size: 16px;
        margin-bottom: 24px;
      }
      
      .error-retry {
        background-color: var(--accent, #ff7518);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
      }
      
      .error-retry:hover {
        background-color: var(--accent-hover, #e66000);
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(errorScreen);
    
    // Set up retry button
    errorScreen.querySelector('.error-retry').addEventListener('click', () => {
      errorScreen.remove();
      window.location.reload();
    });
  },
  
  /**
   * Set up basic event listeners
   * @private
   */
  _setupEventListeners: function() {
    // Theme toggle button
    document.getElementById('toggle-theme').addEventListener('click', () => {
      AppState.toggleTheme();
    });
    
    // Handle clicks on the backdrop elements to close modals
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.classList.remove('active');
        }
      }
    });
  },
  
  /**
   * Set up keyboard shortcuts
   * @private
   */
  _setupKeyboardShortcuts: function() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+, = Open Settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        SettingsManager.showSettings();
      }
      
      // Ctrl+Shift+T = Toggle Theme
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        AppState.toggleTheme();
      }
      
      // Escape = Close Modals
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal.active');
        if (activeModals.length > 0) {
          activeModals.forEach(modal => modal.classList.remove('active'));
        } else if (AppState.get('settingsOpen')) {
          SettingsManager.hideSettings();
        }
      }
      
      // Channel navigation
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        this._navigateNextChannel();
      }
      
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        this._navigatePreviousChannel();
      }
      
      // Den navigation
      if (e.ctrlKey && e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        this._navigateNextDen();
      }
      
      if (e.ctrlKey && e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        this._navigatePreviousDen();
      }
    });
  },
  
  /**
   * Handle window resize
   * @private
   */
  _handleWindowResize: function() {
    // Check window width and update mobile state
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
    
    // On mobile, collapse the member sidebar
    if (isMobile) {
      document.getElementById('members-sidebar').classList.remove('active');
    }
  },
  
  /**
   * Set up window controls for Electron
   * @private
   */
  _setupWindowControls: function() {
    // Only set up if electron is available
    if (!window.electron || !window.electron.windowControls) return;
    
    document.getElementById('minimize-button').addEventListener('click', () => {
      window.electron.windowControls.minimize();
    });
    
    document.getElementById('maximize-button').addEventListener('click', () => {
      window.electron.windowControls.maximize();
    });
    
    document.getElementById('close-button').addEventListener('click', () => {
      window.electron.windowControls.close();
    });
  },
  
  /**
   * Navigate to the next channel
   * @private
   */
  _navigateNextChannel: function() {
    const denId = AppState.get('activeDen');
    if (!denId) return;
    
    const channels = AppState.getChannelsForDen(denId);
    const currentChannelId = AppState.get('activeChannel');
    
    if (!channels || channels.length === 0) return;
    
    // Find the current channel index
    const currentIndex = channels.findIndex(channel => channel.id === currentChannelId);
    
    // Calculate the next index
    const nextIndex = (currentIndex + 1) % channels.length;
    
    // Set the next channel as active
    AppState.setActiveChannel(channels[nextIndex].id);
  },
  
  /**
   * Navigate to the previous channel
   * @private
   */
  _navigatePreviousChannel: function() {
    const denId = AppState.get('activeDen');
    if (!denId) return;
    
    const channels = AppState.getChannelsForDen(denId);
    const currentChannelId = AppState.get('activeChannel');
    
    if (!channels || channels.length === 0) return;
    
    // Find the current channel index
    const currentIndex = channels.findIndex(channel => channel.id === currentChannelId);
    
    // Calculate the previous index
    const previousIndex = (currentIndex - 1 + channels.length) % channels.length;
    
    // Set the previous channel as active
    AppState.setActiveChannel(channels[previousIndex].id);
  },
  
  /**
   * Navigate to the next den
   * @private
   */
  _navigateNextDen: function() {
    const dens = AppState.get('dens');
    const currentDenId = AppState.get('activeDen');
    
    if (!dens || dens.length === 0) return;
    
    // Find the current den index
    const currentIndex = dens.findIndex(den => den.id === currentDenId);
    
    // Calculate the next index
    const nextIndex = (currentIndex + 1) % dens.length;
    
    // Set the next den as active
    AppState.setActiveDen(dens[nextIndex].id);
  },
  
  /**
   * Navigate to the previous den
   * @private
   */
  _navigatePreviousDen: function() {
    const dens = AppState.get('dens');
    const currentDenId = AppState.get('activeDen');
    
    if (!dens || dens.length === 0) return;
    
    // Find the current den index
    const currentIndex = dens.findIndex(den => den.id === currentDenId);
    
    // Calculate the previous index
    const previousIndex = (currentIndex - 1 + dens.length) % dens.length;
    
    // Set the previous den as active
    AppState.setActiveDen(dens[previousIndex].id);
  }
};

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(error => {
    console.error('Failed to initialize application:', error);
  });
});

// Export for use in other modules
window.App = App;
