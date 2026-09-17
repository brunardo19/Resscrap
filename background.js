// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log("Resscrap Extension installed.");
    // Initialize storage with an empty array if not exists
    chrome.storage.local.get(['extractedResults'], (result) => {
        if (!result.extractedResults) {
            chrome.storage.local.set({ extractedResults: [] });
        }
    });
});
