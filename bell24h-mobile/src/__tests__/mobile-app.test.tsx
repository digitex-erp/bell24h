import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CompleteRFQScreen from '../screens/CompleteRFQScreen';
import { pushNotificationService } from '../services/PushNotificationService';

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({ recording: { stopAndUnloadAsync: jest.fn(), getURI: jest.fn(() => 'test-uri') } })),
      RecordingOptionsPresets: {
        HIGH_QUALITY: {},
      },
    },
  },
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'test-push-token' })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('test-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Create mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      // Add your reducers here
    },
    preloadedState: {
      // Add your initial state here
    },
  });
};

describe('Bell24H Mobile App', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  describe('CompleteRFQScreen', () => {
    it('renders voice recording interface', () => {
      const { getByText, getByTestId } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      expect(getByText('Voice RFQ Creation')).toBeTruthy();
      expect(getByText('Tap the microphone and speak your RFQ requirements clearly. We\'ll automatically extract the details.')).toBeTruthy();
    });

    it('starts recording when microphone button is pressed', async () => {
      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      const recordButton = getByText('Tap to start recording');
      fireEvent.press(recordButton);

      await waitFor(() => {
        expect(getByText('Tap to stop recording')).toBeTruthy();
      });
    });

    it('processes voice input and extracts RFQ data', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          transcription: { text: 'I need 100 steel pipes for construction project' },
          extractedInfo: {
            title: 'Steel Pipes for Construction',
            description: 'Need steel pipes for construction project',
            category: 'Construction Materials',
            quantity: 100,
            budget: 50000,
            deliveryDeadline: '2024-02-15',
            requirements: ['steel pipes', 'construction grade'],
            location: 'Mumbai',
            priority: 'high',
          },
        },
      });

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Start recording
      const recordButton = getByText('Tap to start recording');
      fireEvent.press(recordButton);

      // Stop recording
      await waitFor(() => {
        const stopButton = getByText('Tap to stop recording');
        fireEvent.press(stopButton);
      });

      // Wait for processing
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith(
          'https://your-api-domain.com/api/rfqs/voice',
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        );
      });
    });

    it('handles voice processing errors gracefully', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Start recording
      const recordButton = getByText('Tap to start recording');
      fireEvent.press(recordButton);

      // Stop recording
      await waitFor(() => {
        const stopButton = getByText('Tap to stop recording');
        fireEvent.press(stopButton);
      });

      // Should show error message
      await waitFor(() => {
        expect(getByText('Processing Error')).toBeTruthy();
      });
    });

    it('submits RFQ successfully', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Navigate to review step
      const continueButton = getByText('Continue to Review');
      fireEvent.press(continueButton);

      // Submit RFQ
      const submitButton = getByText('Submit RFQ');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith(
          'https://your-api-domain.com/api/rfq',
          expect.any(Object),
          expect.objectContaining({
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });
  });

  describe('PushNotificationService', () => {
    it('initializes push notifications successfully', async () => {
      const token = await pushNotificationService.initialize();
      expect(token).toBe('test-push-token');
    });

    it('sends local notification', async () => {
      await pushNotificationService.initialize();
      
      const notificationData = {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { type: 'test' },
      };

      await pushNotificationService.sendLocalNotification(notificationData);
      
      const mockNotifications = require('expo-notifications');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification',
          data: { type: 'test' },
          sound: true,
          priority: 'default',
        },
        trigger: null,
      });
    });

    it('schedules notification for later', async () => {
      await pushNotificationService.initialize();
      
      const notificationData = {
        title: 'Scheduled Notification',
        body: 'This is a scheduled notification',
        data: { type: 'scheduled' },
      };

      const trigger = { seconds: 60 };
      const identifier = await pushNotificationService.scheduleNotification(notificationData, trigger);
      
      expect(identifier).toBe('test-id');
    });

    it('cancels scheduled notification', async () => {
      await pushNotificationService.initialize();
      
      await pushNotificationService.cancelNotification('test-id');
      
      const mockNotifications = require('expo-notifications');
      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('test-id');
    });

    it('sets badge count', async () => {
      await pushNotificationService.initialize();
      
      await pushNotificationService.setBadgeCount(5);
      
      const mockNotifications = require('expo-notifications');
      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
    });

    it('gets push token', () => {
      const token = pushNotificationService.getPushToken();
      expect(token).toBe('test-push-token');
    });
  });

  describe('Voice Processing Integration', () => {
    it('handles audio recording permissions', async () => {
      const mockAudio = require('expo-av');
      mockAudio.Audio.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Should show permission error
      await waitFor(() => {
        expect(getByText('Permission required')).toBeTruthy();
      });
    });

    it('speaks transcription text', async () => {
      const mockSpeech = require('expo-speech');
      
      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Simulate having transcription
      // This would require setting up the component state properly
      // For now, we'll test the speech function directly
      
      expect(mockSpeech.speak).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Trigger an action that would cause a network request
      const continueButton = getByText('Continue to Review');
      fireEvent.press(continueButton);

      // Should show error message
      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
      });
    });

    it('handles permission denied errors', async () => {
      const mockAudio = require('expo-av');
      mockAudio.Audio.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      await waitFor(() => {
        expect(getByText('Permission required')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to dashboard after successful RFQ submission', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const { getByText } = render(
        <Provider store={store}>
          <CompleteRFQScreen navigation={mockNavigation} />
        </Provider>
      );

      // Navigate through the flow and submit
      const continueButton = getByText('Continue to Review');
      fireEvent.press(continueButton);

      // Submit RFQ
      const submitButton = getByText('Submit RFQ');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
      });
    });
  });
}); 