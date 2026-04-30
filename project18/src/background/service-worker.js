chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'START_SCREENSHOT' });
  } catch (error) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/content/content.js']
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'START_SCREENSHOT' });
        } catch (e) {}
      }, 100);
    } catch (e) {}
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CAPTURE_SCREENSHOT') {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' })
      .then((dataUrl) => {
        sendResponse({ success: true, dataUrl });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'DOWNLOAD_SCREENSHOT') {
    chrome.downloads.download({
      url: request.dataUrl,
      filename: request.filename || `screenshot-${Date.now()}.png`
    }).then(() => {
      sendResponse({ success: true });
    }).catch(() => {
      sendResponse({ success: false });
    });
    return true;
  }
});