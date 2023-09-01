// Re-assignable Object to store tab focus times
let tabFocusTimes = {};

// Initialize the tabFocusTimes object in chrome.storage.local
chrome.storage.local.get(["tabFocusTimes"], (result) => {
  // If the tabFocusTimes object exists in chrome.storage.local
  if (result.tabFocusTimes) {
    // Update the tabFocusTimes object with the value from chrome.storage.local
    tabFocusTimes = result.tabFocusTimes;
  }
  // Otherwise if the tabFocusTimes object does not exist in chrome.storage.local
  else {
    // Initialize the tabFocusTimes object in chrome.storage.local
    chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then(() => {
      console.log("tabFocusTimes initialized in chrome.storage.local");
    });
  }
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Current Tab ID
  const tabId = activeInfo.tabId;

  // Current Time in milliseconds
  const timestamp = new Date().getTime();

  // index of the last active tab (if it exists) in the tabFocusTimes object
  const lastActiveTab = Object.keys(tabFocusTimes).find(
    (tabId) => tabFocusTimes[tabId].isActive
  );

  // if there is a last active tab
  if (lastActiveTab) {
    // update the last active tab's endTime
    tabFocusTimes[lastActiveTab].endTime = timestamp;

    // calculate the focusTimeSeconds of the last active tab
    tabFocusTimes[lastActiveTab].focusTimeSeconds += Math.round(
      (tabFocusTimes[lastActiveTab].endTime -
        tabFocusTimes[lastActiveTab].startTime) /
        1000
    );

    // set the last active tab's status to inactive
    tabFocusTimes[lastActiveTab].isActive = false;
  }

  // if the current tab is a new one
  if (!tabFocusTimes[tabId]) {
    chrome.tabs.get(tabId, (tab) => {
      //  get the url of the current tab
      tabUrl = tab.url;

      // get the title of the current tab
      tabTitle = tab.title;

      // create a new tab object
      tabFocusTimes[tabId] = {
        title: tabTitle,
        url: tabUrl,
        startTime: timestamp,
        endTime: null,
        focusTimeSeconds: 0,
        isActive: true,
      };
    });
  }
  // Otherwise if the current tab is not a new one
  else {
    // Set the current tab's status to active
    tabFocusTimes[tabId].isActive = true;

    // Set the current tab's startTime to the current time
    tabFocusTimes[tabId].startTime = timestamp;
  }

  console.log(tabFocusTimes);

  // Persist the updated tabFocusTimes data to chrome.storage
  chrome.storage.local.set({ tabFocusTimes: tabFocusTimes }).then((result) => {
    console.log("tabFocusTimes updated in chrome.storage.local");
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Grab the current focus times from the tabFocusTimes object
  if (request.action === "getTabFocusTimes") {
    // Update the tabFocusTimes for the currently active tab
    // Retrieve the index currently active tab from the tabFocusTimes object
    const activeTab = Object.keys(tabFocusTimes).find(
      (tabId) => tabFocusTimes[tabId].isActive
    );

    // If there is an active tab
    if (activeTab) {
      // Update the endTime
      tabFocusTimes[activeTab].endTime = new Date().getTime();

      // Calculate the focusTimeSeconds
      tabFocusTimes[activeTab].focusTimeSeconds += Math.round(
        (tabFocusTimes[activeTab].endTime -
          tabFocusTimes[activeTab].startTime) /
          1000
      );
    }

    // Persist the updated tabFocusTimes data to chrome.storage
    chrome.storage.local
      .set({ tabFocusTimes: tabFocusTimes })
      .then((result) => {
        console.log("tabFocusTimes updated in chrome.storage.local");
      });

    // Send the tabFocusTimes data to the popup
    sendResponse({ tabFocusTimes });
  }

  // Clear the chrome.storage.local and tabFocusTimes data
  if (request.action === "clearTabFocusTimes") {
    // Clear the chrome.storage.local data
    chrome.storage.local.clear();

    console.log("tabFocusTimes cleared from chrome.storage.local");

    // Update the tabFocusTimes object
    tabFocusTimes = {};

    // Send the tabFocusTimes data to the popup
    sendResponse({ tabFocusTimes });
  }
});

// Listen for tab updates
