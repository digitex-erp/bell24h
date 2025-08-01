// Global type declarations for Bell24H

declare global {
  interface Window {
    templeBellSound?: {
      playBellSound: (duration?: number) => Promise<void>;
      isAudioSupported: () => boolean;
    };
  }
}

export {};
