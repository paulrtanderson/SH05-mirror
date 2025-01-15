// Function to send the visible text content of the current page to the background script
function sendPageContent() {
  const pageData = {
    action: 'sendVisibleTextContent', // Action type for communication
    url: window.location.href,       // The URL of the current page
    title: document.title,           // The title of the current page
    visibleTextContent: document.body.innerText, // The visible text content of the page
  };

  // Use Chrome's runtime messaging API to send the data to the background script
  chrome.runtime.sendMessage(pageData, (response) => {
    // Log the response received from the background script
    console.log('Response from background:', response);
  });
}

// Automatically send the content of the page when it has fully loaded
document.addEventListener('DOMContentLoaded', () => {
  sendPageContent();
});

// Handle dynamic content updates for Single Page Applications (SPAs) or pages with dynamically loaded content
const observer = new MutationObserver(() => {
  sendPageContent(); // Resend the page content whenever changes are detected in the DOM
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true, // Observe direct changes to child elements
  subtree: true,   // Observe changes to child nodes and their descendants
});

// Optional: Clean up the MutationObserver when the page unloads
window.addEventListener('beforeunload', () => {
  observer.disconnect(); // Stop observing to prevent memory leaks
});
