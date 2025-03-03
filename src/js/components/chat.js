// Minimal ChatManager implementation
const ChatManager = {
  init: function() {
    console.log("ChatManager initialized");
    // ...existing chat functionality...
  }
};

window.ChatManager = ChatManager;

// At initialization or after DOM is ready, add event listener for the emoji button:
document.getElementById('emoji-button').addEventListener('click', () => {
  const emojiModal = document.getElementById('emoji-modal');
  if (emojiModal) {
    // Toggle active class to show/hide the emoji selector
    emojiModal.classList.toggle('active');
  }
});
