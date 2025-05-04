import base64
import hashlib
import socket
import struct
import threading
import logging
import time
import random
import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
MAX_PAYLOAD = 4096

# Globals
CONNECTED_CLIENTS = []
RECENT_NOTIFICATIONS = []
MAX_RECENT_NOTIFICATIONS = 50

class WebSocketHandler:
    """Handles WebSocket connection and communication"""
    
    def __init__(self, client_socket, client_address):
        self.client_socket = client_socket
        self.client_address = client_address
        self.keep_alive = True
        self.handshake_done = False
        self.buffer = b""
        
        client_socket.settimeout(10)  # 10 second timeout
        
    def handle(self):
        """Main handler for the WebSocket connection"""
        try:
            # Read data from the client
            data = self.client_socket.recv(MAX_PAYLOAD)
            if not data:
                logger.warning("No data received from client")
                return
                
            # If we haven't done the handshake yet
            if not self.handshake_done:
                # Extract the WebSocket key from the HTTP headers
                headers = data.decode('utf-8', errors='ignore')
                logger.info(f"Received headers: {headers}")
                
                # Check if this is an HTTP GET request instead of a WebSocket request
                if headers.startswith('GET ') and 'HTTP/' in headers and 'Upgrade: websocket' not in headers:
                    logger.info("Received an HTTP request instead of a WebSocket connection request")
                    # Send a simple HTTP response for debugging purposes
                    response = (
                        "HTTP/1.1 200 OK\r\n"
                        "Content-Type: text/plain\r\n"
                        "Connection: close\r\n"
                        "\r\n"
                        "This is a WebSocket server endpoint. Please use a WebSocket client to connect.\r\n"
                    )
                    self.client_socket.send(response.encode('utf-8'))
                    self._cleanup()
                    return
                
                # Check for WebSocket key
                key_match = "Sec-WebSocket-Key:"
                for line in headers.split('\r\n'):
                    if line.startswith(key_match):
                        key = line[len(key_match):].strip()
                        logger.info(f"Found WebSocket key: {key}")
                        break
                else:
                    logger.error("No WebSocket key found in headers")
                    return
                    
                # Perform the WebSocket handshake
                self._handshake(key)
                
                # Start the message loop
                self._start_message_loop()
                
            # If handshake is done, handle received data as a WebSocket frame
            else:
                self.buffer += data
                self._receive_frame()
        
        except socket.timeout:
            logger.warning(f"Socket timeout for client {self.client_address}")
            self._cleanup()
        
        except Exception as e:
            logger.error(f"Error handling WebSocket connection: {e}")
            self._cleanup()

    def _handshake(self, key):
        """Perform the WebSocket handshake"""
        try:
            # Calculate the WebSocket accept key
            accept_key = base64.b64encode(
                hashlib.sha1((key + GUID).encode('utf-8')).digest()
            ).decode('utf-8')
            
            # Create the HTTP response headers
            handshake_response = (
                "HTTP/1.1 101 Switching Protocols\r\n"
                "Upgrade: websocket\r\n"
                "Connection: Upgrade\r\n"
                f"Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
            )
            
            # Send the handshake response
            self.client_socket.send(handshake_response.encode('utf-8'))
            self.handshake_done = True
            
            # Add this client to the global list of connected clients
            global CONNECTED_CLIENTS
            CONNECTED_CLIENTS.append(self)
            
            logger.info(f"WebSocket handshake completed with {self.client_address}")
            
            # Send a welcome message
            welcome_msg = {
                "type": "system",
                "message": "Connected to Bell24h WebSocket Server",
                "timestamp": datetime.now().isoformat()
            }
            self.send_message(json.dumps(welcome_msg))
            
        except Exception as e:
            logger.error(f"Error during WebSocket handshake: {e}")
            self._cleanup()

    def _start_message_loop(self):
        """Start the message loop for this WebSocket client"""
        try:
            # Keep the connection alive
            while self.keep_alive:
                # Try to receive a frame
                data = self.client_socket.recv(MAX_PAYLOAD)
                if not data:
                    logger.warning(f"No data received from {self.client_address}, closing connection")
                    break
                    
                # Add data to buffer and process frames
                self.buffer += data
                self._receive_frame()
                
        except socket.timeout:
            logger.info(f"Socket timeout for client {self.client_address}")
        
        except Exception as e:
            logger.error(f"Error in message loop: {e}")
        
        finally:
            self._cleanup()

    def _cleanup(self):
        """Clean up resources when client disconnects"""
        try:
            # Remove this client from the global list
            global CONNECTED_CLIENTS
            if self in CONNECTED_CLIENTS:
                CONNECTED_CLIENTS.remove(self)
                
            # Close the socket
            if hasattr(self, 'client_socket') and self.client_socket:
                self.client_socket.close()
                
            self.keep_alive = False
            
            logger.info(f"Closed connection with {self.client_address}")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

    def _receive_frame(self):
        """Receive and decode a WebSocket frame"""
        try:
            # Check if we have enough data for a frame header
            if len(self.buffer) < 2:
                return
                
            # Decode the header
            header_byte = self.buffer[0]
            fin = (header_byte & 0x80) != 0
            opcode = header_byte & 0x0F
            
            # Handle different opcodes
            if opcode == 0x8:  # Close
                logger.info(f"Received close frame from {self.client_address}")
                self.keep_alive = False
                return
                
            elif opcode == 0x9:  # Ping
                logger.debug(f"Received ping from {self.client_address}")
                self._send_pong()
                return
                
            elif opcode not in (0x1, 0xA):  # We only handle text and pong frames
                logger.warning(f"Unsupported opcode {opcode} from {self.client_address}")
                self.buffer = b""
                return
                
            # Get the payload length
            payload_len = self.buffer[1] & 0x7F
            header_length = 2
            
            if payload_len == 126:
                # Extended payload length (2 bytes)
                if len(self.buffer) < 4:
                    return
                payload_len = struct.unpack("!H", self.buffer[2:4])[0]
                header_length = 4
            elif payload_len == 127:
                # Extended payload length (8 bytes)
                if len(self.buffer) < 10:
                    return
                payload_len = struct.unpack("!Q", self.buffer[2:10])[0]
                header_length = 10
                
            # Check if mask bit is set (all frames from client should be masked)
            mask = (self.buffer[1] & 0x80) != 0
            
            # Calculate total frame length
            frame_length = header_length + (4 if mask else 0) + payload_len
            
            # Check if we have the complete frame
            if len(self.buffer) < frame_length:
                return
                
            # Get the mask key and payload
            if mask:
                mask_key = self.buffer[header_length:header_length+4]
                payload = self.buffer[header_length+4:frame_length]
                
                # Unmask the payload
                unmasked = bytearray(payload)
                for i in range(len(payload)):
                    unmasked[i] = payload[i] ^ mask_key[i % 4]
                    
                payload = bytes(unmasked)
            else:
                payload = self.buffer[header_length:frame_length]
                
            # Remove the processed frame from the buffer
            self.buffer = self.buffer[frame_length:]
            
            # Handle the payload based on opcode
            if opcode == 0x1:  # Text frame
                try:
                    message = payload.decode('utf-8')
                    logger.info(f"Received message from {self.client_address}: {message}")
                    
                    # Handle the message (echo it back for now)
                    response = {
                        "type": "echo",
                        "message": message,
                        "timestamp": datetime.now().isoformat()
                    }
                    self.send_message(json.dumps(response))
                    
                except UnicodeDecodeError:
                    logger.error(f"Failed to decode message from {self.client_address}")
                    
            # Process any remaining frames in buffer
            if len(self.buffer) > 0:
                self._receive_frame()
                
        except Exception as e:
            logger.error(f"Error receiving frame: {e}")
            self.buffer = b""

    def _send_pong(self):
        """Send a pong frame in response to a ping"""
        try:
            # Construct a pong frame (opcode 0xA)
            frame = bytearray([0x8A, 0x00])  # fin=1, opcode=0xA, len=0
            self.client_socket.send(frame)
            logger.debug(f"Sent pong to {self.client_address}")
            
        except Exception as e:
            logger.error(f"Error sending pong: {e}")
            self._cleanup()

    def send_message(self, message):
        """Send a message to the WebSocket client"""
        try:
            # Convert message to bytes if it's a string
            if isinstance(message, str):
                message = message.encode('utf-8')
                
            # Create a WebSocket frame
            message_len = len(message)
            
            # Determine how to encode the length
            if message_len <= 125:
                # Simple length
                frame = bytearray([0x81, message_len])
            elif message_len <= 65535:
                # Extended length (2 bytes)
                frame = bytearray([0x81, 126])
                frame.extend(struct.pack("!H", message_len))
            else:
                # Extended length (8 bytes)
                frame = bytearray([0x81, 127])
                frame.extend(struct.pack("!Q", message_len))
                
            # Add the message to the frame
            frame.extend(message)
            
            # Send the frame
            self.client_socket.send(frame)
            logger.debug(f"Sent message to {self.client_address}")
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self._cleanup()


