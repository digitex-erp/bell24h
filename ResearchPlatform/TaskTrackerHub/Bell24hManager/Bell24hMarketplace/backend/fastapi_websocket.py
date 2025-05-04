"""
FastAPI WebSocket Implementation for Bell24h

This module provides a WebSocket implementation using FastAPI, which is more standard
and potentially more compatible with various environments compared to the pure Python
WebSocket implementation.
"""

import json
import logging
import random
import threading
import time
from datetime import datetime
from typing import Dict, List, Set

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Bell24h FastAPI WebSocket Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
CONNECTED_CLIENTS: Set[WebSocket] = set()
RECENT_NOTIFICATIONS: List[Dict] = []
MAX_RECENT_NOTIFICATIONS = 100


class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        
    async def connect(self, websocket: WebSocket):
        """Connect a new client and send welcome message"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected: {websocket.client}")
        
        # Send welcome message
        await websocket.send_json({
            "type": "system",
            "message": "Connected to Bell24h WebSocket Server",
            "timestamp": datetime.now().isoformat()
        })
        
    def disconnect(self, websocket: WebSocket):
        """Disconnect a client"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected: {websocket.client}")
            
    async def broadcast(self, message: Dict):
        """Send a message to all connected clients"""
        if not self.active_connections:
            logger.warning("No connected clients to broadcast to")
            return
            
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to client: {e}")
                

# Create connection manager
manager = ConnectionManager()


@app.get("/")
async def get_index():
    """Return a simple HTML page with WebSocket client"""
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Bell24h WebSocket Test</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                #messages { border: 1px solid #ddd; padding: 10px; height: 300px; overflow-y: auto; margin-bottom: 10px; }
                button { background-color: #4CAF50; color: white; border: none; padding: 10px 15px; margin: 5px; cursor: pointer; }
                input { padding: 8px; width: 300px; }
                .status { margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <h1>Bell24h WebSocket Test</h1>
            <div class="status">Status: <span id="status">Disconnected</span></div>
            
            <div>
                <button id="connect">Connect</button>
                <button id="disconnect" disabled>Disconnect</button>
                <button id="test-notification">Send Test Notification</button>
            </div>
            
            <div id="messages"></div>
            
            <div>
                <input type="text" id="message" placeholder="Type a message...">
                <button id="send" disabled>Send</button>
            </div>
            
            <script>
                const statusEl = document.getElementById('status');
                const messagesEl = document.getElementById('messages');
                const messageEl = document.getElementById('message');
                const connectBtn = document.getElementById('connect');
                const disconnectBtn = document.getElementById('disconnect');
                const sendBtn = document.getElementById('send');
                const testBtn = document.getElementById('test-notification');
                
                let socket = null;
                
                function addMessage(message) {
                    const div = document.createElement('div');
                    div.textContent = message;
                    messagesEl.appendChild(div);
                    messagesEl.scrollTop = messagesEl.scrollHeight;
                }
                
                connectBtn.addEventListener('click', () => {
                    try {
                        // Create WebSocket connection - dynamically determine URL
                        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                        const wsUrl = `${protocol}//${window.location.host}/ws`;
                        socket = new WebSocket(wsUrl);
                        
                        statusEl.textContent = 'Connecting...';
                        
                        socket.onopen = () => {
                            statusEl.textContent = 'Connected';
                            connectBtn.disabled = true;
                            disconnectBtn.disabled = false;
                            sendBtn.disabled = false;
                            addMessage('Connected to WebSocket server');
                        };
                        
                        socket.onmessage = (event) => {
                            let data = event.data;
                            try {
                                // Try to parse as JSON
                                const jsonData = JSON.parse(data);
                                data = JSON.stringify(jsonData, null, 2);
                            } catch {
                                // If not JSON, use as is
                            }
                            addMessage(`Received: ${data}`);
                        };
                        
                        socket.onclose = () => {
                            statusEl.textContent = 'Disconnected';
                            connectBtn.disabled = false;
                            disconnectBtn.disabled = true;
                            sendBtn.disabled = true;
                            addMessage('Connection closed');
                            socket = null;
                        };
                        
                        socket.onerror = (error) => {
                            addMessage(`Error: ${error}`);
                        };
                    } catch (error) {
                        addMessage(`Error: ${error.message}`);
                    }
                });
                
                disconnectBtn.addEventListener('click', () => {
                    if (socket) {
                        socket.close();
                    }
                });
                
                sendBtn.addEventListener('click', () => {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        const message = messageEl.value;
                        if (message) {
                            socket.send(message);
                            addMessage(`Sent: ${message}`);
                            messageEl.value = '';
                        }
                    }
                });
                
                testBtn.addEventListener('click', () => {
                    fetch('/api/test-notification')
                        .then(response => response.json())
                        .then(data => {
                            addMessage(`Created test notification: ${JSON.stringify(data)}`);
                        })
                        .catch(error => {
                            addMessage(`Error creating notification: ${error}`);
                        });
                });
                
                messageEl.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        sendBtn.click();
                    }
                });
            </script>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.get("/api/test-notification")
