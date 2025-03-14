import { initializeOmnibox } from "./omnibox";
import { initializeStorage } from "./storageManager";
import { createContextMenu, setupContextMenuListeners } from "./contextMenu";
import { loadSearchIndex, handleIndexPage } from "./searchEngine";
import { handleAddTaskNotification, handleDeleteTaskNotification, handleUpdateTaskNotification, handleBackupImported, addAlarmListeners } from "./notifications";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  createContextMenu();
  initializeStorage();
});

await loadSearchIndex();
initializeOmnibox();
setupContextMenuListeners();



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "indexPage") {
    try {
      handleIndexPage(request);
      sendResponse({ success: true });
    } catch (error) {
      console.error(error);
      sendResponse({ success: false });
    }
    return true;
  }

  // Implementing Notifications
  if (request.action === "addTask") {
    handleAddTaskNotification(request, sender, sendResponse);
    return true;
  }

  if (request.action === "deleteTask") {
    handleDeleteTaskNotification(request, sender, sendResponse);
    return true;
  }

  if (request.action === "updateTask") {
    handleUpdateTaskNotification(request, sender, sendResponse);
    return true; // Required for asynchronous sendResponse
  }

  if (request.action === "backup_imported") {
    handleBackupImported(request, sender, sendResponse);

    return true; // Required for asynchronous sendResponse
  }
});

addAlarmListeners();