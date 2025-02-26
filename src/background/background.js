import MiniSearch from "minisearch";
import { encode } from "he";

const indexDescriptor = {
  fields: ["title", "content"], // Fields to index
  storeFields: ["title"], // Fields to return in search results
  idField: "id", // Field for unique identifier

  searchOptions: {
    boost: { title: 2 }, // Give higher weight to title matches
    fuzzy: 0.2, // Allow slight spelling variations

  },
};

const defaultRegexList = [
  "^https://[^/]+.amazon.com/.*$",
  "^https://atoz.amazon.work/.*$",
  "^https://quip-amazon.com/.*$",
  "^https://quip.com/.*$",
];

function removeAnchorLink(url) {
  return url.split("#")[0];
}

let miniSearch = new MiniSearch(indexDescriptor);

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  chrome.storage.local.set({ allowedSites: [] }, () => {});

  chrome.storage.local.set({ allowedURLs: [] }, () => {});

  chrome.storage.local.set({ allowedStringMatches: [] }, () => {});

  chrome.storage.local.set({ allowedRegex: defaultRegexList }, () => {});

  chrome.storage.local.set({ allLastTitles: {} }, () => {});

  // chrome.storage.local.set({ pageIndex: JSON.stringify(miniSearch) }, () => {});

});


chrome.storage.local.get("pageIndex", (data) => {
  if (data.pageIndex) {
    miniSearch = MiniSearch.loadJSON(data.pageIndex,indexDescriptor);
  }
});


  // Attempt to load the page index from storage
  chrome.storage.local.get("pageIndex", (data) => {
    if (data.pageIndex) {
      miniSearch = MiniSearch.loadJSON(data.pageIndex, indexDescriptor);
    }
  });

  // Create context menu item
  chrome.contextMenus.create({
    id: "addToHawk",
    title: "Add Task",
    contexts: ["selection"],
  });

// Handle omnibox input changes
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (!text.trim()) return;

  let results = miniSearch.search(text, { prefix: true, fuzzy: 0.2 });
  let suggestions = results.map((result) => ({
    content: result.id,
    description: encode(result.title),
  }));

  if (suggestions.length === 0) {
    suggestions.push({
      content: text,
      description: `No indexed pages found for "${text}"`,
    });
  }

  suggest(suggestions);
});

// Handle omnibox input entered (open new tab)
chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.tabs.update(tabs[0].id, { url: text });
    } else {
      chrome.tabs.create({ url: text });
    }
  });
});

// Indexing new page via message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "indexPage") {
    let pageData = {
      id: removeAnchorLink(request.url),
      title: request.title,
      content: request.content,
    };

    if (miniSearch.has(pageData.id)) {
      miniSearch.replace(pageData);
    } else {
      miniSearch.add(pageData);
    }

    chrome.storage.local.set({ pageIndex: JSON.stringify(miniSearch) });
    sendResponse({ success: true });
  }
});

function backupData() {
  chrome.storage.local.get(null, (data) => {
      chrome.storage.local.set({ backup: data }, () => {
          console.log("Backup saved.");
      });
  });
}

setInterval(backupData, 24 * 60 * 60 * 1000);

chrome.runtime.onSuspend.addListener(() => {
  backupData();
});


// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToHawk") {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
  }
});
