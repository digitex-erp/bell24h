#!/usr/bin/env python3
"""
Server-Sent Events (SSE) implementation for Bell24h

This module provides an SSE server that can be used as a middle-ground
alternative between WebSockets and HTTP polling. SSE allows for server
to client communication with lower overhead than polling but doesn't
require the complete WebSocket protocol.

Features:
- One-way server-to-client communication (no client-to-server)
- Works over standard HTTP (no special protocols)
- Built-in reconnection support
- Event IDs for resuming missed events
- Compatible with most firewalls and proxies

Usage:
    python sse_server.py
"""

import http.server
import socketserver
import threading
import time
import random
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables
CLIENTS = []  # Will store active client connections
MAX_RECENT_NOTIFICATIONS = 100
RECENT_NOTIFICATIONS = []
NEXT_EVENT_ID = 1

class SSEHandler(http.server.BaseHTTPRequestHandler):
    """Server-Sent Events HTTP handler"""
    
    def _set_headers(self, content_type="application/json"):
        """Set response headers with CORS support"""
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self._set_headers()
    
    def do_GET(self):
        """Handle HTTP GET requests"""
        try:
            # Handle different paths
            if self.path == "/sse-test":
                # Serve the SSE test HTML page
                self._set_headers("text/html")
                with open('frontend/sse-test.html', 'r') as file:
                    self.wfile.write(file.read().encode())
            
            elif self.path == "/events":
                # This is the SSE endpoint
                self._handle_sse_stream()
            
            elif self.path == "/api/notifications":
                # Return recent notifications as JSON
                self._set_headers()
                response = {
                    "type": "notification_list",
                    "notifications": RECENT_NOTIFICATIONS,
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())
            
            elif self.path == "/api/notification/create":
                # Create and return a test notification
                self._set_headers()
                notification = self._create_notification()
                self.wfile.write(json.dumps(notification).encode())
                # Broadcast to all SSE clients
                self._broadcast_notification(notification)
            
            elif self.path == "/api/status":
                # Return server status
                self._set_headers()
                response = {
                    "status": "ok",
                    "sse_server": "running",
                    "connected_clients": len(CLIENTS),
                    "recent_notifications": len(RECENT_NOTIFICATIONS),
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())
            
            else:
                # Serve a simple 404 page
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b"<html><head><title>404 Not Found</title></head>")
                self.wfile.write(b"<body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>")
                self.wfile.write(b"<p><a href='/sse-test'>Go to SSE Test Page</a></p></body></html>")
                
        except Exception as e:
            logger.error(f"Error handling HTTP request: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Internal Server Error", "detail": str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def _handle_sse_stream(self):
        """Handle an SSE stream connection"""
        global CLIENTS
        
        # Set SSE specific headers
        self.send_response(200)
        self.send_header('Content-type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Add client to list of active connections
        client_id = hash(self.client_address)
        CLIENTS.append(self.wfile)
        logger.info(f"New SSE client connected: {self.client_address}")
        
        # Send welcome message
        self._send_sse_message(
            self.wfile, 
            {
                "type": "connection", 
                "message": "Connected to Bell24h SSE server",
                "timestamp": datetime.now().isoformat()
            }
        )
        
        # Send recent notifications
        for notification in RECENT_NOTIFICATIONS[-5:]:  # Last 5 notifications
            self._send_sse_message(self.wfile, notification)
        
        # Keep connection open until client disconnects
        while True:
            try:
                # Send a heartbeat every 30 seconds to keep connection alive
                time.sleep(30)
                self._send_sse_message(
                    self.wfile, 
                    {
                        "type": "heartbeat",
                        "timestamp": datetime.now().isoformat()
                    },
                    event="heartbeat"
                )
            except Exception as e:
                logger.info(f"Client disconnected: {self.client_address} - {e}")
                try:
                    CLIENTS.remove(self.wfile)
                except ValueError:
                    pass  # Client was already removed
                break
    
    def _send_sse_message(self, client, data, event=None):
        """Send a message to an SSE client in the proper format"""
        global NEXT_EVENT_ID
        
        try:
            message = f"id: {NEXT_EVENT_ID}\n"
            NEXT_EVENT_ID += 1
            
            if event:
                message += f"event: {event}\n"
                
            # Convert data to JSON
            json_data = json.dumps(data)
            message += f"data: {json_data}\n\n"
            
            # Send message
            client.write(message.encode())
            
            # Only flush if the client has this method
            if hasattr(client, 'flush'):
                client.flush()
            
        except Exception as e:
            logger.error(f"Error sending SSE message: {e}")
            # If we fail to send, client is probably disconnected
            if client in CLIENTS:
                CLIENTS.remove(client)
    
    def _broadcast_notification(self, notification):
        """Broadcast a notification to all connected SSE clients"""
        disconnected_clients = []
        
        for client in CLIENTS:
            try:
                self._send_sse_message(client, notification, event="notification")
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected_clients.append(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            if client in CLIENTS:
                CLIENTS.remove(client)
    
    def _create_notification(self):
        """Create a test notification"""
        global RECENT_NOTIFICATIONS
        
        notification_types = [
            {
                "type": "notification",
                "title": "New RFQ Posted",
                "message": "A new Request for Quote has been posted in your industry category",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Bid Status Updated",
                "message": "Your bid status has been updated to 'Under Review'",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Payment Processed",
                "message": "Payment of ₹15,000 has been processed for order #45678",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "New Message Received",
                "message": "You have received a new message from Buyer ABC",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Order Status Changed",
                "message": "Order #34567 status changed to 'Shipped'",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "notification",
                "title": "Supplier Verification Completed",
                "message": "Your GST verification has been completed successfully",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        notification = random.choice(notification_types)
        notification["id"] = f"{NEXT_EVENT_ID}-{int(time.time())}-{random.randint(1000, 9999)}"
        
        # Add to recent notifications
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS.pop()
            
        logger.info(f"Created notification: {notification['title']}")
        
        return notification


class NotificationGenerator(threading.Thread):
    """Background thread that generates notifications periodically"""
    
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.running = False
        self.handler = SSEHandler
        
    def run(self):
        """Run the notification generator"""
        self.running = True
        logger.info("Started notification generator")
        
        while self.running:
            try:
                # Wait for random time between 15-45 seconds
                sleep_time = random.randint(15, 45)
                time.sleep(sleep_time)
                
                # Generate a random notification
                notification = self._create_notification()
                logger.info(f"Generated notification: {notification['title']}")
                
                # Broadcast to all connected clients
                self._broadcast_notification(notification)
                
            except Exception as e:
                logger.error(f"Error generating notification: {e}")
                time.sleep(5)  # Wait a bit after errors
                
        logger.info("Notification generator stopped")
    
    def _create_notification(self):
        """Create a notification and add it to the global list"""
        global RECENT_NOTIFICATIONS, NEXT_EVENT_ID
        
        notification_titles = [
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
            "id": f"{NEXT_EVENT_ID}-{int(time.time())}-{random.randint(1000, 9999)}",
            "title": random.choice(notification_titles),
            "message": f"Notification #{len(RECENT_NOTIFICATIONS) + 1} - Generated at {datetime.now().strftime('%H:%M:%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to recent notifications
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS.pop()
            
        return notification
    
    def _broadcast_notification(self, notification):
        """Broadcast a notification to all connected clients"""
        global NEXT_EVENT_ID
        disconnected_clients = []
        
        for client in CLIENTS:
            try:
                # Send the message directly without creating a handler instance
                try:
                    message = f"id: {NEXT_EVENT_ID}\n"
                    NEXT_EVENT_ID += 1
                    message += f"event: notification\n"
                    
                    # Convert data to JSON
                    json_data = json.dumps(notification)
                    message += f"data: {json_data}\n\n"
                    
                    # Send message
                    client.write(message.encode())
                    
                    # Only flush if the client has this method
                    if hasattr(client, 'flush'):
                        client.flush()
                except Exception as e:
                    logger.error(f"Error sending SSE message: {e}")
                    disconnected_clients.append(client)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected_clients.append(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            if client in CLIENTS:
                CLIENTS.remove(client)
                
    def stop(self):
        """Stop the notification generator"""
        self.running = False


def run_sse_server(port=5004):
    """Run the SSE server on port 5004"""
    # Start the notification generator in a background thread
    notifier = NotificationGenerator()
    notifier.start()
    
    # Create and start the HTTP server
    httpd = socketserver.ThreadingTCPServer(("0.0.0.0", port), SSEHandler)
    logger.info(f"SSE server started on port {port}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received, shutting down server")
    finally:
        httpd.server_close()
        notifier.stop()
        logger.info("Server stopped")


if __name__ == "__main__":
    run_sse_server()