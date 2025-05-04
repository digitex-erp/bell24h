import json
import asyncio
from typing import Dict, Set, Any, List
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from websockets.exceptions import ConnectionClosed
from starlette.websockets import WebSocketDisconnect
from fastapi import FastAPI, WebSocket, status
from backend.ws import WebSocketServer
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app specifically for WebSockets
app = FastAPI()

# Store active connections
class ConnectionManager:
    def __init__(self):
        # Supplier connections: Map of supplier_id to WebSocket connection
        self.supplier_connections: Dict[str, WebSocket] = {}
        
        # Buyer connections: Map of buyer_id to WebSocket connection
        self.buyer_connections: Dict[str, WebSocket] = {}
        
        # RFQ watchers: Map of rfq_id to set of buyer_ids watching
        self.rfq_watchers: Dict[str, Set[str]] = {}
        
        # Lock for thread safety
        self.lock = asyncio.Lock()
        
        # WebSocket server
        self.wss = WebSocketServer(app, path="/ws")
    
    async def connect_supplier(self, supplier_id: str, websocket: WebSocket):
        """Connect a supplier's WebSocket"""
        await websocket.accept()
        async with self.lock:
            self.supplier_connections[supplier_id] = websocket
        logger.info(f"Supplier {supplier_id} connected")
    
    async def connect_buyer(self, buyer_id: str, websocket: WebSocket):
        """Connect a buyer's WebSocket"""
        await websocket.accept()
        async with self.lock:
            self.buyer_connections[buyer_id] = websocket
        logger.info(f"Buyer {buyer_id} connected")
    
    async def disconnect_supplier(self, supplier_id: str):
        """Disconnect a supplier's WebSocket"""
        async with self.lock:
            if supplier_id in self.supplier_connections:
                del self.supplier_connections[supplier_id]
                logger.info(f"Supplier {supplier_id} disconnected")
    
    async def disconnect_buyer(self, buyer_id: str):
        """Disconnect a buyer's WebSocket"""
        async with self.lock:
            if buyer_id in self.buyer_connections:
                del self.buyer_connections[buyer_id]
                # Remove from any RFQ watchers
                for rfq_id, watchers in self.rfq_watchers.items():
                    if buyer_id in watchers:
                        watchers.remove(buyer_id)
                logger.info(f"Buyer {buyer_id} disconnected")
    
    async def watch_rfq(self, rfq_id: str, buyer_id: str):
        """Add buyer to RFQ watchers list"""
        async with self.lock:
            if rfq_id not in self.rfq_watchers:
                self.rfq_watchers[rfq_id] = set()
            self.rfq_watchers[rfq_id].add(buyer_id)
            logger.info(f"Buyer {buyer_id} watching RFQ {rfq_id}")
    
    async def send_supplier_notification(self, supplier_id: str, message: Any):
        """Send notification to a specific supplier"""
        async with self.lock:
            if supplier_id in self.supplier_connections:
                websocket = self.supplier_connections[supplier_id]
                if websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await websocket.send_json(message)
                        logger.info(f"Notification sent to supplier {supplier_id}")
                        return True
                    except ConnectionClosed:
                        await self.disconnect_supplier(supplier_id)
                        logger.warning(f"Failed to send to supplier {supplier_id}, connection closed")
            return False
    
    async def send_buyer_notification(self, buyer_id: str, message: Any):
        """Send notification to a specific buyer"""
        async with self.lock:
            if buyer_id in self.buyer_connections:
                websocket = self.buyer_connections[buyer_id]
                if websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await websocket.send_json(message)
                        logger.info(f"Notification sent to buyer {buyer_id}")
                        return True
                    except ConnectionClosed:
                        await self.disconnect_buyer(buyer_id)
                        logger.warning(f"Failed to send to buyer {buyer_id}, connection closed")
            return False
    
    async def broadcast_rfq_update(self, rfq_id: str, update: Any):
        """Broadcast RFQ update to all watchers"""
        async with self.lock:
            if rfq_id in self.rfq_watchers:
                watchers = self.rfq_watchers[rfq_id].copy()
                for buyer_id in watchers:
                    if buyer_id in self.buyer_connections:
                        await self.send_buyer_notification(buyer_id, {
                            "type": "rfq_update",
                            "rfq_id": rfq_id,
                            "data": update,
                            "timestamp": datetime.now().isoformat()
                        })
    
    async def broadcast_new_rfq(self, rfq_data: Any, categories: List[str]):
        """Broadcast new RFQ to relevant suppliers"""
        # This would filter suppliers by category in a real implementation
        async with self.lock:
            for supplier_id, websocket in self.supplier_connections.items():
                if websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await websocket.send_json({
                            "type": "new_rfq",
                            "data": rfq_data,
                            "timestamp": datetime.now().isoformat()
                        })
                    except ConnectionClosed:
                        await self.disconnect_supplier(supplier_id)
                        logger.warning(f"Failed to send to supplier {supplier_id}, connection closed")


# Create a singleton instance
manager = ConnectionManager()


@app.websocket("/buyer/{buyer_id}")
async def buyer_websocket(websocket: WebSocket, buyer_id: str):
    """WebSocket endpoint for buyers"""
    await manager.connect_buyer(buyer_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Process buyer messages
            if "action" in data:
                if data["action"] == "watch_rfq" and "rfq_id" in data:
                    await manager.watch_rfq(data["rfq_id"], buyer_id)
                    await websocket.send_json({
                        "type": "ack",
                        "action": "watch_rfq",
                        "rfq_id": data["rfq_id"],
                        "status": "success"
                    })
    except WebSocketDisconnect:
        await manager.disconnect_buyer(buyer_id)


@app.websocket("/supplier/{supplier_id}")
async def supplier_websocket(websocket: WebSocket, supplier_id: str):
    """WebSocket endpoint for suppliers"""
    await manager.connect_supplier(supplier_id, websocket)
    try:
        while True:
            # Just keep the connection alive, no need to process messages from suppliers
            data = await websocket.receive_json()
            # Echo back as acknowledgment
            await websocket.send_json({
                "type": "ack",
                "received_at": datetime.now().isoformat()
            })
    except WebSocketDisconnect:
        await manager.disconnect_supplier(supplier_id)
