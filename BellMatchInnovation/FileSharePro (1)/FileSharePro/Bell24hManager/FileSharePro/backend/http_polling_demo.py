import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import logging
import json
from datetime import datetime
from typing import List, Dict, Any
from collections import deque
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="HTTP Polling API Demo",
    description="A simple message-passing API using HTTP polling instead of WebSockets",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Message queue (last 100 messages)
message_queue: deque = deque(maxlen=100)
client_counters: Dict[str, int] = {}

# Add some initial messages
message_queue.append({
    "id": 1,
    "type": "system",
    "text": "Server started",
    "timestamp": datetime.now().isoformat()
})

@app.get("/")
async def get_index_page():
    """Return the demo page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Bell24h Message Polling Demo</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                max-width: 800px; 
                margin: 0 auto; 
            }
            #status { 
                padding: 10px; 
                margin-bottom: 10px; 
                border-radius: 4px; 
            }
            .connected { 
                background-color: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
            }
            .disconnected { 
                background-color: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
            }
            #messages { 
                border: 1px solid #ddd; 
                padding: 10px; 
                height: 300px; 
                overflow-y: auto; 
                margin-bottom: 10px; 
            }
            .message { 
                padding: 5px; 
                margin-bottom: 5px;
                border-bottom: 1px solid #eee; 
            }
            .sent { 
                color: #004085; 
                background-color: #cce5ff; 
            }
            .received { 
                color: #155724; 
                background-color: #d4edda; 
            }
            .system { 
                color: #856404; 
                background-color: #fff3cd; 
            }
            .controls { 
                display: flex; 
                gap: 10px; 
                margin-top: 10px;
            }
            .settings {
                margin-top: 20px;
                padding: 10px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .settings label {
                margin-right: 10px;
                cursor: pointer;
            }
            button { 
                padding: 8px 16px; 
                cursor: pointer;
            }
            input { 
                padding: 8px; 
                flex-grow: 1;
            }
        </style>
    </head>
    <body>
        <h1>Bell24h Message Polling Demo</h1>
        
        <div id="status" class="disconnected">
            Disconnected
        </div>
        
        <div id="messages"></div>
        
        <div class="controls">
            <input type="text" id="messageInput" placeholder="Type a message...">
            <button id="sendBtn">Send</button>
            <button id="startBtn">Start Polling</button>
            <button id="stopBtn">Stop Polling</button>
        </div>
        
        <div class="settings">
            <label>
                <input type="checkbox" id="soundToggle" checked>
                Enable sound notifications
            </label>
            <button id="testSoundBtn">Test Sound</button>
        </div>
        
        <!-- Audio element for notification sound -->
        <audio id="notificationSound" preload="auto">
            <source src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMDA4ODg4ODg4ODg4ODg4ODg4ODg//////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAZJAAAAAAAAAbDWwcLnAP/jYMQAEvUixqJYGAhJS8vLy8vLzX4C13///////////////////+QhERERERERERERERERERERERER4REREf/jYMQAEqgBP3ONABARERERERERER42IhEREREREREREREREREREQHgIBAIBAIBAIBAIBAIBAIBAIBAIBAIBAIBAIBAIBAf/jYMQAEgwy6uZwAgIBAIBAIBAIBAMdxcWHwCAQCAQCAQCAgEeIhEQiIRCIhEQiERCIhEIiAQCAQCAQDHcQiERCIhEQiIRCIhEI" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        
        <script>
            // DOM Elements
            const statusDiv = document.getElementById('status');
            const messagesDiv = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            const startBtn = document.getElementById('startBtn');
            const stopBtn = document.getElementById('stopBtn');
            const soundToggle = document.getElementById('soundToggle');
            const testSoundBtn = document.getElementById('testSoundBtn');
            const notificationSound = document.getElementById('notificationSound');
            
            // State
            let clientId = `client-${Date.now()}`;
            let isPolling = false;
            let pollingInterval = null;
            let lastMessageId = 0;
            let soundEnabled = soundToggle.checked;
            
            // Functions
            function updateStatus(isConnected, message = '') {
                statusDiv.className = isConnected ? 'connected' : 'disconnected';
                statusDiv.textContent = isConnected ? 'Connected' : 'Disconnected';
                if (message) {
                    statusDiv.textContent += `: ${message}`;
                }
            }
            
            function addMessage(message, type) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${type}`;
                
                // Format based on message type
                let content = '';
                if (typeof message === 'object') {
                    if (message.type === 'system') {
                        content = `System: ${message.text}`;
                    } else if (message.type === 'message') {
                        content = `${message.sender || 'Unknown'}: ${message.text}`;
                    } else {
                        content = JSON.stringify(message, null, 2);
                    }
                } else {
                    content = message;
                }
                
                messageDiv.textContent = content;
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
            
            function startPolling() {
                if (isPolling) return;
                
                isPolling = true;
                updateStatus(true, 'Polling started');
                
                // Register client
                fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ client_id: clientId })
                })
                .then(response => response.json())
                .then(data => {
                    addMessage('Registered with server', 'system');
                    
                    // Start polling for messages
                    pollingInterval = setInterval(pollMessages, 1000);
                })
                .catch(error => {
                    console.error('Error registering:', error);
                    updateStatus(false, 'Registration failed');
                    isPolling = false;
                });
            }
            
            function stopPolling() {
                if (!isPolling) return;
                
                clearInterval(pollingInterval);
                isPolling = false;
                updateStatus(false, 'Polling stopped');
                
                // Unregister client
                fetch(`/api/unregister/${clientId}`, { method: 'POST' })
                    .then(() => addMessage('Unregistered from server', 'system'))
                    .catch(error => console.error('Error unregistering:', error));
            }
            
            // Play notification sound
            function playNotificationSound() {
                if (soundEnabled) {
                    // Reset sound to beginning (in case it's already playing)
                    notificationSound.pause();
                    notificationSound.currentTime = 0;
                    
                    // Play the sound
                    notificationSound.play().catch(error => {
                        console.error('Error playing sound:', error);
                    });
                }
            }
            
            function pollMessages() {
                fetch(`/api/messages/${clientId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.messages && data.messages.length > 0) {
                            // Check if there are any new messages (not from current user)
                            const newMessages = data.messages.filter(msg => 
                                msg.id > lastMessageId && 
                                (msg.type === 'message' && !msg.sender.includes(clientId))
                            );
                            
                            // Play sound if there are new messages from others
                            if (newMessages.length > 0) {
                                playNotificationSound();
                            }
                            
                            // Add all messages to the log
                            data.messages.forEach(msg => {
                                addMessage(msg, msg.type || 'received');
                                if (msg.id > lastMessageId) {
                                    lastMessageId = msg.id;
                                }
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error polling messages:', error);
                        updateStatus(false, 'Polling error');
                    });
            }
            
            function sendMessage() {
                const text = messageInput.value.trim();
                if (!text) return;
                
                if (!isPolling) {
                    addMessage('Not connected. Start polling first.', 'system');
                    return;
                }
                
                fetch('/api/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: clientId,
                        text: text,
                        type: 'message'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    addMessage({ 
                        text: text, 
                        sender: 'You',
                        type: 'message'
                    }, 'sent');
                    messageInput.value = '';
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    addMessage('Failed to send message', 'system');
                });
            }
            
            // Event Listeners
            startBtn.addEventListener('click', startPolling);
            stopBtn.addEventListener('click', stopPolling);
            sendBtn.addEventListener('click', sendMessage);
            
            // Sound notification toggle
            soundToggle.addEventListener('change', function() {
                soundEnabled = this.checked;
                addMessage(`Sound notifications ${soundEnabled ? 'enabled' : 'disabled'}`, 'system');
            });
            
            // Test sound button
            testSoundBtn.addEventListener('click', function() {
                if (soundEnabled) {
                    playNotificationSound();
                    addMessage('Testing notification sound...', 'system');
                } else {
                    addMessage('Sound notifications are disabled. Enable them first.', 'system');
                }
            });
            
            messageInput.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Auto-start polling
            window.addEventListener('load', startPolling);
            window.addEventListener('beforeunload', stopPolling);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/api/register")
async def register_client(data: Dict[str, str]):
    """Register a new client"""
    client_id = data.get("client_id")
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id is required")
    
    # Initialize client counter
    client_counters[client_id] = 0
    
    logger.info(f"Client registered: {client_id}")
    
    # Add system message
    message_queue.append({
        "id": len(message_queue) + 1,
        "type": "system",
        "text": f"Client {client_id} connected",
        "timestamp": datetime.now().isoformat()
    })
    
    return {"status": "registered", "client_id": client_id}

@app.post("/api/unregister/{client_id}")
async def unregister_client(client_id: str):
    """Unregister a client"""
    if client_id in client_counters:
        del client_counters[client_id]
        
        # Add system message
        message_queue.append({
            "id": len(message_queue) + 1,
            "type": "system",
            "text": f"Client {client_id} disconnected",
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info(f"Client unregistered: {client_id}")
        return {"status": "unregistered"}
    
    return {"status": "not_found"}

@app.get("/api/messages/{client_id}")
async def get_messages(client_id: str):
    """Get new messages for a client"""
    if client_id not in client_counters:
        # Auto-register if not found
        client_counters[client_id] = 0
    
    # Get client's counter
    counter = client_counters[client_id]
    
    # Find unread messages
    new_messages = list(message_queue)[counter:]
    
    # Update counter
    client_counters[client_id] = len(message_queue)
    
    return {"messages": new_messages, "count": len(new_messages)}

@app.post("/api/send")
async def send_message(data: Dict[str, Any]):
    """Send a message to all clients"""
    client_id = data.get("client_id")
    text = data.get("text")
    
    if not client_id or not text:
        raise HTTPException(status_code=400, detail="client_id and text are required")
    
    # Create and add message
    message = {
        "id": len(message_queue) + 1,
        "type": "message",
        "text": text,
        "sender": f"Client {client_id}",
        "timestamp": datetime.now().isoformat()
    }
    
    message_queue.append(message)
    logger.info(f"Message from {client_id}: {text}")
    
    return {"status": "sent", "message_id": message["id"]}

@app.get("/api/debug/messages")
async def debug_messages():
    """Get all messages (for debugging)"""
    return {"messages": list(message_queue), "count": len(message_queue)}

@app.get("/api/debug/clients")
async def debug_clients():
    """Get all clients (for debugging)"""
    return {"clients": client_counters, "count": len(client_counters)}

if __name__ == "__main__":
    print("Starting HTTP polling demo on port 5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)