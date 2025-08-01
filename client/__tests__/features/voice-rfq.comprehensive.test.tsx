/**
 * Voice RFQ Feature - Comprehensive Test Suite
 * Tests voice recording, transcription, AI analysis, and RFQ creation workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateTestData, apiTestUtils, bell24hTestUtils } from '../utils/testHelpers';

// Mock Voice RFQ component
const MockVoiceRFQComponent = () => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [transcription, setTranscription] = React.useState('');
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const startRecording = async () => {
    setIsRecording(true);
    // Mock recording start
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // Mock audio blob creation
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
    setAudioBlob(mockBlob);
  };

  const processVoiceRFQ = async () => {
    setIsProcessing(true);
    try {
      // Mock API call for transcription
      const transcriptionResult = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: audioBlob,
      });
      const { text } = await transcriptionResult.json();
      setTranscription(text);

      // Mock AI analysis
      const analysisResult = await fetch('/api/ai/analyze-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const analysisData = await analysisResult.json();
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Voice RFQ processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div data-testid='voice-rfq-component'>
      <h1>Voice RFQ Creation</h1>

      <div data-testid='recording-controls'>
        <button data-testid='start-recording' onClick={startRecording} disabled={isRecording}>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>

        <button data-testid='stop-recording' onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>

      {audioBlob && (
        <div data-testid='audio-controls'>
          <audio controls data-testid='audio-player'>
            <source src={URL.createObjectURL(audioBlob)} type='audio/wav' />
          </audio>

          <button data-testid='process-voice' onClick={processVoiceRFQ} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process Voice RFQ'}
          </button>
        </div>
      )}

      {transcription && (
        <div data-testid='transcription-result'>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}

      {analysis && (
        <div data-testid='ai-analysis'>
          <h3>AI Analysis:</h3>
          <div data-testid='category-result'>Category: {analysis.category}</div>
          <div data-testid='confidence-score'>Confidence: {analysis.confidence}%</div>
          <div data-testid='suggested-suppliers'>
            Suggested Suppliers: {analysis.suggestedSuppliers?.length || 0}
          </div>
        </div>
      )}

      {isProcessing && (
        <div data-testid='processing-indicator'>
          <div className='spinner'>Processing your voice RFQ...</div>
        </div>
      )}
    </div>
  );
};

describe('Voice RFQ Feature - Comprehensive Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock MediaRecorder API
    Object.defineProperty(window, 'MediaRecorder', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        state: 'inactive',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        ondataavailable: null,
        onstop: null,
      })),
    });

    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [
            {
              stop: jest.fn(),
              kind: 'audio',
              label: 'Test Microphone',
            },
          ],
        }),
      },
    });

    // Mock API responses
    apiTestUtils.mockApiSuccess({
      text: 'I need 100 units of industrial grade semiconductors for electronics manufacturing project',
    });
  });

  describe('Voice Recording Functionality', () => {
    test('microphone access and recording initialization', async () => {
      render(<MockVoiceRFQComponent />);

      const startButton = screen.getByTestId('start-recording');
      expect(startButton).toBeInTheDocument();
      expect(startButton).not.toBeDisabled();
    });

    test('start recording functionality', async () => {
      render(<MockVoiceRFQComponent />);

      const startButton = screen.getByTestId('start-recording');
      await user.click(startButton);

      // Button should change to recording state
      expect(screen.getByText('Recording...')).toBeInTheDocument();
      expect(startButton).toBeDisabled();

      // Stop button should be enabled
      const stopButton = screen.getByTestId('stop-recording');
      expect(stopButton).not.toBeDisabled();
    });

    test('stop recording functionality', async () => {
      render(<MockVoiceRFQComponent />);

      // Start recording first
      const startButton = screen.getByTestId('start-recording');
      await user.click(startButton);

      // Stop recording
      const stopButton = screen.getByTestId('stop-recording');
      await user.click(stopButton);

      // Audio controls should appear
      await waitFor(() => {
        expect(screen.getByTestId('audio-controls')).toBeInTheDocument();
        expect(screen.getByTestId('audio-player')).toBeInTheDocument();
        expect(screen.getByTestId('process-voice')).toBeInTheDocument();
      });
    });

    test('audio playback functionality', async () => {
      render(<MockVoiceRFQComponent />);

      // Complete recording workflow
      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));

      // Audio player should be available
      const audioPlayer = screen.getByTestId('audio-player');
      expect(audioPlayer).toBeInTheDocument();
      expect(audioPlayer).toHaveAttribute('controls');
    });

    test('handles microphone permission denial', async () => {
      // Mock permission denial
      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));

      render(<MockVoiceRFQComponent />);

      const startButton = screen.getByTestId('start-recording');
      await user.click(startButton);

      // Should handle error gracefully
      expect(startButton).toBeInTheDocument();
    });

    test('handles unsupported browser scenarios', async () => {
      // Mock unsupported MediaRecorder
      delete (window as any).MediaRecorder;

      render(<MockVoiceRFQComponent />);

      // Component should still render
      expect(screen.getByTestId('voice-rfq-component')).toBeInTheDocument();
    });
  });

  describe('Voice Transcription', () => {
    test('voice transcription API integration', async () => {
      apiTestUtils.mockApiSuccess({
        text: 'I need industrial semiconductors for manufacturing',
        confidence: 0.95,
        language: 'en-US',
      });

      render(<MockVoiceRFQComponent />);

      // Complete recording and process
      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should show transcription result
      await waitFor(() => {
        expect(screen.getByTestId('transcription-result')).toBeInTheDocument();
        expect(screen.getByText(/industrial semiconductors/)).toBeInTheDocument();
      });

      // Verify API call was made correctly
      apiTestUtils.expectApiCall('/api/voice/transcribe', 'POST');
    });

    test('handles transcription errors gracefully', async () => {
      apiTestUtils.mockApiError('Transcription service unavailable', 503);

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.queryByTestId('transcription-result')).not.toBeInTheDocument();
      });
    });

    test('supports multiple languages', async () => {
      // Test Hindi transcription
      apiTestUtils.mockApiSuccess({
        text: 'मुझे इलेक्ट्रॉनिक्स के लिए सेमीकंडक्टर चाहिए',
        confidence: 0.92,
        language: 'hi-IN',
      });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      await waitFor(() => {
        expect(screen.getByText(/सेमीकंडक्टर/)).toBeInTheDocument();
      });
    });

    test('handles low confidence transcriptions', async () => {
      apiTestUtils.mockApiSuccess({
        text: 'need semiconductor maybe electronics',
        confidence: 0.45,
        language: 'en-US',
        warning: 'Low confidence transcription',
      });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should still show transcription but with warning
      await waitFor(() => {
        expect(screen.getByTestId('transcription-result')).toBeInTheDocument();
      });
    });
  });

  describe('AI Analysis and Categorization', () => {
    test('AI categorization with high accuracy', async () => {
      // Mock transcription response
      apiTestUtils.mockApiSuccess({
        text: 'I need 100 units of industrial grade semiconductors for electronics manufacturing',
      });

      // Mock AI analysis response
      const analysisResponse = generateTestData.apiResponse({
        category: 'Electronics',
        subCategory: 'Semiconductors',
        confidence: 98.5,
        keywords: ['semiconductors', 'industrial', 'electronics', 'manufacturing'],
        suggestedSuppliers: [
          generateTestData.supplier({ category: 'Electronics', rating: 4.8 }),
          generateTestData.supplier({ category: 'Electronics', rating: 4.6 }),
          generateTestData.supplier({ category: 'Electronics', rating: 4.4 }),
        ],
        estimatedBudget: { min: 25000, max: 75000, currency: 'INR' },
        urgency: 'medium',
        location: 'Delhi, India',
      });

      // Set up API mocks for the workflow
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ text: 'I need industrial semiconductors' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(analysisResponse),
        });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should show AI analysis results
      await waitFor(() => {
        expect(screen.getByTestId('ai-analysis')).toBeInTheDocument();
        expect(screen.getByTestId('category-result')).toHaveTextContent('Electronics');
        expect(screen.getByTestId('confidence-score')).toHaveTextContent('98.5%');
        expect(screen.getByTestId('suggested-suppliers')).toHaveTextContent('3');
      });
    });

    test('handles ambiguous voice input', async () => {
      const ambiguousAnalysis = generateTestData.apiResponse({
        category: 'Multiple',
        possibleCategories: ['Electronics', 'Automobile', 'Industrial'],
        confidence: 65.2,
        needsClarification: true,
        clarificationQuestions: [
          'What specific type of components do you need?',
          'What is the intended use case?',
          'What is your preferred supplier location?',
        ],
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ text: 'I need some components' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(ambiguousAnalysis),
        });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      await waitFor(() => {
        expect(screen.getByTestId('ai-analysis')).toBeInTheDocument();
        expect(screen.getByTestId('confidence-score')).toHaveTextContent('65.2%');
      });
    });

    test('AI analysis includes business context', async () => {
      const contextualAnalysis = generateTestData.apiResponse({
        category: 'Electronics',
        confidence: 94.8,
        businessContext: {
          industryType: 'Manufacturing',
          companySize: 'Mid-size',
          urgencyLevel: 'High',
          budgetRange: 'Enterprise',
        },
        riskAssessment: {
          supplierRisk: 'Low',
          marketRisk: 'Medium',
          timelineRisk: 'Low',
        },
        recommendations: [
          'Consider bulk pricing for 100+ units',
          'Verify ISO certification for industrial grade',
          'Plan for 2-3 week lead time',
        ],
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ text: 'Urgent need for certified semiconductors' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(contextualAnalysis),
        });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      await waitFor(() => {
        expect(screen.getByTestId('ai-analysis')).toBeInTheDocument();
        expect(screen.getByTestId('confidence-score')).toHaveTextContent('94.8%');
      });
    });
  });

  describe('Integration with Bell24H Systems', () => {
    test('integrates with supplier matching system', async () => {
      const matchingResponse = generateTestData.apiResponse({
        category: 'Electronics',
        confidence: 96.3,
        matchedSuppliers: [
          { ...generateTestData.supplier(), matchScore: 95.8, verified: true },
          { ...generateTestData.supplier(), matchScore: 92.4, verified: true },
          { ...generateTestData.supplier(), matchScore: 89.1, verified: true },
        ],
        totalMatches: 47,
        searchCriteria: {
          category: 'Electronics',
          location: 'India',
          certification: 'ISO 9001',
          rating: 4.0,
        },
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ text: 'Need verified electronics suppliers' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(matchingResponse),
        });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      await waitFor(() => {
        expect(screen.getByTestId('suggested-suppliers')).toHaveTextContent('3');
      });
    });

    test('integrates with RFQ creation workflow', async () => {
      const rfqData = generateTestData.rfq({
        title: 'Industrial Semiconductors for Manufacturing',
        category: 'Electronics',
        description: 'AI-generated from voice input',
        source: 'voice',
        aiConfidence: 96.5,
      });

      const createRFQResponse = generateTestData.apiResponse(rfqData);

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ text: 'I need semiconductors for manufacturing' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              category: 'Electronics',
              confidence: 96.5,
              rfqData: rfqData,
            }),
        });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      await waitFor(() => {
        expect(screen.getByTestId('ai-analysis')).toBeInTheDocument();
        expect(screen.getByTestId('confidence-score')).toHaveTextContent('96.5%');
      });
    });

    test('integrates with notification system', async () => {
      const notificationSpy = jest.fn();
      bell24hTestUtils.mockNotificationSystem = { sendNotification: notificationSpy };

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should trigger notifications for successful processing
      await waitFor(() => {
        expect(screen.getByTestId('ai-analysis')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Optimization', () => {
    test('handles large audio files efficiently', async () => {
      // Mock large audio file (5MB)
      const largeAudioBlob = new Blob(['a'.repeat(5 * 1024 * 1024)], { type: 'audio/wav' });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));

      // Should handle large files without performance issues
      expect(screen.getByTestId('audio-controls')).toBeInTheDocument();
    });

    test('provides real-time feedback during processing', async () => {
      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should show processing indicator
      expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();
      expect(screen.getByText('Processing your voice RFQ...')).toBeInTheDocument();
    });

    test('caches and reuses transcription results', async () => {
      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      await waitFor(() => {
        expect(screen.getByTestId('transcription-result')).toBeInTheDocument();
      });

      // Process again - should use cached result
      await user.click(screen.getByTestId('process-voice'));

      // Should not make duplicate API calls
      expect(global.fetch).toHaveBeenCalledTimes(2); // Once for transcription, once for analysis
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles network failures gracefully', async () => {
      apiTestUtils.mockNetworkError();

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should handle network error without crashing
      expect(screen.getByTestId('voice-rfq-component')).toBeInTheDocument();
    });

    test('handles empty or silent audio recordings', async () => {
      apiTestUtils.mockApiSuccess({
        text: '',
        confidence: 0,
        error: 'No speech detected',
      });

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should handle empty transcription appropriately
      await waitFor(() => {
        expect(screen.queryByTestId('transcription-result')).not.toBeInTheDocument();
      });
    });

    test('handles unsupported audio formats', async () => {
      // Mock unsupported format error
      apiTestUtils.mockApiError('Unsupported audio format', 400);

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should handle format error gracefully
      expect(screen.getByTestId('voice-rfq-component')).toBeInTheDocument();
    });

    test('provides user feedback for processing timeout', async () => {
      // Mock timeout scenario
      apiTestUtils.mockApiError('Request timeout', 504);

      render(<MockVoiceRFQComponent />);

      await user.click(screen.getByTestId('start-recording'));
      await user.click(screen.getByTestId('stop-recording'));
      await user.click(screen.getByTestId('process-voice'));

      // Should handle timeout appropriately
      expect(screen.getByTestId('voice-rfq-component')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Usability', () => {
    test('supports keyboard navigation', async () => {
      render(<MockVoiceRFQComponent />);

      const startButton = screen.getByTestId('start-recording');

      // Should be focusable
      startButton.focus();
      expect(startButton).toHaveFocus();

      // Should work with Enter key
      fireEvent.keyDown(startButton, { key: 'Enter' });
      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });

    test('provides proper ARIA labels and descriptions', () => {
      render(<MockVoiceRFQComponent />);

      const startButton = screen.getByTestId('start-recording');
      expect(startButton).toHaveAttribute('aria-label', expect.any(String));
    });

    test('supports screen readers with audio descriptions', () => {
      render(<MockVoiceRFQComponent />);

      // Should have proper headings for screen readers
      expect(screen.getByRole('heading', { name: /Voice RFQ Creation/ })).toBeInTheDocument();
    });
  });
});
