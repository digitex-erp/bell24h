
import { Server } from 'ws';
import { createRFQ, createQuote, createUser } from '@/lib/utils';

export const mockWebSocketServer = () => {
  const wss = new Server({ port: 8080 });
  return {
    wss,
    close: () => wss.close()
  };
};

export const setupWebsocketServer = () => {
  const server = mockWebSocketServer();
  return server;
};

export const mockVoiceRecognition = () => {
  return {
    start: jest.fn(),
    stop: jest.fn(),
    onResult: jest.fn(),
    onError: jest.fn()
  };
};

export const generateTestData = () => ({
  rfq: createRFQ(),
  quote: createQuote(),
  user: createUser()
});
