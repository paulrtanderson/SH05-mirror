import { createContextMenu, setupContextMenuListeners } from '../../background/contextMenu';

// Mock Chrome API
global.chrome = {
  contextMenus: {
    create: jest.fn(),
    onClicked: { addListener: jest.fn() }
  },
  sidePanel: {
    open: jest.fn(() => Promise.resolve())
  },
  storage: {
    local: {
      set: jest.fn(() => Promise.resolve())
    }
  }
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Context Menu Tests', () => {
  test('should create context menu item', () => {
    createContextMenu();
    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: "addToHawk",
      title: "Add Task",
      contexts: ["selection"]
    });
  });

  test('should set up context menu listeners', () => {
    setupContextMenuListeners();
    expect(chrome.contextMenus.onClicked.addListener).toHaveBeenCalled();
  });
});