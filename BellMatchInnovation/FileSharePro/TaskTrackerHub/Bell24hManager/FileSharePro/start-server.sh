#!/bin/bash

# Bell24h Startup Script with Module Compatibility Fixes
# This script handles starting the application with proper configuration

echo "==============================================="
echo "  Bell24h Application Startup Script"
echo "==============================================="

# Set up placeholder environment variables for external APIs if needed
setup_placeholder_env() {
  echo "Setting up placeholder environment variables for external APIs..."
  
  # FSAT API
  if [[ -z "${FSAT_API_KEY}" ]]; then
    export FSAT_API_KEY="placeholder_fsat_api_key"
    echo "  - FSAT_API_KEY set to placeholder"
  fi
  if [[ -z "${FSAT_API_SECRET}" ]]; then
    export FSAT_API_SECRET="placeholder_fsat_api_secret"
    echo "  - FSAT_API_SECRET set to placeholder"
  fi
  if [[ -z "${FSAT_BASE_URL}" ]]; then
    export FSAT_BASE_URL="https://api.fsat.com/v1"
    echo "  - FSAT_BASE_URL set to placeholder"
  fi
  
  # Kotak Securities API
  if [[ -z "${KOTAK_SECURITIES_API_KEY}" ]]; then
    export KOTAK_SECURITIES_API_KEY="placeholder_kotak_securities_api_key"
    echo "  - KOTAK_SECURITIES_API_KEY set to placeholder"
  fi
  if [[ -z "${KOTAK_SECURITIES_API_SECRET}" ]]; then
    export KOTAK_SECURITIES_API_SECRET="placeholder_kotak_securities_api_secret"
    echo "  - KOTAK_SECURITIES_API_SECRET set to placeholder"
  fi
  
  # KredX API
  if [[ -z "${KREDX_API_KEY}" ]]; then
    export KREDX_API_KEY="placeholder_kredx_api_key"
    echo "  - KREDX_API_KEY set to placeholder"
  fi
  if [[ -z "${KREDX_API_SECRET}" ]]; then
    export KREDX_API_SECRET="placeholder_kredx_api_secret"
    echo "  - KREDX_API_SECRET set to placeholder"
  fi
  
  # RazorpayX API
  if [[ -z "${RAZORPAYX_API_KEY}" ]]; then
    export RAZORPAYX_API_KEY="placeholder_razorpayx_api_key"
    echo "  - RAZORPAYX_API_KEY set to placeholder"
  fi
  if [[ -z "${RAZORPAYX_API_SECRET}" ]]; then
    export RAZORPAYX_API_SECRET="placeholder_razorpayx_api_secret"
    echo "  - RAZORPAYX_API_SECRET set to placeholder"
  fi
  
  echo "Placeholder environment variables set up successfully."
  echo "==============================================="
}

# Start server.js directly with node
start_node_server() {
  echo "Starting standalone Node.js server..."
  node server.js
}

# Start the application with our custom entry point
setup_placeholder_env
start_node_server