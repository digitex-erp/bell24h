import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Added import
import Toast from 'react-native-toast-message';

const WS_URL = 'ws://localhost:8080';

const VoiceRFQ: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Add Arabic for Dubai launch and prepare for more languages
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN' | 'ar-AE'>('en-IN'); // Added state for language
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Uncomment and implement if using @react-native-voice/voice
    // Voice.onSpeechStart = () => setIsListening(true);
    // Voice.onSpeechEnd = () => setIsListening(false);
    // Voice.onSpeechResults = (event) => {
    //   const { results } = event;
    //   setTranscript(results[0][0].transcript);
    // };
    // Voice.onSpeechError = (err) => setError(err.error);
  }, []);

  const startListening = async () => {
    setIsLoading(true);
    try {
      // await Voice.start(language); // Use selected language (English, Hindi, Arabic)
      setTranscript('');
      setIsListening(true);
    } catch (e) {
      setError('Failed to start voice recognition');
      Toast.show({ type: 'error', text1: 'Voice recognition failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const stopListening = async () => {
    try {
      // await Voice.stop();
      setIsListening(false);
    } catch (e) {
      setError('Failed to stop voice recognition');
    }
  };

  const submitRFQ = async () => {
    if (!transcript) {
      setError('No transcription found');
      Toast.show({ type: 'error', text1: 'No transcription found' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, lang: language, type: 'rfq', content: 'Test RFQ' }), // Pass selected language and additional data
      });
      const data = await response.json();
      if (data.success) {
        Toast.show({ type: 'success', text1: 'RFQ submitted successfully!' });
        alert('RFQ submitted successfully!');
      } else {
        setError('RFQ submission failed');
        Toast.show({ type: 'error', text1: 'RFQ submission failed' });
      }
    } catch (e) {
      setError('RFQ submission failed');
      Toast.show({ type: 'error', text1: 'RFQ submission failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.header}>🎤 Voice-Based RFQ</Text>
      <Picker
        selectedValue={language}
        style={{ height: 50, width: 220, marginBottom: 10 }}
        onValueChange={(itemValue) => setLanguage(itemValue as 'en-IN' | 'hi-IN' | 'ar-AE')}
      >
        <Picker.Item label="English" value="en-IN" />
        <Picker.Item label="Hindi" value="hi-IN" />
        <Picker.Item label="Arabic" value="ar-AE" />
      </Picker>
      <Button title={isListening ? 'Stop' : 'Start Listening'} onPress={isListening ? stopListening : startListening} />
      <TextInput
        style={styles.input}
        placeholder="Or type RFQ manually"
        value={transcript}
        onChangeText={setTranscript}
      />
      <Button title="Submit RFQ" onPress={submitRFQ} />
      <FlatList
        data={[transcript]}
        renderItem={({ item }) => <Text style={styles.transcript}>{item}</Text>}
        keyExtractor={(_, idx) => idx.toString()}
      />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 },
  transcript: { marginBottom: 5, color: '#333' },
  error: { color: 'red', marginTop: 10 },
});

export default VoiceRFQ;

import sys
import whisper

if len(sys.argv) < 3:
    print("Usage: whisper_transcribe.py <audio_file_path> <language>", file=sys.stderr)
    sys.exit(1)

audio_path = sys.argv[1]
language = sys.argv[2]

model = whisper.load_model("base")
result = model.transcribe(audio_path, language=language)
print(result["text"])
