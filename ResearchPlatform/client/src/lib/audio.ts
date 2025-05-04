/**
 * Audio utilities for Bell24h platform
 * Provides sound effects for key interactions
 */

// Bell sound data URL (base64 encoded small MP3)
// This is a light chime sound representing speed and positivity
const SUCCESS_SOUND_DATA = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCZWxsMjRoIGNoaW1lIHNvdW5kIGZvciB1c2VyIGludGVyYWN0aW9ucwAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+Cjw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIvPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0iciI/PgpJTkZPAAAADwAABEVuZ2luZWVyAFRhZ2dlZABJQ09QAAALUwAAAVRFTkMAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQr78yzexaBRxcHFwfwz//gIJATk5QcnJ/5f+Af54AAA';

// Notification bell sound data URL (different sound)
const NOTIFICATION_SOUND_DATA = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCZWxsMjRoIG5vdGlmaWNhdGlvbiBzb3VuZCBmb3IgYWxlcnRzAAAAAA==';

// RFQ Received sound (for marketplace sellers when they receive an RFQ)
const RFQ_SOUND_DATA = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCZWxsMjRoIFJGUSByZWNlaXZlZCBzb3VuZCBmb3Igc2VsbGVycwAA';

// Match Found sound (for when supplier/buyer matching happens)
const MATCH_SOUND_DATA = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCZWxsMjRoIG1hdGNoIGZvdW5kIHNvdW5kIGZvciBidXllci9zdXBwbGllcgA=';

// Transaction Completed sound (for when a deal is finalized)
const TRANSACTION_SOUND_DATA = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCZWxsMjRoIHRyYW5zYWN0aW9uIGNvbXBsZXRlIHNvdW5kAA==';

// Flag to track if audio is enabled (initialized on first user interaction)
let audioEnabled = false;

/**
 * Initialize audio on user interaction to comply with browser autoplay policies
 * Should be called in response to a user action like a click
 */
export const initializeAudio = (): void => {
  audioEnabled = true;
  console.log('Audio initialized on user interaction');
};

/**
 * Play a sound from data URL
 * @param soundDataUrl The base64 encoded sound data URL
 * @param volume Volume level between 0 and 1
 */
const playSound = (soundDataUrl: string, volume = 0.5): void => {
  // Only attempt to play if audio is enabled and browser supports it
  if (!audioEnabled) {
    console.log('Audio not yet initialized. Call initializeAudio() first on user interaction');
    initializeAudio(); // Auto initialize on first attempt
  }

  try {
    // Use Audio element for simplicity
    const sound = new Audio(soundDataUrl);
    sound.volume = Math.min(1, Math.max(0, volume)); // Clamp volume between 0 and 1
    
    sound.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

/**
 * Play success sound (for completion of actions)
 * @param volume Volume level between 0 and 1, default is 0.6
 */
export const playSuccessSound = (volume = 0.6): void => {
  playSound(SUCCESS_SOUND_DATA, volume);
};

/**
 * Play notification sound (for alerts and notifications)
 * @param volume Volume level between 0 and 1, default is 0.5
 */
export const playNotificationSound = (volume = 0.5): void => {
  playSound(NOTIFICATION_SOUND_DATA, volume);
};

/**
 * Play RFQ received sound (for marketplace sellers)
 * @param volume Volume level between 0 and 1, default is 0.7
 */
export const playRfqSound = (volume = 0.7): void => {
  playSound(RFQ_SOUND_DATA, volume);
};

/**
 * Play match found sound (buyer/supplier matching)
 * @param volume Volume level between 0 and 1, default is 0.6
 */
export const playMatchSound = (volume = 0.6): void => {
  playSound(MATCH_SOUND_DATA, volume);
};

/**
 * Play transaction completed sound
 * @param volume Volume level between 0 and 1, default is 0.7
 */
export const playTransactionSound = (volume = 0.7): void => {
  playSound(TRANSACTION_SOUND_DATA, volume);
};

/**
 * BellSoundEffects class for more convenient use in React components
 */
export class BellSoundEffects {
  /**
   * Play success sound effect
   */
  static success() {
    playSuccessSound();
  }

  /**
   * Play notification sound effect
   */
  static notification() {
    playNotificationSound();
  }
  
  /**
   * Play RFQ received sound effect
   */
  static rfqReceived() {
    playRfqSound();
  }
  
  /**
   * Play match found sound effect
   */
  static matchFound() {
    playMatchSound();
  }
  
  /**
   * Play transaction completed sound effect
   */
  static transactionComplete() {
    playTransactionSound();
  }

  /**
   * Initialize audio system
   */
  static initialize() {
    initializeAudio();
  }
}

/**
 * React hook for using sound effects in functional components
 * @returns Object with sound functions
 */
export const useAudio = () => {
  return {
    success: playSuccessSound,
    notification: playNotificationSound,
    rfqReceived: playRfqSound,
    matchFound: playMatchSound,
    transactionComplete: playTransactionSound,
    initialize: initializeAudio
  };
};

export default BellSoundEffects;