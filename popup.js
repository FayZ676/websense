// UTILS

// Export the tabFocusTimes data to a CSV file
function exportToCSV(tabFocusTimes) {
  const csvContent = [];

  csvContent.push("Title,URL,Focus Time (seconds)");

  for (const tabId in tabFocusTimes) {
    const tabData = tabFocusTimes[tabId];
    csvContent.push(
      `"${tabData.title}", "${tabData.url}", ${tabData.totalFocusTime}}`
    );
  }

  const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });

  const downloadLink = document.createElement("a");
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = "tabFocusTimes.csv";
  downloadLink.click();
}

// CHROME EXTENSION CODE

// Update the tab list when the popup is opened
const action = { action: "getTabFocusTimes" };
chrome.runtime.sendMessage(action).then((response) => {
  if (response) {
    console.log("RESPONSE RETRIEVED:\n");
    console.log(response);

    const tabFocusTimes = response.tabFocusTimes;
    const tabList = document.getElementById("tabList");
    tabList.innerHTML = "";

    for (const tabId in tabFocusTimes) {
      const tabData = tabFocusTimes[tabId];
      const listItem = document.createElement("li");
      const listItemContent = document.createElement("div");
      const tabTitle = document.createElement("h3");
      const tabFocusTime = document.createElement("p");

      listItem.classList.add("list-item");
      listItemContent.classList.add("item-card");
      tabTitle.classList.add("tab-title");
      tabFocusTime.classList.add("tab-focus-time");

      tabTitle.innerHTML = `<a href="${tabData.url}" target="_blank">${tabData.title}</a>`;
      tabFocusTime.textContent = `${tabData.totalFocusTime} seconds`;

      listItemContent.appendChild(tabTitle);
      listItemContent.appendChild(tabFocusTime);
      listItem.appendChild(listItemContent);
      tabList.appendChild(listItem);
    }

    const exportButton = document.getElementById("export");
    exportButton.addEventListener("click", () => {
      exportToCSV(tabFocusTimes);
    });
  } else {
    console.log("ERROR RETRIEVING RESPONSE:\n");
    console.error(response);
  }
});

// Clear the tab list when the reset button is clicked
const tabList = document.getElementById("tabList");
const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
  chrome.runtime.sendMessage("clearTabFocusTimes", (result) => {
    tabFocusTimes = result.tabFocusTimes;
    tabList.innerHTML = "";
  });
});
