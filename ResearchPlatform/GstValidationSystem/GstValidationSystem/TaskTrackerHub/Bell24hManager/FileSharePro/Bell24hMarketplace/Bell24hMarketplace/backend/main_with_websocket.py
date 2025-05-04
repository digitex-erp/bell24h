import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Bell24h API",
    description="API for Bell24h.com - AI-Powered RFQ Marketplace",
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

# Store active connections
clients = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket connection request received")
    
    # Accept the connection
    try:
        await websocket.accept()
        logger.info("WebSocket connection accepted")
        
        # Add to active clients
        clients.add(websocket)
        logger.info(f"Client connected, total clients: {len(clients)}")
        
        # Send a welcome message
        await websocket.send_json({
            "type": "welcome",
            "message": "Connected to Bell24h WebSocket server",
            "timestamp": datetime.now().isoformat()
        })
        
        # Main message loop
        while True:
            # Wait for messages
            try:
                data = await websocket.receive_json()
                logger.info(f"Received message: {data}")
                
                # Echo the message back to the client
                await websocket.send_json({
                    "type": "echo",
                    "data": data,
                    "timestamp": datetime.now().isoformat()
                })
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON")
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON received",
                    "timestamp": datetime.now().isoformat()
                })
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        if websocket in clients:
            clients.remove(websocket)
        logger.info(f"Client disconnected, remaining clients: {len(clients)}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in clients:
            clients.remove(websocket)
        logger.info(f"Client removed due to error, remaining clients: {len(clients)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "Bell24h API", "websocket_clients": len(clients)}

@app.get("/api/test-websocket")
async def test_websocket():
    """Send a test message to all connected WebSocket clients"""
    if not clients:
        return {"status": "no_clients", "message": "No WebSocket clients connected"}
    
    # Broadcast a message to all clients
    disconnected = set()
    for client in clients:
        try:
            await client.send_json({
                "type": "broadcast",
                "message": "Test broadcast message from server",
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Error sending to client: {e}")
            disconnected.add(client)
    
    # Remove disconnected clients
    for client in disconnected:
        clients.remove(client)
    
    return {
        "status": "sent",
        "clients": len(clients),
        "message": "Test message sent to all connected clients"
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Bell24h API",
        "version": "1.0.0",
        "documentation": "/docs",
        "websocket": "/ws",
        "websocket_test": "/websocket-test"
    }

@app.get("/websocket-test", response_class=HTMLResponse)
async def get_websocket_test():
    """Simple WebSocket test page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Bell24h WebSocket Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; margin: 0 auto; }
            #status { padding: 10px; margin-bottom: 10px; border-radius: 4px; }
            .connected { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .disconnected { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            #messages { border: 1px solid #ddd; padding: 10px; height: 300px; overflow-y: auto; }
            .sent { color: blue; }
            .received { color: green; }
            .controls { margin-top: 10px; display: flex; gap: 10px; }
            button { padding: 8px 16px; }
            input { padding: 8px; flex-grow: 1; }
        </style>
    </head>
    <body>
        <h1>Bell24h WebSocket Test</h1>
        <div id="status" class="disconnected">Disconnected</div>
        <div id="messages"></div>
        <div class="controls">
            <input id="messageInput" placeholder="Type a message...">
            <button id="sendBtn">Send</button>
            <button id="connectBtn">Connect</button>
            <button id="disconnectBtn">Disconnect</button>
        </div>
        
        <script>
            const statusDiv = document.getElementById('status');
            const messagesDiv = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');
            
            let socket = null;
            
            function addMessage(text, className) {
                const msg = document.createElement('div');
                msg.className = className;
                msg.textContent = text;
                messagesDiv.appendChild(msg);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
            
            function connect() {
                if (socket) {
                    addMessage("Already connected", "sent");
                    return;
                }
                
                // Use the current host with /ws path
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${window.location.host}/ws`;
                console.log(`Connecting to WebSocket at ${wsUrl}`);
                
                statusDiv.textContent = "Connecting...";
                statusDiv.className = "disconnected";
                
                socket = new WebSocket(wsUrl);
                
                socket.onopen = function() {
                    statusDiv.textContent = "Connected";
                    statusDiv.className = "connected";
                    addMessage("Connected to server", "received");
                };
                
                socket.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        addMessage(`Received: ${JSON.stringify(data, null, 2)}`, "received");
                    } catch (e) {
                        addMessage(`Received: ${event.data}`, "received");
                    }
                };
                
                socket.onclose = function() {
                    statusDiv.textContent = "Disconnected";
                    statusDiv.className = "disconnected";
                    addMessage("Disconnected from server", "received");
                    socket = null;
                };
                
                socket.onerror = function(error) {
                    statusDiv.textContent = "Error: " + error;
                    statusDiv.className = "disconnected";
                    addMessage(`Error: ${error}`, "received");
                };
            }
            
            function disconnect() {
                if (socket) {
                    socket.close();
                    socket = null;
                    statusDiv.textContent = "Disconnected";
                    statusDiv.className = "disconnected";
                    addMessage("Manually disconnected", "sent");
                }
            }
            
            function sendMessage() {
                const message = messageInput.value.trim();
                if (!message) return;
                
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const data = {
                        type: "message",
                        text: message,
                        timestamp: new Date().toISOString()
                    };
                    
                    socket.send(JSON.stringify(data));
                    addMessage(`Sent: ${JSON.stringify(data, null, 2)}`, "sent");
                    messageInput.value = "";
                } else {
                    addMessage("Not connected", "sent");
                }
            }
            
            // Event listeners
            connectBtn.addEventListener("click", connect);
            disconnectBtn.addEventListener("click", disconnect);
            sendBtn.addEventListener("click", sendMessage);
            
            messageInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter") sendMessage();
            });
            
            // Auto-connect when page loads
            window.addEventListener("load", connect);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    print("Starting Bell24h API with WebSockets on port 5000")
    # Run the application
    uvicorn.run(app, host="0.0.0.0", port=5000)
