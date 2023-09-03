// Re-assignable Object to store tab focus times
let tabFocusTimes = {};

// Initialize the tabFocusTimes object in chrome.storage.local
chrome.storage.local.get(["tabFocusTimes"], (result) => {
  if (result.tabFocusTimes) {
    tabFocusTimes = result.tabFocusTimes;
  } else {
    chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then(() => {
      console.log("tabFocusTimes initialized in chrome.storage.local");
    });
  }
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  const timestamp = new Date().getTime();
  const lastActiveTab = Object.keys(tabFocusTimes).find(
    (tabId) => tabFocusTimes[tabId].isActive
  );

  if (lastActiveTab) {
    tabFocusTimes[lastActiveTab].endTime = timestamp;
    tabFocusTimes[lastActiveTab].focusTimeSeconds += Math.round(
      (tabFocusTimes[lastActiveTab].endTime -
        tabFocusTimes[lastActiveTab].startTime) /
        1000
    );
    tabFocusTimes[lastActiveTab].isActive = false;
  }

  if (!tabFocusTimes[tabId]) {
    chrome.tabs.get(tabId, (tab) => {
      tabUrl = tab.url;
      tabTitle = tab.title;
      tabFocusTimes[tabId] = {
        title: tabTitle,
        url: tabUrl,
        startTime: timestamp,
        endTime: null,
        focusTimeSeconds: 0,
        isActive: true,
      };
    });
  } else {
    tabFocusTimes[tabId].isActive = true;
    tabFocusTimes[tabId].startTime = timestamp;
  }

  console.log(tabFocusTimes);

  chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then((result) => {
    console.log("tabFocusTimes updated in chrome.storage.local");
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTabFocusTimes") {
    const activeTab = Object.keys(tabFocusTimes).find(
      (tabId) => tabFocusTimes[tabId].isActive
    );

    if (activeTab) {
      tabFocusTimes[activeTab].endTime = new Date().getTime();
      tabFocusTimes[activeTab].focusTimeSeconds += Math.round(
        (tabFocusTimes[activeTab].endTime -
          tabFocusTimes[activeTab].startTime) /
          1000
      );
    }

    chrome.storage.local
      .set({ tabFocusTimes: tabFocusTimes })
      .then((result) => {
        console.log("tabFocusTimes updated in chrome.storage.local");
      });

    sendResponse({ tabFocusTimes });
  }

  if (request.action === "clearTabFocusTimes") {
    chrome.storage.local.clear();
    tabFocusTimes = {};

    sendResponse({ tabFocusTimes });
  }
});
