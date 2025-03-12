import { initializeStorage } from '../../background/storageManager';

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(() => Promise.resolve())
    }
  }
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Storage Manager Tests', () => {
  test('should initialize storage with default values', async () => {
    await initializeStorage();
    expect(chrome.storage.local.set).toHaveBeenCalled();
  });
});