class WebSocketServer(threading.Thread):
    """WebSocket server thread"""
    
    def __init__(self, host='0.0.0.0', port=5000):
        super().__init__()
        self.daemon = True
        self.host = host
        self.port = port
        self.server_socket = None
        self.running = False
        
    def run(self):
        """Run the WebSocket server"""
        try:
            # Create a TCP socket
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            
            self.running = True
            logger.info(f"WebSocket server started on {self.host}:{self.port}")
            
            # Accept incoming connections
            while self.running:
                try:
                    # Accept a connection
                    client_socket, client_address = self.server_socket.accept()
                    logger.info(f"New connection from {client_address}")
                    
                    # Create a new handler for this client
                    handler = WebSocketHandler(client_socket, client_address)
                    
                    # Start a new thread to handle this client
                    client_thread = threading.Thread(target=self._handle_client, args=(handler,))
                    client_thread.daemon = True
                    client_thread.start()
                    
                except socket.timeout:
                    continue
                
                except Exception as e:
                    logger.error(f"Error accepting connection: {e}")
                    if not self.running:
                        break
            
        except Exception as e:
            logger.error(f"Error starting WebSocket server: {e}")
            
        finally:
            if self.server_socket:
                self.server_socket.close()
                
            logger.info("WebSocket server stopped")
            
    def _handle_client(self, handler):
        """Handle a client connection"""
        try:
            handler.handle()
        except Exception as e:
            logger.error(f"Error in client handler: {e}")
            
    def stop(self):
        """Stop the WebSocket server"""
        logger.info("Stopping WebSocket server")
        self.running = False
        
        # Close all client connections
        global CONNECTED_CLIENTS
        for client in CONNECTED_CLIENTS[:]:
            client._cleanup()
            
        # Close the server socket
        if self.server_socket:
            self.server_socket.close()


