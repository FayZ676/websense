// Re-assignable Object to store tab focus times
let tabFocusTimes = {};

// Initialize the tabFocusTimes object in chrome.storage.local when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["tabFocusTimes"]).then((result) => {
    if (result.tabFocusTimes) {
      Object.assign(tabFocusTimes, result.tabFocusTimes);
    } else {
      chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then();
    }
  });
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local
    .get(["tabFocusTimes"])
    .then((response) => {
      tabFocusTimes = response.tabFocusTimes;
      console.log("STORAGE RETRIEVED (ON TAB CHANGE):\n");
      console.log(tabFocusTimes);

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
        return chrome.tabs.get(tabId).then((tab) => {
          const tabUrl = tab.url;
          const tabTitle = tab.title;
          tabFocusTimes[tabId] = {
            title: tabTitle,
            url: tabUrl,
            lastActive: Date.now(),
            totalFocusTime: 0,
            isActive: true,
          };
          return tabFocusTimes;
        });
      } else {
        tabFocusTimes[tabId].isActive = true;
        tabFocusTimes[tabId].lastActive = Date.now();
        return tabFocusTimes;
      }
    })
    .then((updatedTabFocusTimes) => {
      chrome.storage.local
        .set({ tabFocusTimes: updatedTabFocusTimes })
        .then(() => {
          console.log("STORAGE UPDATED (ON TAB CHANGE):\n");
          console.log(tabFocusTimes);
        });
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
        console.log("STORAGE UPDATED (ON POPUP OPEN):\n");
        console.log(tabFocusTimes);
        sendResponse({ tabFocusTimes: tabFocusTimes });
      });
    }

    if (request.action === "clearTabFocusTimes") {
      chrome.storage.local.clear().then(() => {
        tabFocusTimes = {};
        console.log("STORAGE UPDATED (ON POPUP RESET):\n");
        console.log(tabFocusTimes);
        sendResponse({ tabFocusTimes: tabFocusTimes });
      });
    }
  });

  return true;
});
