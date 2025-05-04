
#!/bin/bash

# Run all tests
echo "Running unit tests..."
npm run test:unit

echo "Running integration tests..."
npm run test:integration

echo "Running E2E tests..."
npm run test:e2e

echo "Running third-party integration tests..."
npm run test:third-party

echo "Running voice feature tests..."
npm run test:voice

echo "Running WebSocket tests..."
npm run test:websocket
#!/bin/bash

echo "Running all tests..."

# Run tests in sequence
npm run test:unit && \
npm run test:integration && \
npm run test:e2e && \
npm run test:third-party && \
npm run test:voice && \
npm run test:websocket

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "All tests passed!"
else
  echo "Some tests failed. Check logs above."
fi

exit $exit_code
