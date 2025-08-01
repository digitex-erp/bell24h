import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceRFQPage from '@/app/voice-rfq/page';

/**
 * Phase B: AI Voice RFQ UI Testing (Cursor-safe)
 * Tests UI interactions only - all AI/API calls are mocked
 * Keep under 80 lines to prevent hanging
 */

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/voice-rfq',
}));

// Mock audio recording
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  state: 'inactive',
}));

global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [],
  }),
};

describe('AI Voice RFQ - Basic UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Voice RFQ page with key elements', () => {
    render(<VoiceRFQPage />);

    expect(screen.getByText(/Voice RFQ/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  test('start/stop recording button toggles correctly', async () => {
    render(<VoiceRFQPage />);

    const recordButton = screen.getByRole('button', { name: /start recording/i });

    // Start recording
    fireEvent.click(recordButton);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });

    // Stop recording
    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    });
  });

  test('displays language selector', () => {
    render(<VoiceRFQPage />);

    const languageSelect = screen.getByRole('combobox', { name: /language/i });
    expect(languageSelect).toBeInTheDocument();
    expect(languageSelect).toHaveValue('en');
  });

  test('shows processing state after recording', async () => {
    render(<VoiceRFQPage />);

    // Simulate recording flow
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    // Should show processing state
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });
});
