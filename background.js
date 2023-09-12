// Re-assignable Object to store tab focus times
let tabFocusTimes = {};

// Initialize the tabFocusTimes object in chrome.storage.local when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["tabFocusTimes"], (result) => {
    if (result.tabFocusTimes) {
      Object.assign(tabFocusTimes, result.tabFocusTimes);
    } else {
      chrome.storage.local.set({ tabFocusTimes: tabFocusTimes });
    }
  });
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get(["tabFocusTimes"]).then((response) => {
    tabFocusTimes = response.tabFocusTimes;
    const tabId = activeInfo.tabId;
    const lastActiveTab = Object.keys(tabFocusTimes).find(
      (tabId) => tabFocusTimes[tabId].isActive
    );

    if (lastActiveTab) {
      const now = Date.now();
      const lastActive = tabFocusTimes[lastActiveTab].lastActive;
      const elapsedSeconds = (now - lastActive) / 1000;
      tabFocusTimes[lastActiveTab].lastActive = now;
      tabFocusTimes[lastActiveTab].totalFocusTime += elapsedSeconds;
      tabFocusTimes[lastActiveTab].isActive = false;
    }

    if (!tabFocusTimes[tabId]) {
      chrome.tabs.get(tabId, (tab) => {
        tabUrl = tab.url;
        tabTitle = tab.title;
        tabFocusTimes[tabId] = {
          title: tabTitle,
          url: tabUrl,
          lastActive: Date.now(),
          totalFocusTime: 0,
          isActive: true,
        };
      });
    } else {
      tabFocusTimes[tabId].isActive = true;
      tabFocusTimes[tabId].lastActive = Date.now();
    }

    chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then();
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.storage.local.get(["tabFocusTimes"]).then((response) => {
    tabFocusTimes = response.tabFocusTimes;

    if (request.action === "getTabFocusTimes") {
      const lastActiveTab = Object.keys(tabFocusTimes).find(
        (tabId) => tabFocusTimes[tabId].isActive
      );
      if (lastActiveTab) {
        const now = Date.now();
        const lastActive = tabFocusTimes[lastActiveTab].lastActive;
        const elapsedSeconds = (now - lastActive) / 1000;
        tabFocusTimes[lastActiveTab].totalFocusTime += elapsedSeconds;
        tabFocusTimes[lastActiveTab].lastActive = now;
      }

      chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then(() => {
        sendResponse({ tabFocusTimes: tabFocusTimes });
      });
    }

    if (request.action === "clearTabFocusTimes") {
      chrome.storage.local.clear().then(() => {
        tabFocusTimes = {};
        sendResponse({ tabFocusTimes: tabFocusTimes });
      });
    }
  });

  return true;
});
