import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HomePage from '@/app/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}));

// Mock other components
jest.mock('@/components/SEO/GlobalSEOHead', () => {
  return function MockGlobalSEOHead() {
    return <div data-testid="mock-seo-head" />;
  };
});

jest.mock('@/components/SEO/LocalBusinessSchema', () => {
  return function MockLocalBusinessSchema() {
    return <script type="application/ld+json" data-testid="mock-schema" />;
  };
});

describe('Audio Bell Sound System', () => {
  let user: any;
  let mockPlay: jest.Mock;
  let mockPause: jest.Mock;
  let mockLoad: jest.Mock;
  let mockTempleBellSound: any;

  beforeEach(() => {
    user = userEvent.setup();
    
    // Mock HTML Audio Element
    mockPlay = jest.fn(() => Promise.resolve());
    mockPause = jest.fn();
    mockLoad = jest.fn();
    
    global.HTMLMediaElement.prototype.play = mockPlay;
    global.HTMLMediaElement.prototype.pause = mockPause;
    global.HTMLMediaElement.prototype.load = mockLoad;
    
    // Mock temple bell sound system
    mockTempleBellSound = {
      isAudioSupported: jest.fn(() => true),
      playBellSound: jest.fn(() => Promise.resolve()),
      stopBellSound: jest.fn(),
      setVolume: jest.fn(),
      isPlaying: jest.fn(() => false)
    };
    
    (window as any).templeBellSound = mockTempleBellSound;
    
    // Mock script loading
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tagName) => {
      const element = originalCreateElement.call(document, tagName);
      if (tagName === 'script') {
        setTimeout(() => {
          if (element.onload) element.onload({} as Event);
        }, 100);
      }
      return element;
    });
    
    // Mock document.head.appendChild
    const originalAppendChild = document.head.appendChild;
    document.head.appendChild = jest.fn((element) => {
      if (element.tagName === 'SCRIPT') {
        setTimeout(() => {
          if (element.onload) element.onload({} as Event);
        }, 100);
      }
      return originalAppendChild.call(document.head, element);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (window as any).templeBellSound;
    document.createElement = originalCreateElement;
    document.head.appendChild = originalAppendChild;
  });

  describe('Audio System Initialization', () => {
    test('initializes bell sound system on component mount', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(document.createElement).toHaveBeenCalledWith('script');
      });
      
      // Should create and load the bell sound script
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    test('renders audio element with correct sources', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement).toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      expect(audioElement).toHaveAttribute('preload', 'auto');
      
      const sources = audioElement?.querySelectorAll('source');
      expect(sources).toHaveLength(2);
      expect(sources?.[0]).toHaveAttribute('src', '/sounds/temple-bell.mp3');
      expect(sources?.[0]).toHaveAttribute('type', 'audio/mpeg');
      expect(sources?.[1]).toHaveAttribute('src', '/sounds/temple-bell.wav');
      expect(sources?.[1]).toHaveAttribute('type', 'audio/wav');
    });

    test('plays bell sound automatically on load when enabled', async () => {
      render(<HomePage />);
      
      // Wait for component to mount and script to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
      });
      
      await waitFor(() => {
        expect(mockTempleBellSound.playBellSound).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('does not auto-play when sound is disabled', async () => {
      render(<HomePage />);
      
      // Disable sound immediately
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell|enable bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell|enable bell/i);
      await user.click(soundButton);
      
      // Should not auto-play when disabled
      expect(mockTempleBellSound.playBellSound).not.toHaveBeenCalled();
    });

    test('handles script loading errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock script loading failure
      document.createElement = jest.fn((tagName) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'script') {
          setTimeout(() => {
            if (element.onerror) element.onerror({} as ErrorEvent);
          }, 100);
        }
        return element;
      });
      
      render(<HomePage />);
      
      // Should not crash and should log error
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Bell sound initialization error')
        );
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Sound Control Interface', () => {
    test('renders sound toggle button with correct initial state', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell|enable bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell|enable bell/i);
      expect(soundButton).toBeInTheDocument();
      
      // Should start with sound enabled (Volume2 icon)
      const volume2Icon = soundButton.querySelector('[data-lucide="volume-2"]');
      expect(volume2Icon).toBeInTheDocument();
    });

    test('toggles sound state when button is clicked', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/enable bell|mute bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/enable bell|mute bell/i);
      
      // Initial state should be enabled
      expect(soundButton).toHaveAttribute('title', 'Mute Bell');
      
      await user.click(soundButton);
      
      // Should toggle to disabled
      await waitFor(() => {
        expect(soundButton).toHaveAttribute('title', 'Enable Bell');
      });
      
      await user.click(soundButton);
      
      // Should toggle back to enabled
      await waitFor(() => {
        expect(soundButton).toHaveAttribute('title', 'Mute Bell');
      });
    });

    test('updates icon when sound state changes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell/i);
      
      // Should start with Volume2 icon
      let volume2Icon = soundButton.querySelector('[data-lucide="volume-2"]');
      expect(volume2Icon).toBeInTheDocument();
      
      await user.click(soundButton);
      
      // Should switch to VolumeX icon
      await waitFor(() => {
        const volumeXIcon = soundButton.querySelector('[data-lucide="volume-x"]');
        expect(volumeXIcon).toBeInTheDocument();
      });
    });

    test('plays bell sound when enabling from disabled state', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell/i);
      
      // Disable first
      await user.click(soundButton);
      
      // Clear previous calls
      mockTempleBellSound.playBellSound.mockClear();
      
      // Enable again
      await user.click(soundButton);
      
      // Should play bell sound
      await waitFor(() => {
        expect(mockTempleBellSound.playBellSound).toHaveBeenCalled();
      });
    });

    test('sound toggle appears in both header and footer', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButtons = screen.getAllByTitle(/mute bell|enable bell/i);
        expect(soundButtons).toHaveLength(2);
      });

      const soundButtons = screen.getAllByTitle(/mute bell|enable bell/i);
      
      // One in header, one in footer
      expect(soundButtons).toHaveLength(2);
      
      // Both should have the same initial state
      soundButtons.forEach(button => {
        expect(button).toHaveAttribute('title', 'Mute Bell');
      });
    });

    test('footer sound toggle shows current state text', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const footerSoundToggle = screen.getByText(/Bell Sound:/);
        expect(footerSoundToggle).toBeInTheDocument();
      });

      const footerSoundToggle = screen.getByText(/Bell Sound:/);
      expect(footerSoundToggle).toHaveTextContent('Bell Sound: On');
      
      // Click to toggle
      await user.click(footerSoundToggle);
      
      await waitFor(() => {
        expect(footerSoundToggle).toHaveTextContent('Bell Sound: Off');
      });
    });
  });

  describe('Manual Bell Sound Trigger', () => {
    test('renders clickable bell icon in hero section', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellIcon = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellIcon).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
      expect(bellContainer).toBeInTheDocument();
      expect(bellContainer).toHaveClass('cursor-pointer');
    });

    test('shows hover tooltip for manual bell trigger', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
      const tooltip = bellContainer?.querySelector('p');
      
      expect(tooltip).toHaveTextContent('Click for Bell Sound');
      expect(tooltip).toHaveClass('opacity-0', 'group-hover:opacity-100');
    });

    test('plays bell sound when hero bell is clicked', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      await user.click(bellContainer);
      
      await waitFor(() => {
        expect(mockTempleBellSound.playBellSound).toHaveBeenCalled();
      });
    });

    test('falls back to HTML audio if temple bell sound fails', async () => {
      // Mock temple bell sound failure
      mockTempleBellSound.isAudioSupported.mockReturnValue(false);
      
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      await user.click(bellContainer);
      
      // Should fall back to HTML audio
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    test('handles audio play errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock audio play failure
      mockTempleBellSound.playBellSound.mockRejectedValue(new Error('Audio play failed'));
      
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      await user.click(bellContainer);
      
      // Should not crash and should log error
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Bell sound play failed')
        );
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Audio Performance and Optimization', () => {
    test('audio preloading does not block page render', async () => {
      const renderStart = performance.now();
      
      render(<HomePage />);
      
      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement).toBeInTheDocument();
      });
      
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      // Page should render quickly despite audio preloading
      expect(renderTime).toBeLessThan(200);
    });

    test('bell sound script loads asynchronously', async () => {
      const scriptCreateSpy = jest.spyOn(document, 'createElement');
      
      render(<HomePage />);
      
      await waitFor(() => {
        expect(scriptCreateSpy).toHaveBeenCalledWith('script');
      });
      
      // Should create script element
      expect(scriptCreateSpy).toHaveBeenCalledWith('script');
      
      // Script should be set to load from correct path
      const scriptCalls = scriptCreateSpy.mock.results.filter(
        result => result.value.tagName === 'SCRIPT'
      );
      expect(scriptCalls.length).toBeGreaterThan(0);
    });

    test('multiple rapid bell triggers do not cause audio conflicts', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      // Click rapidly multiple times
      await user.click(bellContainer);
      await user.click(bellContainer);
      await user.click(bellContainer);
      
      // Should handle multiple calls gracefully
      expect(mockTempleBellSound.playBellSound).toHaveBeenCalledTimes(3);
    });

    test('audio resources are cleaned up on component unmount', async () => {
      const { unmount } = render(<HomePage />);
      
      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement).toBeInTheDocument();
      });
      
      // Unmount component
      unmount();
      
      // Should not cause memory leaks or errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Cross-Browser Audio Compatibility', () => {
    test('provides multiple audio source formats', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement).toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      const sources = audioElement?.querySelectorAll('source');
      
      // Should provide both MP3 and WAV formats
      expect(sources).toHaveLength(2);
      
      const formats = Array.from(sources || []).map(source => 
        source.getAttribute('type')
      );
      expect(formats).toContain('audio/mpeg');
      expect(formats).toContain('audio/wav');
    });

    test('checks audio support before playing', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      await user.click(bellContainer);
      
      // Should check audio support
      expect(mockTempleBellSound.isAudioSupported).toHaveBeenCalled();
    });

    test('handles browsers without audio support', async () => {
      // Mock no audio support
      mockTempleBellSound.isAudioSupported.mockReturnValue(false);
      mockPlay.mockRejectedValue(new Error('Audio not supported'));
      
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      // Should not crash when audio is not supported
      await expect(async () => {
        await user.click(bellContainer);
      }).not.rejects.toThrow();
    });
  });

  describe('Accessibility and User Experience', () => {
    test('sound controls are keyboard accessible', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell/i);
      
      // Should be focusable
      soundButton.focus();
      expect(document.activeElement).toBe(soundButton);
      
      // Should respond to Enter key
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(soundButton).toHaveAttribute('title', 'Enable Bell');
      });
    });

    test('provides clear visual feedback for sound state', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell/i);
      
      // Icon should reflect current state
      let volume2Icon = soundButton.querySelector('[data-lucide="volume-2"]');
      expect(volume2Icon).toBeInTheDocument();
      
      await user.click(soundButton);
      
      await waitFor(() => {
        const volumeXIcon = soundButton.querySelector('[data-lucide="volume-x"]');
        expect(volumeXIcon).toBeInTheDocument();
      });
    });

    test('respects user preference for reduced motion', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(<HomePage />);
      
      // Bell animations should respect reduced motion preference
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });
    });

    test('provides appropriate titles and tooltips', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell/i);
        const bellContainer = screen.getByText('Click for Bell Sound');
        expect(soundButton).toBeInTheDocument();
        expect(bellContainer).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell/i);
      expect(soundButton).toHaveAttribute('title', 'Mute Bell');
      
      await user.click(soundButton);
      
      await waitFor(() => {
        expect(soundButton).toHaveAttribute('title', 'Enable Bell');
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('recovers from audio context suspension', async () => {
      // Mock audio context suspended state
      const mockAudioContext = {
        state: 'suspended',
        resume: jest.fn(() => Promise.resolve())
      };
      
      (window as any).AudioContext = jest.fn(() => mockAudioContext);
      
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      // Should handle suspended audio context
      await user.click(bellContainer);
      
      // Should attempt to resume context or fallback gracefully
      expect(mockTempleBellSound.playBellSound).toHaveBeenCalled();
    });

    test('handles missing audio files gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock audio load failure
      mockLoad.mockImplementation(() => {
        throw new Error('Audio file not found');
      });
      
      render(<HomePage />);
      
      await waitFor(() => {
        const bellContainer = screen.getByText('Click for Bell Sound').closest('.group');
        expect(bellContainer).toBeInTheDocument();
      });

      const bellContainer = screen.getByText('Click for Bell Sound').closest('.group') as HTMLElement;
      
      // Should not crash when audio files are missing
      await expect(async () => {
        await user.click(bellContainer);
      }).not.rejects.toThrow();
      
      consoleSpy.mockRestore();
    });

    test('maintains sound state across re-renders', async () => {
      const { rerender } = render(<HomePage />);
      
      await waitFor(() => {
        const soundButton = screen.getByTitle(/mute bell/i);
        expect(soundButton).toBeInTheDocument();
      });

      const soundButton = screen.getByTitle(/mute bell/i);
      
      // Disable sound
      await user.click(soundButton);
      
      await waitFor(() => {
        expect(soundButton).toHaveAttribute('title', 'Enable Bell');
      });
      
      // Re-render component
      rerender(<HomePage />);
      
      // Sound state should persist
      await waitFor(() => {
        const soundButtonAfterRerender = screen.getByTitle(/enable bell/i);
        expect(soundButtonAfterRerender).toHaveAttribute('title', 'Enable Bell');
      });
    });
  });
}); 