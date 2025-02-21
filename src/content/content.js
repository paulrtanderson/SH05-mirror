import { checkWhitelist } from "../utils/WhitelistChecker.js";

console.log("Content script loaded.");
let cachedWhitelist = { sites: [], urls: [], stringMatches: [], regex: [] };

// Debounce delay (ms)
const DEBOUNCE_DELAY = 10000;


function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

let observer = null;

async function manageObserver() {
  const currentURL = window.location.href;
  const isWhitelisted = await checkWhitelist(currentURL, cachedWhitelist);

  if (isWhitelisted) {
    console.log("Page is whitelisted. Starting observer...");
    
    if (!observer) {
      observer = new MutationObserver(
        debounce(async () => {
          console.log("DOM mutated, re-indexing...");
          await sendPageData();
        }, DEBOUNCE_DELAY)
      );

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });

      await sendPageData();
    }
  } else {
    console.log("Page is not whitelisted. Stopping observer...");
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
}

chrome.storage.local.get("lastIndexedPage", (data) => {
  if (data.lastIndexedPage) {
    console.log("Backup: Restoring last indexed page", data.lastIndexedPage);
    chrome.runtime.sendMessage({
      action: "indexPage",
      url: data.lastIndexedPage.url,
      title: data.lastIndexedPage.title,
      content: data.lastIndexedPage.content
    });
  }
});

async function sendPageData() {
  console.log("Sending page data...");
  const currentURL = window.location.href;
  const currentTitle = document.title;
  const pageContent = document.body.innerText;

  const isWhitelisted = await checkWhitelist(currentURL, cachedWhitelist);
  if (isWhitelisted) {
    chrome.runtime.sendMessage(
      { action: "indexPage", url: currentURL, title: currentTitle, content: pageContent },
      () => {
        chrome.storage.local.set({ lastIndexedPage: { url: currentURL, title: currentTitle, content: pageContent } }, 
        () => console.log("Backup: Indexed page data saved."));
      }
    );
  }
}
