const ChatManager = {
    init: function() {
        console.log('Initializing ChatManager');
        
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            // Replace previous event listener with this new one
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (!e.shiftKey) {
                        e.preventDefault(); // Prevent newline
                        this.sendMessage();
                    }
                    // Allow newline if Shift is pressed (don't prevent default)
                }
            });
            console.log('Added keydown listener to message input');
        } else {
            console.error('Message input not found');
        }

        // Subscribe to message changes
        AppState.subscribe('messages', () => this.renderMessages());
        AppState.subscribe('activeChannel', () => this.renderMessages());
        
        // Initial render
        this.renderMessages();
    },

    sendTestMessage: function() {
        console.log('Sending test message');
        const channelId = AppState.get('activeChannel');
        const testMessage = {
            id: `msg-${Utils.generateId()}`,
            channelId: channelId,
            userId: 'system',
            username: 'System',
            content: 'Chat initialized',
            timestamp: new Date().toISOString(),
            type: 'system'
        };
        AppState.addMessage(channelId, testMessage);
    },

    sendMessage: function() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (message) {
            console.log('Sending message:', message);
            const channelId = AppState.get('activeChannel');
            
            if (channelId) {
                const newMessage = {
                    id: `msg-${Utils.generateId()}`,
                    channelId: channelId,
                    userId: AppState.get('currentUser').id,
                    username: AppState.get('currentUser').username,
                    content: message,
                    timestamp: new Date().toISOString()
                };
                
                AppState.addMessage(channelId, newMessage);
                messageInput.value = ''; // Clear input after sending
            }
        }
    },

    renderMessages: function() {
        const channelId = AppState.get('activeChannel');
        console.log('Rendering messages for channel:', channelId);
        
        const messages = AppState.getMessagesForChannel(channelId);
        console.log('Messages to render:', messages);
        
        const messagesContainer = document.getElementById('messages-container');
        console.log('Messages container:', messagesContainer);
        
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }
        
        // ...existing code for rendering messages...
    }
};

window.ChatManager = ChatManager;
