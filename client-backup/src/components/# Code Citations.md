# Code Citations

## License: unknown
https://github.com/mpsc-io/branding/tree/91aeeb6f2f777c4144689ce9ca32fbd3909b58e0/user_guide/blog/2023-07-01-UCAAS-HTML5.md

```
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    ws.send(JSON.stringify({ status: 'success', message: 'RFQ submitted successfully' }));
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import WebSocket from 'ws';

const WebSocketDemo: React.FC = () => {
  const [rfqText, setRfqText] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket
    const socket = new WebSocket('ws://localhost:8080'); // Update with your server URL

    socket.onopen = () => {
      setConnectionStatus('Connected');
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, JSON.stringify(parsedMessage, null, 2)]);
      } catch (e) {
        setMessages((prev) => [...prev, event.data]);
      }
    };

    socket.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket closed');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleSubmit = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'rfq', content: rfqText }));
      setMessages((prev) => [...prev, `Sent: ${rfqText}`]);
      setRfqText('');
    } else {
      setMessages((prev) => [...prev, 'Error: WebSocket not connected']);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>|RFQ WebSocket Demo</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter RFQ details"
        value={rfqText}
        onChangeText={setRfqText}
      />
      <Button title="Submit RFQ" onPress={handleSubmit} />
      <Text style={styles.status}>Status: {connectionStatus}</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 },
  status: { marginTop: 20, color: 'green' },
  message: { marginBottom: 5, color: '#333' },
});

export default WebSocketDemo;
```

client/src/components/WebSocketDemo.tsx

import VoiceRFQ from './components/VoiceRFQ';
import WebSocketDemo from './components/WebSocketDemo';

export default function App() {
  return (
    <>
      <VoiceRFQ />
      <WebSocketDemo />
    </>
  );
}

