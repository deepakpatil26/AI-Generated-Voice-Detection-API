// Jest DOM custom matchers
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

// Mock Canvas API (required for wavesurfer.js)
HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
  return {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
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
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  } as unknown; 
}) as any;

// Mock URL.createObjectURL (required for file uploads)
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock AudioContext (required for wavesurfer.js)
window.AudioContext = jest.fn().mockImplementation(() => ({
  createGain: jest.fn(() => ({ connect: jest.fn(), gain: { value: 0 } })),
  createAnalyser: jest.fn(() => ({ connect: jest.fn(), disconnect: jest.fn() })),
  destination: {},
  state: 'suspended',
  resume: jest.fn(),
  suspend: jest.fn(),
  close: jest.fn(),
})) as any;
