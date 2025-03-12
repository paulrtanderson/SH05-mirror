import { 
    handleAddTaskNotification, 
    handleDeleteTaskNotification, 
    handleUpdateTaskNotification, 
    handleBackupImported,
    addAlarmListeners
  } from '../../background/notifications';
  
  // Mock Chrome API
  global.chrome = {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(() => Promise.resolve())
      }
    },
    alarms: {
      create: jest.fn(),
      clear: jest.fn((alarmName, callback) => {
        if (callback && typeof callback === 'function') {
          callback(true);  // This simulates successful alarm clearing
        }
        return Promise.resolve(true);
      }),
      clearAll: jest.fn(() => Promise.resolve()),
      onAlarm: { addListener: jest.fn() }
    },
    notifications: {
      create: jest.fn(),
      clear: jest.fn(() => Promise.resolve()),
      onButtonClicked: { addListener: jest.fn() }
    }
  };
  
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    chrome.storage.local.get.mockImplementation((key) => {
      if (key === "tasks") {
        return Promise.resolve({ tasks: [
          { id: '123', text: 'Test Task', dueDate: new Date().toISOString(), hasReminder: true }
        ]});
      }
      return Promise.resolve({});
    });
  });
  
  describe('Notification Tests', () => {
    test('should handle adding task notifications', async () => {
      const request = {
        task: { 
          id: '123', 
          text: 'New Task', 
          dueDate: new Date().toISOString(),
          hasReminder: true 
        }
      };
      const sendResponse = jest.fn();
      
      await handleAddTaskNotification(request, {}, sendResponse);
      expect(chrome.alarms.create).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('should handle deleting task notifications', async () => {
      const request = { taskId: '123' };
      const sendResponse = jest.fn();
      
      await handleDeleteTaskNotification(request, {}, sendResponse);
      expect(chrome.storage.local.set).toHaveBeenCalled();
      expect(chrome.alarms.clear).toHaveBeenCalledWith('task-123', expect.any(Function));
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('should handle updating task notifications', async () => {
      const newDate = new Date().toISOString();
      const request = { 
        taskId: '123',
        newDueDate: newDate,
        newHasReminder: true
      };
      const sendResponse = jest.fn();
      
      await handleUpdateTaskNotification(request, {}, sendResponse);
      expect(chrome.alarms.clear).toHaveBeenCalled();
      expect(chrome.alarms.create).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('should handle backup imported', async () => {
      const request = {};
      const sendResponse = jest.fn();
      
      await handleBackupImported(request, {}, sendResponse);
      expect(chrome.alarms.clearAll).toHaveBeenCalled();
      expect(chrome.alarms.create).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('should add alarm listeners', () => {
      addAlarmListeners();
      expect(chrome.alarms.onAlarm.addListener).toHaveBeenCalled();
      expect(chrome.notifications.onButtonClicked.addListener).toHaveBeenCalled();
    });
  });