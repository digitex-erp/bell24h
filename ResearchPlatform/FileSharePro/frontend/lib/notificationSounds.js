/**
 * Bell24h Notification Sound Manager
 * 
 * This module provides sound notification functionality for the Bell24h platform.
 * It supports different sound types, volume control, and user preferences.
 */

class NotificationSoundManager {
    constructor(options = {}) {
        // Default options
        this.options = {
            enabled: true,
            volume: 0.5,
            soundPath: '../public/sounds/',
            defaultSound: 'notification-default.mp3',
            ...options
        };

        // Sound types with their corresponding audio files
        this.soundTypes = {
            default: this.options.defaultSound,
            message: 'message-received.mp3',
            rfq: 'rfq-notification.mp3',
            bid: 'bid-update.mp3',
            payment: 'payment-processed.mp3',
            delivery: 'delivery-update.mp3',
            verification: 'verification-complete.mp3'
        };

        // Initialize audio elements
        this.audioElements = {};
        this._initAudioElements();

        // User preference from localStorage
        this._loadUserPreferences();
    }

    /**
     * Initialize audio elements for each sound type
     * @private
     */
    _initAudioElements() {
        for (const [type, file] of Object.entries(this.soundTypes)) {
            const audio = new Audio();
            audio.src = `${this.options.soundPath}${file}`;
            audio.volume = this.options.volume;
            audio.preload = 'auto';
            this.audioElements[type] = audio;
        }
    }

    /**
     * Load user preferences from localStorage
     * @private
     */
    _loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('bell24h_sound_preferences'));
            if (preferences) {
                this.options.enabled = preferences.enabled !== undefined ? preferences.enabled : this.options.enabled;
                this.options.volume = preferences.volume !== undefined ? preferences.volume : this.options.volume;
                
                // Update audio elements with saved volume
                this._updateAudioVolume();
            }
        } catch (error) {
            console.error('Error loading sound preferences:', error);
        }
    }

    /**
     * Save user preferences to localStorage
     * @private
     */
    _saveUserPreferences() {
        try {
            const preferences = {
                enabled: this.options.enabled,
                volume: this.options.volume
            };
            localStorage.setItem('bell24h_sound_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving sound preferences:', error);
        }
    }

    /**
     * Update volume for all audio elements
     * @private
     */
    _updateAudioVolume() {
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = this.options.volume;
        });
    }

    /**
     * Play a notification sound
     * @param {string} type - The type of notification sound to play
     * @returns {Promise} A promise that resolves when the sound finished playing or rejects if there was an error
     */
    play(type = 'default') {
        return new Promise((resolve, reject) => {
            if (!this.options.enabled) {
                resolve(false);
                return;
            }

            const soundType = this.soundTypes[type] ? type : 'default';
            const audio = this.audioElements[soundType];

            if (!audio) {
                reject(new Error(`Sound type "${type}" not found`));
                return;
            }

            // Reset to beginning if already playing
            audio.currentTime = 0;

            // Play the sound
            audio.play()
                .then(() => {
                    // Listen for when playback finishes
                    audio.addEventListener('ended', () => resolve(true), { once: true });
                })
                .catch(error => {
                    console.error(`Error playing notification sound "${type}":`, error);
                    reject(error);
                });
        });
    }

    /**
     * Enable or disable sound notifications
     * @param {boolean} enabled - Whether sounds should be enabled
     */
    setEnabled(enabled) {
        this.options.enabled = Boolean(enabled);
        this._saveUserPreferences();
    }

    /**
     * Set the volume for notification sounds
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        // Ensure volume is between 0 and 1
        this.options.volume = Math.max(0, Math.min(1, volume));
        this._updateAudioVolume();
        this._saveUserPreferences();
    }

    /**
     * Check if sound notifications are enabled
     * @returns {boolean} Whether sounds are enabled
     */
    isEnabled() {
        return this.options.enabled;
    }

    /**
     * Get the current volume level
     * @returns {number} The current volume (0.0 to 1.0)
     */
    getVolume() {
        return this.options.volume;
    }

    /**
     * Toggle sound notifications on/off
     * @returns {boolean} The new enabled state
     */
    toggle() {
        this.options.enabled = !this.options.enabled;
        this._saveUserPreferences();
        return this.options.enabled;
    }
}

// Create a singleton instance
const notificationSound = new NotificationSoundManager();

export default notificationSound;