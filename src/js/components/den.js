/**
 * FoxDen Den (Server) Management
 * 
 * Handles all functionality related to dens (Discord server equivalent)
 */

const DenManager = {
  // Track initialization state
  initialized: false,
  
  /**
   * Initialize the den manager
   */
  init: function() {
    if (this.initialized) return;
    
    // Cache DOM elements
    this.densList = document.getElementById('dens-list');
    this.createDenButton = document.getElementById('create-den');
    this.denModal = document.getElementById('den-modal');
    this.currentDenName = document.getElementById('current-den-name');
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Subscribe to state changes
    AppState.subscribe('activeDen', (denId) => this._handleActiveDenChange(denId));
    AppState.subscribe('dens', () => this.renderDenList());
    
    // Render the den list
    this.renderDenList();
    
    this.initialized = true;
  },
  
  /**
   * Set up event listeners for den-related elements
   * @private
   */
  _setupEventListeners: function() {
    // Handle den click
    this.densList.addEventListener('click', (e) => {
      const denElement = e.target.closest('.den');
      if (denElement) {
        const denId = denElement.dataset.denId;
        if (denId) {
          AppState.setActiveDen(denId);
        }
      }
    });
    
    // Handle create den button click
    this.createDenButton.addEventListener('click', () => {
      this._showCreateDenModal();
    });
    
    // Handle den settings button click
    document.getElementById('den-settings').addEventListener('click', (e) => {
      e.stopPropagation();
      this._showDenSettingsMenu(e);
    });
    
    // Set up modal events
    const closeButtons = this.denModal.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.denModal.classList.remove('active');
      });
    });
    
    // Handle create den form submission
    document.getElementById('create-den-submit').addEventListener('click', () => {
      this._handleCreateDenSubmit();
    });
    
    // Handle join den button click
    document.getElementById('join-den').addEventListener('click', () => {
      this._showJoinDenView();
    });
  },
  
  /**
   * Render the list of dens (servers) in the sidebar
   */
  renderDenList: function() {
    const dens = AppState.get('dens');
    const activeDenId = AppState.get('activeDen');
    
    // Clear existing dens
    this.densList.innerHTML = '';
    
    // Add each den to the sidebar
    dens.forEach(den => {
      const denElement = document.createElement('div');
      denElement.className = `den ${den.id === activeDenId ? 'active' : ''}`;
      denElement.dataset.denId = den.id;
      denElement.dataset.tooltip = den.name;
      
      // Use the first two letters of the den name as the icon if no custom icon
      denElement.textContent = den.icon || den.name.substring(0, 2);
      
      this.densList.appendChild(denElement);
    });
  },
  
  /**
   * Handle changes to the active den
   * @param {string} denId - The new active den ID
   * @private
   */
  _handleActiveDenChange: function(denId) {
    if (!denId) return;
    
    // Update active den in UI
    const dens = this.densList.querySelectorAll('.den');
    dens.forEach(den => {
      den.classList.toggle('active', den.dataset.denId === denId);
    });
    
    // Update den name in header
    const den = AppState.getActiveDen();
    if (den) {
      this.currentDenName.textContent = den.name;
    }
  },
  
  /**
   * Show the create den modal
   * @private
   */
  _showCreateDenModal: function() {
    // Reset form fields
    document.getElementById('den-name').value = '';
    
    // Reset den icon preview
    const iconPreview = document.querySelector('.den-icon-preview');
    iconPreview.textContent = 'FD';
    iconPreview.style.backgroundColor = '#ff7518';
    
    // Update modal title
    const modalHeader = this.denModal.querySelector('.modal-header h3');
    modalHeader.textContent = 'Create a Den';
    
    // Show the modal
    this.denModal.classList.add('active');
  },
  
  /**
   * Show the join den view within the modal
   * @private
   */
  _showJoinDenView: function() {
    // Update modal title
    const modalHeader = this.denModal.querySelector('.modal-header h3');
    modalHeader.textContent = 'Join a Den';
    
    // Update form content for joining a den
    const modalContent = this.denModal.querySelector('.modal-content .modal-section');
    modalContent.innerHTML = `
      <div class="input-group">
        <label for="invite-code">Invite Code</label>
        <input type="text" id="invite-code" placeholder="Enter an invite code (e.g., aB9c7D)">
      </div>
      <p class="input-help">
        Invite codes are shared by den owners or members who have permission to create invites.
      </p>
    `;
    
    // Update buttons
    const createButton = document.getElementById('create-den-submit');
    createButton.textContent = 'Join';
    
    const joinButton = document.getElementById('join-den');
    joinButton.textContent = 'Create a Den';
    
    // Update button event handler
    createButton.onclick = () => this._handleJoinDenSubmit();
    joinButton.onclick = () => {
      // Switch back to create den view
      this._showCreateDenModal();
      
      // Update button text and event handler
      createButton.textContent = 'Create';
      joinButton.textContent = 'Join a Den';
      
      // Restore original event handler
      createButton.onclick = () => this._handleCreateDenSubmit();
    };
  },
  
  /**
   * Handle the submission of the create den form
   * @private
   */
  _handleCreateDenSubmit: function() {
    const nameInput = document.getElementById('den-name');
    const denName = nameInput.value.trim();
    
    if (!denName) {
      // Show error
      Utils.showToast('Please enter a den name', 'error');
      return;
    }
    
    // Generate a random ID for the new den
    const denId = 'den-' + Utils.generateId();
    
    // Create a new den object
    const newDen = {
      id: denId,
      name: denName,
      icon: denName.substring(0, 2).toUpperCase(),
      ownerId: AppState.get('currentUser').id,
      description: `Welcome to ${denName}!`,
      createdAt: new Date().toISOString()
    };
    
    // Add the den to the state
    const dens = AppState.get('dens');
    AppState.set('dens', [...dens, newDen]);
    
    // Create default channels for the new den
    const defaultChannels = [
      {
        id: `${denId}-welcome`,
        denId: denId,
        name: 'welcome',
        type: 'text',
        position: 0,
        category: 'Text Channels',
        createdAt: new Date().toISOString()
      },
      {
        id: `${denId}-general`,
        denId: denId,
        name: 'general',
        type: 'text',
        position: 1,
        category: 'Text Channels',
        createdAt: new Date().toISOString()
      },
      {
        id: `${denId}-voice`,
        denId: denId,
        name: 'Voice Chat',
        type: 'voice',
        position: 0,
        category: 'Voice Channels',
        createdAt: new Date().toISOString(),
        connectedUsers: 0
      }
    ];
    
    // Add channels to state
    const channels = AppState.get('channels');
    AppState.set('channels', {
      ...channels,
      [denId]: defaultChannels
    });
    
    // Add current user as a member
    const currentUser = AppState.get('currentUser');
    const denMembers = [
      {
        id: currentUser.id,
        denId: denId,
        username: currentUser.username,
        tag: currentUser.tag,
        avatar: currentUser.avatar,
        status: currentUser.status,
        isOwner: true,
        roles: ['admin'],
        joinedAt: new Date().toISOString()
      }
    ];
    
    // Add members to state
    const members = AppState.get('members');
    AppState.set('members', {
      ...members,
      [denId]: denMembers
    });
    
    // Create welcome message
    const welcomeMessage = {
      id: `msg-${Utils.generateId()}`,
      channelId: `${denId}-welcome`,
      userId: 'bot-1',
      username: 'FoxDen Bot',
      content: `Welcome to ${denName}! This is the beginning of the #welcome channel. Invite your friends to join the den!`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    // Add message to state
    AppState.addMessage(`${denId}-welcome`, welcomeMessage);
    
    // Set the new den as active
    AppState.setActiveDen(denId);
    
    // Close the modal
    this.denModal.classList.remove('active');
    
    // Show success toast
    Utils.showToast(`Den "${denName}" created successfully!`, 'success');
  },
  
  /**
   * Handle the submission of the join den form
   * @private
   */
  _handleJoinDenSubmit: function() {
    const inviteCodeInput = document.getElementById('invite-code');
    const inviteCode = inviteCodeInput.value.trim();
    
    if (!inviteCode) {
      // Show error
      Utils.showToast('Please enter an invite code', 'error');
      return;
    }
    
    // In a real app, this would make an API call to join the den
    // For this demo, we'll just show an error since we don't have a backend
    Utils.showToast('Invalid invite code or den does not exist', 'error');
  },
  
  /**
   * Show the den settings context menu
   * @param {Event} event - The click event
   * @private
   */
  _showDenSettingsMenu: function(event) {
    const activeDen = AppState.getActiveDen();
    if (!activeDen) return;
    
    const currentUser = AppState.get('currentUser');
    const isOwner = activeDen.ownerId === currentUser.id;
    
    const menuItems = [
      {
        label: 'Invite People',
        icon: '👋',
        onClick: () => this._handleInvitePeople()
      },
      {
        label: 'Den Settings',
        icon: '⚙️',
        onClick: () => this._handleDenSettings()
      },
      { divider: true },
      {
        label: 'Create Channel',
        icon: '➕',
        onClick: () => ChannelManager.showCreateChannelModal()
      },
      { divider: true }
    ];
    
    // Add leave/delete option based on ownership
    if (isOwner) {
      menuItems.push({
        label: 'Delete Den',
        icon: '🗑️',
        danger: true,
        onClick: () => this._handleDeleteDen()
      });
    } else {
      menuItems.push({
        label: 'Leave Den',
        icon: '🚪',
        danger: true,
        onClick: () => this._handleLeaveDen()
      });
    }
    
    Utils.showContextMenu(menuItems, event.clientX, event.clientY);
  },
  
  /**
   * Handle the invite people action
   * @private
   */
  _handleInvitePeople: function() {
    // In a real app, this would generate an invite link
    // For this demo, we'll just show a toast with a fake invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    Utils.showToast(`Invite code: ${inviteCode}`, 'info', 5000);
  },
  
  /**
   * Handle the den settings action
   * @private
   */
  _handleDenSettings: function() {
    // In a real app, this would open a den settings modal
    // For this demo, we'll just show a toast
    Utils.showToast('Den settings would open here', 'info');
  },
  
  /**
   * Handle the delete den action
   * @private
   */
  _handleDeleteDen: function() {
    const activeDen = AppState.getActiveDen();
    if (!activeDen) return;
    
    // Ask for confirmation
    if (confirm(`Are you sure you want to delete ${activeDen.name}? This action cannot be undone.`)) {
      // Remove the den from the state
      const dens = AppState.get('dens').filter(den => den.id !== activeDen.id);
      AppState.set('dens', dens);
      
      // Remove channels and messages for this den
      const channels = { ...AppState.get('channels') };
      delete channels[activeDen.id];
      AppState.set('channels', channels);
      
      // Remove members for this den
      const members = { ...AppState.get('members') };
      delete members[activeDen.id];
      AppState.set('members', members);
      
      // Set the first available den as active, or null if none
      if (dens.length > 0) {
        AppState.setActiveDen(dens[0].id);
      } else {
        AppState.set('activeDen', null);
      }
      
      Utils.showToast(`Den "${activeDen.name}" deleted successfully`, 'success');
    }
  },
  
  /**
   * Handle the leave den action
   * @private
   */
  _handleLeaveDen: function() {
    const activeDen = AppState.getActiveDen();
    if (!activeDen) return;
    
    // Ask for confirmation
    if (confirm(`Are you sure you want to leave ${activeDen.name}?`)) {
      // In a real app, this would make an API call to leave the den
      // For this demo, we'll remove the current user from members
      
      const currentUser = AppState.get('currentUser');
      const denMembers = AppState.getMembersForDen(activeDen.id)
        .filter(member => member.id !== currentUser.id);
      
      // Update members in state
      const members = { ...AppState.get('members') };
      members[activeDen.id] = denMembers;
      AppState.set('members', members);
      
      // Remove the den from the list
      const dens = AppState.get('dens').filter(den => den.id !== activeDen.id);
      AppState.set('dens', dens);
      
      // Set the first available den as active
      if (dens.length > 0) {
        AppState.setActiveDen(dens[0].id);
      } else {
        AppState.set('activeDen', null);
      }
      
      Utils.showToast(`Left "${activeDen.name}" successfully`, 'success');
    }
  }
};

// Export for use in other modules
window.DenManager = DenManager;
