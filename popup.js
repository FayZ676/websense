// UTILS

// Export the tabFocusTimes data to a CSV file
function exportToCSV(tabFocusTimes) {
  const csvContent = [];
  csvContent.push("Title,URL,Focus Time (seconds)");

  // Add data for each tab into the csv
  for (const tabId in tabFocusTimes) {
    const tabData = tabFocusTimes[tabId];
    csvContent.push(
      `"${tabData.title}", "${tabData.url}", ${tabData.focusTimeSeconds}`
    );
  }

  // Create a blob object for the CSV data
  const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });

  // Create a temporary download link and trigger a download
  const downloadLink = document.createElement("a");
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = "tabFocusTimes.csv";
  downloadLink.click();
}

// CHROME EXTENSION CODE

// Update the tab list when the popup is opened
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

    // Add click event listener to the export button
    const exportButton = document.getElementById("export");
    exportButton.addEventListener("click", () => {
      exportToCSV(tabFocusTimes);
    });
  }
});

// Clear the tab list when the reset button is clicked
const tabList = document.getElementById("tabList");
const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clearTabFocusTimes" }, (result) => {
    tabFocusTimes = result.tabFocusTimes;
    tabList.innerHTML = "";
  });
});
