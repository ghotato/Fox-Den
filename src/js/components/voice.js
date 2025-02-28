/**
 * FoxDen Voice Management
 * 
 * Handles all functionality related to voice and video chat
 */

const VoiceManager = {
  // Track initialization state
  initialized: false,
  
  // Stream references
  localStream: null,
  screenStream: null,
  remoteStreams: {},
  
  // MediaRecorder for voice activity detection
  audioAnalyser: null,
  
  // Audio context for processing
  audioContext: null,
  
  // Speaking detection
  speakingDetectionInterval: null,
  
  /**
   * Initialize the voice manager
   */
  init: function() {
    if (this.initialized) return;
    
    // Cache DOM elements with error handling
    try {
      this.voiceContainer = document.getElementById('voice-container');
      this.videoGrid = document.getElementById('video-grid');
      this.voiceChannelName = document.getElementById('voice-channel-name');
      this.voiceBottomPanel = document.getElementById('voice-bottom-panel');
      this.voiceBottomChannelName = document.getElementById('voice-bottom-channel-name');
      
      if (!this.voiceContainer || !this.videoGrid) {
        throw new Error('Required voice elements not found');
      }
    } catch (error) {
      console.error('Voice initialization failed:', error);
      return;
    }
    
    // Track state
    this.isConnected = false;
    this.isMuted = false;
    this.isDeafened = false;
    this.hasVideo = false;
    this.isScreenSharing = false;
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Subscribe to state changes
    AppState.subscribe('activeChannel', (channelId) => this._handleActiveChannelChange(channelId));
    AppState.subscribe('activeVoiceChannel', (channelId) => this._handleActiveVoiceChannelChange(channelId));
    AppState.subscribe('connectedToVoice', (isConnected) => this._handleConnectionStateChange(isConnected));
    AppState.subscribe('micMuted', (isMuted) => this._handleMicMuteChange(isMuted));
    AppState.subscribe('deafened', (isDeafened) => this._handleDeafenedChange(isDeafened));
    AppState.subscribe('videoEnabled', (hasVideo) => this._handleVideoChange(hasVideo));
    AppState.subscribe('screenShareEnabled', (isScreenSharing) => this._handleScreenShareChange(isScreenSharing));
    
    this.initialized = true;
  },
  
  /**
   * Set up event listeners for voice-related elements
   * @private
   */
  _setupEventListeners: function() {
    const elements = {
      'toggle-mic': () => this.toggleMicrophone(),
      'toggle-speakers': () => this.toggleDeafen(),
      'toggle-video': () => this.toggleVideo(),
      'toggle-screen': () => this.toggleScreenShare(),
      'disconnect-call': () => this.disconnect(),
      'leave-voice': () => this.disconnect()
    };

    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        // Only handle mouse clicks
        element.addEventListener('click', (e) => {
          handler();
        });
        
        // Remove any keyboard handling
        element.removeAttribute('tabindex');
        element.removeAttribute('accesskey');
        element.removeAttribute('aria-keyshortcuts');
      }
    });
  },
  
  /**
   * Handle changes to the active channel
   * @param {string} channelId - The new active channel ID
   * @private
   */
  _handleActiveChannelChange: function(channelId) {
    if (!channelId) return;
    
    const channel = AppState.getActiveChannel();
    
    // Show appropriate container based on channel type
    if (channel && channel.type === 'voice') {
      // Show voice container
      this.voiceContainer.classList.add('active');
      document.getElementById('text-container').classList.remove('active');
      
      // Connect to voice
      this.connect(channelId);
    } else if (AppState.get('connectedToVoice')) {
      // User switched to a text channel while in voice
      // Show text container and bottom voice panel
      this.voiceContainer.classList.remove('active');
      document.getElementById('text-container').classList.add('active');
      this.voiceBottomPanel.classList.add('active');
    }
  },
  
  /**
   * Handle changes to the active voice channel
   * @param {string} channelId - The new active voice channel ID
   * @private
   */
  _handleActiveVoiceChannelChange: function(channelId) {
    if (!channelId) {
      this.voiceBottomPanel.classList.remove('active');
      return;
    }
    
    const channels = AppState.getChannelsForDen(AppState.get('activeDen')) || [];
    const channel = channels.find(ch => ch.id === channelId);
    
    if (channel) {
      // Update channel name
      this.voiceChannelName.textContent = channel.name;
      this.voiceBottomChannelName.textContent = channel.name;
    }
  },
  
  /**
   * Handle changes to the connection state
   * @param {boolean} isConnected - Whether connected to voice
   * @private
   */
  _handleConnectionStateChange: function(isConnected) {
    this.isConnected = isConnected;
    
    if (!isConnected) {
      // Clean up and remove voice UI
      this._cleanupMediaStreams();
      this.voiceBottomPanel.classList.remove('active');
      
      // Show text container if active channel is voice
      const channel = AppState.getActiveChannel();
      if (channel && channel.type === 'voice') {
        this.voiceContainer.classList.remove('active');
        document.getElementById('text-container').classList.add('active');
      }
    }
  },
  
  /**
   * Handle changes to the microphone mute state
   * @param {boolean} isMuted - Whether the microphone is muted
   * @private
   */
  _handleMicMuteChange: function(isMuted) {
    this.isMuted = isMuted;
    
    // Toggle mute state in UI
    const toggleMicBtn = document.getElementById('toggle-mic');
    const bottomToggleMicBtn = document.getElementById('bottom-toggle-mic');
    
    toggleMicBtn.classList.toggle('muted', isMuted);
    bottomToggleMicBtn.classList.toggle('muted', isMuted);
    
    // Update mic button icons
    if (isMuted) {
      toggleMicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
      
      bottomToggleMicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
    } else {
      toggleMicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
      
      bottomToggleMicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
    }
    
    // Update local stream
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
    
    // Update user video element
    const userVideo = document.querySelector('.video-container[data-user-id="' + AppState.get('currentUser').id + '"]');
    if (userVideo) {
      userVideo.classList.toggle('muted', isMuted);
      
      const statusElement = userVideo.querySelector('.video-status');
      if (statusElement) {
        if (isMuted) {
          statusElement.textContent = 'Muted';
        } else if (this.hasVideo) {
          statusElement.textContent = 'Video On';
        } else {
          statusElement.textContent = 'Talking';
        }
      }
    }
  },
  
  /**
   * Handle changes to the deafened state
   * @param {boolean} isDeafened - Whether audio output is deafened
   * @private
   */
  _handleDeafenedChange: function(isDeafened) {
    this.isDeafened = isDeafened;
    
    // Toggle deafened state in UI
    const toggleSpeakersBtn = document.getElementById('toggle-speakers');
    toggleSpeakersBtn.classList.toggle('deafened', isDeafened);
    
    // Update speakers button icon
    if (isDeafened) {
      toggleSpeakersBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
    } else {
      toggleSpeakersBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      `;
    }
    
    // Mute all audio elements if deafened
    document.querySelectorAll('.voice-container audio, .voice-container video').forEach(element => {
      element.muted = isDeafened;
    });
    
    // If deafened, also mute microphone
    if (isDeafened && !this.isMuted) {
      this.toggleMicrophone();
    }
    
    // Update user video element
    const userVideo = document.querySelector('.video-container[data-user-id="' + AppState.get('currentUser').id + '"]');
    if (userVideo) {
      userVideo.classList.toggle('deafened', isDeafened);
    }
  },
  
  /**
   * Handle changes to the video state
   * @param {boolean} hasVideo - Whether video is enabled
   * @private
   */
  _handleVideoChange: function(hasVideo) {
    this.hasVideo = hasVideo;
    
    // Toggle video state in UI
    const toggleVideoBtn = document.getElementById('toggle-video');
    const bottomToggleVideoBtn = document.getElementById('bottom-toggle-video');
    
    toggleVideoBtn.classList.toggle('active', hasVideo);
    bottomToggleVideoBtn.classList.toggle('active', hasVideo);
    
    // Update video button icons
    if (hasVideo) {
      toggleVideoBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      `;
      
      bottomToggleVideoBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      `;
    } else {
      toggleVideoBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M13.41 6H6.59C5.71 6 5 6.71 5 7.59v8.82c0 .88.71 1.59 1.59 1.59h6.82c.88 0 1.59-.71 1.59-1.59v-8.82C15 6.71 14.29 6 13.41 6Z"></path>
          <path d="m17 15 4 2V7l-4 2"></path>
        </svg>
      `;
      
      bottomToggleVideoBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M13.41 6H6.59C5.71 6 5 6.71 5 7.59v8.82c0 .88.71 1.59 1.59 1.59h6.82c.88 0 1.59-.71 1.59-1.59v-8.82C15 6.71 14.29 6 13.41 6Z"></path>
          <path d="m17 15 4 2V7l-4 2"></path>
        </svg>
      `;
    }
    
    // Update local video stream
    this._updateVideoStream(hasVideo);
  },
  
  /**
   * Handle changes to the screen sharing state
   * @param {boolean} isScreenSharing - Whether screen sharing is enabled
   * @private
   */
  _handleScreenShareChange: function(isScreenSharing) {
    this.isScreenSharing = isScreenSharing;
    
    // Toggle screen sharing state in UI
    const toggleScreenBtn = document.getElementById('toggle-screen');
    const bottomToggleScreenBtn = document.getElementById('bottom-toggle-screen');
    
    toggleScreenBtn.classList.toggle('active', isScreenSharing);
    bottomToggleScreenBtn.classList.toggle('active', isScreenSharing);
    
    // Update screen share container visibility
    const screenShareContainer = document.querySelector('.screen-share-container');
    if (screenShareContainer) {
      screenShareContainer.style.display = isScreenSharing ? 'block' : 'none';
    } else if (isScreenSharing) {
      // Create screen share container if it doesn't exist
      this._createScreenShareElement();
    }
    
    // Update screen share indicator
    const screenShareIndicator = document.getElementById('screen-sharer-name');
    if (screenShareIndicator) {
      screenShareIndicator.textContent = isScreenSharing ? 'You' : '';
    }
    
    // Enable or disable screen sharing
    if (isScreenSharing) {
      this._startScreenShare();
    } else {
      this._stopScreenShare();
    }
  },
  
  /**
   * Connect to a voice channel
   * @param {string} channelId - The channel ID to connect to
   */
  connect: function(channelId) {
    if (this.isConnected) {
      // Already connected to a voice channel
      // In a real app, would disconnect first then connect to the new channel
      this.disconnect();
    }
    
    const channel = AppState.getActiveChannel();
    if (!channel || channel.type !== 'voice') return;
    
    // Set channel name
    this.voiceChannelName.textContent = channel.name;
    this.voiceBottomChannelName.textContent = channel.name;
    
    // Show voice container
    this.voiceContainer.classList.add('active');
    document.getElementById('text-container').classList.remove('active');
    
    // Show bottom panel
    this.voiceBottomPanel.classList.add('active');
    
    // Set state
    AppState.set('activeVoiceChannel', channelId);
    AppState.set('connectedToVoice', true);
    AppState.set('micMuted', false);
    AppState.set('deafened', false);
    AppState.set('videoEnabled', false);
    AppState.set('screenShareEnabled', false);
    
    // Create user video elements
    this._createVideoElements();
    
    // Initialize audio/video streams
    this._initializeMedia();
    
    // Remove any keyboard event listeners that might have been added
    this.removeAllKeyboardListeners();
    
    // In a real app, would connect to WebRTC/WebSocket here
    console.log('Connected to voice channel:', channelId);
  },
  
  /**
   * Disconnect from the current voice channel
   */
  disconnect: function() {
    if (!this.isConnected) return;
    
    // Clean up media streams
    this._cleanupMediaStreams();
    
    // Reset state
    AppState.leaveVoiceChannel();
    
    // Clear video grid
    this.videoGrid.innerHTML = '';
    
    // Hide voice container if active
    if (this.voiceContainer.classList.contains('active')) {
      this.voiceContainer.classList.remove('active');
      document.getElementById('text-container').classList.add('active');
    }
    
    // Hide bottom panel
    this.voiceBottomPanel.classList.remove('active');
    
    // Remove any keyboard event listeners
    this.removeAllKeyboardListeners();
    
    console.log('Disconnected from voice channel');
  },
  
  /**
   * Toggle microphone mute state
   */
  toggleMicrophone: function() {
    AppState.set('micMuted', !this.isMuted);
  },
  
  /**
   * Toggle speakers deafened state
   */
  toggleDeafen: function() {
    AppState.set('deafened', !this.isDeafened);
  },
  
  /**
   * Toggle video state
   */
  toggleVideo: function() {
    AppState.set('videoEnabled', !this.hasVideo);
  },
  
  /**
   * Toggle screen sharing state
   */
  toggleScreenShare: function() {
    AppState.set('screenShareEnabled', !this.isScreenSharing);
  },
  
  /**
   * Initialize media streams
   * @private
   */
  _initializeMedia: function() {
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Utils.showToast('Your browser does not support voice/video chat', 'error');
      return;
    }
    
    // Request microphone access
    this._initializeMicrophone();
  },
  
  /**
   * Initialize microphone
   * @private
   */
  _initializeMicrophone: async function() {
    try {
      // Request microphone access
      if (window.media && window.media.getAudioStream) {
        this.localStream = await window.media.getAudioStream();
      } else {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      // Set up voice activity detection
      this._setupVoiceActivityDetection();
      
      console.log('Microphone initialized');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      Utils.showToast('Could not access microphone. Please check permissions.', 'error');
      
      // Create empty stream for UI purposes
      this.localStream = new MediaStream();
    }
  },
  
  /**
   * Update video stream
   * @param {boolean} enable - Whether to enable video
   * @private
   */
  _updateVideoStream: async function(enable) {
    try {
      if (enable) {
        // Request camera access
        if (window.media && window.media.getVideoStream) {
          const videoStream = await window.media.getVideoStream();
          
          // Add video tracks to local stream
          videoStream.getVideoTracks().forEach(track => {
            this.localStream.addTrack(track);
          });
        } else {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          // Add video tracks to local stream
          videoStream.getVideoTracks().forEach(track => {
            this.localStream.addTrack(track);
          });
        }
        
        // Show video in user container
        const userContainer = document.querySelector(`.video-container[data-user-id="${AppState.get('currentUser').id}"]`);
        if (userContainer) {
          const video = document.createElement('video');
          video.srcObject = this.localStream;
          video.autoplay = true;
          video.muted = true; // Avoid feedback
          video.playsInline = true;
          
          // Replace placeholder
          const placeholder = userContainer.querySelector('.video-placeholder');
          if (placeholder) {
            placeholder.style.display = 'none';
          }
          
          // Add video element
          userContainer.appendChild(video);
          
          // Update status text
          const statusElement = userContainer.querySelector('.video-status');
          if (statusElement) {
            statusElement.textContent = 'Video On';
          }
        }
        
        console.log('Camera initialized');
      } else {
        // Remove video tracks
        if (this.localStream) {
          const videoTracks = this.localStream.getVideoTracks();
          videoTracks.forEach(track => {
            track.stop();
            this.localStream.removeTrack(track);
          });
        }
        
        // Show placeholder in user container
        const userContainer = document.querySelector(`.video-container[data-user-id="${AppState.get('currentUser').id}"]`);
        if (userContainer) {
          const video = userContainer.querySelector('video');
          if (video) {
            video.remove();
          }
          
          // Show placeholder
          const placeholder = userContainer.querySelector('.video-placeholder');
          if (placeholder) {
            placeholder.style.display = 'flex';
          }
          
          // Update status text
          const statusElement = userContainer.querySelector('.video-status');
          if (statusElement) {
            statusElement.textContent = this.isMuted ? 'Muted' : 'Talking';
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      Utils.showToast('Could not access camera. Please check permissions.', 'error');
      
      // Disable video state
      AppState.set('videoEnabled', false);
    }
  },
  
  /**
   * Start screen sharing
   * @private
   */
  _startScreenShare: async function() {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in your browser');
      }

      // Get all available sources
      const sources = await this._getScreenSources();
      const screenPickerDialog = document.createElement('div');
      screenPickerDialog.className = 'screen-picker-dialog';
      screenPickerDialog.innerHTML = `
        <div class="screen-picker-content">
          <h2>Share your screen</h2>
          <div class="picker-tabs">
            <button class="picker-tab active" data-tab="screens">Screens</button>
            <button class="picker-tab" data-tab="apps">Applications</button>
          </div>
          <div class="picker-content">
            <div class="source-list" id="source-list">
              ${this._createSourcePreviewList(sources)}
            </div>
            <div class="quality-settings">
              <div class="quality-group">
                <label>Quality:</label>
                <select class="quality-select">
                  <option value="high">High (1080p/60fps)</option>
                  <option value="medium" selected>Medium (720p/30fps)</option>
                  <option value="low">Low (480p/15fps)</option>
                </select>
              </div>
            </div>
          </div>
          <div class="picker-buttons">
            <button class="cancel-share">Cancel</button>
            <button class="start-share" disabled>Share</button>
          </div>
        </div>
      `;

      document.body.appendChild(screenPickerDialog);

      // Handle tab switching and updating source list
      let currentTab = 'screens';
      screenPickerDialog.querySelectorAll('.picker-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          currentTab = tab.dataset.tab;
          screenPickerDialog.querySelectorAll('.picker-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          const sourceList = screenPickerDialog.querySelector('#source-list');
          const filteredSources = currentTab === 'screens' ? sources.screens : sources.applications;
          sourceList.innerHTML = this._createSourcePreviewList({ [currentTab]: filteredSources });
        });
      });

      // Handle source selection and sharing
      let selectedSource = null;
      const startShare = async () => {
        if (!selectedSource) return;

        const quality = screenPickerDialog.querySelector('.quality-select').value;
        const constraints = this._getQualityConstraints(quality);

        try {
          this.screenStream = await navigator.mediaDevices.getUserMedia({
            video: {
              ...constraints,
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: selectedSource.id
              }
            }
          });

          await this._updateScreenShareUI(this.screenStream);
          screenPickerDialog.remove();
          AppState.set('screenShareEnabled', true);
        } catch (error) {
          console.error('Failed to start screen share:', error);
          Utils.showToast('Failed to start screen sharing', 'error');
          screenPickerDialog.remove();
          AppState.set('screenShareEnabled', false);
        }
      };

      // Event listeners for dialog
      screenPickerDialog.addEventListener('click', (e) => {
        const sourceItem = e.target.closest('.source-item');
        if (sourceItem) {
          screenPickerDialog.querySelectorAll('.source-item').forEach(item => item.classList.remove('selected'));
          sourceItem.classList.add('selected');
          selectedSource = {
            id: sourceItem.dataset.id,
            type: sourceItem.dataset.type
          };
          screenPickerDialog.querySelector('.start-share').disabled = false;
        }
      });

      screenPickerDialog.querySelector('.start-share').addEventListener('click', () => startShare());
      screenPickerDialog.querySelector('.cancel-share').addEventListener('click', () => {
        screenPickerDialog.remove();
        AppState.set('screenShareEnabled', false);
      });

    } catch (error) {
      console.error('Screen sharing error:', error);
      Utils.showToast('Screen sharing failed: ' + error.message, 'error');
      AppState.set('screenShareEnabled', false);
    }
  },

  _getScreenSources: async function() {
    const sources = {
      screens: [],
      applications: []
    };

    try {
      // Try to use electron's desktop capturer first
      if (window.electron?.desktopCapturer) {
        const electronSources = await window.electron.desktopCapturer.getSources({
          types: ['screen', 'window'],
          thumbnailSize: { width: 320, height: 180 }
        });

        electronSources.forEach(source => {
          const sourceData = {
            id: source.id,
            name: source.name,
            thumbnail: source.thumbnail?.toDataURL(),
            type: source.id.startsWith('screen:') ? 'screen' : 'window'
          };

          if (source.id.startsWith('screen:')) {
            sources.screens.push(sourceData);
          } else {
            sources.applications.push(sourceData);
          }
        });
      } 
      // Fallback to browser API
      else {
        try {
          const mediaDevices = await navigator.mediaDevices.enumerateDevices();
          const displayDevices = mediaDevices.filter(device => 
            device.kind === 'videoinput' && 
            device.deviceId && 
            device.label.toLowerCase().includes('display')
          );

          // Add each display as a source
          for (const device of displayDevices) {
            sources.screens.push({
              id: device.deviceId,
              name: device.label || `Display ${sources.screens.length + 1}`,
              type: 'screen'
            });
          }

          // Try to get window/application sources
          const gdmOptions = {
            video: {
              displaySurface: 'window',
              logicalSurface: true
            }
          };

          const stream = await navigator.mediaDevices.getDisplayMedia(gdmOptions);
          const track = stream.getVideoTracks()[0];
          if (track) {
            const settings = track.getSettings();
            sources.applications.push({
              id: settings.deviceId || 'window:0',
              name: settings.displaySurface === 'window' ? 'Application Window' : 'Your Screen',
              type: 'window'
            });
            track.stop();
          }
        } catch (e) {
          console.warn('Failed to enumerate display devices:', e);
        }
      }
    } catch (error) {
      console.warn('Could not get screen sources:', error);
    }

    // Add fallback if no sources detected
    if (sources.screens.length === 0) {
      sources.screens.push({
        id: 'screen:0',
        name: 'Your Entire Screen',
        type: 'screen'
      });
    }

    return sources;
  },

  _createSourcePreviewList: function(sources) {
    const { screens = [], applications = [] } = sources;
    
    if (screens.length === 0 && applications.length === 0) {
      return '<div class="no-sources">No sources available</div>';
    }

    const createSourceItem = (source) => `
      <div class="source-item" data-id="${source.id}" data-type="${source.type}">
        <div class="source-preview">
          ${source.thumbnail 
            ? `<img src="${source.thumbnail}" alt="${source.name}">`
            : `<div class="source-preview-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                </svg>
              </div>`
          }
        </div>
        <div class="source-name">${source.name}</div>
      </div>
    `;

    return `
      ${screens.map(createSourceItem).join('')}
      ${applications.map(createSourceItem).join('')}
    `;
  },

  _updateScreenQuality: async function(resolution, frameRate) {
    if (!this.screenStream) return;

    const constraints = {
      width: { ideal: resolution === '1080' ? 1920 : resolution === '720' ? 1280 : 854 },
      height: { ideal: resolution === '1080' ? 1080 : resolution === '720' ? 720 : 480 },
      frameRate: { ideal: parseInt(frameRate) }
    };

    try {
      const track = this.screenStream.getVideoTracks()[0];
      await track.applyConstraints(constraints);
      Utils.showToast(`Screen share quality updated to ${resolution}p/${frameRate}fps`, 'success');
    } catch (error) {
      console.error('Error updating screen quality:', error);
      Utils.showToast('Failed to update quality', 'error');
    }
  },

  /**
   * Stop screen sharing
   * @private
   */
  _stopScreenShare: function() {
    // Stop all screen sharing tracks
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    
    // Hide screen share container
    const screenContainer = document.querySelector('.screen-share-container');
    if (screenContainer) {
      screenContainer.style.display = 'none';
      
      // Remove video
      const video = screenContainer.querySelector('video');
      if (video) {
        video.remove();
      }
    }
    
    console.log('Screen sharing stopped');
  },
  
  /**
   * Set up voice activity detection
   * @private
   */
  _setupVoiceActivityDetection: function() {
    if (!this.localStream || !this.localStream.getAudioTracks().length) return;
    
    // Create audio context
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    }
    
    // Create analyser
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.minDecibels = -65;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    
    // Connect microphone to analyser
    const source = this.audioContext.createMediaStreamSource(this.localStream);
    source.connect(analyser);
    
    // Set up detection interval
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let speaking = false;
    
    this.speakingDetectionInterval = setInterval(() => {
      if (this.isMuted) {
        // Don't detect if muted
        if (speaking) {
          speaking = false;
          this._updateSpeakingState(false);
        }
        return;
      }
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate volume average
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Check if speaking
      const isSpeaking = average > 20; // Threshold for speaking
      
      if (isSpeaking !== speaking) {
        speaking = isSpeaking;
        this._updateSpeakingState(speaking);
      }
    }, 100);
  },
  
  /**
   * Update speaking state in UI
   * @param {boolean} isSpeaking - Whether the user is speaking
   * @private
   */
  _updateSpeakingState: function(isSpeaking) {
    // Update video container
    const userContainer = document.querySelector(`.video-container[data-user-id="${AppState.get('currentUser').id}"]`);
    if (userContainer) {
      userContainer.classList.toggle('speaking', isSpeaking);
      
      // Show/hide speaking indicator
      let indicator = userContainer.querySelector('.speaking-indicator');
      
      if (isSpeaking) {
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'speaking-indicator';
          userContainer.appendChild(indicator);
        }
      } else if (indicator) {
        indicator.remove();
      }
    }
  },
  
  /**
   * Create video elements for users in the voice channel
   * @private
   */
  _createVideoElements: function() {
    // Clear existing elements
    this.videoGrid.innerHTML = '';
    
    // Get current den and channel
    const denId = AppState.get('activeDen');
    const channelId = AppState.get('activeVoiceChannel');
    if (!denId || !channelId) return;
    
    // Get members for this den
    const members = AppState.getMembersForDen(denId);
    if (!members || members.length === 0) return;
    
    // Simulate connected users based on channel data
    const channel = AppState.getActiveChannel();
    if (!channel) return;
    
    // Number of connected users
    const connectedUsers = channel.connectedUsers || 0;
    
    // Current user is always connected
    const currentUser = AppState.get('currentUser');
    const connectedMembers = [currentUser];
    
    // Add random members to simulate other users
    // In a real app, this would be based on who is actually connected
    for (let i = 0; i < Math.min(connectedUsers - 1, members.length); i++) {
      // Skip current user
      if (members[i].id === currentUser.id) continue;
      
      connectedMembers.push(members[i]);
      
      // Stop when we have enough users
      if (connectedMembers.length >= connectedUsers) break;
    }
    
    // Create screen share container
    this._createScreenShareElement();
    
    // Create video containers for each user
    connectedMembers.forEach(member => {
      this._createUserVideoElement(member);
    });
  },
  
  /**
   * Create a user video element
   * @param {Object} user - The user data
   * @private
   */
  _createUserVideoElement: function(user) {
    const container = document.createElement('div');
    container.className = 'video-container';
    container.dataset.userId = user.id;
    
    // Generate avatar initials
    const initials = Utils.getInitials(user.username);
    
    // User is current user
    const isCurrentUser = user.id === AppState.get('currentUser').id;
    
    // Create placeholder content
    container.innerHTML = `
      <div class="video-placeholder">
        <div class="video-user-avatar" style="background-color: ${Utils.getRandomAvatarColor()}">
          ${user.avatar || initials}
        </div>
        <div class="video-username">${user.username}</div>
        <div class="video-status">${isCurrentUser ? 'You' : 'Talking'}</div>
      </div>
      <div class="video-controls">
        <div class="video-controls-left">
          <div class="video-username-small">${user.username}${isCurrentUser ? ' (You)' : ''}</div>
        </div>
        <div class="video-controls-right">
          ${isCurrentUser ? `
            <div class="video-control ${this.isMuted ? 'muted' : ''}" id="mic-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Add to grid
    this.videoGrid.appendChild(container);
  },
  
  /**
   * Create the screen share element
   * @private
   */
  _createScreenShareElement: function() {
    const container = document.createElement('div');
    container.className = 'screen-share-container';
    container.id = 'screen-share-container';
    container.style.display = 'none'; // Hidden by default
    
    container.innerHTML = `
      <div class="screen-share-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        <span id="screen-sharer-name">You</span> is sharing their screen
      </div>
    `;
    
    // Add placeholder image
    const img = document.createElement('img');
    img.src = '/api/placeholder/1280/720';
    img.alt = 'Screen share placeholder';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    
    container.appendChild(img);
    
    // Add to grid
    this.videoGrid.prepend(container);
  },
  
  /**
   * Clean up media streams
   * @private
   */
  _cleanupMediaStreams: function() {
    try {
      clearInterval(this.speakingDetectionInterval);
      
      // Safely stop all tracks
      const stopTracks = (stream) => {
        if (stream?.getTracks) {
          stream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (e) {
              console.warn('Error stopping track:', e);
            }
          });
        }
      };
      
      stopTracks(this.localStream);
      stopTracks(this.screenStream);
      
      this.localStream = null;
      this.screenStream = null;
      
      // Safely close audio context
      if (this.audioContext?.state !== 'closed') {
        try {
          this.audioContext.close();
        } catch (e) {
          console.warn('Error closing audio context:', e);
        }
      }
      this.audioContext = null;
      
      // Clean up remote streams
      Object.values(this.remoteStreams).forEach(stopTracks);
      this.remoteStreams = {};
      
    } catch (error) {
      console.error('Error cleaning up media streams:', error);
    }
  },

  // Add method to remove all keyboard listeners
  removeAllKeyboardListeners: function() {
    // Remove any global keyboard event listeners
    document.removeEventListener('keydown', this._handleKeyPress, true);
    document.removeEventListener('keyup', this._handleKeyPress, true);
    document.removeEventListener('keypress', this._handleKeyPress, true);
    
    // Remove from window as well to be thorough
    window.removeEventListener('keydown', this._handleKeyPress, true);
    window.removeEventListener('keyup', this._handleKeyPress, true);
    window.removeEventListener('keypress', this._handleKeyPress, true);
  }
};

// Export for use in other modules
window.VoiceManager = VoiceManager;
