import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

const WebSocketDemo: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const socket = new WebSocket('ws://localhost:8080'); // Update with your server URL
      socket.onopen = () => {
        setMessages(prev => [...prev, '✅ Connected to WebSocket server']);
        setIsLoading(false);
      };
      socket.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data);
          setMessages(prev => [...prev, JSON.stringify(parsedMessage, null, 2)]);
        } catch (e) {
          setMessages(prev => [...prev, event.data]);
        }
      };
      socket.onclose = () => {
        setMessages(prev => [...prev, '❌ WebSocket disconnected']);
      };
      setWs(socket);
    } catch (e) {
      setError('WebSocket connection failed');
      Toast.show({ type: 'error', text1: 'WebSocket connection failed' });
      setIsLoading(false);
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'test', content: message }));
      setMessages(prev => [...prev, `📤 Sent: ${message}`]);
      setMessage('');
      Toast.show({ type: 'success', text1: 'Message sent!' });
    } else {
      setError('⚠️ WebSocket not connected');
      Toast.show({ type: 'error', text1: 'WebSocket not connected' });
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" />}
      {error && <Text style={styles.message}>{error}</Text>}
      <Text style={styles.header}>🧪 WebSocket Demo</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send Message" onPress={sendMessage} />
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 },
  message: { marginBottom: 5, color: '#333' },
});

export default WebSocketDemo;

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
