import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, TextInput, Chip } from 'react-native-paper';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store/store';
import { submitVoiceRFQ, createRFQ, clearVoiceResult } from '../store/slices/rfqSlice';
import VoiceRecorder from '../components/VoiceRecorder';

const VoiceRFQScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { voiceResult, loading, error } = useSelector((state: RootState) => state.rfq);
  const { user } = useSelector((state: RootState) => state.user);

  const [isRecording, setIsRecording] = useState(false);
  const [rfqData, setRfqData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    requirements: [] as string[],
  });

  useEffect(() => {
    if (voiceResult) {
      const { extractedInfo } = voiceResult;
      setRfqData({
        title: extractedInfo.title || '',
        description: extractedInfo.description || '',
        category: extractedInfo.category || '',
        budget: extractedInfo.budget?.toString() || '',
        requirements: extractedInfo.requirements || [],
      });
    }
  }, [voiceResult]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleRecordingComplete = async (audioBase64: string) => {
    dispatch(submitVoiceRFQ({ audioBase64, languagePreference: 'en' }));
  };

  const handleSubmitRFQ = async () => {
    if (!rfqData.title || !rfqData.description || !rfqData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const rfqPayload = {
      title: rfqData.title,
      description: rfqData.description,
      category: rfqData.category,
      budget: rfqData.budget ? parseInt(rfqData.budget) : undefined,
      requirements: rfqData.requirements,
    };

    try {
      await dispatch(createRFQ(rfqPayload)).unwrap();
      Alert.alert('Success', 'RFQ created successfully!');
      setRfqData({
        title: '',
        description: '',
        category: '',
        budget: '',
        requirements: [],
      });
      dispatch(clearVoiceResult());
    } catch (error) {
      Alert.alert('Error', 'Failed to create RFQ');
    }
  };

  const addRequirement = () => {
    if (rfqData.requirements.length < 5) {
      setRfqData(prev => ({
        ...prev,
        requirements: [...prev.requirements, ''],
      }));
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...rfqData.requirements];
    newRequirements[index] = value;
    setRfqData(prev => ({
      ...prev,
      requirements: newRequirements,
    }));
  };

  const removeRequirement = (index: number) => {
    setRfqData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="mic" size={32} color="#2563eb" />
        <Text style={styles.title}>Voice RFQ Submission</Text>
        <Text style={styles.subtitle}>Record your requirements and let AI extract the details</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Step 1: Record Your RFQ</Text>
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Processing your voice...</Text>
            </View>
          )}

          {voiceResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Transcription:</Text>
              <Text style={styles.transcription}>{voiceResult.text}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Step 2: Review & Edit Details</Text>
          
          <TextInput
            label="Title *"
            value={rfqData.title}
            onChangeText={(text) => setRfqData(prev => ({ ...prev, title: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Description *"
            value={rfqData.description}
            onChangeText={(text) => setRfqData(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Category *"
            value={rfqData.category}
            onChangeText={(text) => setRfqData(prev => ({ ...prev, category: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Budget (₹)"
            value={rfqData.budget}
            onChangeText={(text) => setRfqData(prev => ({ ...prev, budget: text }))}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requirements:</Text>
            {rfqData.requirements.map((req, index) => (
              <View key={index} style={styles.requirementRow}>
                <TextInput
                  label={`Requirement ${index + 1}`}
                  value={req}
                  onChangeText={(text) => updateRequirement(index, text)}
                  style={styles.requirementInput}
                  mode="outlined"
                />
                <Button
                  mode="text"
                  onPress={() => removeRequirement(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="red" />
                </Button>
              </View>
            ))}
            {rfqData.requirements.length < 5 && (
              <Button
                mode="outlined"
                onPress={addRequirement}
                style={styles.addButton}
              >
                Add Requirement
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleSubmitRFQ}
            style={styles.submitButton}
            loading={loading}
            disabled={loading || !rfqData.title || !rfqData.description || !rfqData.category}
          >
            Submit RFQ
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
  },
  transcription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  requirementsContainer: {
    marginTop: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default VoiceRFQScreen; 