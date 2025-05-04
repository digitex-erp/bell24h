#!/bin/bash

# Bell24h Integrated Test Runner
# This script runs all tests for the Bell24h application in an integrated manner

set -e  # Exit immediately if a command exits with a non-zero status

# Define color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section header
print_header() {
  echo -e "\n${BLUE}========================================"
  echo -e "  $1"
  echo -e "========================================${NC}\n"
}

# Navigate to the project root directory
PROJECT_ROOT=$(dirname "$(dirname "$(readlink -f "$0")")")
cd $PROJECT_ROOT

print_header "Bell24h Integrated Test Runner"

# Check if we need to run with coverage
COVERAGE=""
if [ "$1" == "--coverage" ]; then
  COVERAGE="--coverage"
  echo -e "${YELLOW}Running tests with coverage reporting.${NC}"
else
  echo -e "${YELLOW}Running tests without coverage. Use --coverage flag to enable coverage reporting.${NC}"
fi

# Set up test environment
print_header "Setting up test environment"
export NODE_ENV=test
echo -e "${YELLOW}Setting NODE_ENV=test${NC}"

# Check for test database
if [ -z "$TEST_DATABASE_URL" ]; then
  echo -e "${YELLOW}TEST_DATABASE_URL not set. Using in-memory database for tests.${NC}"
else
  echo -e "${YELLOW}Using TEST_DATABASE_URL for database connection.${NC}"
fi

# Check for GST API key for third-party tests
if [ -z "$GST_API_KEY" ]; then
  echo -e "${YELLOW}GST_API_KEY not set. Third-party GST API tests will be skipped.${NC}"
else
  echo -e "${YELLOW}GST_API_KEY found. Third-party GST API tests will be executed.${NC}"
fi

# Run database migrations for test environment
print_header "Running database migrations for test environment"
npm run db:push:test

# Run Unit Tests
print_header "Running Unit Tests"
echo -e "${YELLOW}Running server unit tests...${NC}"
npm run test:unit:server $COVERAGE
echo -e "${GREEN}Server unit tests completed.${NC}"

echo -e "${YELLOW}Running client unit tests...${NC}"
npm run test:unit:client $COVERAGE
echo -e "${GREEN}Client unit tests completed.${NC}"

# Run Integration Tests
print_header "Running Integration Tests"
echo -e "${YELLOW}Running API integration tests...${NC}"
npm run test:integration:api $COVERAGE
echo -e "${GREEN}API integration tests completed.${NC}"

echo -e "${YELLOW}Running workflow integration tests...${NC}"
npm run test:integration:workflows $COVERAGE
echo -e "${GREEN}Workflow integration tests completed.${NC}"

# Run Third-party Integration Tests if API keys are available
print_header "Running Third-party Integration Tests"
if [ -n "$GST_API_KEY" ]; then
  echo -e "${YELLOW}Running GST API integration tests...${NC}"
  npm run test:third-party:gst $COVERAGE
  echo -e "${GREEN}GST API integration tests completed.${NC}"
else
  echo -e "${YELLOW}Skipping GST API integration tests (no API key).${NC}"
fi

if [ -n "$M1_EXCHANGE_API_KEY" ]; then
  echo -e "${YELLOW}Running M1 Exchange integration tests...${NC}"
  npm run test:third-party:m1exchange $COVERAGE
  echo -e "${GREEN}M1 Exchange integration tests completed.${NC}"
else
  echo -e "${YELLOW}Skipping M1 Exchange integration tests (no API key).${NC}"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}Running OpenAI integration tests...${NC}"
  npm run test:third-party:openai $COVERAGE
  echo -e "${GREEN}OpenAI integration tests completed.${NC}"
else
  echo -e "${YELLOW}Skipping OpenAI integration tests (no API key).${NC}"
fi

if [ -n "$GEMINI_API_KEY" ]; then
  echo -e "${YELLOW}Running Gemini integration tests...${NC}"
  npm run test:third-party:gemini $COVERAGE
  echo -e "${GREEN}Gemini integration tests completed.${NC}"
else
  echo -e "${YELLOW}Skipping Gemini integration tests (no API key).${NC}"
fi

# Run E2E Tests
print_header "Running End-to-End Tests"
echo -e "${YELLOW}Running E2E tests...${NC}"
npm run test:e2e $COVERAGE
echo -e "${GREEN}E2E tests completed.${NC}"

# Generate coverage report if coverage enabled
if [ "$COVERAGE" == "--coverage" ]; then
  print_header "Generating Coverage Report"
  npm run test:coverage:report
  echo -e "${GREEN}Coverage report generated. See coverage/lcov-report/index.html${NC}"
fi

print_header "Test Summary"
echo -e "${GREEN}🎉 All tests completed successfully! 🎉${NC}"
echo -e "${YELLOW}Test run completed at: $(date)${NC}"

# Print coverage summary if available
if [ "$COVERAGE" == "--coverage" ]; then
  echo -e "\n${YELLOW}Coverage Summary:${NC}"
  npm run test:coverage:summary
fi

exit 0