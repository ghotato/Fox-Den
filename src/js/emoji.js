const EmojiPicker = {
  categories: {
    recent: {
      name: 'Recently Used',
      icon: '🕒',
      emojis: []
    },
    smileys: {
      name: 'Smileys & Emotion',
      icon: '😊',
      emojis: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘']
    },
    animals: {
      name: 'Animals & Nature',
      icon: '🐱',
      emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸','🐵','🐔','🐧']
    },
    food: {
      name: 'Food & Drink',
      icon: '🍔',
      emojis: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝']
    },
    activities: {
      name: 'Activities',
      icon: '⚽',
      emojis: ['⚽','🏀','🏈','⚾','🎾','🏉','🎱','🏓','🏸','🏒','🏑','🥍','🏏','⛳','🥊']
    }
  },

  init: function() {
    this.currentCategory = 'smileys';
    this.emojiGrid = document.querySelector('.emoji-grid');
    this.categoryTabs = document.querySelector('.emoji-categories');
    
    if (!this.emojiGrid || !this.categoryTabs) return;
    
    // Initialize categories
    this.setupCategories();
    // Load initial category
    this.loadCategory(this.currentCategory);
    // Set up event listeners
    this.setupEventListeners();
  },

  setupCategories: function() {
    let tabsHtml = '';
    for (const [id, category] of Object.entries(this.categories)) {
      tabsHtml += `<div class="emoji-category-tab" data-category="${id}">${category.icon}</div>`;
    }
    this.categoryTabs.innerHTML = tabsHtml;
  },

  loadCategory: function(categoryId) {
    const category = this.categories[categoryId];
    if (!category) return;

    this.currentCategory = categoryId;
    
    // Update active tab
    document.querySelectorAll('.emoji-category-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === categoryId);
    });

    // Populate emoji grid
    this.emojiGrid.innerHTML = category.emojis.map(emoji => 
      `<div class="emoji" data-emoji="${emoji}">${emoji}</div>`
    ).join('');
  },

  setupEventListeners: function() {
    // Category tab clicks
    this.categoryTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.emoji-category-tab');
      if (tab) {
        const category = tab.dataset.category;
        this.loadCategory(category);
      }
    });

    // Emoji clicks
    this.emojiGrid.addEventListener('click', (e) => {
      const emojiElement = e.target.closest('.emoji');
      if (emojiElement) {
        const emoji = emojiElement.dataset.emoji;
        this.handleEmojiClick(emoji);
      }
    });
  },

  handleEmojiClick: function(emoji) {
    // Add to recent category (limit to 15)
    const recentEmojis = this.categories.recent.emojis;
    recentEmojis.unshift(emoji);
    this.categories.recent.emojis = [...new Set(recentEmojis)].slice(0, 15);

    // Insert emoji into chat input
    const chatInput = document.querySelector('.chat-input');
    if (chatInput) {
      const cursorPos = chatInput.selectionStart;
      const text = chatInput.value;
      // Only insert once
      chatInput.value = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
      chatInput.focus();
      chatInput.selectionStart = chatInput.selectionEnd = cursorPos + emoji.length;
    }

    // Close emoji picker after selection
    const emojiModal = document.querySelector('.emoji-modal');
    if (emojiModal) {
      emojiModal.classList.remove('active');
    }
  }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => EmojiPicker.init());

// Export for use in other modules
window.EmojiPicker = EmojiPicker;
