import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import logging
import json
from datetime import datetime
import asyncio
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Simple WebSocket Test",
    description="A minimal WebSocket server for testing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Store active WebSocket connections
active_connections = set()

# Store global list of recent notifications for all clients to poll
recent_notifications = []
MAX_RECENT_NOTIFICATIONS = 50

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.active_connections)}")
        return len(self.active_connections)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.active_connections)}")
        return len(self.active_connections)

    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to client: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.active_connections.remove(connection)

manager = ConnectionManager()

# Function to generate random notifications for polling clients
async def generate_random_notifications():
    """Generate random notifications at random intervals for polling clients to fetch"""
    import asyncio
    import random
    
    while True:
        # Wait for random time between 15-45 seconds
        await asyncio.sleep(random.randint(15, 45))
        
        # Generate a random notification
        notification_types = [
            {
                "type": "notification",
                "title": "New Request for Quote",
                "message": "A new RFQ matching your profile has been posted",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Bid Status Updated",
                "message": "Your bid status has changed to 'Under Review'",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "New Message",
                "message": "You have a new message from a potential buyer",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Payment Processed",
                "message": "Your payment of ₹32,450 has been processed",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        # Select a random notification
        notification = random.choice(notification_types)
        notification["id"] = str(random.randint(1000000, 9999999))
        
        # Add to recent notifications (limit size)
        recent_notifications.insert(0, notification)
        if len(recent_notifications) > MAX_RECENT_NOTIFICATIONS:
            recent_notifications.pop()
            
        logger.info(f"Generated new notification: {notification['title']}")
        
        # Also broadcast to WebSocket clients
        if manager.active_connections:
            await manager.broadcast(notification)
            logger.info(f"Broadcasted notification to {len(manager.active_connections)} WebSocket clients")

@app.get("/", response_class=HTMLResponse)
async def get_websocket_test():
    """Simple WebSocket test page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebSocket Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; margin: 0 auto; }
            #connection-status { 
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
            #message-log { 
                border: 1px solid #ddd; 
                padding: 10px; 
                height: 300px; 
                overflow-y: auto; 
                margin-bottom: 10px; 
            }
            .message { padding: 5px; border-bottom: 1px solid #eee; }
            .sent { color: blue; }
            .received { color: green; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <h1>WebSocket Test</h1>
        
        <div id="connection-status" class="disconnected">
            Disconnected
        </div>
        
        <div id="message-log"></div>
        
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <input type="text" id="message-input" style="flex-grow: 1; padding: 8px;" placeholder="Type a message...">
            <button id="send-btn" style="padding: 8px 16px;">Send</button>
            <button id="connect-btn" style="padding: 8px 16px;">Connect</button>
            <button id="disconnect-btn" style="padding: 8px 16px;">Disconnect</button>
        </div>
        
        <script>
            const statusElem = document.getElementById('connection-status');
            const logElem = document.getElementById('message-log');
            const messageInput = document.getElementById('message-input');
            const sendBtn = document.getElementById('send-btn');
            const connectBtn = document.getElementById('connect-btn');
            const disconnectBtn = document.getElementById('disconnect-btn');
            
            let socket = null;
            
            function log(message, type) {
                const elem = document.createElement('div');
                elem.classList.add('message', type);
                elem.textContent = message;
                logElem.appendChild(elem);
                logElem.scrollTop = logElem.scrollHeight;
            }
            
            function updateStatus(connected, message = null) {
                statusElem.className = connected ? 'connected' : 'disconnected';
                statusElem.textContent = connected ? 'Connected' : 'Disconnected';
                if (message) {
                    statusElem.textContent += ': ' + message;
                }
            }
            
            function connect() {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    log('Already connected', 'error');
                    return;
                }
                
                try {
                    // Direct WebSocket connection
                    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                    const wsUrl = `${protocol}//${window.location.host}/ws`;
                    
                    log(`Connecting to ${wsUrl}...`, 'sent');
                    socket = new WebSocket(wsUrl);
                    
                    socket.onopen = () => {
                        updateStatus(true);
                        log('Connection established', 'received');
                    };
                    
                    socket.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            log(`Received: ${JSON.stringify(data, null, 2)}`, 'received');
                        } catch (e) {
                            log(`Received: ${event.data}`, 'received');
                        }
                    };
                    
                    socket.onclose = () => {
                        updateStatus(false);
                        log('Connection closed', 'error');
                        socket = null;
                    };
                    
                    socket.onerror = (error) => {
                        updateStatus(false, 'Error occurred');
                        log(`Error: ${error.message || 'Unknown error'}`, 'error');
                    };
                } catch (err) {
                    updateStatus(false, 'Connection failed');
                    log(`Connection failed: ${err.message}`, 'error');
                }
            }
            
            function disconnect() {
                if (!socket) {
                    log('Not connected', 'error');
                    return;
                }
                
                socket.close();
                updateStatus(false, 'Manually disconnected');
                log('Disconnected', 'sent');
            }
            
            function sendMessage() {
                const message = messageInput.value.trim();
                if (!message) return;
                
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const data = {
                        type: 'message',
                        text: message,
                        timestamp: new Date().toISOString()
                    };
                    
                    socket.send(JSON.stringify(data));
                    log(`Sent: ${JSON.stringify(data, null, 2)}`, 'sent');
                    messageInput.value = '';
                } else {
                    log('Cannot send: not connected', 'error');
                }
            }
            
            // Event listeners
            sendBtn.addEventListener('click', sendMessage);
            connectBtn.addEventListener('click', connect);
            disconnectBtn.addEventListener('click', disconnect);
            
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            
            // Auto-connect when page loads
            window.addEventListener('load', connect);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# Store pending notifications per client
notifications_queue = {}

# Get all recent notifications
@app.get("/notifications/recent")
async def get_recent_notifications():
    """Get list of recent notifications"""
    return {
        "type": "notification_list",
        "notifications": recent_notifications,
        "timestamp": datetime.now().isoformat()
    }

# Create demo notification (for testing)
@app.get("/notifications/create-demo")
async def create_demo_notification():
    """Create a demo notification (for testing)"""
    import random
    
    notification_types = [
        {
            "type": "notification",
            "title": "New bid received",
            "message": "A supplier has placed a new bid on your RFQ",
            "timestamp": datetime.now().isoformat()
        },
        {
            "type": "notification",
            "title": "Price update",
            "message": "A supplier has updated their price on your active RFQ",
            "timestamp": datetime.now().isoformat()
        },
        {
            "type": "notification",
            "title": "RFQ deadline approaching",
            "message": "Your RFQ #2025-0151 is closing in 24 hours",
            "timestamp": datetime.now().isoformat()
        },
        {
            "type": "notification",
            "title": "New message",
            "message": "You have received a new message from Supplier XYZ",
            "timestamp": datetime.now().isoformat()
        }
    ]
    
    notification = random.choice(notification_types)
    notification["id"] = str(random.randint(1000000, 9999999))
    
    # Add to recent notifications
    recent_notifications.insert(0, notification)
    if len(recent_notifications) > MAX_RECENT_NOTIFICATIONS:
        recent_notifications.pop()
        
    logger.info(f"Created demo notification: {notification['title']}")
    
    # Broadcast to all WebSocket clients
    if manager.active_connections:
        await manager.broadcast(notification)
        logger.info(f"Broadcasted demo notification to {len(manager.active_connections)} WebSocket clients")
    
    return notification

# HTTP polling endpoint for notifications
@app.get("/notifications")
async def get_notifications():
    """Get new notifications (polling endpoint)"""
    import random
    
    # Generate a random client ID for this request
    client_id = f"poll-{random.randint(10000, 99999)}"
    
    # If we have recent notifications, return the most recent one
    if recent_notifications:
        notification = recent_notifications[0]
        return notification
    
    # 30% chance of generating a new notification if no recent ones exist
    if random.random() < 0.3:
        notification_types = [
            {
                "type": "notification",
                "title": "New RFQ posted",
                "message": "A new RFQ matching your profile has been posted",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Supplier verified",
                "message": "A new supplier in your category has been GST verified",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "System update",
                "message": "Bell24h platform has been updated with new features",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        notification = random.choice(notification_types)
        notification["id"] = str(random.randint(1000000, 9999999))
        
        # Also add this to recent notifications
        recent_notifications.insert(0, notification)
        if len(recent_notifications) > MAX_RECENT_NOTIFICATIONS:
            recent_notifications.pop()
            
        logger.info(f"Polling: Generated notification for client {client_id}: {notification['title']}")
        
        # Also broadcast to WebSocket clients
        if manager.active_connections:
            await manager.broadcast(notification)
            logger.info(f"Broadcasted polling notification to {len(manager.active_connections)} WebSocket clients")
        
        return notification
    else:
        # No new notifications
        return {"type": "no_notifications"}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket connections"""
    # Accept connection
    client_id = f"ws-{random.randint(10000, 99999)}"
    
    try:
        # Accept the connection
        await manager.connect(websocket)
        logger.info(f"WebSocket client {client_id} connected")
        
        # Send welcome message
        await websocket.send_json({
            "type": "system",
            "message": "Welcome to Bell24h WebSocket server",
            "timestamp": datetime.now().isoformat()
        })
        
        # Send the last 5 notifications (if any)
        if recent_notifications:
            await websocket.send_json({
                "type": "notification_history",
                "notifications": recent_notifications[:5],
                "timestamp": datetime.now().isoformat()
            })
        
        # Main loop - process incoming messages
        try:
            while True:
                # Wait for message from client
                data = await websocket.receive_text()
                
                try:
                    # Parse the JSON message
                    message = json.loads(data)
                    
                    # Handle message based on type
                    if message.get("type") == "message":
                        # Echo back to sender
                        await websocket.send_json({
                            "type": "message_echo",
                            "original": message,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        # If it contains a special command to create a notification
                        if "create_notification" in message.get("text", "").lower():
                            # Create a demo notification
                            notification = await create_demo_notification()
                            # This notification will also be broadcast to all clients by the broadcast in the create function
                            await websocket.send_json({
                                "type": "system",
                                "message": f"Created notification: {notification['title']}",
                                "timestamp": datetime.now().isoformat()
                            })
                    else:
                        # Unknown message type
                        await websocket.send_json({
                            "type": "error",
                            "message": "Unknown message type",
                            "timestamp": datetime.now().isoformat()
                        })
                except json.JSONDecodeError:
                    # Not a valid JSON
                    await websocket.send_json({
                        "type": "error",
                        "message": "Invalid JSON message",
                        "timestamp": datetime.now().isoformat()
                    })
        except WebSocketDisconnect:
            # Client disconnected
            manager.disconnect(websocket)
            logger.info(f"WebSocket client {client_id} disconnected")
    except Exception as e:
        # Something went wrong
        logger.error(f"WebSocket error: {e}")
        if websocket in manager.active_connections:
            manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    """Start background tasks when app starts"""
    import asyncio
    # Start background notification task
    asyncio.create_task(generate_random_notifications())
    logger.info("Started background notification task")

if __name__ == "__main__":
    print("Starting simple WebSocket server on port 5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)