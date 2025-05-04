// WebSocket client for Bell24h

document.addEventListener('DOMContentLoaded', function() {
  const messagesList = document.getElementById('messages-list');
  const statusElement = document.getElementById('ws-status');
  const connectButton = document.getElementById('connect-button');
  const disconnectButton = document.getElementById('disconnect-button');
  const sendButton = document.getElementById('send-button');
  const messageInput = document.getElementById('message-input');
  
  let ws = null;
  
  // Function to create a WebSocket connection
  function connect() {
    if (ws) {
      console.log('WebSocket already connected');
      return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = function() {
        console.log('WebSocket connected');
        updateStatus('Connected', 'success');
        enableDisconnectButton();
      };
      
      ws.onmessage = function(event) {
        console.log('Message received:', event.data);
        const message = JSON.parse(event.data);
        addMessageToList(message);
      };
      
      ws.onclose = function() {
        console.log('WebSocket disconnected');
        updateStatus('Disconnected', 'error');
        ws = null;
        enableConnectButton();
      };
      
      ws.onerror = function(error) {
        console.error('WebSocket error:', error);
        updateStatus('Error: ' + error, 'error');
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      updateStatus('Error: ' + error, 'error');
    }
  }
  
  // Function to disconnect WebSocket
  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
      updateStatus('Disconnected', 'warning');
      enableConnectButton();
    }
  }
  
  // Function to send a message
  function sendMessage() {
    if (!ws) {
      alert('Not connected to WebSocket');
      return;
    }
    
    const message = messageInput.value.trim();
    if (!message) {
      alert('Please enter a message');
      return;
    }
    
    try {
      ws.send(JSON.stringify({ type: 'message', text: message }));
      messageInput.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error);
    }
  }
  
  // Function to add message to the list
  function addMessageToList(message) {
    const item = document.createElement('li');
    item.className = 'message-item';
    
    const timestamp = new Date().toLocaleTimeString();
    const type = message.type || 'unknown';
    const data = message.data ? JSON.stringify(message.data, null, 2) : 'No data';
    
    item.innerHTML = `
      <div class="message-header">
        <span class="message-type">${type}</span>
        <span class="message-time">${timestamp}</span>
      </div>
      <pre class="message-data">${data}</pre>
    `;
    
    if (messagesList) {
      messagesList.prepend(item);
    }
  }
  
  // Function to update connection status
  function updateStatus(text, status) {
    if (statusElement) {
      statusElement.textContent = text;
      statusElement.className = `status status-${status}`;
    }
  }
  
  // Function to enable connect button
  function enableConnectButton() {
    if (connectButton && disconnectButton) {
      connectButton.disabled = false;
      disconnectButton.disabled = true;
      sendButton.disabled = true;
    }
  }
  
  // Function to enable disconnect button
  function enableDisconnectButton() {
    if (connectButton && disconnectButton) {
      connectButton.disabled = true;
      disconnectButton.disabled = false;
      sendButton.disabled = false;
    }
  }
  
  // Initialize
  if (connectButton) {
    connectButton.addEventListener('click', connect);
  }
  
  if (disconnectButton) {
    disconnectButton.addEventListener('click', disconnect);
  }
  
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }
  
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Auto-connect if on websocket-test page
  if (window.location.pathname.includes('websocket-test')) {
    setTimeout(connect, 1000);
  }
});