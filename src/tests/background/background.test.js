// Main integration tests for background.js functionality
import * as omnibox from "../../background/omnibox";
import * as storageManager from "../../background/storageManager";
import * as contextMenu from "../../background/contextMenu";
import * as searchEngine from "../../background/searchEngine";
import * as notifications from "../../background/notifications";

// Mock the module imports
jest.mock("../../background/omnibox");
jest.mock("../../background/storageManager");
jest.mock("../../background/contextMenu");
jest.mock("../../background/searchEngine");
jest.mock("../../background/notifications");

// Mock Chrome API with complete set of needed mocks
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(() => Promise.resolve())
    }
  },
  omnibox: {
    onInputChanged: { addListener: jest.fn() },
    onInputEntered: { addListener: jest.fn() }
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: { addListener: jest.fn() }
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    clear: jest.fn(() => Promise.resolve(true)),
    clearAll: jest.fn(() => Promise.resolve()),
    onAlarm: { addListener: jest.fn() }
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(() => Promise.resolve()),
    onButtonClicked: { addListener: jest.fn() }
  },
  runtime: {
    getURL: jest.fn(() => "icons/logo48x48.png"),
    onMessage: {
      addListener: jest.fn((callback) => {
        // Store the callback for testing
        global.messageListener = callback;
      })
    },
    onInstalled: {
      addListener: jest.fn((callback) => {
        // Store the callback for testing
        global.onInstalledListener = callback;
      })
    }
  },
  sidePanel: {
    setPanelBehavior: jest.fn(() => Promise.resolve()),
    open: jest.fn(() => Promise.resolve())
  }
};

// Store original implementation before mocking
let realHandleIndexPage;
let realHandleAddTaskNotification;
let realHandleDeleteTaskNotification;
let realHandleUpdateTaskNotification;
let realHandleBackupImported;

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Import the module after setting up mocks
// We use dynamic import to ensure mocks are set up first
beforeAll(async () => {
  // Setup mocks FIRST
  searchEngine.loadSearchIndex = jest.fn().mockResolvedValue();
  searchEngine.handleIndexPage = jest.fn().mockResolvedValue();
  
  omnibox.initializeOmnibox = jest.fn();
  contextMenu.setupContextMenuListeners = jest.fn();
  notifications.addAlarmListeners = jest.fn();
  
  // Now import the module
  await import("../../background/background");
});

describe('Background Integration Tests', () => {
  test('should initialize components on install', () => {
    // Simulate the onInstalled event
    global.onInstalledListener();
    
    // Check if the required functions were called
    expect(chrome.sidePanel.setPanelBehavior).toHaveBeenCalledWith({ 
      openPanelOnActionClick: true 
    });
    expect(contextMenu.createContextMenu).toHaveBeenCalled();
    expect(storageManager.initializeStorage).toHaveBeenCalled();
  });

  test('should handle indexPage messages', async () => {
    // Create a mock request, sender, and response function
    const request = {
      action: "indexPage",
      url: "https://example.com",
      title: "Example Website",
      content: "This is the page content"
    };
    const sender = { id: "extension-id" };
    const sendResponse = jest.fn();
    
    // Call the message listener with our mock request
    await global.messageListener(request, sender, sendResponse);
    
    // Check if the handler was called with the right parameters
    expect(searchEngine.handleIndexPage).toHaveBeenCalledWith(request);
    
    // Check if sendResponse was called with success
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });
  
  test('should handle addTask messages', async () => {
    const request = {
      action: "addTask",
      task: { id: "123", text: "New task", dueDate: new Date().toISOString() }
    };
    const sender = { id: "extension-id" };
    const sendResponse = jest.fn();
    
    const result = await global.messageListener(request, sender, sendResponse);
    
    // Should return true to indicate async response
    expect(result).toBe(true);
    
    // Check if the handler was called with the right parameters
    expect(notifications.handleAddTaskNotification).toHaveBeenCalledWith(
      request,
      sender,
      sendResponse
    );
  });
  
  test('should handle deleteTask messages', async () => {
    const request = {
      action: "deleteTask",
      taskId: "123"
    };
    const sender = { id: "extension-id" };
    const sendResponse = jest.fn();
    
    const result = await global.messageListener(request, sender, sendResponse);
    
    // Should return true to indicate async response
    expect(result).toBe(true);
    
    // Check if the handler was called with the right parameters
    expect(notifications.handleDeleteTaskNotification).toHaveBeenCalledWith(
      request,
      sender,
      sendResponse
    );
  });
  
  test('should handle updateTask messages', async () => {
    const request = {
      action: "updateTask",
      taskId: "123",
      newDueDate: new Date().toISOString(),
      newHasReminder: true
    };
    const sender = { id: "extension-id" };
    const sendResponse = jest.fn();
    
    const result = await global.messageListener(request, sender, sendResponse);
    
    // Should return true to indicate async response
    expect(result).toBe(true);
    
    // Check if the handler was called with the right parameters
    expect(notifications.handleUpdateTaskNotification).toHaveBeenCalledWith(
      request,
      sender,
      sendResponse
    );
  });
  
  test('should handle backup_imported messages', async () => {
    const request = {
      action: "backup_imported",
      tasks: [{ id: "123", text: "Imported task" }]
    };
    const sender = { id: "extension-id" };
    const sendResponse = jest.fn();
    
    const result = await global.messageListener(request, sender, sendResponse);
    
    // Should return true to indicate async response
    expect(result).toBe(true);
    
    // Check if the handler was called with the right parameters
    expect(notifications.handleBackupImported).toHaveBeenCalledWith(
      request,
      sender,
      sendResponse
    );
  });
  
  test('should handle indexPage error case', async () => {
    // Mock an error in the handleIndexPage function
    searchEngine.handleIndexPage.mockRejectedValueOnce(new Error("Indexing failed"));
    
    const request = {
      action: "indexPage",
      url: "https://example.com",
      title: "Example Website"
    };
    const sender = { id: "extension-id" };
    const sendResponse = jest.fn();
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the message listener and get the result
    const result = global.messageListener(request, sender, sendResponse);
    
    // Add a small delay to allow the Promise rejection to be processed
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check if the error was logged
    expect(consoleSpy).toHaveBeenCalled();
    
    // Check if sendResponse was called with failure
    expect(sendResponse).toHaveBeenCalledWith({ success: false });
    
    // Restore console.error
    consoleSpy.mockRestore();
    
    // Verify the listener returned true
    expect(result).toBe(true);
  });
});