#!/bin/bash

# Bell24h Deployment Script
# This script is used to deploy the Bell24h application to the production environment

set -e  # Exit immediately if a command exits with a non-zero status

# Define color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Bell24h deployment process...${NC}"

# Check if we have the necessary environment variables
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
  exit 1
fi

if [ -z "$GST_API_KEY" ]; then
  echo -e "${RED}ERROR: GST_API_KEY environment variable is not set${NC}"
  exit 1
fi

# Check for Docker and Docker Compose
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
  exit 1
fi

echo -e "${GREEN}Environment check passed. Starting deployment...${NC}"

# Navigate to the project root directory
PROJECT_ROOT=$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")
cd $PROJECT_ROOT

# Pull the latest code if in a git repository
if [ -d ".git" ]; then
  echo -e "${YELLOW}Pulling latest code from repository...${NC}"
  git pull
  echo -e "${GREEN}Code updated successfully.${NC}"
fi

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run db:push
echo -e "${GREEN}Database migrations completed successfully.${NC}"

# Build the Docker images
echo -e "${YELLOW}Building Docker images...${NC}"
cd deployment/docker
docker-compose build
echo -e "${GREEN}Docker images built successfully.${NC}"

# Start the containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d
echo -e "${GREEN}Docker containers started successfully.${NC}"

# Run health checks
echo -e "${YELLOW}Running health checks...${NC}"
# Wait for the server to be available
MAX_RETRIES=30
RETRY_COUNT=0
while ! curl -s http://localhost:5000/api/health | grep -q "ok"; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Server health check failed after ${MAX_RETRIES} attempts.${NC}"
    exit 1
  fi
  echo -e "${YELLOW}Waiting for server to be available... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
  sleep 2
done

echo -e "${GREEN}Server health check passed successfully.${NC}"

# Check client availability
if curl -s http://localhost | grep -q "Bell24h"; then
  echo -e "${GREEN}Client health check passed successfully.${NC}"
else
  echo -e "${RED}Client health check failed.${NC}"
  exit 1
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}🚀 Bell24h deployed successfully! 🚀${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "${YELLOW}Server available at: ${NC}http://localhost:5000"
echo -e "${YELLOW}Client available at: ${NC}http://localhost"

exit 0