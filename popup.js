// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const siteInput = document.getElementById('site-input');
  const addButton = document.getElementById('add-button');
  const allowedSitesList = document.getElementById('allowed-sites');

  // Load the list of allowed sites from Chrome storage when the popup opens
  chrome.storage.local.get(['allowedSites'], (result) => {
    const sites = result.allowedSites || [];
    updateSiteList(sites);
  });

  // Add a new site to the list when the Add button is clicked
  addButton.addEventListener('click', () => {
    const site = siteInput.value.trim(); // Get the input value and trim whitespace
    if (!site) return; // Ignore empty inputs

    // Retrieve the current list of allowed sites from Chrome storage
    chrome.storage.local.get(['allowedSites'], (result) => {
      const sites = result.allowedSites || [];
      if (!sites.includes(site)) { // Avoid duplicates
        sites.push(site); // Add the new site to the list
        chrome.storage.local.set({ allowedSites: sites }, () => {
          updateSiteList(sites); // Update the displayed list in the popup
        });
      } else {
        alert('This site is already in the allowed list.'); // Notify user if site exists
      }
    });

    siteInput.value = ''; // Clear the input field
  });

  // Function to update the allowed sites list displayed in the popup
  function updateSiteList(sites) {
    allowedSitesList.innerHTML = ''; // Clear the current list
    sites.forEach((site) => {
      const listItem = document.createElement('li'); // Create a new list item
      const siteSpan = document.createElement('span'); // Display the site name
      siteSpan.textContent = site;

      const deleteButton = document.createElement('button'); // Add a Delete button
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.style.marginLeft = '10px';
      deleteButton.style.backgroundColor = 'red';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.padding = '5px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.borderRadius = '3px';

      // Event listener for the Delete button
      deleteButton.addEventListener('click', () => {
        const updatedSites = sites.filter((s) => s !== site); // Remove the site
        chrome.storage.local.set({ allowedSites: updatedSites }, () => {
          updateSiteList(updatedSites); // Refresh the displayed list
        });
      });

      listItem.appendChild(siteSpan); // Add the site name to the list item
      listItem.appendChild(deleteButton); // Add the Delete button to the list item
      allowedSitesList.appendChild(listItem); // Add the list item to the list
    });
  }
});
