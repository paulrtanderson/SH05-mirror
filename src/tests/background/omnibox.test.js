import { initializeOmnibox } from '../../background/omnibox';

// Mock Chrome API
global.chrome = {
  omnibox: {
    onInputChanged: { addListener: jest.fn() },
    onInputEntered: { addListener: jest.fn() }
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Omnibox Tests', () => {
  test('should initialize omnibox with listeners', () => {
    initializeOmnibox();
    expect(chrome.omnibox.onInputChanged.addListener).toHaveBeenCalled();
    expect(chrome.omnibox.onInputEntered.addListener).toHaveBeenCalled();
  });
});