// console log the url of the current tab
const tabFocusTimes = {};

const calculateFocusTime = (tabId) => {
  if (tabFocusTimes[tabId]) {
    const currentTime = new Date().getTime();
    const focusedTime = currentTime - tabFocusTimes[tabId].timestamp;
    return focusedTime;
  }
  return 0;
};

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    const timestamp = new Date().toLocaleString();
    const tabId = activeInfo.tabId;
    const tabUrl = tab.url;
    const tabTitle = tab.title;

    // Append tabId, url, title, and timestamp to tabFocusTime object
    tabFocusTime[tabId] = {
      title: tabTitle,
      url: tabUrl,
      timestamp: timestamp,
    };

    console.log(`[${timestamp}] Active tab: ${tab.url}`);
  });
});
