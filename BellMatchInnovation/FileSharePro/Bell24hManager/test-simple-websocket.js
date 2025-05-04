/**
 * Simple WebSocket Test for Bell24h
 * 
 * This script tests the basic WebSocket functionality with quick message exchange.
 */

const WebSocket = require('ws');

// Test quick message exchange
async function testSimpleWebSocketExchange() {
  console.log('Starting simple WebSocket test...');
  
  return new Promise((resolve, reject) => {
    // Connect to WebSocket server
    console.log('Connecting to WebSocket server...');
    const ws = new WebSocket('ws://localhost:3000/ws');
    
    // Set up connection timeout
    const connectionTimeout = setTimeout(() => {
      console.error('WebSocket connection timed out');
      ws.terminate();
      reject(new Error('Connection timeout'));
    }, 5000);
    
    // Set up response timeout
    let responseTimeout;
    
    ws.on('open', () => {
      console.log('Connected to WebSocket server');
      clearTimeout(connectionTimeout);
      
      // Send a simple message
      const message = {
        type: 'ping',
        data: { timestamp: Date.now() }
      };
      
      console.log('Sending message:', message);
      ws.send(JSON.stringify(message));
      
      // Set up response timeout
      responseTimeout = setTimeout(() => {
        console.error('No response received from server');
        ws.close();
        reject(new Error('Response timeout'));
      }, 3000);
    });
    
    ws.on('message', (data) => {
      clearTimeout(responseTimeout);
      
      try {
        const message = JSON.parse(data);
        console.log('Received response:', message);
        
        // Test voice command
        if (message.type === 'pong' || message.type === 'welcome') {
          console.log('Testing voice command...');
          
          const voiceMessage = {
            type: 'voice_command',
            data: {
              command: 'Hello, Bell24h!', 
              confidence: 0.95,
              timestamp: Date.now()
            }
          };
          
          console.log('Sending voice command:', voiceMessage);
          ws.send(JSON.stringify(voiceMessage));
          
          // Wait for voice response
          responseTimeout = setTimeout(() => {
            console.error('No voice response received from server');
            ws.close();
            reject(new Error('Voice response timeout'));
          }, 3000);
        } 
        // Check for voice command response
        else if (message.type === 'voice_command_response') {
          console.log('Voice command test successful!');
          console.log('Response:', message.data.response);
          
          // Close connection
          ws.close(1000, 'Test completed');
          resolve(true);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.close();
        reject(error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearTimeout(connectionTimeout);
      clearTimeout(responseTimeout);
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`WebSocket closed with code ${code} and reason: ${reason}`);
      // Only resolve if it hasn't been resolved/rejected yet
      if (responseTimeout) {
        clearTimeout(responseTimeout);
        resolve(false);
      }
    });
  });
}

// Run test
(async () => {
  try {
    console.log('WebSocket Test Starting...');
    const result = await testSimpleWebSocketExchange();
    console.log('WebSocket test completed successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('WebSocket test failed:', error.message);
    process.exit(1);
  }
})();