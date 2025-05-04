#!/bin/bash

echo -e "\nChecking Frontend Server (http://localhost:5001/):"
curl -I http://localhost:5001/ 2>/dev/null | head -1
curl -I http://localhost:5001/index.html 2>/dev/null | head -1
curl -I http://localhost:5001/notification-sounds-test.html 2>/dev/null | head -1
curl -I http://localhost:5001/websocket-demo.html 2>/dev/null | head -1
curl -I http://localhost:5001/websocket-test.html 2>/dev/null | head -1
curl -I http://localhost:5001/hybrid-websocket.html 2>/dev/null | head -1
curl -I http://localhost:5001/sse-test.html 2>/dev/null | head -1

echo -e "\nChecking WebSocket Server HTTP endpoint (http://localhost:5002/):"
curl -I http://localhost:5002/ 2>/dev/null | head -1

echo -e "\nChecking WebSocket Proxy (http://localhost:5003/):"
curl -I http://localhost:5003/ 2>/dev/null | head -1

echo -e "\nChecking SSE Server (http://localhost:5004/):"
curl -I http://localhost:5004/ 2>/dev/null | head -1