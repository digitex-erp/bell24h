import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Title, Paragraph, TextInput as PaperTextInput } from 'react-native-paper';
import axios from 'axios';

interface RFQData {
  title: string;
  description: string;
  category: string;
  quantity: number;
  budget: number;
  deliveryDeadline: string;
  requirements: string[];
  location: string;
  priority: 'high' | 'medium' | 'low';
}

export default function CompleteRFQScreen({ navigation }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [rfqData, setRfqData] = useState<RFQData | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [step, setStep] = useState<'voice' | 'review' | 'confirm'>('voice');

  // Form fields for manual input
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    deliveryDeadline: '',
    requirements: '',
    location: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    requestPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is required for voice RFQ.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setTranscription('');
      setRfqData(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      setIsProcessing(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);

      if (uri) {
        await processVoiceInput(uri);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      setIsProcessing(false);
    }
  };

  const processVoiceInput = async (uri: string) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'voice_rfq.m4a',
      } as any);
      formData.append('language', 'en');

      // Send to backend for processing
      const response = await axios.post(
        'https://your-api-domain.com/api/rfqs/voice',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const { transcription: trans, extractedInfo } = response.data;
        setTranscription(trans.text);
        setRfqData(extractedInfo);
        
        // Update form data with extracted information
        setFormData({
          title: extractedInfo.title || '',
          description: extractedInfo.description || '',
          category: extractedInfo.category || '',
          quantity: extractedInfo.quantity?.toString() || '',
          budget: extractedInfo.budget?.toString() || '',
          deliveryDeadline: extractedInfo.deliveryDeadline || '',
          requirements: extractedInfo.requirements?.join(', ') || '',
          location: extractedInfo.location || '',
          priority: extractedInfo.priority || 'medium',
        });

        setStep('review');
      } else {
        throw new Error(response.data.error || 'Failed to process voice input');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process voice input. Please try again or use manual input.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const speakTranscription = () => {
    if (transcription) {
      Speech.speak(transcription, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
      });
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);

      const rfqPayload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        budget: parseFloat(formData.budget) || 0,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
      };

      // Submit RFQ to backend
      const response = await axios.post(
        'https://your-api-domain.com/api/rfq',
        rfqPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Success',
          'RFQ submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      } else {
        throw new Error(response.data.error || 'Failed to submit RFQ');
      }
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      Alert.alert('Error', 'Failed to submit RFQ. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderVoiceStep = () => (
    <View style={styles.stepContainer}>
      <Title style={styles.stepTitle}>Voice RFQ Creation</Title>
      <Paragraph style={styles.stepDescription}>
        Tap the microphone and speak your RFQ requirements clearly. We'll automatically extract the details.
      </Paragraph>

      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : 'mic'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        
        <Text style={styles.recordText}>
          {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
        </Text>
      </View>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Processing your voice input...</Text>
        </View>
      )}

      {transcription && (
        <Card style={styles.transcriptionCard}>
          <Card.Content>
            <Title>Transcription</Title>
            <Paragraph>{transcription}</Paragraph>
            <Button
              mode="outlined"
              onPress={speakTranscription}
              style={styles.speakButton}
            >
              <MaterialIcons name="volume-up" size={20} />
              Speak
            </Button>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="outlined"
        onPress={() => setStep('review')}
        style={styles.manualButton}
        disabled={!transcription && !rfqData}
      >
        Continue to Review
      </Button>
    </View>
  );

  const renderReviewStep = () => (
    <ScrollView style={styles.stepContainer}>
      <Title style={styles.stepTitle}>Review RFQ Details</Title>
      <Paragraph style={styles.stepDescription}>
        Review and edit the extracted information before submitting.
      </Paragraph>

      <Card style={styles.formCard}>
        <Card.Content>
          <PaperTextInput
            label="RFQ Title"
            value={formData.title}
            onChangeText={(text) => handleFormChange('title', text)}
            style={styles.input}
          />

          <PaperTextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => handleFormChange('description', text)}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <PaperTextInput
            label="Category"
            value={formData.category}
            onChangeText={(text) => handleFormChange('category', text)}
            style={styles.input}
          />

          <PaperTextInput
            label="Quantity"
            value={formData.quantity}
            onChangeText={(text) => handleFormChange('quantity', text)}
            keyboardType="numeric"
            style={styles.input}
          />

          <PaperTextInput
            label="Budget (INR)"
            value={formData.budget}
            onChangeText={(text) => handleFormChange('budget', text)}
            keyboardType="numeric"
            style={styles.input}
          />

          <PaperTextInput
            label="Delivery Deadline"
            value={formData.deliveryDeadline}
            onChangeText={(text) => handleFormChange('deliveryDeadline', text)}
            style={styles.input}
          />

          <PaperTextInput
            label="Requirements (comma-separated)"
            value={formData.requirements}
            onChangeText={(text) => handleFormChange('requirements', text)}
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <PaperTextInput
            label="Location"
            value={formData.location}
            onChangeText={(text) => handleFormChange('location', text)}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => setStep('voice')}
          style={styles.button}
        >
          Back to Voice
        </Button>
        <Button
          mode="contained"
          onPress={() => setStep('confirm')}
          style={styles.button}
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <Title style={styles.stepTitle}>Confirm RFQ Submission</Title>
      <Paragraph style={styles.stepDescription}>
        Please review your RFQ details one final time before submitting.
      </Paragraph>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>RFQ Summary</Title>
          <Paragraph><strong>Title:</strong> {formData.title}</Paragraph>
          <Paragraph><strong>Category:</strong> {formData.category}</Paragraph>
          <Paragraph><strong>Quantity:</strong> {formData.quantity}</Paragraph>
          <Paragraph><strong>Budget:</strong> ₹{formData.budget}</Paragraph>
          <Paragraph><strong>Delivery:</strong> {formData.deliveryDeadline}</Paragraph>
          <Paragraph><strong>Location:</strong> {formData.location}</Paragraph>
          <Paragraph><strong>Priority:</strong> {formData.priority}</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => setStep('review')}
          style={styles.button}
        >
          Back to Edit
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.button}
        >
          Submit RFQ
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 'voice' && renderVoiceStep()}
      {step === 'review' && renderReviewStep()}
      {step === 'confirm' && renderConfirmStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  recordText: {
    fontSize: 16,
    color: '#666',
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  transcriptionCard: {
    marginVertical: 20,
  },
  speakButton: {
    marginTop: 10,
  },
  manualButton: {
    marginTop: 20,
  },
  formCard: {
    marginVertical: 20,
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  summaryCard: {
    marginVertical: 20,
  },
}); 