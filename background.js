let currentTab = null;
let tabStartTime = null;
let timeSpent = {};  // Store time spent per site (using root domain)

// Track time when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (currentTab !== null && tabStartTime !== null) {
    let elapsedTime = Math.floor((Date.now() - tabStartTime) / 1000); // Convert to seconds
    let domain = extractDomain(currentTab);
    if (domain) {
      if (timeSpent[domain]) {
        timeSpent[domain].time += elapsedTime;
      } else {
        timeSpent[domain] = { time: elapsedTime, favicon: getFaviconUrl(currentTab) };
      }
      chrome.storage.local.set({ timeSpent });
    }
  }

  // Start tracking the new tab
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    currentTab = tab.url;
    tabStartTime = Date.now();
  });
});

// Track time when a tab is updated (e.g., page load)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Stop tracking the old tab
    if (currentTab !== null && tabStartTime !== null) {
      let elapsedTime = Math.floor((Date.now() - tabStartTime) / 1000); // Convert to seconds
      let domain = extractDomain(currentTab);
      if (domain) {
        if (timeSpent[domain]) {
          timeSpent[domain].time += elapsedTime;
        } else {
          timeSpent[domain] = { time: elapsedTime, favicon: getFaviconUrl(tab.url) };
        }
        chrome.storage.local.set({ timeSpent });
      }
    }

    // Start tracking the new tab's time
    currentTab = tab.url;
    tabStartTime = Date.now();
  }
});

// Track time continuously when the tab is active
let intervalId = setInterval(() => {
  if (currentTab && tabStartTime) {
    let elapsedTime = Math.floor((Date.now() - tabStartTime) / 1000); // Convert to seconds
    let domain = extractDomain(currentTab);
    if (domain) {
      if (timeSpent[domain]) {
        timeSpent[domain].time += 10; // Increment time every second
      } else {
        timeSpent[domain] = { time: 10, favicon: getFaviconUrl(currentTab) }; // Initialize with 1 second if it's the first time
      }
      chrome.storage.local.set({ timeSpent });
    }
  }
}, 10000);  // Update every second (1000 ms)

// Helper function to extract the root domain from a URL
function extractDomain(url) {
  try {
    let parsedUrl = new URL(url);
    let domain = parsedUrl.hostname;
    return domain.startsWith('www.') ? domain.slice(4) : domain;
  } catch (e) {
    return null;  // Return null if the URL is invalid
  }
}

// Helper function to get the favicon URL
function getFaviconUrl(url) {
  let domain = extractDomain(url);
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  }
  return '';  // Return an empty string if no domain is found
}



// Listen for reset action from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'reset') {
    // Reset the time spent data
    timeSpent = {};  // Clear the stored time data

    // Clear the stored data from chrome storage
    chrome.storage.local.set({ timeSpent }, () => {
      sendResponse({ status: 'Time tracking reset successfully!' });
    });

    // Ensure asynchronous response
    return true;  // Keeps the message channel open for sendResponse
  }
});
