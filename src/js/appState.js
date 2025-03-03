const AppState = {
    state: {
        messages: {},  // Messages stored by channelId
        currentUser: null,
        activeChannel: null
    },

    subscribers: {},

    addMessage: function(channelId, message) {
        console.log('Adding message:', message, 'to channel:', channelId);
        
        if (!this.state.messages[channelId]) {
            this.state.messages[channelId] = [];
        }
        
        this.state.messages[channelId].push(message);
        this.notifySubscribers('messages');
    },

    getMessagesForChannel: function(channelId) {
        console.log('Getting messages for channel:', channelId);
        console.log('Available messages:', this.state.messages);
        return this.state.messages[channelId] || [];
    },

    // ...existing code...
};

window.AppState = AppState;
