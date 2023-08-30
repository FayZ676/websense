async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // "tabs" will either be a "tab.Tab" instance or "undefined"
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// Check for an open tab event

// Check for a closed tab event
