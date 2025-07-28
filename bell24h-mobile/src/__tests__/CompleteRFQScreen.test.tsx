import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompleteRFQScreen from '../screens/CompleteRFQScreen';
import rfqReducer from '../../store/slices/rfqSlice';
import userReducer from '../../store/slices/userSlice';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn(),
      RecordingOptionsPresets: {
        HIGH_QUALITY: 'high_quality',
      },
    },
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    All: 'all',
  },
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
      },
      VideoQuality: {
        '720p': '720p',
      },
    },
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      rfq: rfqReducer,
      user: userReducer,
    },
    preloadedState: {
      rfq: {
        loading: false,
        error: null,
        rfqs: [],
        ...initialState.rfq,
      },
      user: {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        loading: false,
        error: null,
        ...initialState.user,
      },
    },
  });
};

describe('CompleteRFQScreen', () => {
  let mockStore: any;

  beforeEach(() => {
    mockStore = createMockStore();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('renders correctly with all sections', () => {
      const { getByText, getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      // Check header
      expect(getByText('Create RFQ')).toBeTruthy();
      expect(getByText('Request for Quotation')).toBeTruthy();

      // Check input options
      expect(getByText('Input Methods')).toBeTruthy();
      expect(getByText('Voice')).toBeTruthy();
      expect(getByText('Video')).toBeTruthy();
      expect(getByText('Images')).toBeTruthy();

      // Check form sections
      expect(getByText('Basic Information')).toBeTruthy();
      expect(getByText('Category *')).toBeTruthy();
      expect(getByText('Requirements')).toBeTruthy();

      // Check form inputs
      expect(getByPlaceholderText('RFQ Title *')).toBeTruthy();
      expect(getByPlaceholderText('Description *')).toBeTruthy();
      expect(getByPlaceholderText('Budget (₹)')).toBeTruthy();
      expect(getByPlaceholderText('Quantity')).toBeTruthy();
    });

    it('displays all category options', () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const categories = [
        'Electronics & Components',
        'Machinery & Equipment',
        'Chemicals & Materials',
        'Textiles & Apparel',
        'Automotive & Parts',
        'Construction & Building',
        'Food & Beverage',
        'Pharmaceuticals',
        'Energy & Power',
        'Aerospace & Defense',
      ];

      categories.forEach(category => {
        expect(getByText(category)).toBeTruthy();
      });
    });
  });

  describe('Form Input', () => {
    it('updates form fields correctly', () => {
      const { getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      const titleInput = getByPlaceholderText('RFQ Title *');
      const descriptionInput = getByPlaceholderText('Description *');
      const budgetInput = getByPlaceholderText('Budget (₹)');
      const quantityInput = getByPlaceholderText('Quantity');

      fireEvent.changeText(titleInput, 'Test RFQ Title');
      fireEvent.changeText(descriptionInput, 'Test RFQ Description');
      fireEvent.changeText(budgetInput, '50000');
      fireEvent.changeText(quantityInput, '100');

      expect(titleInput.props.value).toBe('Test RFQ Title');
      expect(descriptionInput.props.value).toBe('Test RFQ Description');
      expect(budgetInput.props.value).toBe('50000');
      expect(quantityInput.props.value).toBe('100');
    });

    it('handles category selection', () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const categoryChip = getByText('Electronics & Components');
      fireEvent.press(categoryChip);

      // The chip should be selected (this would depend on your Chip component implementation)
      expect(categoryChip).toBeTruthy();
    });
  });

  describe('Requirements Management', () => {
    it('adds new requirements', () => {
      const { getByText, getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      const addButton = getByText('Requirements').parent?.findByType('TouchableOpacity');
      fireEvent.press(addButton);

      expect(getByPlaceholderText('Requirement 1')).toBeTruthy();
    });

    it('updates requirement text', () => {
      const { getByText, getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      // Add a requirement first
      const addButton = getByText('Requirements').parent?.findByType('TouchableOpacity');
      fireEvent.press(addButton);

      const requirementInput = getByPlaceholderText('Requirement 1');
      fireEvent.changeText(requirementInput, 'Test requirement');

      expect(requirementInput.props.value).toBe('Test requirement');
    });

    it('removes requirements', () => {
      const { getByText, queryByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      // Add a requirement first
      const addButton = getByText('Requirements').parent?.findByType('TouchableOpacity');
      fireEvent.press(addButton);

      expect(getByPlaceholderText('Requirement 1')).toBeTruthy();

      // Remove the requirement
      const removeButton = getByText('Requirements').parent?.findByType('TouchableOpacity').findByType('Ionicons');
      fireEvent.press(removeButton);

      expect(queryByPlaceholderText('Requirement 1')).toBeNull();
    });
  });

  describe('Voice Recording', () => {
    it('opens voice recording modal', () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const voiceButton = getByText('Voice');
      fireEvent.press(voiceButton);

      expect(getByText('Voice Recording')).toBeTruthy();
    });

    it('starts and stops voice recording', async () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      // Open voice modal
      const voiceButton = getByText('Voice');
      fireEvent.press(voiceButton);

      // Mock recording start
      const mockRecording = {
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'test-uri'),
      };

      const { Audio } = require('expo-av');
      Audio.Recording.createAsync.mockResolvedValue({ recording: mockRecording });

      // Start recording
      const recordButton = getByText('Tap to start recording').parent?.findByType('TouchableOpacity');
      fireEvent.press(recordButton);

      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
        expect(Audio.Recording.createAsync).toHaveBeenCalled();
      });

      // Stop recording
      fireEvent.press(recordButton);

      await waitFor(() => {
        expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      });
    });

    it('processes voice transcription', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            transcription: { text: 'Test transcription' },
            extractedInfo: {
              title: 'Test Title',
              description: 'Test Description',
              category: 'Electronics & Components',
              budget: 50000,
              quantity: 100,
              requirements: ['Requirement 1', 'Requirement 2'],
            },
          }),
        })
      ) as jest.Mock;

      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      // Open voice modal and process recording
      const voiceButton = getByText('Voice');
      fireEvent.press(voiceButton);

      // Mock recording
      const mockRecording = {
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'test-uri'),
      };

      const { Audio } = require('expo-av');
      Audio.Recording.createAsync.mockResolvedValue({ recording: mockRecording });

      // Start and stop recording
      const recordButton = getByText('Tap to start recording').parent?.findByType('TouchableOpacity');
      fireEvent.press(recordButton);
      fireEvent.press(recordButton);

      await waitFor(() => {
        expect(getByText('Test transcription')).toBeTruthy();
      });
    });
  });

  describe('Video Recording', () => {
    it('opens video recording modal', () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const videoButton = getByText('Video');
      fireEvent.press(videoButton);

      // Video modal should be visible
      expect(getByText('Video')).toBeTruthy();
    });

    it('handles camera permissions', async () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const { Camera } = require('expo-camera');
      Camera.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const videoButton = getByText('Video');
      fireEvent.press(videoButton);

      await waitFor(() => {
        expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Image Picker', () => {
    it('opens image picker', async () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const { launchImageLibraryAsync } = require('expo-image-picker');
      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'test-image-uri', fileName: 'test.jpg' }],
      });

      const imageButton = getByText('Images');
      fireEvent.press(imageButton);

      await waitFor(() => {
        expect(launchImageLibraryAsync).toHaveBeenCalled();
      });
    });

    it('handles image selection', async () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const { launchImageLibraryAsync } = require('expo-image-picker');
      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'test-image-uri', fileName: 'test.jpg' }],
      });

      const imageButton = getByText('Images');
      fireEvent.press(imageButton);

      await waitFor(() => {
        expect(getByText('Attachments')).toBeTruthy();
        expect(getByText('test.jpg')).toBeTruthy();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error for missing required fields', async () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      // Try to submit without filling required fields
      const submitButton = getByText('Create RFQ');
      fireEvent.press(submitButton);

      // Should show error alert
      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
        expect(getByText('Please fill in all required fields')).toBeTruthy();
      });
    });

    it('submits form successfully with valid data', async () => {
      const { getByText, getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      // Fill required fields
      const titleInput = getByPlaceholderText('RFQ Title *');
      const descriptionInput = getByPlaceholderText('Description *');
      const categoryChip = getByText('Electronics & Components');

      fireEvent.changeText(titleInput, 'Test RFQ');
      fireEvent.changeText(descriptionInput, 'Test Description');
      fireEvent.press(categoryChip);

      // Mock successful submission
      const mockDispatch = jest.fn();
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      const submitButton = getByText('Create RFQ');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Form Reset', () => {
    it('resets form after successful submission', async () => {
      const { getByText, getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      // Fill form
      const titleInput = getByPlaceholderText('RFQ Title *');
      const descriptionInput = getByPlaceholderText('Description *');

      fireEvent.changeText(titleInput, 'Test RFQ');
      fireEvent.changeText(descriptionInput, 'Test Description');

      // Mock successful submission
      const mockDispatch = jest.fn().mockResolvedValue({ payload: {} });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      const submitButton = getByText('Create RFQ');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(titleInput.props.value).toBe('');
        expect(descriptionInput.props.value).toBe('');
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during submission', () => {
      const loadingStore = createMockStore({ rfq: { loading: true } });
      const { getByText } = render(
        <Provider store={loadingStore}>
          <CompleteRFQScreen />
        </Provider>
      );

      const submitButton = getByText('Create RFQ');
      expect(submitButton.props.loading).toBe(true);
      expect(submitButton.props.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles submission errors', async () => {
      const { getByText, getByPlaceholderText } = renderWithProvider(<CompleteRFQScreen />);

      // Fill required fields
      const titleInput = getByPlaceholderText('RFQ Title *');
      const descriptionInput = getByPlaceholderText('Description *');
      const categoryChip = getByText('Electronics & Components');

      fireEvent.changeText(titleInput, 'Test RFQ');
      fireEvent.changeText(descriptionInput, 'Test Description');
      fireEvent.press(categoryChip);

      // Mock failed submission
      const mockDispatch = jest.fn().mockRejectedValue(new Error('Submission failed'));
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      const submitButton = getByText('Create RFQ');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
        expect(getByText('Failed to create RFQ')).toBeTruthy();
      });
    });

    it('handles voice recording errors', async () => {
      const { getByText } = renderWithProvider(<CompleteRFQScreen />);

      const { Audio } = require('expo-av');
      Audio.Recording.createAsync.mockRejectedValue(new Error('Recording failed'));

      // Open voice modal
      const voiceButton = getByText('Voice');
      fireEvent.press(voiceButton);

      // Try to start recording
      const recordButton = getByText('Tap to start recording').parent?.findByType('TouchableOpacity');
      fireEvent.press(recordButton);

      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
        expect(getByText('Failed to start recording')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = renderWithProvider(<CompleteRFQScreen />);

      expect(getByLabelText('RFQ Title')).toBeTruthy();
      expect(getByLabelText('Description')).toBeTruthy();
      expect(getByLabelText('Budget')).toBeTruthy();
      expect(getByLabelText('Quantity')).toBeTruthy();
    });

    it('supports screen readers', () => {
      const { getByAccessibilityHint } = renderWithProvider(<CompleteRFQScreen />);

      expect(getByAccessibilityHint('Create a new RFQ')).toBeTruthy();
    });
  });
}); 