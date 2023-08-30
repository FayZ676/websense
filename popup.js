// Send a message to the background script
// to retrieve the tabFocusTimes data
chrome.runtime.sendMessage({ action: "getTabFocusTimes" }, (response) => {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
  } else {
    // Get the tabFocusTimes data from the response
    const tabFocusTimes = response.tabFocusTimes;

    // Get the tabList element
    const tabList = document.getElementById("tabList");

    // Clear the existing list
    tabList.innerHTML = "";

    // Display the data for each tab in the list
    for (const tabId in tabFocusTimes) {
      const tabData = tabFocusTimes[tabId];
      const listItem = document.createElement("li");
      listItem.textContent = `Title: ${tabData.title}, URL: ${tabData.url}, Focus Time: ${tabData.focusTimeSeconds} seconds`;
      tabList.appendChild(listItem);
    }
  }
});
