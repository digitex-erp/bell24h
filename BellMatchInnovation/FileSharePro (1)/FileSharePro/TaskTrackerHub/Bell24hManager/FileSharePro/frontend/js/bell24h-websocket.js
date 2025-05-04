/**
 * Bell24h WebSocket Client
 * 
 * A robust WebSocket client implementation for Bell24h that handles:
 * - Auto-reconnection with exponential backoff
 * - Notification processing
 * - Sound notifications
 * - Automatic fallback to SSE or HTTP polling
 * - Event-based API
 */

class Bell24hRealTimeClient {
    /**
     * Create a new Bell24h real-time client
     * @param {Object} options - Configuration options
     * @param {string} options.websocketUrl - Primary WebSocket URL
     * @param {string} options.sseUrl - Fallback SSE URL
     * @param {string} options.pollUrl - Fallback polling URL
     * @param {number} options.pollInterval - Polling interval in ms (default: 3000)
     * @param {boolean} options.autoConnect - Whether to connect automatically (default: true)
     * @param {boolean} options.debug - Whether to enable debug logging (default: false)
     * @param {boolean} options.enableSounds - Whether to enable notification sounds (default: true)
     */
    constructor(options = {}) {
        this.options = {
            websocketUrl: null,
            sseUrl: null,
            pollUrl: null, 
            pollInterval: 3000,
            autoConnect: true,
            debug: false,
            enableSounds: true,
            ...options
        };

        // State variables
        this.connectionState = 'disconnected'; // disconnected, connecting, connected
        this.connectionMode = null; // websocket, sse, polling
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectBaseDelay = 1000; // ms
        this.reconnectMaxDelay = 30000; // ms
        this.socket = null;
        this.sseSource = null;
        this.pollInterval = null;
        this.lastMessageId = null;

        // Event handlers
        this.eventHandlers = {
            'connect': [],
            'disconnect': [],
            'message': [],
            'notification': [],
            'error': [],
            'reconnect': [],
            'fallback': []
        };

        // Sound support
        this.sounds = {
            'message': new Audio('/sounds/message-received.mp3'),
            'notification': new Audio('/sounds/notification-default.mp3'),
            'bid': new Audio('/sounds/bid-update.mp3'),
            'payment': new Audio('/sounds/payment-processed.mp3'),
            'delivery': new Audio('/sounds/delivery-update.mp3'),
            'rfq': new Audio('/sounds/rfq-notification.mp3'),
            'verification': new Audio('/sounds/verification-complete.mp3')
        };

        // Auto connect if enabled
        if (this.options.autoConnect) {
            this.connect();
        }
    }

    /**
     * Log a debug message if debug mode is enabled
     * @param {string} message - The message to log
     * @param {any} data - Optional data to log
     * @private
     */
    _debug(message, data = null) {
        if (this.options.debug) {
            if (data) {
                console.log(`[Bell24h] ${message}`, data);
            } else {
                console.log(`[Bell24h] ${message}`);
            }
        }
    }

    /**
     * Connect to the real-time service
     * @returns {Promise} - Resolves when connected
     */
    async connect() {
        this._debug('Connecting to real-time service...');
        
        // Reset state if reconnecting
        if (this.connectionState === 'connected') {
            await this.disconnect();
        }

        this.connectionState = 'connecting';
        this._triggerEvent('connect', { state: 'connecting' });

        // Try WebSocket first if URL provided
        if (this.options.websocketUrl) {
            try {
                await this._connectWebSocket();
                return;
            } catch (error) {
                this._debug('WebSocket connection failed, falling back...', error);
                this._triggerEvent('fallback', { 
                    from: 'websocket', 
                    to: this.options.sseUrl ? 'sse' : 'polling',
                    error
                });
            }
        }

        // Try SSE next if URL provided
        if (this.options.sseUrl) {
            try {
                await this._connectSSE();
                return;
            } catch (error) {
                this._debug('SSE connection failed, falling back to polling...', error);
                this._triggerEvent('fallback', { 
                    from: 'sse', 
                    to: 'polling',
                    error
                });
            }
        }

        // Fall back to polling as last resort
        if (this.options.pollUrl) {
            try {
                await this._connectPolling();
                return;
            } catch (error) {
                this._debug('Polling connection failed...', error);
                this._handleDisconnect(error);
            }
        } else {
            this._debug('No fallback URLs provided, cannot connect');
            this._handleDisconnect(new Error('No valid connection URLs provided'));
        }
    }

