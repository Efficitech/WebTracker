// Capture website URL and send to background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'trackTime') {
    let currentUrl = window.location.href;
    chrome.runtime.sendMessage({ action: 'trackTime', url: currentUrl });
  }
});
