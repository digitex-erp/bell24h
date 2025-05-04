/**
 * Bell24h Notification Manager
 * 
 * A library for managing and displaying notifications from Bell24h services,
 * with support for sounds, browser notifications, and automatic real-time connection.
 */

class Bell24hNotificationManager {
    /**
     * Create a new Bell24h notification manager
     * @param {Object} options - Configuration options
     * @param {Object} options.realTimeOptions - Options for the real-time client
     * @param {boolean} options.enableSounds - Whether to enable notification sounds (default: true)
     * @param {boolean} options.enableBrowserNotifications - Whether to enable browser notifications (default: true)
     * @param {boolean} options.debug - Whether to enable debug logging (default: false)
     * @param {function} options.onNotification - Callback for when a notification is received
     * @param {string} options.containerSelector - CSS selector for the notification container (default: null)
     */
    constructor(options = {}) {
        this.options = {
            realTimeOptions: {},
            enableSounds: true,
            enableBrowserNotifications: true,
            debug: false,
            onNotification: null,
            containerSelector: null,
            ...options
        };

        // Setup state
        this.realTimeClient = null;
        this.notificationContainer = null;
        this.notifications = [];
        this.browserNotificationPermission = 'default';
        
        // Sound assets (will be initialized later)
        this.sounds = {};
        
        // Initialize the notification manager
        this._initialize();
    }
    
    /**
     * Initialize the notification manager
     * @private
     */
    _initialize() {
        this._debug('Initializing Bell24h Notification Manager');
        
        // Load sound assets
        this._loadSoundAssets();
        
        // Setup notification container if selector provided
        if (this.options.containerSelector) {
            this.notificationContainer = document.querySelector(this.options.containerSelector);
            
            if (!this.notificationContainer) {
                console.warn(`Bell24h Notification container not found: ${this.options.containerSelector}`);
                
                // Create a default container
                this.notificationContainer = document.createElement('div');
                this.notificationContainer.className = 'bell24h-notification-container';
                this.notificationContainer.style.position = 'fixed';
                this.notificationContainer.style.top = '20px';
                this.notificationContainer.style.right = '20px';
                this.notificationContainer.style.zIndex = '9999';
                this.notificationContainer.style.width = '300px';
                this.notificationContainer.style.maxHeight = '80vh';
                this.notificationContainer.style.overflowY = 'auto';
                this.notificationContainer.style.display = 'flex';
                this.notificationContainer.style.flexDirection = 'column-reverse';
                this.notificationContainer.style.gap = '10px';
                
                document.body.appendChild(this.notificationContainer);
                this._debug('Created default notification container');
            }
        }
        
        // Check browser notification permission
        if (this.options.enableBrowserNotifications && 'Notification' in window) {
            this.browserNotificationPermission = Notification.permission;
            
            if (this.browserNotificationPermission === 'default') {
                // Will request permission when first notification arrives
                this._debug('Browser notifications enabled, permission not granted yet');
            } else {
                this._debug(`Browser notifications ${this.browserNotificationPermission === 'granted' ? 'enabled' : 'denied'}`);
            }
        } else {
            this._debug('Browser notifications not supported or disabled');
        }
        
        // Setup real-time client if Bell24hRealTimeClient is available
        if (typeof Bell24hRealTimeClient !== 'undefined') {
            this._setupRealTimeClient();
        } else {
            console.error('Bell24hRealTimeClient not available. Make sure bell24h-websocket.js is loaded before bell24h-notifications.js');
        }
    }
    