class HTTPHandler(BaseHTTPRequestHandler):
    """HTTP server handler for static content and API endpoints"""
    
    def _set_headers(self, content_type="application/json"):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()
        
    def do_OPTIONS(self):
        self._set_headers()
        
    def do_GET(self):
        """Handle HTTP GET requests"""
        try:
            if self.path == "/":
                # Serve a simple index page
                self._set_headers("text/html")
                with open('websocket-test.html', 'rb') as file:
                    self.wfile.write(file.read())
                    
            elif self.path == "/api/notification/create":
                # Create a test notification
                self._set_headers()
                notification = self._create_demo_notification()
                self._broadcast_to_ws_clients(json.dumps(notification))
                self.wfile.write(json.dumps(notification).encode())
                
            elif self.path == "/api/notifications":
                # Return recent notifications
                self._set_headers()
                response = {
                    "notifications": RECENT_NOTIFICATIONS,
                    "count": len(RECENT_NOTIFICATIONS)
                }
                self.wfile.write(json.dumps(response).encode())
                
            else:
                # 404 Not Found
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b"<html><body><h1>404 Not Found</h1></body></html>")
                
        except Exception as e:
            logger.error(f"Error handling HTTP request: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
            
    def _create_demo_notification(self):
        """Create a demo notification"""
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
            "message": f"Demo notification created at {datetime.now().strftime('%H:%M:%S')}",
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to recent notifications
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS.pop()
            
        logger.info(f"Created demo notification: {notification['title']}")
        
        return notification
        
    def _broadcast_to_ws_clients(self, message):
        """Broadcast a message to all WebSocket clients"""
        global CONNECTED_CLIENTS
        for client in CONNECTED_CLIENTS[:]:
            try:
                client.send_message(message)
            except:
                # If sending fails, client will clean itself up
                pass


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread"""
    pass


class BackgroundNotifier(threading.Thread):
    """Background thread that generates notifications periodically"""
    
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.running = False
        
    def run(self):
        """Run the background notifier"""
        self.running = True
        logger.info("Started background notifier")
        
        while self.running:
            try:
                # Wait for random time between 15-45 seconds
                sleep_time = random.randint(15, 45)
                time.sleep(sleep_time)
                
                # Create and broadcast a notification
                notification = self._generate_notification()
                self._broadcast_to_ws_clients(json.dumps(notification))
                
                logger.info(f"Generated notification: {notification['title']}")
                
            except Exception as e:
                logger.error(f"Error generating notification: {e}")
                time.sleep(5)
                
        logger.info("Background notifier stopped")
        
    def _generate_notification(self):
        """Generate a random notification"""
        global RECENT_NOTIFICATIONS
        
        notification_titles = [
            "New RFQ Posted", 
            "Bid Status Updated", 
            "Payment Processed", 
            "New Message",
            "Order Status Changed",
            "New Request for Quote",
            "Delivery Update",
            "Supplier Verification Completed"
        ]
        
        notification = {
            "type": "notification",
            "id": str(random.randint(1000000, 9999999)),
            "title": random.choice(notification_titles),
            "message": f"Automatic notification #{len(RECENT_NOTIFICATIONS) + 1}",
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to recent notifications
        RECENT_NOTIFICATIONS.insert(0, notification)
        if len(RECENT_NOTIFICATIONS) > MAX_RECENT_NOTIFICATIONS:
            RECENT_NOTIFICATIONS.pop()
            
        return notification
        
    def _broadcast_to_ws_clients(self, message):
        """Broadcast a message to all WebSocket clients"""
        global CONNECTED_CLIENTS
        for client in CONNECTED_CLIENTS[:]:
            try:
                client.send_message(message)
            except:
                # If sending fails, client will clean itself up
                pass
                
    def stop(self):
        """Stop the background notifier"""
        self.running = False


def run_servers(http_port=5002, ws_port=5000):
    """Run both HTTP and WebSocket servers"""
    try:
        # Start the WebSocket server
        ws_server = WebSocketServer(port=ws_port)
        ws_server.start()
        
        # Start the background notifier
        notifier = BackgroundNotifier()
        notifier.start()
        
        # Start the HTTP server
        httpd = ThreadedHTTPServer(("0.0.0.0", http_port), HTTPHandler)
        logger.info(f"HTTP server started on port {http_port}")
        
        # Run the HTTP server until keyboard interrupt
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received, shutting down servers")
        finally:
            httpd.server_close()
            ws_server.stop()
            notifier.stop()
            
    except Exception as e:
        logger.error(f"Error running servers: {e}")


if __name__ == "__main__":
    run_servers()