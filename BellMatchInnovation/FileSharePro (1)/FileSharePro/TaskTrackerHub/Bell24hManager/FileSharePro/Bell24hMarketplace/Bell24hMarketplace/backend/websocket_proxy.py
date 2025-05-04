import http.server
import socketserver
import logging
import json
import threading
import time
import random
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global variables
RECENT_NOTIFICATIONS = []
MAX_RECENT_NOTIFICATIONS = 50

class WebSocketProxyHandler(http.server.BaseHTTPRequestHandler):
    """Simple HTTP handler to provide WebSocket test page and API endpoints"""
    
    def _set_headers(self, content_type="application/json"):
        """Set response headers with CORS support"""
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self._set_headers()
    
    def do_GET(self):
        """Handle HTTP GET requests"""
        try:
            # Handle different paths
            if self.path == "/ws-test":
                # Serve the WebSocket test HTML page
                self._set_headers("text/html")
                with open('frontend/websocket-test.html', 'r') as file:
                    self.wfile.write(file.read().encode())
            
            elif self.path == "/api/notifications":
                # Return mock notifications
                self._set_headers()
                response = {
                    "type": "notification_list",
                    "notifications": self._get_mock_notifications(),
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())
            
            elif self.path == "/api/notification/create":
                # Create and return a mock notification
                self._set_headers()
                notification = self._create_mock_notification()
                self.wfile.write(json.dumps(notification).encode())
            
            elif self.path == "/api/status":
                # Return server status
                self._set_headers()
                response = {
                    "status": "ok",
                    "websocket_proxy": "running",
                    "websocket_server": "running",
                    "polling_available": True,
                    "recent_notifications": len(RECENT_NOTIFICATIONS),
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())

            elif self.path == "/api/ping":
                # Simple ping endpoint for connection testing
                self._set_headers()
                response = {
                    "status": "ok",
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())
                
            elif self.path == "/api/send":
                # Handle sending a message (for polling fallback)
                query_params = {}
                if '?' in self.path:
                    query_string = self.path.split('?', 1)[1]
                    for param in query_string.split('&'):
                        if '=' in param:
                            key, value = param.split('=', 1)
                            query_params[key] = value
                
                # Echo the message back as a notification
                self._set_headers()
                notification = {
                    "type": "echo",
                    "id": str(random.randint(1000000, 9999999)),
                    "message": query_params.get('message', 'No message provided'),
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(notification).encode())
            
            else:
                # Serve a simple 404 page
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b"<html><head><title>404 Not Found</title></head>")
                self.wfile.write(b"<body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>")
                self.wfile.write(b"<p><a href='/ws-test'>Go to WebSocket Test Page</a></p></body></html>")
                
        except Exception as e:
            logger.error(f"Error handling HTTP request: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Internal Server Error", "detail": str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def _get_mock_notifications(self):
        """Return recent notifications or generate some if none exist"""
        global RECENT_NOTIFICATIONS
        
        if not RECENT_NOTIFICATIONS:
            # Generate a few mock notifications
            for _ in range(3):
                self._create_mock_notification()
                
        return RECENT_NOTIFICATIONS
    
    def _create_mock_notification(self):
        """Create a mock notification"""
        global RECENT_NOTIFICATIONS
        
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
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS.pop()
            
        logger.info(f"Created mock notification: {notification['title']}")
        
        return notification


class NotificationGenerator(threading.Thread):
    """Background thread that generates notifications periodically"""
    
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.running = False
        
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
                logger.info(f"Generated new notification: {notification['title']}")
                
            except Exception as e:
                logger.error(f"Error generating notification: {e}")
                time.sleep(5)  # Wait a bit after errors
                
        logger.info("Notification generator stopped")
    
    def _create_notification(self):
        """Create a notification and add it to the global list"""
        global RECENT_NOTIFICATIONS
        
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
            "id": str(random.randint(1000000, 9999999)),
            "title": random.choice(notification_titles),
            "message": f"Notification #{len(RECENT_NOTIFICATIONS) + 1} - Generated at {datetime.now().strftime('%H:%M:%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to recent notifications
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS.pop()
            
        return notification
        
    def stop(self):
        """Stop the notification generator"""
        self.running = False


def run_proxy_server(port=5003):
    """Run the HTTP proxy server on port 5003"""
    # Start the notification generator in a background thread
    notifier = NotificationGenerator()
    notifier.start()
    
    # Create and start the HTTP server
    httpd = socketserver.ThreadingTCPServer(("0.0.0.0", port), WebSocketProxyHandler)
    logger.info(f"WebSocket proxy server started on port {port}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received, shutting down server")
    finally:
        httpd.server_close()
        notifier.stop()
        logger.info("Server stopped")


if __name__ == "__main__":
    run_proxy_server()