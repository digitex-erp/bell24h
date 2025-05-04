from fastapi import FastAPI, WebSocket
import logging
from fastapi.exceptions import WebSocketDisconnect
from typing import Dict, Set, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketServer:
    """
    WebSocket server implementation with reconnection handling and message queuing
    """
    
    def __init__(self, app: FastAPI, path: str = '/ws'):
        self.message_queue: Dict[str, List[Dict[str, Any]]] = {}
        self.max_queue_size = 100
        self.reconnect_timeout = 5  # seconds
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

        # Store active connections and performance metrics
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.supplier_performance_metrics: Dict[int, Dict[str, Any]] = {}

        # Set up the WebSocket handler
        @app.websocket(path)
        async def websocket_endpoint(websocket: WebSocket):
            await websocket.accept()
            client_id = websocket.client.host

            try:
                while True:
                    try:
                        data = await websocket.receive_text()
                        # Process message
                        await websocket.send_text(f"Message received: {data}")
                    except WebSocketDisconnect:
                        logger.info(f"Client {client_id} disconnected, attempting reconnection...")
                        try:
                            await websocket.accept()
                            logger.info(f"Client {client_id} reconnected successfully")
                        except Exception as e:
                            logger.error(f"Reconnection failed for client {client_id}: {str(e)}")
                            break
            except Exception as e:
                logger.error(f"Error in websocket connection: {str(e)}")
            finally:
                try:
                    await websocket.close()
                except:
                    pass

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

    async def queue_message(self, client_id: str, message: Dict[str, Any]):
        """Queue message for offline clients"""
        if client_id not in self.message_queue:
            self.message_queue[client_id] = []
        
        queue = self.message_queue[client_id]
        queue.append({
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Maintain queue size
        if len(queue) > self.max_queue_size:
            queue.pop(0)

    async def send_queued_messages(self, client_id: str, websocket: WebSocket):
        """Send queued messages to reconnected client"""
        if client_id in self.message_queue:
            queued_messages = self.message_queue[client_id]
            for item in queued_messages:
                try:
                    await websocket.send_json({
                        "type": "queued_message",
                        "data": item["message"],
                        "queued_at": item["timestamp"]
                    })
                except Exception as e:
                    logger.error(f"Error sending queued message: {e}")
            self.message_queue[client_id] = []

    async def broadcast(self, message: dict):
        """
        Broadcast message to all connected clients with offline queueing

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

    async def track_supplier_performance(self, supplier_id: int, event_type: str, data: Dict[str, Any]):
        """Track supplier performance metrics in real-time"""
        if supplier_id not in self.supplier_performance_metrics:
            self.supplier_performance_metrics[supplier_id] = {
                "total_rfqs": 0,
                "won_rfqs": 0,
                "response_times": [],
                "last_updated": datetime.utcnow()
            }

        metrics = self.supplier_performance_metrics[supplier_id]

        if event_type == "rfq_response":
            metrics["total_rfqs"] += 1
            if "response_time" in data:
                metrics["response_times"].append(data["response_time"])
        elif event_type == "rfq_won":
            metrics["won_rfqs"] += 1

        metrics["last_updated"] = datetime.utcnow()

        # Notify connected clients about performance update
        if supplier_id in self.active_connections:
            message = {
                "type": "performance_update",
                "supplier_id": supplier_id,
                "metrics": metrics
            }
            await self.broadcast_to_supplier(supplier_id, message)

    async def broadcast_to_supplier(self, supplier_id: int, message: dict):
        if supplier_id in self.active_connections:
            for client in self.active_connections[supplier_id]:
                try:
                    await client.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to client: {e}")
                    await self.disconnect(client)