    /**
     * Load notification sound assets
     * @private
     */
    _loadSoundAssets() {
        this._debug('Loading notification sound assets');
        
        // Create Audio objects for each notification type
        this.sounds = {
            default: new Audio('/sounds/notification-default.mp3'),
            message: new Audio('/sounds/message-received.mp3'),
            bid: new Audio('/sounds/bid-update.mp3'),
            payment: new Audio('/sounds/payment-processed.mp3'),
            delivery: new Audio('/sounds/delivery-update.mp3'),
            rfq: new Audio('/sounds/rfq-notification.mp3'),
            verification: new Audio('/sounds/verification-complete.mp3')
        };
        
        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.load();
        });
    }
    
    /**
     * Setup the real-time client
     * @private
     */
    _setupRealTimeClient() {
        this._debug('Setting up real-time client');
        
        // Create real-time client with provided options
        this.realTimeClient = new Bell24hRealTimeClient({
            ...this.options.realTimeOptions,
            enableSounds: false, // We'll handle sounds ourselves
            debug: this.options.debug
        });
        
        // Register event handlers
        this.realTimeClient.on('notification', (data) => {
            this._handleNotification(data.notification);
        });
        
        this.realTimeClient.on('connect', (data) => {
            this._debug(`Real-time client connected via ${data.mode}`);
        });
        
        this.realTimeClient.on('disconnect', (data) => {
            this._debug(`Real-time client disconnected: ${data.reason}`);
        });
        
        this.realTimeClient.on('error', (data) => {
            console.error('Bell24h real-time client error:', data.error);
        });
        
        // Connect to real-time service if auto-connect is enabled
        if (this.options.realTimeOptions.autoConnect !== false) {
            this.realTimeClient.connect();
        }
    }
    
    /**
     * Handle a notification
     * @param {Object} notification - The notification data
     * @private
     */
    _handleNotification(notification) {
        this._debug('Received notification', notification);
        
        // Add notification to list
        this.notifications.push(notification);
        
        // Play sound if enabled
        if (this.options.enableSounds) {
            this._playNotificationSound(notification);
        }
        
        // Show browser notification if enabled
        if (this.options.enableBrowserNotifications) {
            this._showBrowserNotification(notification);
        }
        
        // Display in container if available
        if (this.notificationContainer) {
            this._displayNotification(notification);
        }
        
        // Call notification callback if provided
        if (typeof this.options.onNotification === 'function') {
            try {
                this.options.onNotification(notification);
            } catch (error) {
                console.error('Error in notification callback:', error);
            }
        }
    }
    
    /**
     * Play a notification sound based on notification type
     * @param {Object} notification - The notification data
     * @private
     */
    _playNotificationSound(notification) {
        let sound = this.sounds.default; // Default sound
        
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
     * Show a browser notification
     * @param {Object} notification - The notification data
     * @private
     */
    _showBrowserNotification(notification) {
        if (!('Notification' in window)) {
            return;
        }
        
        const title = notification.title || 'Bell24h Notification';
        const options = {
            body: notification.message || '',
            icon: '/images/bell24h-logo.png',
            tag: `bell24h-${notification.id || Date.now()}`,
            data: notification
        };
        
        if (this.browserNotificationPermission === 'granted') {
            // Permission already granted, show notification
            new Notification(title, options);
        } else if (this.browserNotificationPermission === 'default') {
            // Request permission
            Notification.requestPermission().then(permission => {
                this.browserNotificationPermission = permission;
                
                if (permission === 'granted') {
                    new Notification(title, options);
                }
            });
        }
    }
    
    /**
     * Display a notification in the container
     * @param {Object} notification - The notification data
     * @private
     */
    _displayNotification(notification) {
        // Create notification element
        const element = document.createElement('div');
        element.className = 'bell24h-notification';
        element.style.padding = '15px';
        element.style.background = 'white';
        element.style.borderRadius = '5px';
        element.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        element.style.borderLeft = '5px solid #3498db';
        element.style.position = 'relative';
        
        // Add category-specific styles
        if (notification.category) {
            switch(notification.category.toLowerCase()) {
                case 'message':
                    element.style.borderLeftColor = '#2ecc71';
                    break;
                case 'bid':
                case 'bid_update':
                    element.style.borderLeftColor = '#f39c12';
                    break;
                case 'payment':
                    element.style.borderLeftColor = '#9b59b6';
                    break;
                case 'delivery':
                    element.style.borderLeftColor = '#e74c3c';
                    break;
                case 'rfq':
                    element.style.borderLeftColor = '#3498db';
                    break;
                case 'verification':
                    element.style.borderLeftColor = '#1abc9c';
                    break;
            }
        }
        
        // Add title
        const title = document.createElement('div');
        title.className = 'bell24h-notification-title';
        title.textContent = notification.title || 'Notification';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '5px';
        element.appendChild(title);
        
        // Add message if available
        if (notification.message) {
            const message = document.createElement('div');
            message.className = 'bell24h-notification-message';
            message.textContent = notification.message;
            element.appendChild(message);
        }
        
        // Add time
        const time = document.createElement('div');
        time.className = 'bell24h-notification-time';
        time.textContent = new Date().toLocaleTimeString();
        time.style.fontSize = '0.8em';
        time.style.marginTop = '5px';
        time.style.color = '#7f8c8d';
        element.appendChild(time);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'bell24h-notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '5px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'transparent';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#95a5a6';
        
        closeBtn.addEventListener('click', () => {
            this.notificationContainer.removeChild(element);
        });
        
        element.appendChild(closeBtn);
        
        // Add to container
        this.notificationContainer.appendChild(element);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (element.parentNode === this.notificationContainer) {
                this.notificationContainer.removeChild(element);
            }
        }, 5000);
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
                console.log(`[Bell24h Notifications] ${message}`, data);
            } else {
                console.log(`[Bell24h Notifications] ${message}`);
            }
        }
    }
    
    /**
     * Create a test notification
     * @param {string} type - The type of notification to create (message, bid, payment, delivery, rfq, verification)
     * @returns {Promise} - Resolves when the notification is created
     */
    async createTestNotification(type = 'default') {
        const categories = ['message', 'bid', 'payment', 'delivery', 'rfq', 'verification'];
        const category = categories.includes(type) ? type : 'default';
        
        const titles = {
            default: 'New Notification',
            message: 'New Message',
            bid: 'Bid Update',
            payment: 'Payment Processed',
            delivery: 'Delivery Update',
            rfq: 'New RFQ Posted',
            verification: 'Verification Complete'
        };
        
        const messages = {
            default: 'You have a new notification from Bell24h.',
            message: 'You have received a new message from a supplier.',
            bid: 'A supplier has updated their bid on your RFQ.',
            payment: 'Your payment has been processed successfully.',
            delivery: 'Your order status has been updated.',
            rfq: 'A new Request for Quote has been posted that matches your profile.',
            verification: 'Your account verification is now complete.'
        };
        
        const notification = {
            id: Date.now(),
            type: 'notification',
            category,
            title: titles[category],
            message: messages[category],
            timestamp: new Date().toISOString()
        };
        
        this._handleNotification(notification);
        
        return Promise.resolve(notification);
    }
    
    /**
     * Enable or disable notification sounds
     * @param {boolean} enabled - Whether sounds are enabled
     */
    setSoundsEnabled(enabled) {
        this.options.enableSounds = enabled;
        this._debug(`Notification sounds ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Enable or disable browser notifications
     * @param {boolean} enabled - Whether browser notifications are enabled
     */
    setBrowserNotificationsEnabled(enabled) {
        this.options.enableBrowserNotifications = enabled;
        this._debug(`Browser notifications ${enabled ? 'enabled' : 'disabled'}`);
        
        // Request permission if enabling and not already granted
        if (enabled && this.browserNotificationPermission === 'default' && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.browserNotificationPermission = permission;
                this._debug(`Browser notification permission: ${permission}`);
            });
        }
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebug(enabled) {
        this.options.debug = enabled;
        
        if (this.realTimeClient) {
            this.realTimeClient.setDebug(enabled);
        }
    }
    
    /**
     * Get all notifications
     * @returns {Array} - Array of notifications
     */
    getNotifications() {
        return [...this.notifications];
    }
    
    /**
     * Clear all notifications
     */
    clearNotifications() {
        this.notifications = [];
        
        if (this.notificationContainer) {
            this.notificationContainer.innerHTML = '';
        }
    }
}

// Global export
if (typeof window !== 'undefined') {
    window.Bell24hNotificationManager = Bell24hNotificationManager;
}

// ESM export
export default Bell24hNotificationManager;