async def create_test_notification():
    """Create a test notification and broadcast it to all WebSocket clients"""
    global RECENT_NOTIFICATIONS
    
    notification_types = [
        "New RFQ Posted", 
        "Bid Status Updated", 
        "Payment Processed", 
        "New Message Received",
        "Order Status Changed",
        "New Request for Quote",
        "Delivery Update",
        "Supplier Verification Completed"
    ]
    
    notification = {
        "type": "notification",
        "id": str(random.randint(1000000, 9999999)),
        "title": random.choice(notification_types),
        "message": f"Test notification created at {datetime.now().strftime('%H:%M:%S')}",
        "timestamp": datetime.now().isoformat()
    }
    
    # Add to recent notifications
    RECENT_NOTIFICATIONS.insert(0, notification)
    if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
        RECENT_NOTIFICATIONS = RECENT_NOTIFICATIONS[:MAX_RECENT_NOTIFICATIONS]
    
    # Broadcast to all clients
    await manager.broadcast(notification)
    
    logger.info(f"Created test notification: {notification['title']}")
    
    return notification


@app.get("/api/notifications")
async def get_notifications():
    """Get recent notifications (for HTTP polling fallback)"""
    return {
        "notifications": RECENT_NOTIFICATIONS,
        "count": len(RECENT_NOTIFICATIONS)
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket connections"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            
            logger.info(f"Received message: {data}")
            
            # Echo the message back
            response = {
                "type": "echo",
                "message": data,
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
        manager.disconnect(websocket)


class NotificationGenerator(threading.Thread):
    """Background thread that generates notifications periodically"""
    
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.running = True
        
    def run(self):
        """Generate random notifications at random intervals"""
        logger.info("Started notification generator")
        
        while self.running:
            try:
                # Sleep for a random interval (5-15 seconds)
                sleep_time = random.randint(5, 15)
                time.sleep(sleep_time)
                
                # Generate and broadcast a notification
                self._generate_notification()
                
            except Exception as e:
                logger.error(f"Error in notification generator: {e}")
                
    async def _generate_notification(self):
        """Generate a random notification and broadcast it"""
        global RECENT_NOTIFICATIONS
        
        notification_types = [
            "New RFQ Posted", 
            "Bid Status Updated", 
            "Payment Processed", 
            "New Message Received",
            "Order Status Changed",
            "New Request for Quote",
            "Delivery Update",
            "Supplier Verification Completed"
        ]
        
        notification = {
            "type": "notification",
            "id": str(random.randint(1000000, 9999999)),
            "title": random.choice(notification_types),
            "message": f"Auto-generated notification at {datetime.now().strftime('%H:%M:%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to recent notifications
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS = RECENT_NOTIFICATIONS[:MAX_RECENT_NOTIFICATIONS]
        
        # Broadcast to all clients
        await manager.broadcast(notification)
        
        logger.info(f"Generated notification: {notification['title']}")
        
    def stop(self):
        """Stop the notification generator"""
        self.running = False


@app.on_event("startup")
async def startup_event():
    """Start background tasks when the app starts"""
    # We'll initialize the notification generator here
    # but since it requires an async context, we're not starting it directly
    pass


def run_fastapi_server(host="0.0.0.0", port=5005):
    """Run the FastAPI WebSocket server"""
    logger.info(f"Starting FastAPI WebSocket server on {host}:{port}")
    # Add a log message that the workflow detection can see
    print(f"Uvicorn running on http://{host}:{port}")
    # Run the server with log_level=info to provide more visibility
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    run_fastapi_server()