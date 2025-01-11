chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

// Create context menu item
chrome.contextMenus.create({
  id: "addToInputBar",
  title: "Add Note",
  contexts: ["selection"]
});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
if (info.menuItemId === "addToInputBar") {
  const selectedText = info.selectionText;
  chrome.runtime.sendMessage({
    type: "ADD_TO_INPUT",
    text: selectedText
  });
}
});