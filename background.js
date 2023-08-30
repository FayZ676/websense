const tabFocusTimes = {};

// Fires when the active tab in a window changes.
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

  // console.log(tabFocusTimes);
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTabFocusTimes") {
    // Send the tabFocusTimes data to the popup
    sendResponse({ tabFocusTimes });
  }
});