    /**
     * Disconnect from all real-time services
     * @returns {Promise} - Resolves when disconnected
     */
    async disconnect() {
        this._debug('Disconnecting from real-time service...');

        // Close WebSocket if active
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        // Close SSE if active
        if (this.sseSource) {
            this.sseSource.close();
            this.sseSource = null;
        }

        // Stop polling if active
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        this.connectionState = 'disconnected';
        this.connectionMode = null;
        this._triggerEvent('disconnect', { reason: 'user_initiated' });

        return Promise.resolve();
    }

    /**
     * Send a message through the active connection
     * @param {string|Object} message - The message to send
     * @returns {Promise} - Resolves when message is sent
     */
    async send(message) {
        if (this.connectionState !== 'connected') {
            throw new Error('Cannot send message: not connected');
        }

        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

        if (this.connectionMode === 'websocket') {
            this.socket.send(messageStr);
            return Promise.resolve();
        } else {
            // For SSE or polling, need to use a separate HTTP request
            // Get base URL from the current connection URL
            let baseUrl;
            
            if (this.connectionMode === 'sse') {
                baseUrl = this.options.sseUrl.substring(0, this.options.sseUrl.lastIndexOf('/'));
            } else {
                baseUrl = this.options.pollUrl.substring(0, this.options.pollUrl.lastIndexOf('/'));
            }

            const sendUrl = `${baseUrl}/send`;
            
            try {
                const response = await fetch(sendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: messageStr
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                this._debug('Error sending message:', error);
                throw error;
            }
        }
    }

    /**
     * Register an event handler
     * @param {string} event - The event name
     * @param {Function} handler - The event handler function
     * @returns {Bell24hRealTimeClient} - The client instance for chaining
     */
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        } else {
            throw new Error(`Unknown event: ${event}`);
        }
        return this;
    }

    /**
     * Remove an event handler
     * @param {string} event - The event name
     * @param {Function} handler - The event handler function to remove
     * @returns {Bell24hRealTimeClient} - The client instance for chaining
     */
    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        } else {
            throw new Error(`Unknown event: ${event}`);
        }
        return this;
    }

    /**
     * Set whether sounds are enabled
     * @param {boolean} enabled - Whether sounds are enabled
     * @returns {Bell24hRealTimeClient} - The client instance for chaining
     */
    setSoundsEnabled(enabled) {
        this.options.enableSounds = enabled;
        return this;
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     * @returns {Bell24hRealTimeClient} - The client instance for chaining
     */
    setDebug(enabled) {
        this.options.debug = enabled;
        return this;
    }

    /**
     * Connect using WebSocket
     * @returns {Promise} - Resolves when connected
     * @private
     */
    _connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                this._debug(`Connecting to WebSocket: ${this.options.websocketUrl}`);
                
                // Create WebSocket instance
                this.socket = new WebSocket(this.options.websocketUrl);
                
                // Set timeouts for connection
                const connectionTimeout = setTimeout(() => {
                    if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
                        this._debug('WebSocket connection timeout');
                        this.socket.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);
                
                // Handle WebSocket events
                this.socket.onopen = () => {
                    this._debug('WebSocket connected');
                    clearTimeout(connectionTimeout);
                    this.connectionState = 'connected';
                    this.connectionMode = 'websocket';
                    this.reconnectAttempts = 0;
                    this._triggerEvent('connect', { 
                        state: 'connected', 
                        mode: 'websocket' 
                    });
                    resolve();
                };
                
                this.socket.onmessage = (event) => {
                    this._handleMessage(event.data);
                };
                
                this.socket.onclose = (event) => {
                    this._debug(`WebSocket closed (code: ${event.code})`);
                    clearTimeout(connectionTimeout);
                    
                    if (this.connectionState === 'connected' && this.connectionMode === 'websocket') {
                        this._handleDisconnect(new Error(`WebSocket closed with code ${event.code}`));
                    } else if (this.connectionState === 'connecting') {
                        reject(new Error(`WebSocket closed during connection with code ${event.code}`));
                    }
                };
                
                this.socket.onerror = (error) => {
                    this._debug('WebSocket error', error);
                    if (this.connectionState === 'connecting') {
                        reject(error || new Error('WebSocket connection failed'));
                    } else {
                        this._triggerEvent('error', { error });
                    }
                };
            } catch (error) {
                this._debug('Error setting up WebSocket', error);
                reject(error);
            }
        });
    }

    /**
     * Connect using Server-Sent Events
     * @returns {Promise} - Resolves when connected
     * @private
     */
    _connectSSE() {
        return new Promise((resolve, reject) => {
            try {
                this._debug(`Connecting to SSE: ${this.options.sseUrl}`);
                
                // Create EventSource instance
                this.sseSource = new EventSource(this.options.sseUrl);
                
                // Set timeouts for connection
                const connectionTimeout = setTimeout(() => {
                    if (this.sseSource && this.sseSource.readyState !== EventSource.OPEN) {
                        this._debug('SSE connection timeout');
                        this.sseSource.close();
                        reject(new Error('SSE connection timeout'));
                    }
                }, 10000);
                
                // Handle SSE events
                this.sseSource.onopen = () => {
                    this._debug('SSE connected');
                    clearTimeout(connectionTimeout);
                    this.connectionState = 'connected';
                    this.connectionMode = 'sse';
                    this.reconnectAttempts = 0;
                    this._triggerEvent('connect', { 
                        state: 'connected', 
                        mode: 'sse' 
                    });
                    resolve();
                };
                
                this.sseSource.onmessage = (event) => {
                    this._handleMessage(event.data);
                };
                
                this.sseSource.onerror = (error) => {
                    this._debug('SSE error', error);
                    clearTimeout(connectionTimeout);
                    
                    if (this.sseSource.readyState === EventSource.CLOSED) {
                        if (this.connectionState === 'connected' && this.connectionMode === 'sse') {
                            this._handleDisconnect(error || new Error('SSE connection closed'));
                        } else if (this.connectionState === 'connecting') {
                            reject(error || new Error('SSE connection failed'));
                        }
                    } else {
                        this._triggerEvent('error', { error });
                    }
                };
            } catch (error) {
                this._debug('Error setting up SSE', error);
                reject(error);
            }
        });
    }

    /**
     * Connect using HTTP polling
     * @returns {Promise} - Resolves when connected
     * @private
     */
    _connectPolling() {
        return new Promise((resolve, reject) => {
            try {
                this._debug(`Setting up polling: ${this.options.pollUrl}`);
                
                // First poll to check if service is available
                fetch(this.options.pollUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        this._debug('Initial poll successful', data);
                        
                        // Set up regular polling
                        this.pollInterval = setInterval(() => {
                            this._pollForMessages();
                        }, this.options.pollInterval);
                        
                        this.connectionState = 'connected';
                        this.connectionMode = 'polling';
                        this.reconnectAttempts = 0;
                        this._triggerEvent('connect', { 
                            state: 'connected', 
                            mode: 'polling' 
                        });
                        resolve();
                    })
                    .catch(error => {
                        this._debug('Initial poll failed', error);
                        reject(error);
                    });
            } catch (error) {
                this._debug('Error setting up polling', error);
                reject(error);
            }
        });
    }

    /**
     * Poll for new messages
     * @private
     */
    _pollForMessages() {
        const url = this.lastMessageId 
            ? `${this.options.pollUrl}?since=${this.lastMessageId}` 
            : this.options.pollUrl;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.notifications && data.notifications.length > 0) {
                    data.notifications.forEach(notification => {
                        if (!this.lastMessageId || notification.id > this.lastMessageId) {
                            this.lastMessageId = notification.id;
                            this._handleMessage(JSON.stringify(notification));
                        }
                    });
                }
            })
            .catch(error => {
                this._debug('Polling error', error);
                this._triggerEvent('error', { error });
                
                // Don't auto-reconnect on every poll error
                // Only if we hit a threshold of consecutive errors
            });
    }

    /**
     * Handle a message from any transport
     * @param {string} data - The message data
     * @private
     */
    _handleMessage(data) {
        try {
            // Try to parse as JSON
            let message;
            
            if (typeof data === 'string') {
                message = JSON.parse(data);
            } else {
                message = data;
            }
            
            this._debug('Received message', message);
            
            // Trigger generic message event
            this._triggerEvent('message', { message });
            
            // Handle specific message types
            if (message.type === 'notification') {
                this._handleNotification(message);
            }
        } catch (error) {
            // If not JSON, treat as plain text
            this._debug('Received non-JSON message', data);
            this._triggerEvent('message', { message: data });
        }
    }

    /**
     * Handle a notification message
     * @param {Object} notification - The notification data
     * @private
     */
    _handleNotification(notification) {
        this._debug('Received notification', notification);
        
        // Play sound if enabled
        if (this.options.enableSounds) {
            this._playNotificationSound(notification);
        }
        
        // Trigger notification event
        this._triggerEvent('notification', { notification });
    }

    /**
     * Play a notification sound based on notification type
     * @param {Object} notification - The notification data
     * @private
     */
    _playNotificationSound(notification) {
        let sound = this.sounds.notification; // Default sound
        
        // Select specific sound based on notification category
        if (notification.category) {
            switch(notification.category.toLowerCase()) {
                case 'message':
                    sound = this.sounds.message;
                    break;
                case 'bid':
                case 'bid_update':
                    sound = this.sounds.bid;
                    break;
                case 'payment':
                    sound = this.sounds.payment;
                    break;
                case 'delivery':
                    sound = this.sounds.delivery;
                    break;
                case 'rfq':
                    sound = this.sounds.rfq;
                    break;
                case 'verification':
                    sound = this.sounds.verification;
                    break;
            }
        }
        
        // Play the sound
        try {
            sound.currentTime = 0;
            sound.play().catch(error => {
                // Browser may block autoplay
                this._debug('Error playing notification sound', error);
            });
        } catch (error) {
            this._debug('Error playing notification sound', error);
        }
    }

    /**
     * Handle a disconnection event
     * @param {Error} error - The error that caused the disconnection
     * @private
     */
    _handleDisconnect(error) {
        this._debug('Disconnected', error);
        
        // Clean up resources
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket = null;
        }
        
        if (this.sseSource) {
            this.sseSource.onopen = null;
            this.sseSource.onmessage = null;
            this.sseSource.onerror = null;
            this.sseSource.close();
            this.sseSource = null;
        }
        
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        
        // Update state
        this.connectionState = 'disconnected';
        const previousMode = this.connectionMode;
        this.connectionMode = null;
        
        // Trigger disconnect event
        this._triggerEvent('disconnect', { 
            reason: 'error', 
            error,
            previousMode
        });
        
        // Attempt reconnect if appropriate
        this._scheduleReconnect();
    }

    /**
     * Schedule a reconnect attempt with exponential backoff
     * @private
     */
    _scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this._debug(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`);
            return;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
            this.reconnectBaseDelay * Math.pow(1.5, this.reconnectAttempts) * (0.9 + Math.random() * 0.2),
            this.reconnectMaxDelay
        );
        
        this._debug(`Scheduling reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (this.connectionState === 'disconnected') {
                this._debug(`Attempting reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                this.reconnectAttempts++;
                this._triggerEvent('reconnect', { attempt: this.reconnectAttempts });
                this.connect().catch(error => {
                    this._debug('Reconnect failed', error);
                });
            }
        }, delay);
    }

    /**
     * Trigger an event
     * @param {string} event - The event name
     * @param {Object} data - The event data
     * @private
     */
    _triggerEvent(event, data) {
        if (this.eventHandlers[event]) {
            for (const handler of this.eventHandlers[event]) {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${event} event handler:`, error);
                }
            }
        }
    }
}

// Global export
if (typeof window !== 'undefined') {
    window.Bell24hRealTimeClient = Bell24hRealTimeClient;
}

// ESM export
export default Bell24hRealTimeClient;


class Bell24hWebSocket {
  constructor() {
    this.connect();
    this.setupEventListeners();
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${window.location.host}`);
  }

  setupEventListeners() {
    this.ws.onopen = () => {
      console.log('Connected to server');
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      setTimeout(() => this.connect(), 1000);
    };
  }

  handleMessage(data) {
    const activityFeed = document.getElementById('activity-feed');
    if(activityFeed){
        const item = document.createElement('div');
        item.className = 'p-4 border rounded';
        item.textContent = data;
        activityFeed.prepend(item);
    } else {
        console.error("activity-feed element not found");
    }
  }
}

window.addEventListener('load', () => {
  new Bell24hWebSocket();
});