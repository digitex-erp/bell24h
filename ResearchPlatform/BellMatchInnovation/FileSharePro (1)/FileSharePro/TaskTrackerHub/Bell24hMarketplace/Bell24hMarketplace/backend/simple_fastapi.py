"""
A simple FastAPI WebSocket echo server for testing
"""

from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/")
async def get():
    html = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket Test</title>
            <script>
                var ws = null;
                
                function connect() {
                    ws = new WebSocket("ws://" + window.location.host + "/ws");
                    ws.onmessage = function(event) {
                        var messages = document.getElementById('messages');
                        var message = document.createElement('li');
                        message.textContent = event.data;
                        messages.appendChild(message);
                    };
                    document.getElementById('status').textContent = 'Connected';
                }
                
                function disconnect() {
                    if (ws) {
                        ws.close();
                        document.getElementById('status').textContent = 'Disconnected';
                    }
                }
                
                function send() {
                    var messageInput = document.getElementById('messageText');
                    var message = messageInput.value;
                    if (ws && message) {
                        ws.send(message);
                        messageInput.value = '';
                    }
                }
            </script>
        </head>
        <body>
            <h1>WebSocket Test</h1>
            <p>Status: <span id="status">Disconnected</span></p>
            <button onclick="connect()">Connect</button>
            <button onclick="disconnect()">Disconnect</button>
            <hr>
            <input type="text" id="messageText" placeholder="Enter message">
            <button onclick="send()">Send</button>
            <hr>
            <ul id="messages"></ul>
        </body>
    </html>
    """
    return HTMLResponse(html)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("Client connecting...")
    await websocket.accept()
    print("Client connected!")
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received: {data}")
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI WebSocket Server on port 5005")
    uvicorn.run(app, host="0.0.0.0", port=5005)