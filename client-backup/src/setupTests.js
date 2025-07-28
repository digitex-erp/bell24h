// Import the jest-dom library for custom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverStub;

// Mock the HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: (x, y, w, h) => ({
    data: new Array(w * h * 4).fill(0)
  }),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: () => ({
    width: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0
  }),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
});

// Mock the createObjectURL and revokeObjectURL
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();
