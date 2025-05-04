#!/bin/bash

# Bell24h Build Script
# This script builds the Bell24h application for production

set -e  # Exit immediately if a command exits with a non-zero status

# Define color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Bell24h build process...${NC}"

# Navigate to the project root directory
PROJECT_ROOT=$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")
cd $PROJECT_ROOT

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}Dependencies installed successfully.${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm run test
if [ $? -ne 0 ]; then
  echo -e "${RED}Tests failed. Aborting build.${NC}"
  exit 1
fi
echo -e "${GREEN}Tests passed successfully.${NC}"

# Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build
echo -e "${GREEN}Application built successfully.${NC}"

# Create build artifacts directory
ARTIFACTS_DIR="./build-artifacts"
mkdir -p $ARTIFACTS_DIR

# Package application
echo -e "${YELLOW}Packaging application...${NC}"
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="bell24h_v${VERSION}_${BUILD_DATE}.tar.gz"

# Create tarball of the build
tar -czf "${ARTIFACTS_DIR}/${FILENAME}" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="build-artifacts" \
    --exclude="*.log" \
    .

echo -e "${GREEN}Application packaged successfully: ${ARTIFACTS_DIR}/${FILENAME}${NC}"

# Generate build info file
echo -e "${YELLOW}Generating build info...${NC}"
cat > "${ARTIFACTS_DIR}/build-info.json" << EOF
{
  "version": "${VERSION}",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "buildType": "production",
  "environment": "production"
}
EOF

echo -e "${GREEN}Build info generated successfully.${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}🚀 Bell24h build completed! 🚀${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "${YELLOW}Build artifacts available at: ${NC}${ARTIFACTS_DIR}"

exit 0