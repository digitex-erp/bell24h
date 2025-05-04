from fastapi import FastAPI, WebSocket
import logging

logger = logging.getLogger(__name__)

class WebSocketServer:
    """
    WebSocket server implementation following development guidelines
    """
    
    def __init__(self, app: FastAPI, path: str = '/ws'):
        """
        Initialize the WebSocket server
        
        Args:
            app: FastAPI application instance
            path: Path for the WebSocket endpoint
        """
        self.app = app
        self.path = path
        self.clients = set()
        logger.info(f"WebSocket server initialized on path: {path}")
        
        # Set up the WebSocket handler
        @app.websocket(path)
        async def websocket_endpoint(websocket: WebSocket):
            await self.connect(websocket)
            try:
                while True:
                    data = await websocket.receive_json()
                    await self.message_handler(websocket, data)
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await self.disconnect(websocket)
    
    async def connect(self, websocket: WebSocket):
        """
        Handle new WebSocket connection
        
        Args:
            websocket: WebSocket connection
        """
        await websocket.accept()
        self.clients.add(websocket)
        logger.info(f"Client connected, total clients: {len(self.clients)}")
    
    async def disconnect(self, websocket: WebSocket):
        """
        Handle WebSocket disconnection
        
        Args:
            websocket: WebSocket connection
        """
        if websocket in self.clients:
            self.clients.remove(websocket)
        logger.info(f"Client disconnected, remaining clients: {len(self.clients)}")
    
    async def broadcast(self, message: dict):
        """
        Broadcast message to all connected clients
        
        Args:
            message: Message to broadcast
        """
        disconnected_clients = set()
        
        for client in self.clients:
            if client.application_state == WebSocket.CONNECTED:
                try:
                    await client.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to client: {e}")
                    disconnected_clients.add(client)
            else:
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            await self.disconnect(client)
    
    async def message_handler(self, websocket: WebSocket, data: dict):
        """
        Handle incoming WebSocket messages
        
        Args:
            websocket: WebSocket connection
            data: Message data
        """
        # Default implementation just echoes the message back
        await websocket.send_json({
            "type": "echo",
            "data": data
        })
